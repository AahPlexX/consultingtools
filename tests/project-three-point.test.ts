import { describe, expect, it } from "vitest";
import { calculateThreePointEstimate } from "../src/project/three-point.js";

describe("three-point estimate", () => {
  it("returns weighted PERT-style expectation, standard deviation, variance, and triangular mean", () => {
    expect(calculateThreePointEstimate({ optimistic: 4, mostLikely: 6, pessimistic: 10 })).toEqual({
      optimistic: 4,
      mostLikely: 6,
      pessimistic: 10,
      weightedExpectedValue: 19 / 3,
      standardDeviation: 1,
      variance: 1,
      triangularMean: 20 / 3,
      formulas: {
        weightedExpectedValue: "(optimistic + 4 * mostLikely + pessimistic) / 6",
        standardDeviation: "(pessimistic - optimistic) / 6",
        variance: "standardDeviation^2",
        triangularMean: "(optimistic + mostLikely + pessimistic) / 3",
      },
      convention: expect.stringMatching(/estimate/i),
    });
  });

  it("allows equal three-point inputs with zero variance", () => {
    const result = calculateThreePointEstimate({ optimistic: 5, mostLikely: 5, pessimistic: 5 });
    expect(result.weightedExpectedValue).toBe(5);
    expect(result.variance).toBe(0);
  });

  it("rejects out-of-order, negative, and non-finite estimates", () => {
    expect(() => calculateThreePointEstimate({ optimistic: 7, mostLikely: 6, pessimistic: 10 })).toThrow(/optimistic.*mostLikely/i);
    expect(() => calculateThreePointEstimate({ optimistic: 4, mostLikely: 11, pessimistic: 10 })).toThrow(/mostLikely.*pessimistic/i);
    expect(() => calculateThreePointEstimate({ optimistic: -1, mostLikely: 1, pessimistic: 2 })).toThrow(/optimistic/i);
    expect(() => calculateThreePointEstimate({ optimistic: 1, mostLikely: Number.NaN, pessimistic: 2 })).toThrow(/finite/i);
  });
});
