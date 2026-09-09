import { describe, expect, it } from "vitest";
import {
  createPublicFetcher,
  type PublicFetchAdapters,
  type PublicRequestInput,
  type PublicRequestResult,
} from "../src/web/http-fetch.js";
import type { DnsAddress } from "../src/web/types.js";

function response(
  status: number,
  options: {
    headers?: Record<string, string>;
    body?: Buffer;
    remoteAddress?: string;
  } = {},
): PublicRequestResult {
  return {
    status,
    headers: options.headers ?? { "content-type": "text/html; charset=utf-8" },
    body: options.body ?? Buffer.from("<p>ok</p>"),
    remoteAddress: options.remoteAddress ?? "93.184.216.34",
  };
}

function adapters(options: {
  resolve?: (hostname: string) => Promise<DnsAddress[]>;
  request?: (input: PublicRequestInput) => Promise<PublicRequestResult>;
} = {}): PublicFetchAdapters {
  return {
    resolve: options.resolve ?? (async () => [{ address: "93.184.216.34", family: 4 }]),
    request: options.request ?? (async () => response(200)),
    now: () => new Date("2026-09-09T22:30:00.000Z"),
  };
}

describe("bounded public HTTP fetch", () => {
  it("pins the validated address, strips credentials from request headers, and returns provenance", async () => {
    const seen: PublicRequestInput[] = [];
    const fetchPublicUrl = createPublicFetcher(adapters({
      request: async (input) => {
        seen.push(input);
        return response(200, { body: Buffer.from("hello"), remoteAddress: input.address.address });
      },
    }));

    const result = await fetchPublicUrl("https://example.com/page#fragment");

    expect(seen).toHaveLength(1);
    expect(seen[0]?.address).toEqual({ address: "93.184.216.34", family: 4 });
    expect(seen[0]?.headers).toMatchObject({
      "accept-encoding": "identity",
      "user-agent": "ConsultingToolsBot/1.0",
    });
    expect(Object.keys(seen[0]?.headers ?? {}).map((key) => key.toLowerCase())).not.toEqual(
      expect.arrayContaining(["authorization", "cookie", "proxy-authorization"]),
    );
    expect(result).toMatchObject({
      requestedUrl: "https://example.com/page#fragment",
      finalUrl: "https://example.com/page",
      status: 200,
      fetchedAt: "2026-09-09T22:30:00.000Z",
      redirects: [],
    });
    expect(result.body.toString()).toBe("hello");
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("fails closed when DNS contains any disallowed address", async () => {
    let requested = false;
    const fetchPublicUrl = createPublicFetcher(adapters({
      resolve: async () => [
        { address: "93.184.216.34", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ],
      request: async () => {
        requested = true;
        return response(200);
      },
    }));

    await expect(fetchPublicUrl("https://example.com/")).rejects.toThrow(/public|address|network/i);
    expect(requested).toBe(false);
  });

  it("revalidates every redirect target and records the redirect chain", async () => {
    const resolved: string[] = [];
    const fetchPublicUrl = createPublicFetcher(adapters({
      resolve: async (hostname) => {
        resolved.push(hostname);
        return hostname === "example.org"
          ? [{ address: "93.184.216.35", family: 4 }]
          : [{ address: "93.184.216.34", family: 4 }];
      },
      request: async (input) => {
        if (input.url.hostname === "example.com") {
          return response(302, {
            headers: { location: "https://example.org/final" },
            remoteAddress: input.address.address,
          });
        }
        return response(200, { body: Buffer.from("final"), remoteAddress: input.address.address });
      },
    }));

    const result = await fetchPublicUrl("https://example.com/start");
    expect(resolved).toEqual(["example.com", "example.org"]);
    expect(result.finalUrl).toBe("https://example.org/final");
    expect(result.redirects).toEqual([
      { from: "https://example.com/start", to: "https://example.org/final", status: 302 },
    ]);
  });

  it("rejects a connected socket address that does not match the pinned address", async () => {
    const fetchPublicUrl = createPublicFetcher(adapters({
      request: async () => response(200, { remoteAddress: "8.8.8.8" }),
    }));
    await expect(fetchPublicUrl("https://example.com/")).rejects.toThrow(/remote|pinned|address/i);
  });

  it("rejects content-length and actual bodies over the configured bound", async () => {
    const lengthFetch = createPublicFetcher(adapters({
      request: async (input) => response(200, {
        headers: { "content-type": "text/plain", "content-length": "6" },
        body: Buffer.from("small"),
        remoteAddress: input.address.address,
      }),
    }));
    await expect(lengthFetch("https://example.com/", { maxBytes: 5 })).rejects.toThrow(/size|bytes|length/i);

    const bodyFetch = createPublicFetcher(adapters({
      request: async (input) => response(200, {
        headers: { "content-type": "text/plain" },
        body: Buffer.from("123456"),
        remoteAddress: input.address.address,
      }),
    }));
    await expect(bodyFetch("https://example.com/", { maxBytes: 5 })).rejects.toThrow(/size|bytes/i);
  });

  it("enforces the redirect limit", async () => {
    const fetchPublicUrl = createPublicFetcher(adapters({
      request: async (input) => response(302, {
        headers: { location: `/next-${input.url.pathname.length}` },
        remoteAddress: input.address.address,
      }),
    }));
    await expect(fetchPublicUrl("https://example.com/start", { maxRedirects: 2 })).rejects.toThrow(/redirect/i);
  });
});
