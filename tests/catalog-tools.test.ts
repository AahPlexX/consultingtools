import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

describe("capability MCP tools", () => {
  it("discovers, inspects, and validates capability plans without one tool per capability", async () => {
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
      const capabilityToolNames = names.filter((name) =>
        [
          "search_consulting_capabilities",
          "inspect_consulting_capability",
          "validate_consulting_workflow",
        ].includes(name),
      );
      expect(capabilityToolNames).toHaveLength(3);

      for (const name of capabilityToolNames) {
        expect(tools.tools.find((tool) => tool.name === name)?.annotations).toMatchObject({
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        });
      }

      const search = await client.callTool({
        name: "search_consulting_capabilities",
        arguments: { query: "SWOT", limit: 3 },
      });
      expect(search.isError).not.toBe(true);
      expect(search.structuredContent).toMatchObject({
        totalCatalogSize: expect.any(Number),
        capabilities: expect.arrayContaining([expect.objectContaining({ id: "swot" })]),
      });
      expect((search.structuredContent as { totalCatalogSize: number }).totalCatalogSize).toBeGreaterThanOrEqual(100);

      const inspect = await client.callTool({
        name: "inspect_consulting_capability",
        arguments: { id: "swot" },
      });
      expect(inspect.isError).not.toBe(true);
      expect(inspect.structuredContent).toMatchObject({
        capability: {
          id: "swot",
          routingReady: true,
          businessQuestions: expect.any(Array),
          triggers: expect.any(Array),
          antiTriggers: expect.any(Array),
          methodology: expect.any(String),
          evidence: expect.any(Object),
          qualityGates: expect.any(Array),
          evaluationFixtureIds: expect.any(Array),
        },
      });

      const executable = await client.callTool({
        name: "validate_consulting_workflow",
        arguments: {
          objective: "Calculate bounded financial measures from supplied inputs",
          capabilityIds: ["break-even", "simple-roi"],
          requestedOutputs: ["text"],
        },
      });
      expect(executable.structuredContent).toMatchObject({ executable: true, blockers: [] });

      const partial = await client.callTool({
        name: "validate_consulting_workflow",
        arguments: {
          objective: "Assess a new market and choose an entry approach",
          capabilityIds: ["market-attractiveness", "entry-strategy"],
          requestedOutputs: ["text"],
        },
      });
      expect(partial.structuredContent).toMatchObject({ executable: false });

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
