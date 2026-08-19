import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client({ name: "project-tools-test", version: "1.0.0" }, { versionNegotiation: { mode: "auto" } });
  await client.connect(transport);
  return { client, handler };
}

const names = ["calculate_critical_path", "calculate_three_point_estimate", "calculate_earned_value_performance"] as const;

describe("project MCP tools", () => {
  it("exposes deterministic project tools with safe annotations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const tools = await client.listTools();
      for (const name of names) {
        expect(tools.tools.find((tool) => tool.name === name)?.annotations).toMatchObject({ readOnlyHint: true, openWorldHint: false, destructiveHint: false });
      }
    } finally { await client.close(); await handler.close(); }
  });

  it("executes critical path, three-point, and earned value calculations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const critical = await client.callTool({ name: "calculate_critical_path", arguments: { activities: [
        { id: "A", duration: 3, predecessorIds: [] },
        { id: "B", duration: 2, predecessorIds: ["A"] },
        { id: "C", duration: 4, predecessorIds: ["A"] },
        { id: "D", duration: 2, predecessorIds: ["B", "C"] },
      ] } });
      expect(critical.structuredContent).toMatchObject({ projectDuration: 9, criticalActivityIds: ["A", "C", "D"] });

      const threePoint = await client.callTool({ name: "calculate_three_point_estimate", arguments: { optimistic: 4, mostLikely: 6, pessimistic: 10 } });
      expect(threePoint.structuredContent).toMatchObject({ weightedExpectedValue: 19 / 3, variance: 1 });

      const evm = await client.callTool({ name: "calculate_earned_value_performance", arguments: { plannedValue: 100, earnedValue: 90, actualCost: 120 } });
      expect(evm.structuredContent).toMatchObject({ scheduleVariance: -10, costVariance: -30, schedulePerformanceIndex: 0.9, costPerformanceIndex: 0.75 });
    } finally { await client.close(); await handler.close(); }
  });

  it("returns MCP errors for invalid schedule graphs", async () => {
    const { client, handler } = await connectedClient();
    try {
      const invalid = await client.callTool({ name: "calculate_critical_path", arguments: { activities: [
        { id: "A", duration: 1, predecessorIds: ["B"] },
        { id: "B", duration: 1, predecessorIds: ["A"] },
      ] } });
      expect(invalid.isError).toBe(true);
      expect(invalid.content).toEqual(expect.arrayContaining([expect.objectContaining({ text: expect.stringMatching(/cycle/i) })]));
    } finally { await client.close(); await handler.close(); }
  });
});
