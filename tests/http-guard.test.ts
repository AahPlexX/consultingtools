import { describe, expect, it } from "vitest";
import { createGuardedHttpHandler } from "../src/http.js";

function mcpRequest(host: string, origin?: string) {
  const headers = new Headers({
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
    host,
  });
  if (origin) headers.set("origin", origin);

  return new Request("https://api.example.com/mcp", {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
    }),
  });
}

describe("guarded remote MCP HTTP boundary", () => {
  it("requires at least one allowed production hostname", () => {
    expect(() => createGuardedHttpHandler({ allowedHosts: [] })).toThrow(
      /allowed host/i,
    );
  });

  it("rejects a Host header outside the allowlist before MCP dispatch", async () => {
    const handler = createGuardedHttpHandler({
      allowedHosts: ["api.example.com"],
    });

    try {
      const response = await handler.fetch(mcpRequest("evil.example"));
      expect(response.status).toBe(403);
    } finally {
      await handler.close();
    }
  });

  it("rejects a present Origin header outside the configured allowlist", async () => {
    const handler = createGuardedHttpHandler({
      allowedHosts: ["api.example.com"],
      allowedOrigins: ["chatgpt.com"],
    });

    try {
      const response = await handler.fetch(
        mcpRequest("api.example.com", "https://evil.example"),
      );
      expect(response.status).toBe(403);
    } finally {
      await handler.close();
    }
  });

  it("rejects credential-shaped Host values even when the hostname suffix is allowed", async () => {
    const handler = createGuardedHttpHandler({
      allowedHosts: ["api.example.com"],
    });

    try {
      const response = await handler.fetch(
        mcpRequest("attacker@api.example.com"),
      );
      expect(response.status).toBe(403);
    } finally {
      await handler.close();
    }
  });

  it("rejects credential-shaped Origin values even when the hostname suffix is allowed", async () => {
    const handler = createGuardedHttpHandler({
      allowedHosts: ["api.example.com"],
      allowedOrigins: ["chatgpt.com"],
    });

    try {
      const response = await handler.fetch(
        mcpRequest("api.example.com", "https://attacker@chatgpt.com"),
      );
      expect(response.status).toBe(403);
    } finally {
      await handler.close();
    }
  });
});
