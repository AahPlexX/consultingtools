import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), { fetch: (url, init) => handler.fetch(new Request(url, init)) });
  const client = new Client({ name: "operations-tools-test", version: "1.0.0" }, { versionNegotiation: { mode: "auto" } });
  await client.connect(transport);
  return { client, handler };
}

const names = ["calculate_capacity_utilization", "calculate_flow_performance", "calculate_weighted_decision"] as const;

describe("operations MCP tools", () => {
  it("exposes deterministic operations tools with safe annotations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const tools = await client.listTools();
      for (const name of names) expect(tools.tools.find((tool) => tool.name === name)?.annotations).toMatchObject({ readOnlyHint: true, openWorldHint: false, destructiveHint: false });
    } finally { await client.close(); await handler.close(); }
  });

  it("executes capacity, flow, and weighted decision calculations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const capacity = await client.callTool({ name: "calculate_capacity_utilization", arguments: { usedCapacity: 80, availableCapacity: 100 } });
      expect(capacity.structuredContent).toMatchObject({ utilizationRatio: 0.8, utilizationPercent: 80 });

      const flow = await client.callTool({ name: "calculate_flow_performance", arguments: { completedUnits: 100, elapsedTime: 20 } });
      expect(flow.structuredContent).toMatchObject({ throughput: 5, averageCycleTime: 0.2 });

      const decision = await client.callTool({ name: "calculate_weighted_decision", arguments: {
        criteria: [{ id: "cost", weight: 2 }, { id: "quality", weight: 3 }],
        options: [{ id: "A", scores: { cost: 8, quality: 7 } }, { id: "B", scores: { cost: 6, quality: 9 } }],
      } });
      expect(decision.structuredContent).toMatchObject({ options: [{ id: "B", rank: 1, weightedScore: 7.8 }, { id: "A", rank: 2, weightedScore: 7.4 }] });
    } finally { await client.close(); await handler.close(); }
  });
});
