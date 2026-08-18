import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

async function connectedClient() {
  const handler = createHttpHandler();
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "finance-tools-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler };
}

describe("finance MCP tools", () => {
  it("exposes break-even calculation as a read-only deterministic tool", async () => {
    const { client, handler } = await connectedClient();
    try {
      const tools = await client.listTools();
      expect(tools.tools.find((tool) => tool.name === "calculate_break_even")?.annotations).toMatchObject({
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      });

      const result = await client.callTool({
        name: "calculate_break_even",
        arguments: { fixedCosts: 120000, pricePerUnit: 80, variableCostPerUnit: 50 },
      });
      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        breakEvenUnitsExact: 4000,
        breakEvenUnitsWhole: 4000,
        breakEvenRevenue: 320000,
        contributionMarginPerUnit: 30,
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("returns formula and time basis for simple ROI", async () => {
    const { client, handler } = await connectedClient();
    try {
      const result = await client.callTool({
        name: "calculate_simple_roi",
        arguments: { totalBenefits: 150000, totalCosts: 100000, periodMonths: 12 },
      });
      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toEqual({
        totalBenefits: 150000,
        totalCosts: 100000,
        netBenefit: 50000,
        roiRatio: 0.5,
        roiPercent: 50,
        periodMonths: 12,
        formula: "(totalBenefits - totalCosts) / totalCosts",
      });
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
