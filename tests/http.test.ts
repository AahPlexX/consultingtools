import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

describe("remote MCP HTTP boundary", () => {
  it("negotiates the 2026-07-28 protocol and executes capability search over Streamable HTTP", async () => {
    const handler = createHttpHandler();
    const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    });
    const client = new Client(
      { name: "consulting-tools-test", version: "1.0.0" },
      { versionNegotiation: { mode: "auto" } },
    );

    try {
      await client.connect(transport);

      expect(client.getNegotiatedProtocolVersion()).toBe("2026-07-28");

      const tools = await client.listTools();
      const capabilityTool = tools.tools.find(
        (tool) => tool.name === "search_consulting_capabilities",
      );

      expect(capabilityTool).toBeDefined();
      expect(capabilityTool?.annotations).toMatchObject({
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      });

      const result = await client.callTool({
        name: "search_consulting_capabilities",
        arguments: { query: "SEO", limit: 3 },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        count: expect.any(Number),
        totalCatalogSize: expect.any(Number),
        capabilities: expect.any(Array),
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
