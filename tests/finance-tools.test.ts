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

const financeToolNames = [
  "calculate_break_even",
  "calculate_simple_roi",
  "calculate_npv",
  "calculate_payback",
  "calculate_irr",
  "calculate_working_capital",
  "calculate_cash_conversion_cycle",
  "calculate_financial_ratios",
  "calculate_budget_variance",
  "compare_financial_scenarios",
  "calculate_npv_sensitivity",
] as const;

describe("finance MCP tools", () => {
  it("exposes focused finance actions as read-only closed-world deterministic tools", async () => {
    const { client, handler } = await connectedClient();
    try {
      const tools = await client.listTools();
      for (const name of financeToolNames) {
        expect(tools.tools.find((tool) => tool.name === name)?.annotations).toMatchObject({
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        });
      }
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("preserves existing break-even and simple ROI behavior", async () => {
    const { client, handler } = await connectedClient();
    try {
      const breakEven = await client.callTool({
        name: "calculate_break_even",
        arguments: { fixedCosts: 120000, pricePerUnit: 80, variableCostPerUnit: 50 },
      });
      expect(breakEven.structuredContent).toMatchObject({
        breakEvenUnitsExact: 4000,
        breakEvenRevenue: 320000,
      });

      const roi = await client.callTool({
        name: "calculate_simple_roi",
        arguments: { totalBenefits: 150000, totalCosts: 100000, periodMonths: 12 },
      });
      expect(roi.structuredContent).toMatchObject({ roiPercent: 50, periodMonths: 12 });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("executes NPV, ambiguity-aware IRR, and discounted payback through MCP", async () => {
    const { client, handler } = await connectedClient();
    try {
      const npv = await client.callTool({
        name: "calculate_npv",
        arguments: { cashFlows: [-1000, 600, 600], discountRatePerPeriod: 0.1 },
      });
      expect(npv.isError).not.toBe(true);
      expect(npv.structuredContent).toMatchObject({ npv: expect.any(Number) });

      const irr = await client.callTool({
        name: "calculate_irr",
        arguments: { cashFlows: [-100, 230, -132] },
      });
      expect(irr.structuredContent).toMatchObject({ status: "multiple" });

      const payback = await client.callTool({
        name: "calculate_payback",
        arguments: { cashFlows: [-100, 60, 60], discountRatePerPeriod: 0.1 },
      });
      expect(payback.structuredContent).toMatchObject({ mode: "discounted", recovered: true });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("executes working-capital, ratio, variance, scenario, and sensitivity primitives", async () => {
    const { client, handler } = await connectedClient();
    try {
      const workingCapital = await client.callTool({
        name: "calculate_working_capital",
        arguments: { currentAssets: 500, currentLiabilities: 350 },
      });
      expect(workingCapital.structuredContent).toMatchObject({ workingCapital: 150 });

      const ratio = await client.callTool({
        name: "calculate_financial_ratios",
        arguments: {
          kind: "margins",
          revenue: 1000,
          grossProfit: 400,
          operatingIncome: 180,
          netIncome: 120,
        },
      });
      expect(ratio.structuredContent).toMatchObject({
        kind: "margins",
        result: { operatingMargin: 0.18 },
      });

      const variance = await client.callTool({
        name: "calculate_budget_variance",
        arguments: { budget: 100, actual: 115, favorableDirection: "higher" },
      });
      expect(variance.structuredContent).toMatchObject({ absoluteVariance: 15, favorable: true });

      const scenarios = await client.callTool({
        name: "compare_financial_scenarios",
        arguments: {
          baselineId: "base",
          scenarios: [
            { id: "base", metrics: { revenue: 100 } },
            { id: "upside", metrics: { revenue: 120 } },
          ],
        },
      });
      expect(scenarios.structuredContent).toMatchObject({ metricKeys: ["revenue"] });

      const sensitivity = await client.callTool({
        name: "calculate_npv_sensitivity",
        arguments: { cashFlows: [-1000, 600, 600], discountRatesPerPeriod: [0, 0.1, 0.2] },
      });
      expect(sensitivity.structuredContent).toMatchObject({ results: expect.any(Array) });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("returns deterministic MCP errors for invalid finance domains", async () => {
    const { client, handler } = await connectedClient();
    try {
      const invalid = await client.callTool({
        name: "calculate_irr",
        arguments: { cashFlows: [1, 2, 3] },
      });
      expect(invalid.isError).toBe(true);
      expect(invalid.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ text: expect.stringMatching(/positive.*negative/i) })]),
      );
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
