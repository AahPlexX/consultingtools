import { describe, expect, it } from "vitest";
import { calculateIrr } from "../src/finance/irr.js";

describe("periodic IRR", () => {
  it("returns the unique periodic rate that makes NPV zero", () => {
    const result = calculateIrr({ cashFlows: [-100, 110] });
    expect(result.status).toBe("unique");
    expect(result.roots).toHaveLength(1);
    expect(result.roots[0]).toBeCloseTo(0.1, 9);
    expect(result.residualNpvs[0]).toBeCloseTo(0, 8);
  });

  it("detects multiple acceptable roots instead of presenting the first root as unique", () => {
    const result = calculateIrr({ cashFlows: [-100, 230, -132] });
    expect(result.status).toBe("multiple");
    expect(result.roots).toHaveLength(2);
    expect(result.roots[0]).toBeCloseTo(0.1, 7);
    expect(result.roots[1]).toBeCloseTo(0.2, 7);
    expect(result.warning).toMatch(/multiple/i);
  });

  it("returns none for a valid mixed-sign series with no real rate in the documented search domain", () => {
    const result = calculateIrr({ cashFlows: [-100, 50, -10] });
    expect(result.status).toBe("none");
    expect(result.roots).toEqual([]);
  });

  it("rejects series without at least one positive and one negative cash flow", () => {
    expect(() => calculateIrr({ cashFlows: [1, 2, 3] })).toThrow(/positive.*negative/i);
    expect(() => calculateIrr({ cashFlows: [-1, -2, -3] })).toThrow(/positive.*negative/i);
  });

  it("rejects non-finite cash flows and unbounded input lengths", () => {
    expect(() => calculateIrr({ cashFlows: [-1, Number.NaN, 2] })).toThrow(/finite/i);
    expect(() => calculateIrr({ cashFlows: Array.from({ length: 513 }, (_, index) => (index === 0 ? -1 : 1)) })).toThrow(/512/);
  });
});
