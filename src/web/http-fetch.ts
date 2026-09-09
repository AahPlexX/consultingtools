import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import * as http from "node:http";
import * as https from "node:https";
import { isIP } from "node:net";
import { assertPublicIpAddress, normalizeIpAddress } from "./ip-policy.js";
import { normalizePublicWebUrl } from "./url-policy.js";
import { PUBLIC_FETCH_LIMITS, type DnsAddress, type PublicFetchResult, type PublicFetchRedirect } from "./types.js";

export interface PublicRequestInput {
  url: URL;
  address: DnsAddress;
  headers: Record<string, string>;
  timeoutMs: number;
  maxBytes: number;
}

export interface PublicRequestResult {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
  remoteAddress: string;
}

export interface PublicFetchAdapters {
  resolve(hostname: string): Promise<DnsAddress[]>;
  request(input: PublicRequestInput): Promise<PublicRequestResult>;
  now(): Date;
}

export interface PublicFetchOptions {
  maxBytes?: number;
  timeoutMs?: number;
  maxRedirects?: number;
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function hostnameForResolution(url: URL): string {
  return url.hostname.startsWith("[") && url.hostname.endsWith("]")
    ? url.hostname.slice(1, -1)
    : url.hostname;
}

function boundedInteger(value: number | undefined, fallback: number, maximum: number, label: string): number {
  const resolved = value ?? fallback;
  if (!Number.isSafeInteger(resolved) || resolved < 0 || resolved > maximum) {
    throw new Error(`${label} must be a safe integer between 0 and ${maximum}.`);
  }
  return resolved;
}

function bodyLimit(value: number | undefined): number {
  const resolved = value ?? PUBLIC_FETCH_LIMITS.maxBytes;
  if (!Number.isSafeInteger(resolved) || resolved < 1 || resolved > PUBLIC_FETCH_LIMITS.maxBytes) {
    throw new Error(`maxBytes must be a safe integer between 1 and ${PUBLIC_FETCH_LIMITS.maxBytes}.`);
  }
  return resolved;
}

function header(headers: Record<string, string>, name: string): string | undefined {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return value;
  }
  return undefined;
}

function validateBodyBound(result: PublicRequestResult, maxBytes: number): void {
  const contentLength = header(result.headers, "content-length");
  if (contentLength !== undefined) {
    if (!/^\d+$/.test(contentLength)) throw new Error("Response Content-Length is invalid or ambiguous.");
    if (Number(contentLength) > maxBytes) throw new Error(`Response Content-Length exceeds the ${maxBytes}-byte size limit.`);
  }
  if (result.body.byteLength > maxBytes) throw new Error(`Response body exceeds the ${maxBytes}-byte size limit.`);
}

function assertPinnedRemoteAddress(remoteAddress: string, pinned: string): void {
  assertPublicIpAddress(remoteAddress);
  if (normalizeIpAddress(remoteAddress) !== normalizeIpAddress(pinned)) {
    throw new Error(`Connected remote address did not match the DNS-pinned address.`);
  }
}

function normalizeIncomingHeaders(headers: http.IncomingHttpHeaders): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") result[key.toLowerCase()] = value;
    else if (Array.isArray(value)) result[key.toLowerCase()] = value.join(", ");
  }
  return result;
}

async function defaultResolve(hostname: string): Promise<DnsAddress[]> {
  const literalFamily = isIP(hostname);
  if (literalFamily === 4 || literalFamily === 6) {
    return [{ address: hostname, family: literalFamily }];
  }
  const records = await lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => ({ address: record.address, family: record.family as 4 | 6 }));
}

