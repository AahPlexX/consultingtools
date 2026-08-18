import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

describe("capability MCP tools", () => {
  it("discovers, inspects, and validates capability plans", async () => {
    const handler = createHttpHandler();
    const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    });
    const client = new Client(
      { name: "capability-tools-test", version: "1.0.0" },
      { versionNegotiation: { mode: "auto" } },
    );

    try {
      await client.connect(transport);
      const tools = await client.listTools();
      const names = tools.tools.map(({ name }) => name);
      expect(names).toEqual(
        expect.arrayContaining([
          "search_consulting_capabilities",
          "inspect_consulting_capability",
          "validate_consulting_workflow",
        ]),
      );

      for (const name of [
        "search_consulting_capabilities",
        "inspect_consulting_capability",
        "validate_consulting_workflow",
      ]) {
        expect(tools.tools.find((tool) => tool.name === name)?.annotations).toMatchObject({
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        });
      }

      const inspect = await client.callTool({
        name: "inspect_consulting_capability",
        arguments: { id: "swot" },
      });
      expect(inspect.isError).not.toBe(true);
      expect(inspect.structuredContent).toMatchObject({ capability: { id: "swot" } });

      const valid = await client.callTool({
        name: "validate_consulting_workflow",
        arguments: {
          objective: "Assess a new market and choose an entry approach",
          capabilityIds: ["market-attractiveness", "entry-strategy"],
          requestedOutputs: ["text"],
        },
      });
      expect(valid.structuredContent).toMatchObject({ executable: true });

      const blocked = await client.callTool({
        name: "validate_consulting_workflow",
        arguments: {
          objective: "Use my live Search Console account",
          capabilityIds: ["seo-search-console"],
          requestedOutputs: ["text"],
        },
      });
      expect(blocked.structuredContent).toMatchObject({ executable: false });
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
