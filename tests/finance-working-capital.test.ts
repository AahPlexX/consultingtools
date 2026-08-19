import { describe, expect, it } from "vitest";
import {
  calculateCashConversionCycle,
  calculateWorkingCapital,
} from "../src/finance/working-capital.js";

describe("working capital", () => {
  it("calculates current assets less current liabilities", () => {
    expect(calculateWorkingCapital({ currentAssets: 500, currentLiabilities: 350 })).toEqual({
      currentAssets: 500,
      currentLiabilities: 350,
      workingCapital: 150,
      formula: "currentAssets - currentLiabilities",
    });
  });

  it("supports a working-capital deficit without relabeling it as an error", () => {
    expect(calculateWorkingCapital({ currentAssets: 80, currentLiabilities: 120 }).workingCapital).toBe(-40);
  });
});

describe("cash conversion cycle", () => {
  it("calculates DIO, DSO, DPO, and CCC from explicit average balances and flow bases", () => {
    expect(
      calculateCashConversionCycle({
        averageInventory: 100,
        averageReceivables: 80,
        averagePayables: 60,
        costOfSales: 400,
        netCreditSales: 800,
        purchasesOrCostBasis: 360,
        daysInPeriod: 360,
      }),
    ).toEqual({
      averageInventory: 100,
      averageReceivables: 80,
      averagePayables: 60,
      costOfSales: 400,
      netCreditSales: 800,
      purchasesOrCostBasis: 360,
      daysInPeriod: 360,
      daysInventoryOutstanding: 90,
      daysSalesOutstanding: 36,
      daysPayablesOutstanding: 60,
      cashConversionCycleDays: 66,
      formulas: {
        daysInventoryOutstanding: "averageInventory / costOfSales * daysInPeriod",
        daysSalesOutstanding: "averageReceivables / netCreditSales * daysInPeriod",
        daysPayablesOutstanding: "averagePayables / purchasesOrCostBasis * daysInPeriod",
        cashConversionCycleDays: "daysInventoryOutstanding + daysSalesOutstanding - daysPayablesOutstanding",
      },
    });
  });

  it("rejects missing economic denominators instead of dividing by zero", () => {
    expect(() =>
      calculateCashConversionCycle({
        averageInventory: 100,
        averageReceivables: 80,
        averagePayables: 60,
        costOfSales: 0,
        netCreditSales: 800,
        purchasesOrCostBasis: 360,
        daysInPeriod: 360,
      }),
    ).toThrow(/costOfSales.*greater than zero/i);
  });

  it("rejects negative balances and non-finite values", () => {
    expect(() => calculateWorkingCapital({ currentAssets: -1, currentLiabilities: 1 })).toThrow(/currentAssets/i);
    expect(() =>
      calculateCashConversionCycle({
        averageInventory: Number.NaN,
        averageReceivables: 1,
        averagePayables: 1,
        costOfSales: 1,
        netCreditSales: 1,
        purchasesOrCostBasis: 1,
        daysInPeriod: 365,
      }),
    ).toThrow(/finite/i);
  });
});
