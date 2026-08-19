import { describe, expect, it } from "vitest";
import { calculateNpv } from "../src/finance/discounted-cash-flow.js";

describe("periodic NPV", () => {
  it("treats cashFlows[0] as t=0 and discounts later periodic cash flows", () => {
    const result = calculateNpv({
      cashFlows: [-1000, 600, 600],
      discountRatePerPeriod: 0.1,
    });

    expect(result.npv).toBeCloseTo(41.3223140496, 10);
    expect(result.presentValues[0]).toMatchObject({
      period: 0,
      cashFlow: -1000,
      discountFactor: 1,
      presentValue: -1000,
    });
    expect(result.presentValues[1]?.presentValue).toBeCloseTo(545.4545454545, 10);
    expect(result.formula).toContain("t=0");
    expect(result.convention).toContain("cashFlows[0]");
  });

  it("accepts a zero discount rate without changing cash flows", () => {
    const result = calculateNpv({ cashFlows: [-100, 40, 70], discountRatePerPeriod: 0 });
    expect(result.npv).toBe(10);
  });

  it("rejects an empty series, non-finite cash flows, and a rate at or below negative 100 percent", () => {
    expect(() => calculateNpv({ cashFlows: [], discountRatePerPeriod: 0.1 })).toThrow(/cashFlows/i);
    expect(() => calculateNpv({ cashFlows: [-1, Number.NaN], discountRatePerPeriod: 0.1 })).toThrow(/finite/i);
    expect(() => calculateNpv({ cashFlows: [-1, 2], discountRatePerPeriod: -1 })).toThrow(/greater than -1/i);
  });

  it("rejects a non-finite computed present value rather than returning false precision", () => {
    expect(() =>
      calculateNpv({ cashFlows: [Number.MAX_VALUE, Number.MAX_VALUE], discountRatePerPeriod: 0 }),
    ).toThrow(/finite/i);
  });
});
