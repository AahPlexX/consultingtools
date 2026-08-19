import { describe, expect, it } from "vitest";
import {
  calculateEfficiencyRatios,
  calculateLeverageRatios,
  calculateLiquidityRatios,
  calculateMarginRatios,
  calculateReturnRatios,
} from "../src/finance/ratios.js";

describe("financial ratios", () => {
  it("calculates current and quick ratios from explicitly supplied liquidity components", () => {
    expect(
      calculateLiquidityRatios({
        currentAssets: 500,
        currentLiabilities: 250,
        cashAndEquivalents: 80,
        marketableSecurities: 20,
        accountsReceivable: 150,
      }),
    ).toMatchObject({ currentRatio: 2, quickRatio: 1 });
  });

  it("calculates debt-to-equity from explicit debt rather than silently substituting total liabilities", () => {
    const result = calculateLeverageRatios({ debt: 300, shareholdersEquity: 200 });
    expect(result.debtToEquity).toBe(1.5);
    expect(result.formulas.debtToEquity).toBe("debt / shareholdersEquity");
  });

  it("calculates gross, operating, and net margins against the same explicit revenue basis", () => {
    expect(
      calculateMarginRatios({ revenue: 1000, grossProfit: 400, operatingIncome: 180, netIncome: 120 }),
    ).toMatchObject({ grossMargin: 0.4, operatingMargin: 0.18, netMargin: 0.12 });
  });

  it("calculates inventory and asset turnover from average balance denominators", () => {
    expect(
      calculateEfficiencyRatios({ costOfSales: 600, averageInventory: 150, revenue: 1000, averageAssets: 500 }),
    ).toMatchObject({ inventoryTurnover: 4, assetTurnover: 2 });
  });

  it("calculates ROA and ROE from average balance denominators", () => {
    expect(calculateReturnRatios({ netIncome: 100, averageAssets: 500, averageEquity: 250 })).toMatchObject({
      returnOnAssets: 0.2,
      returnOnEquity: 0.4,
    });
  });

  it("rejects zero denominators instead of returning Infinity or NaN", () => {
    expect(() =>
      calculateLiquidityRatios({
        currentAssets: 1,
        currentLiabilities: 0,
        cashAndEquivalents: 1,
        marketableSecurities: 0,
        accountsReceivable: 0,
      }),
    ).toThrow(/currentLiabilities/i);
    expect(() => calculateLeverageRatios({ debt: 1, shareholdersEquity: 0 })).toThrow(/shareholdersEquity/i);
    expect(() => calculateMarginRatios({ revenue: 0, grossProfit: 1, operatingIncome: 1, netIncome: 1 })).toThrow(/revenue/i);
  });
});
