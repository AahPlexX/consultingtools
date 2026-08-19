import { describe, expect, it } from "vitest";
import { calculateEarnedValuePerformance } from "../src/project/earned-value.js";

describe("earned value performance", () => {
  it("calculates schedule/cost variance and SPI/CPI from explicit PV, EV, and AC", () => {
    expect(calculateEarnedValuePerformance({ plannedValue: 100, earnedValue: 90, actualCost: 120 })).toEqual({
      plannedValue: 100,
      earnedValue: 90,
      actualCost: 120,
      scheduleVariance: -10,
      costVariance: -30,
      schedulePerformanceIndex: 0.9,
      costPerformanceIndex: 0.75,
      formulas: {
        scheduleVariance: "earnedValue - plannedValue",
        costVariance: "earnedValue - actualCost",
        schedulePerformanceIndex: "plannedValue === 0 ? null : earnedValue / plannedValue",
        costPerformanceIndex: "actualCost === 0 ? null : earnedValue / actualCost",
      },
    });
  });

  it("returns null indexes for zero denominators rather than Infinity", () => {
    expect(calculateEarnedValuePerformance({ plannedValue: 0, earnedValue: 0, actualCost: 0 })).toMatchObject({
      schedulePerformanceIndex: null,
      costPerformanceIndex: null,
    });
  });

  it("rejects negative and non-finite PV, EV, or AC", () => {
    expect(() => calculateEarnedValuePerformance({ plannedValue: -1, earnedValue: 0, actualCost: 0 })).toThrow(/plannedValue/i);
    expect(() => calculateEarnedValuePerformance({ plannedValue: 1, earnedValue: Number.NaN, actualCost: 1 })).toThrow(/earnedValue.*finite/i);
  });
});
