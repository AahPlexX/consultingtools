import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), { fetch: (url, init) => handler.fetch(new Request(url, init)) });
  const client = new Client({ name: "supply-chain-tools-test", version: "1.0.0" }, { versionNegotiation: { mode: "auto" } });
  await client.connect(transport);
  return { client, handler };
}

const names = ["calculate_reorder_point", "calculate_eoq", "analyze_supplier_spend"] as const;

describe("supply-chain MCP tools", () => {
  it("exposes deterministic supply-chain tools with safe annotations", async () => {
    const { client, handler } = await connectedClient();
    try {
      const tools = await client.listTools();
      for (const name of names) expect(tools.tools.find((tool) => tool.name === name)?.annotations).toMatchObject({ readOnlyHint: true, openWorldHint: false, destructiveHint: false });
    } finally { await client.close(); await handler.close(); }
  });

  it("executes reorder point, EOQ, and supplier-spend analysis", async () => {
    const { client, handler } = await connectedClient();
    try {
      const reorder = await client.callTool({ name: "calculate_reorder_point", arguments: { demandRatePerPeriod: 20, leadTimePeriods: 5, safetyStock: 30 } });
      expect(reorder.structuredContent).toMatchObject({ demandDuringLeadTime: 100, reorderPoint: 130 });

      const eoq = await client.callTool({ name: "calculate_eoq", arguments: { annualDemand: 10000, orderCost: 50, carryingRate: 0.2, unitCost: 25 } });
      expect(eoq.structuredContent).toMatchObject({ annualHoldingCostPerUnit: 5, economicOrderQuantity: expect.any(Number) });

      const spend = await client.callTool({ name: "analyze_supplier_spend", arguments: { suppliers: [
        { id: "a", name: "Alpha", spend: 50 }, { id: "b", name: "Beta", spend: 30 }, { id: "c", name: "Gamma", spend: 20 },
      ], topN: 2 } });
      expect(spend.structuredContent).toMatchObject({ totalSpend: 100, topNShare: 0.8 });
    } finally { await client.close(); await handler.close(); }
  });
});
