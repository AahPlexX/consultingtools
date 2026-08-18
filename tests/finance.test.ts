import { describe, expect, it } from "vitest";
import { calculateBreakEven, calculateSimpleRoi } from "../src/finance/calculations.js";

describe("deterministic finance calculations", () => {
  it("calculates unit and revenue break-even from explicit contribution economics", () => {
    expect(
      calculateBreakEven({
        fixedCosts: 120_000,
        pricePerUnit: 80,
        variableCostPerUnit: 50,
      }),
    ).toEqual({
      fixedCosts: 120_000,
      pricePerUnit: 80,
      variableCostPerUnit: 50,
      contributionMarginPerUnit: 30,
      contributionMarginRatio: 0.375,
      breakEvenUnitsExact: 4000,
      breakEvenUnitsWhole: 4000,
      breakEvenRevenue: 320_000,
      formulas: {
        contributionMarginPerUnit: "pricePerUnit - variableCostPerUnit",
        contributionMarginRatio: "contributionMarginPerUnit / pricePerUnit",
        breakEvenUnitsExact: "fixedCosts / contributionMarginPerUnit",
        breakEvenRevenue: "fixedCosts / contributionMarginRatio",
      },
    });
  });

  it("rounds required whole units upward without changing the exact calculation", () => {
    const result = calculateBreakEven({
      fixedCosts: 100,
      pricePerUnit: 9,
      variableCostPerUnit: 5,
    });
    expect(result.breakEvenUnitsExact).toBe(25);
    expect(result.breakEvenUnitsWhole).toBe(25);

    const fractional = calculateBreakEven({
      fixedCosts: 101,
      pricePerUnit: 9,
      variableCostPerUnit: 5,
    });
    expect(fractional.breakEvenUnitsExact).toBe(25.25);
    expect(fractional.breakEvenUnitsWhole).toBe(26);
  });

  it("rejects a non-positive contribution margin", () => {
    expect(() =>
      calculateBreakEven({ fixedCosts: 1000, pricePerUnit: 20, variableCostPerUnit: 20 }),
    ).toThrow(/contribution margin/i);
  });

  it("calculates simple ROI from total benefits and total costs with an explicit time basis", () => {
    expect(
      calculateSimpleRoi({
        totalBenefits: 150_000,
        totalCosts: 100_000,
        periodMonths: 12,
      }),
    ).toEqual({
      totalBenefits: 150_000,
      totalCosts: 100_000,
      netBenefit: 50_000,
      roiRatio: 0.5,
      roiPercent: 50,
      periodMonths: 12,
      formula: "(totalBenefits - totalCosts) / totalCosts",
    });
  });

  it("rejects zero total costs because simple ROI would be undefined", () => {
    expect(() => calculateSimpleRoi({ totalBenefits: 10, totalCosts: 0 })).toThrow(
      /greater than zero/i,
    );
  });
});
