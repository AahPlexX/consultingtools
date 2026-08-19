import { describe, expect, it } from "vitest";
import {
  calculateDescriptiveStatistics,
  quantileType7,
} from "../src/statistics/descriptive.js";

describe("type-7 quantiles", () => {
  it("uses h = 1 + (n - 1) p with linear interpolation", () => {
    const values = [1, 2, 3, 4, 5];
    expect(quantileType7(values, 0)).toBe(1);
    expect(quantileType7(values, 0.25)).toBe(2);
    expect(quantileType7(values, 0.5)).toBe(3);
    expect(quantileType7(values, 0.75)).toBe(4);
    expect(quantileType7(values, 1)).toBe(5);
    expect(quantileType7([0, 10], 0.25)).toBe(2.5);
  });

  it("rejects probabilities outside [0,1] and non-finite values", () => {
    expect(() => quantileType7([1, 2], -0.1)).toThrow(/probability/i);
    expect(() => quantileType7([1, Number.NaN], 0.5)).toThrow(/finite/i);
  });
});

describe("descriptive statistics", () => {
  it("reports location, scale, and quartiles with explicit sample/population variance", () => {
    const result = calculateDescriptiveStatistics([1, 2, 3, 4, 5]);
    expect(result).toMatchObject({
      count: 5,
      sum: 15,
      mean: 3,
      median: 3,
      min: 1,
      max: 5,
      sampleVariance: 2.5,
      populationVariance: 2,
      sampleStandardDeviation: Math.sqrt(2.5),
      populationStandardDeviation: Math.sqrt(2),
      q1: 2,
      q3: 4,
      iqr: 2,
      quantileMethod: "type-7",
    });
    expect(result.formulas.sampleVariance).toContain("n - 1");
  });

  it("returns null sample variance/std for a singleton instead of pretending zero uncertainty", () => {
    const result = calculateDescriptiveStatistics([7]);
    expect(result.sampleVariance).toBeNull();
    expect(result.sampleStandardDeviation).toBeNull();
    expect(result.populationVariance).toBe(0);
    expect(result.populationStandardDeviation).toBe(0);
  });

  it("rejects empty and non-finite numeric samples", () => {
    expect(() => calculateDescriptiveStatistics([])).toThrow(/at least one/i);
    expect(() => calculateDescriptiveStatistics([1, Number.POSITIVE_INFINITY])).toThrow(/finite/i);
  });
});
