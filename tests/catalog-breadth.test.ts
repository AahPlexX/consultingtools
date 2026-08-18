import { describe, expect, it } from "vitest";
import { strategyMarketCapabilities } from "../src/catalog/families/strategy-market.js";
import { customerGrowthCapabilities } from "../src/catalog/families/customer-growth.js";
import { financeMaCapabilities } from "../src/catalog/families/finance-ma.js";
import { operationsSupplyCapabilities } from "../src/catalog/families/operations-supply.js";

describe("capability family breadth", () => {
  it("preserves established strategy and market stable IDs", () => {
    expect(strategyMarketCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "swot", "pestle", "porter-five-forces", "vrio", "market-sizing",
        "market-attractiveness", "entry-strategy",
      ]),
    );
  });

  it("preserves customer/growth IDs and adds distinct commercial outcomes", () => {
    expect(customerGrowthCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "segmentation", "jobs-to-be-done", "pricing-strategy", "funnel", "cro",
        "sales-pipeline-diagnostic", "sales-territory-analysis", "packaging-analysis",
        "retention-analysis", "churn-analysis",
      ]),
    );
  });

  it("covers corporate finance, FP&A, investment, and M&A outcomes", () => {
    expect(financeMaCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "break-even", "roi", "npv", "irr", "payback", "dcf", "financial-ratios",
        "working-capital", "cash-conversion-cycle", "budget-variance", "price-volume-mix",
        "cash-flow-forecast", "total-cost-of-ownership", "target-screening",
        "commercial-diligence", "financial-diligence", "operational-diligence",
        "synergy-identification", "synergy-sizing", "integration-complexity",
        "integration-planning",
      ]),
    );
  });

  it("covers operations, quality, supply chain, procurement, and vendor outcomes", () => {
    expect(operationsSupplyCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "process-map", "sipoc", "value-stream", "pareto", "five-whys", "fishbone", "fmea",
        "capacity", "utilization", "throughput", "cycle-time", "control-plan",
        "demand-supply-diagnostic", "inventory-analysis", "supplier-segmentation",
        "sourcing-strategy", "procurement-opportunity", "lead-time-analysis",
        "service-level-tradeoff", "network-cost-diagnostic", "make-buy", "supplier-risk",
        "spend-analysis",
      ]),
    );
  });

  it("makes every family entry routing-ready", () => {
    expect([
      ...strategyMarketCapabilities,
      ...customerGrowthCapabilities,
      ...financeMaCapabilities,
      ...operationsSupplyCapabilities,
    ].every(({ routingReady }) => routingReady)).toBe(true);
  });
});
