import { describe, expect, it } from "vitest";
import { calculateBudgetVariance } from "../src/finance/variance.js";

describe("budget variance", () => {
  it("calculates absolute and percentage variance with an explicit favorable direction", () => {
    expect(calculateBudgetVariance({ budget: 100, actual: 115, favorableDirection: "higher" })).toEqual({
      budget: 100,
      actual: 115,
      favorableDirection: "higher",
      absoluteVariance: 15,
      percentVariance: 0.15,
      favorable: true,
      formulas: {
        absoluteVariance: "actual - budget",
        percentVariance: "budget === 0 ? null : (actual - budget) / budget",
      },
    });
    expect(calculateBudgetVariance({ budget: 100, actual: 115, favorableDirection: "lower" }).favorable).toBe(false);
  });

  it("returns a null percentage when the budget basis is zero", () => {
    expect(calculateBudgetVariance({ budget: 0, actual: 10, favorableDirection: "higher" }).percentVariance).toBeNull();
  });

  it("rejects non-finite inputs", () => {
    expect(() => calculateBudgetVariance({ budget: Number.NaN, actual: 10, favorableDirection: "higher" })).toThrow(/budget.*finite/i);
  });
});
