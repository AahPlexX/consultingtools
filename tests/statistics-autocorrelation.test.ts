import { describe, expect, it } from "vitest";
import {
  calculateAutocorrelation,
  calculateAutocorrelationSeries,
} from "../src/statistics/autocorrelation.js";

describe("autocorrelation", () => {
  it("uses the NIST centered numerator over lag pairs and denominator over all observations", () => {
    const result = calculateAutocorrelation([1, 2, 3, 4, 5], 1);
    expect(result.lag).toBe(1);
    expect(result.autocorrelation).toBeCloseTo(0.4, 12);
    expect(result.formula).toContain("mean");
    expect(result.convention).toMatch(/equally spaced/i);
  });

  it("builds ordered autocorrelations through maxLag", () => {
    const result = calculateAutocorrelationSeries([1, 2, 3, 4, 5], 3);
    expect(result.map(({ lag }) => lag)).toEqual([1, 2, 3]);
    for (const row of result) {
      expect(row.autocorrelation).toBeGreaterThanOrEqual(-1 - 1e-12);
      expect(row.autocorrelation).toBeLessThanOrEqual(1 + 1e-12);
    }
  });

  it("rejects invalid lags, non-finite values, and constant series", () => {
    expect(() => calculateAutocorrelation([1, 2, 3], 0)).toThrow(/lag/i);
    expect(() => calculateAutocorrelation([1, 2, 3], 3)).toThrow(/lag/i);
    expect(() => calculateAutocorrelation([1, Number.NaN, 3], 1)).toThrow(/finite/i);
    expect(() => calculateAutocorrelation([2, 2, 2], 1)).toThrow(/constant/i);
  });
});
