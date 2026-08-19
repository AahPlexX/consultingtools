function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
}

function assertFiniteNonNegative(value: number, label: string): void {
  assertFinite(value, label);
  if (value < 0) throw new Error(`${label} must be greater than or equal to zero.`);
}

function assertPositiveDenominator(value: number, label: string): void {
  assertFinite(value, label);
  if (value <= 0) throw new Error(`${label} must be greater than zero for this ratio.`);
}

function assertNonZeroDenominator(value: number, label: string): void {
  assertFinite(value, label);
  if (value === 0) throw new Error(`${label} must be non-zero for this ratio.`);
}

function finiteRatio(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must remain finite.`);
  return value;
}

export interface LiquidityRatioInput {
  currentAssets: number;
  currentLiabilities: number;
  cashAndEquivalents: number;
  marketableSecurities: number;
  accountsReceivable: number;
}

export function calculateLiquidityRatios(input: LiquidityRatioInput) {
  assertFiniteNonNegative(input.currentAssets, "currentAssets");
  assertPositiveDenominator(input.currentLiabilities, "currentLiabilities");
  assertFiniteNonNegative(input.cashAndEquivalents, "cashAndEquivalents");
  assertFiniteNonNegative(input.marketableSecurities, "marketableSecurities");
  assertFiniteNonNegative(input.accountsReceivable, "accountsReceivable");
  const quickAssets = input.cashAndEquivalents + input.marketableSecurities + input.accountsReceivable;
  return {
    ...input,
    currentRatio: finiteRatio(input.currentAssets / input.currentLiabilities, "currentRatio"),
    quickRatio: finiteRatio(quickAssets / input.currentLiabilities, "quickRatio"),
    formulas: {
      currentRatio: "currentAssets / currentLiabilities",
      quickRatio: "(cashAndEquivalents + marketableSecurities + accountsReceivable) / currentLiabilities",
    },
  };
}

export interface LeverageRatioInput {
  debt: number;
  shareholdersEquity: number;
}

export function calculateLeverageRatios(input: LeverageRatioInput) {
  assertFiniteNonNegative(input.debt, "debt");
  assertNonZeroDenominator(input.shareholdersEquity, "shareholdersEquity");
  return {
    ...input,
    debtToEquity: finiteRatio(input.debt / input.shareholdersEquity, "debtToEquity"),
    formulas: { debtToEquity: "debt / shareholdersEquity" },
  };
}

export interface MarginRatioInput {
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
}

export function calculateMarginRatios(input: MarginRatioInput) {
  assertPositiveDenominator(input.revenue, "revenue");
  assertFinite(input.grossProfit, "grossProfit");
  assertFinite(input.operatingIncome, "operatingIncome");
  assertFinite(input.netIncome, "netIncome");
  return {
    ...input,
    grossMargin: finiteRatio(input.grossProfit / input.revenue, "grossMargin"),
    operatingMargin: finiteRatio(input.operatingIncome / input.revenue, "operatingMargin"),
    netMargin: finiteRatio(input.netIncome / input.revenue, "netMargin"),
    formulas: {
      grossMargin: "grossProfit / revenue",
      operatingMargin: "operatingIncome / revenue",
      netMargin: "netIncome / revenue",
    },
  };
}

export interface EfficiencyRatioInput {
  costOfSales: number;
  averageInventory: number;
  revenue: number;
  averageAssets: number;
}

export function calculateEfficiencyRatios(input: EfficiencyRatioInput) {
  assertFiniteNonNegative(input.costOfSales, "costOfSales");
  assertPositiveDenominator(input.averageInventory, "averageInventory");
  assertFiniteNonNegative(input.revenue, "revenue");
  assertPositiveDenominator(input.averageAssets, "averageAssets");
  return {
    ...input,
    inventoryTurnover: finiteRatio(input.costOfSales / input.averageInventory, "inventoryTurnover"),
    assetTurnover: finiteRatio(input.revenue / input.averageAssets, "assetTurnover"),
    formulas: {
      inventoryTurnover: "costOfSales / averageInventory",
      assetTurnover: "revenue / averageAssets",
    },
  };
}

export interface ReturnRatioInput {
  netIncome: number;
  averageAssets: number;
  averageEquity: number;
}

export function calculateReturnRatios(input: ReturnRatioInput) {
  assertFinite(input.netIncome, "netIncome");
  assertPositiveDenominator(input.averageAssets, "averageAssets");
  assertNonZeroDenominator(input.averageEquity, "averageEquity");
  return {
    ...input,
    returnOnAssets: finiteRatio(input.netIncome / input.averageAssets, "returnOnAssets"),
    returnOnEquity: finiteRatio(input.netIncome / input.averageEquity, "returnOnEquity"),
    formulas: {
      returnOnAssets: "netIncome / averageAssets",
      returnOnEquity: "netIncome / averageEquity",
    },
  };
}
