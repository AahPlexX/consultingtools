import { describe, expect, it } from "vitest";
import { calculateNpv, calculateNpvSensitivity } from "../src/finance/discounted-cash-flow.js";

describe("NPV sensitivity", () => {
  it("preserves caller rate order and composes the canonical NPV convention", () => {
    const cashFlows = [-1000, 600, 600];
    const rates = [0, 0.1, 0.2];
    const result = calculateNpvSensitivity({ cashFlows, discountRatesPerPeriod: rates });

    expect(result.results.map(({ discountRatePerPeriod }) => discountRatePerPeriod)).toEqual(rates);
    for (const row of result.results) {
      expect(row.npv).toBeCloseTo(
        calculateNpv({ cashFlows, discountRatePerPeriod: row.discountRatePerPeriod }).npv,
        12,
      );
    }
    expect(result.convention).toContain("calculateNpv");
  });

  it("rejects an empty rate grid and invalid rates", () => {
    expect(() =>
      calculateNpvSensitivity({ cashFlows: [-1, 2], discountRatesPerPeriod: [] }),
    ).toThrow(/discountRatesPerPeriod/i);
    expect(() =>
      calculateNpvSensitivity({ cashFlows: [-1, 2], discountRatesPerPeriod: [0.1, -1] }),
    ).toThrow(/greater than -1/i);
    expect(() =>
      calculateNpvSensitivity({ cashFlows: [-1, 2], discountRatesPerPeriod: [Number.NaN] }),
    ).toThrow(/finite/i);
  });
});
