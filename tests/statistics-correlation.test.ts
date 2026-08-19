import { describe, expect, it } from "vitest";
import {
  calculatePearsonCorrelation,
  calculateSpearmanCorrelation,
} from "../src/statistics/correlation.js";

describe("correlation", () => {
  it("calculates perfect positive and negative Pearson correlation", () => {
    expect(calculatePearsonCorrelation([1, 2, 3], [2, 4, 6]).correlation).toBeCloseTo(1, 12);
    expect(calculatePearsonCorrelation([1, 2, 3], [6, 4, 2]).correlation).toBeCloseTo(-1, 12);
  });

  it("calculates a known non-perfect Pearson correlation", () => {
    const result = calculatePearsonCorrelation([1, 2, 3, 4], [1, 3, 2, 5]);
    expect(result.correlation).toBeCloseTo(0.8315218406, 10);
    expect(result.count).toBe(4);
  });

  it("calculates Spearman correlation using average ranks for ties", () => {
    const result = calculateSpearmanCorrelation([1, 2, 2, 4], [10, 20, 30, 40]);
    expect(result.ranksX).toEqual([1, 2.5, 2.5, 4]);
    expect(result.ranksY).toEqual([1, 2, 3, 4]);
    expect(result.correlation).toBeCloseTo(0.9486832981, 10);
  });

  it("rejects unequal lengths, fewer than two pairs, non-finite values, and zero variance", () => {
    expect(() => calculatePearsonCorrelation([1, 2], [1])).toThrow(/same length/i);
    expect(() => calculatePearsonCorrelation([1], [2])).toThrow(/at least two/i);
    expect(() => calculatePearsonCorrelation([1, Number.NaN], [1, 2])).toThrow(/finite/i);
    expect(() => calculatePearsonCorrelation([1, 1, 1], [1, 2, 3])).toThrow(/zero variance/i);
  });
});
