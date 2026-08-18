import { describe, expect, it } from "vitest";
import { strategyMarketCapabilities } from "../src/catalog/families/strategy-market.js";
import { customerGrowthCapabilities } from "../src/catalog/families/customer-growth.js";

describe("strategy, market, customer, and growth capability families", () => {
  it("preserves established strategy and market stable IDs", () => {
    const ids = strategyMarketCapabilities.map(({ id }) => id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "swot",
        "pestle",
        "porter-five-forces",
        "vrio",
        "market-sizing",
        "market-attractiveness",
        "entry-strategy",
      ]),
    );
  });

  it("preserves established customer/growth IDs and adds distinct commercial outcomes", () => {
    const ids = customerGrowthCapabilities.map(({ id }) => id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "segmentation",
        "jobs-to-be-done",
        "pricing-strategy",
        "funnel",
        "cro",
        "sales-pipeline-diagnostic",
        "sales-territory-analysis",
        "packaging-analysis",
        "retention-analysis",
        "churn-analysis",
      ]),
    );
  });

  it("makes every family entry routing-ready", () => {
    expect([...strategyMarketCapabilities, ...customerGrowthCapabilities].every(({ routingReady }) => routingReady)).toBe(true);
  });
});
