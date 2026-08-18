import {
  createMcpHandler,
  hostHeaderValidationResponse,
  originValidationResponse,
} from "@modelcontextprotocol/server";
import { MemoryArtifactStore } from "./artifacts/memory-store.js";
import type { ArtifactStore } from "./artifacts/types.js";
import { createServer } from "./server.js";

export interface HttpHandlerOptions {
  artifactStore?: ArtifactStore;
  maxInlineArtifactBytes?: number;
}

export interface HttpGuardOptions extends HttpHandlerOptions {
  allowedHosts: readonly string[];
  allowedOrigins?: readonly string[];
}

function normalizeHostnames(values: readonly string[], label: string): string[] {
  const normalized = [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))];

  if (normalized.length === 0) {
    throw new Error(`${label} must contain at least one allowed hostname.`);
  }

  for (const value of normalized) {
    if (
      value.includes("://") ||
      value.includes("/") ||
      value.includes("@") ||
      /\s/.test(value)
    ) {
      throw new Error(`${label} entries must be hostnames only, without scheme, path, credentials, or whitespace.`);
    }
  }

  return normalized;
}

function credentialShapedHeader(request: Request): boolean {
  return [request.headers.get("host"), request.headers.get("origin")].some(
    (value) => value?.includes("@") === true,
  );
}

function forbidden(): Response {
  return new Response("Forbidden", {
    status: 403,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export function createHttpHandler(options: HttpHandlerOptions = {}) {
  const artifactStore = options.artifactStore ?? new MemoryArtifactStore();
  const maxInlineArtifactBytes = options.maxInlineArtifactBytes;

  return createMcpHandler(() =>
    maxInlineArtifactBytes === undefined
      ? createServer({ artifactStore })
      : createServer({ artifactStore, maxInlineArtifactBytes }),
  );
}

export function createGuardedHttpHandler(options: HttpGuardOptions) {
  const allowedHosts = normalizeHostnames(options.allowedHosts, "allowedHosts");
  const allowedOrigins =
    options.allowedOrigins === undefined
      ? undefined
      : normalizeHostnames(options.allowedOrigins, "allowedOrigins");
  const handler = createHttpHandler(options);

  return {
    bus: handler.bus,
    notify: handler.notify,
    close: () => handler.close(),
    async fetch(request: Request): Promise<Response> {
      if (credentialShapedHeader(request)) return forbidden();

      const rejected =
        hostHeaderValidationResponse(request, allowedHosts) ??
        (allowedOrigins
          ? originValidationResponse(request, allowedOrigins)
          : undefined);

      return rejected ?? handler.fetch(request);
    },
  };
}