function defaultRequest(input: PublicRequestInput): Promise<PublicRequestResult> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finishReject = (error: Error): void => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const finishResolve = (result: PublicRequestResult): void => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const transport = input.url.protocol === "https:" ? https : http;
    const request = transport.request(
      input.url,
      {
        method: "GET",
        headers: input.headers,
        lookup: (_hostname, _options, callback) => {
          callback(null, input.address.address, input.address.family);
        },
      },
      (response) => {
        const headers = normalizeIncomingHeaders(response.headers);
        const contentLength = header(headers, "content-length");
        if (contentLength !== undefined) {
          if (!/^\d+$/.test(contentLength)) {
            response.destroy();
            finishReject(new Error("Response Content-Length is invalid or ambiguous."));
            return;
          }
          if (Number(contentLength) > input.maxBytes) {
            response.destroy();
            finishReject(new Error(`Response Content-Length exceeds the ${input.maxBytes}-byte size limit.`));
            return;
          }
        }

        const chunks: Buffer[] = [];
        let total = 0;
        response.on("data", (chunk: Buffer | Uint8Array | string) => {
          if (settled) return;
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          total += buffer.byteLength;
          if (total > input.maxBytes) {
            response.destroy();
            finishReject(new Error(`Response body exceeds the ${input.maxBytes}-byte size limit.`));
            return;
          }
          chunks.push(buffer);
        });
        response.on("end", () => {
          if (settled) return;
          const remoteAddress = response.socket.remoteAddress;
          if (!remoteAddress) {
            finishReject(new Error("Connected socket did not expose a remote address."));
            return;
          }
          finishResolve({
            status: response.statusCode ?? 0,
            headers,
            body: Buffer.concat(chunks),
            remoteAddress,
          });
        });
        response.on("error", (error) => finishReject(error));
      },
    );

    request.setTimeout(input.timeoutMs, () => {
      request.destroy(new Error(`Public-web request exceeded the ${input.timeoutMs} ms timeout.`));
    });
    request.on("error", (error) => finishReject(error));
    request.end();
  });
}

const defaultAdapters: PublicFetchAdapters = {
  resolve: defaultResolve,
  request: defaultRequest,
  now: () => new Date(),
};

export function createPublicFetcher(adapters: PublicFetchAdapters) {
  return async function fetchWithAdapters(value: string, options: PublicFetchOptions = {}): Promise<PublicFetchResult> {
    const maxBytes = bodyLimit(options.maxBytes);
    const timeoutMs = boundedInteger(options.timeoutMs, PUBLIC_FETCH_LIMITS.timeoutMs, PUBLIC_FETCH_LIMITS.timeoutMs, "timeoutMs");
    if (timeoutMs < 1) throw new Error("timeoutMs must be at least 1 millisecond.");
    const maxRedirects = boundedInteger(
      options.maxRedirects,
      PUBLIC_FETCH_LIMITS.maxRedirects,
      PUBLIC_FETCH_LIMITS.maxRedirects,
      "maxRedirects",
    );

    const requestedUrl = value;
    let current = normalizePublicWebUrl(value);
    const redirects: PublicFetchRedirect[] = [];

    while (true) {
      const hostname = hostnameForResolution(current);
      const addresses = await adapters.resolve(hostname);
      if (addresses.length === 0) throw new Error(`DNS returned no addresses for ${hostname}.`);
      for (const address of addresses) {
        if (address.family !== 4 && address.family !== 6) throw new Error("DNS returned an unsupported address family.");
        assertPublicIpAddress(address.address);
      }
      const selected = addresses[0];
      if (!selected) throw new Error(`DNS returned no usable addresses for ${hostname}.`);

      const result = await adapters.request({
        url: current,
        address: selected,
        headers: {
          accept: "text/html,application/xhtml+xml,text/plain,application/xml,text/xml;q=0.9,*/*;q=0.1",
          "accept-encoding": "identity",
          "user-agent": "ConsultingToolsBot/1.0",
        },
        timeoutMs,
        maxBytes,
      });
      assertPinnedRemoteAddress(result.remoteAddress, selected.address);
      validateBodyBound(result, maxBytes);

      if (REDIRECT_STATUSES.has(result.status)) {
        const location = header(result.headers, "location");
        if (location !== undefined) {
          if (redirects.length >= maxRedirects) throw new Error(`Public-web redirect limit of ${maxRedirects} was exceeded.`);
          const next = normalizePublicWebUrl(new URL(location, current).href);
          redirects.push({ from: current.href, to: next.href, status: result.status });
          current = next;
          continue;
        }
      }

      return {
        requestedUrl,
        finalUrl: current.href,
        status: result.status,
        headers: { ...result.headers },
        body: Buffer.from(result.body),
        fetchedAt: adapters.now().toISOString(),
        sha256: createHash("sha256").update(result.body).digest("hex"),
        redirects: redirects.map((entry) => ({ ...entry })),
      };
    }
  };
}

const defaultFetcher = createPublicFetcher(defaultAdapters);

export async function fetchPublicUrl(value: string, options: PublicFetchOptions = {}): Promise<PublicFetchResult> {
  return defaultFetcher(value, options);
}
