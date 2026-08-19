import { describe, expect, it } from "vitest";
import { calculateEoq, calculateReorderPoint } from "../src/supply-chain/inventory.js";

describe("reorder point", () => {
  it("calculates demand during lead time plus safety stock", () => {
    expect(calculateReorderPoint({ demandRatePerPeriod: 20, leadTimePeriods: 5, safetyStock: 30 })).toEqual({
      demandRatePerPeriod: 20,
      leadTimePeriods: 5,
      safetyStock: 30,
      demandDuringLeadTime: 100,
      reorderPoint: 130,
      formulas: {
        demandDuringLeadTime: "demandRatePerPeriod * leadTimePeriods",
        reorderPoint: "demandDuringLeadTime + safetyStock",
      },
      convention: expect.stringMatching(/same time basis/i),
    });
  });

  it("allows zero demand, zero lead time, and zero safety stock", () => {
    expect(calculateReorderPoint({ demandRatePerPeriod: 0, leadTimePeriods: 0, safetyStock: 0 }).reorderPoint).toBe(0);
  });

  it("rejects negative or non-finite inputs", () => {
    expect(() => calculateReorderPoint({ demandRatePerPeriod: -1, leadTimePeriods: 1, safetyStock: 0 })).toThrow(/demandRatePerPeriod/i);
    expect(() => calculateReorderPoint({ demandRatePerPeriod: 1, leadTimePeriods: Number.NaN, safetyStock: 0 })).toThrow(/finite/i);
  });
});

describe("classical EOQ", () => {
  it("calculates the classical order quantity from annual demand, order cost, carrying rate, and unit cost", () => {
    const result = calculateEoq({ annualDemand: 10000, orderCost: 50, carryingRate: 0.2, unitCost: 25 });
    expect(result.annualHoldingCostPerUnit).toBe(5);
    expect(result.economicOrderQuantity).toBeCloseTo(Math.sqrt(200000), 12);
    expect(result.formula).toContain("sqrt");
    expect(result.convention).toMatch(/classical/i);
  });

  it("returns zero EOQ for zero annual demand", () => {
    expect(calculateEoq({ annualDemand: 0, orderCost: 50, carryingRate: 0.2, unitCost: 25 }).economicOrderQuantity).toBe(0);
  });

  it("requires positive order cost, carrying rate, and unit cost", () => {
    expect(() => calculateEoq({ annualDemand: 1, orderCost: 0, carryingRate: 0.2, unitCost: 25 })).toThrow(/orderCost/i);
    expect(() => calculateEoq({ annualDemand: 1, orderCost: 1, carryingRate: 0, unitCost: 25 })).toThrow(/carryingRate/i);
    expect(() => calculateEoq({ annualDemand: 1, orderCost: 1, carryingRate: 0.2, unitCost: 0 })).toThrow(/unitCost/i);
  });
});
