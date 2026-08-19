import { describe, expect, it } from "vitest";
import { compareFinancialScenarios } from "../src/finance/scenarios.js";

describe("financial scenario comparison", () => {
  it("compares caller-supplied scenarios against a named baseline without inventing values", () => {
    const result = compareFinancialScenarios({
      baselineId: "base",
      scenarios: [
        { id: "base", metrics: { revenue: 100, operatingProfit: 20 } },
        { id: "upside", metrics: { revenue: 120, operatingProfit: 30 } },
        { id: "downside", metrics: { revenue: 80, operatingProfit: 10 } },
      ],
    });

    expect(result.metricKeys).toEqual(["operatingProfit", "revenue"]);
    expect(result.scenarios.find(({ id }) => id === "upside")).toMatchObject({
      deltasFromBaseline: { revenue: 20, operatingProfit: 10 },
      percentDeltasFromBaseline: { revenue: 0.2, operatingProfit: 0.5 },
    });
  });

  it("returns null percentage deltas when a baseline metric is zero", () => {
    const result = compareFinancialScenarios({
      baselineId: "base",
      scenarios: [
        { id: "base", metrics: { profit: 0 } },
        { id: "case", metrics: { profit: 10 } },
      ],
    });
    expect(result.scenarios[1]?.percentDeltasFromBaseline.profit).toBeNull();
  });

  it("rejects duplicate IDs, missing baselines, mismatched metric keys, and non-finite metrics", () => {
    expect(() =>
      compareFinancialScenarios({
        baselineId: "base",
        scenarios: [
          { id: "base", metrics: { revenue: 1 } },
          { id: "base", metrics: { revenue: 2 } },
        ],
      }),
    ).toThrow(/unique/i);

    expect(() =>
      compareFinancialScenarios({
        baselineId: "missing",
        scenarios: [
          { id: "base", metrics: { revenue: 1 } },
          { id: "case", metrics: { revenue: 2 } },
        ],
      }),
    ).toThrow(/baseline/i);

    expect(() =>
      compareFinancialScenarios({
        baselineId: "base",
        scenarios: [
          { id: "base", metrics: { revenue: 1 } },
          { id: "case", metrics: { profit: 2 } },
        ],
      }),
    ).toThrow(/metric keys/i);

    expect(() =>
      compareFinancialScenarios({
        baselineId: "base",
        scenarios: [
          { id: "base", metrics: { revenue: 1 } },
          { id: "case", metrics: { revenue: Number.POSITIVE_INFINITY } },
        ],
      }),
    ).toThrow(/finite/i);
  });
});
