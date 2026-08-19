import { describe, expect, it } from "vitest";
import { calculatePayback } from "../src/finance/payback.js";

describe("payback period", () => {
  it("interpolates recovery within the crossing period for periodic cash flows", () => {
    const result = calculatePayback({ cashFlows: [-100, 60, 60] });
    expect(result.recovered).toBe(true);
    expect(result.paybackPeriod).toBeCloseTo(1.6666666667, 10);
    expect(result.wholePeriodsBeforeRecovery).toBe(1);
    expect(result.fractionOfRecoveryPeriod).toBeCloseTo(2 / 3, 10);
    expect(result.mode).toBe("simple");
  });

  it("calculates discounted payback using present-value cash flows", () => {
    const result = calculatePayback({
      cashFlows: [-100, 60, 60],
      discountRatePerPeriod: 0.1,
    });
    expect(result.recovered).toBe(true);
    expect(result.paybackPeriod).toBeCloseTo(1.9166666667, 10);
    expect(result.mode).toBe("discounted");
    expect(result.rows[1]?.effectiveCashFlow).toBeCloseTo(54.5454545455, 10);
  });

  it("returns zero for an investment already recovered at t=0", () => {
    const result = calculatePayback({ cashFlows: [25, -5, 10] });
    expect(result.paybackPeriod).toBe(0);
    expect(result.recovered).toBe(true);
  });

  it("returns null rather than inventing a recovery period when cumulative cash flow never reaches zero", () => {
    const result = calculatePayback({ cashFlows: [-100, 20, 20] });
    expect(result.recovered).toBe(false);
    expect(result.paybackPeriod).toBeNull();
    expect(result.wholePeriodsBeforeRecovery).toBeNull();
    expect(result.fractionOfRecoveryPeriod).toBeNull();
  });

  it("rejects empty or non-finite cash flows and invalid discount rates", () => {
    expect(() => calculatePayback({ cashFlows: [] })).toThrow(/cashFlows/i);
    expect(() => calculatePayback({ cashFlows: [-1, Number.POSITIVE_INFINITY] })).toThrow(/finite/i);
    expect(() => calculatePayback({ cashFlows: [-100, 110], discountRatePerPeriod: -1 })).toThrow(/greater than -1/i);
  });
});
