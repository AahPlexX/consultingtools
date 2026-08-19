import { describe, expect, it } from "vitest";
import {
  calculateMeanConfidenceInterval,
  calculateWelchTTest,
} from "../src/statistics/inference.js";

describe("mean confidence interval", () => {
  it("uses Student t with sample standard deviation when sigma is unknown", () => {
    const result = calculateMeanConfidenceInterval({
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      confidenceLevel: 0.95,
    });
    expect(result.mean).toBe(5.5);
    expect(result.degreesOfFreedom).toBe(9);
    expect(result.criticalValue).toBeCloseTo(2.2621571628, 8);
    expect(result.lower).toBeCloseTo(3.3341494103, 8);
    expect(result.upper).toBeCloseTo(7.6658505897, 8);
    expect(result.assumptions).toEqual(expect.arrayContaining([expect.stringMatching(/independent/i)]));
  });

  it("rejects a singleton and invalid confidence levels", () => {
    expect(() => calculateMeanConfidenceInterval({ values: [1], confidenceLevel: 0.95 })).toThrow(/at least two/i);
    expect(() => calculateMeanConfidenceInterval({ values: [1, 2], confidenceLevel: 1 })).toThrow(/confidenceLevel/i);
  });
});

describe("Welch two-sample t-test", () => {
  it("matches the official R Welch example for 1:10 versus 7:20", () => {
    const result = calculateWelchTTest({
      sampleA: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      sampleB: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      confidenceLevel: 0.95,
    });
    expect(result.meanA).toBe(5.5);
    expect(result.meanB).toBe(13.5);
    expect(result.meanDifference).toBe(-8);
    expect(result.tStatistic).toBeCloseTo(-5.4349297639, 8);
    expect(result.degreesOfFreedom).toBeCloseTo(21.9822123402, 8);
    expect(result.twoSidedPValue).toBeCloseTo(0.0000185528183251, 10);
    expect(result.confidenceInterval.lower).toBeCloseTo(-11.0528017252, 8);
    expect(result.confidenceInterval.upper).toBeCloseTo(-4.9471982748, 8);
  });

  it("does not phrase failure to reject as proof of equality", () => {
    const result = calculateWelchTTest({
      sampleA: [1, 2, 3, 4, 5],
      sampleB: [1.1, 2.1, 3.1, 4.1, 5.1],
      confidenceLevel: 0.95,
    });
    expect(result.rejectNullAtAlpha).toBe(false);
    expect(result.interpretation).toMatch(/insufficient evidence/i);
    expect(result.interpretation).not.toMatch(/equal populations/i);
  });

  it("rejects insufficient, non-finite, or effectively constant samples", () => {
    expect(() => calculateWelchTTest({ sampleA: [1], sampleB: [1, 2], confidenceLevel: 0.95 })).toThrow(/at least two/i);
    expect(() => calculateWelchTTest({ sampleA: [1, Number.NaN], sampleB: [1, 2], confidenceLevel: 0.95 })).toThrow(/finite/i);
    expect(() => calculateWelchTTest({ sampleA: [1, 1, 1], sampleB: [2, 2, 2], confidenceLevel: 0.95 })).toThrow(/variance/i);
  });
});
