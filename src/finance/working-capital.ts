export interface WorkingCapitalInput {
  currentAssets: number;
  currentLiabilities: number;
}

export interface WorkingCapitalResult extends WorkingCapitalInput {
  workingCapital: number;
  formula: string;
}

export interface CashConversionCycleInput {
  averageInventory: number;
  averageReceivables: number;
  averagePayables: number;
  costOfSales: number;
  netCreditSales: number;
  purchasesOrCostBasis: number;
  daysInPeriod: number;
}

export interface CashConversionCycleResult extends CashConversionCycleInput {
  daysInventoryOutstanding: number;
  daysSalesOutstanding: number;
  daysPayablesOutstanding: number;
  cashConversionCycleDays: number;
  formulas: {
    daysInventoryOutstanding: string;
    daysSalesOutstanding: string;
    daysPayablesOutstanding: string;
    cashConversionCycleDays: string;
  };
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  if (value < 0) throw new Error(`${label} must be greater than or equal to zero.`);
}

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  if (value <= 0) throw new Error(`${label} must be greater than zero.`);
}

function finiteResult(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must remain finite.`);
  return value;
}

export function calculateWorkingCapital(input: WorkingCapitalInput): WorkingCapitalResult {
  assertFiniteNonNegative(input.currentAssets, "currentAssets");
  assertFiniteNonNegative(input.currentLiabilities, "currentLiabilities");
  return {
    ...input,
    workingCapital: finiteResult(input.currentAssets - input.currentLiabilities, "workingCapital"),
    formula: "currentAssets - currentLiabilities",
  };
}

export function calculateCashConversionCycle(
  input: CashConversionCycleInput,
): CashConversionCycleResult {
  assertFiniteNonNegative(input.averageInventory, "averageInventory");
  assertFiniteNonNegative(input.averageReceivables, "averageReceivables");
  assertFiniteNonNegative(input.averagePayables, "averagePayables");
  assertFinitePositive(input.costOfSales, "costOfSales");
  assertFinitePositive(input.netCreditSales, "netCreditSales");
  assertFinitePositive(input.purchasesOrCostBasis, "purchasesOrCostBasis");
  assertFinitePositive(input.daysInPeriod, "daysInPeriod");

  const daysInventoryOutstanding = finiteResult(
    (input.averageInventory / input.costOfSales) * input.daysInPeriod,
    "daysInventoryOutstanding",
  );
  const daysSalesOutstanding = finiteResult(
    (input.averageReceivables / input.netCreditSales) * input.daysInPeriod,
    "daysSalesOutstanding",
  );
  const daysPayablesOutstanding = finiteResult(
    (input.averagePayables / input.purchasesOrCostBasis) * input.daysInPeriod,
    "daysPayablesOutstanding",
  );
  const cashConversionCycleDays = finiteResult(
    daysInventoryOutstanding + daysSalesOutstanding - daysPayablesOutstanding,
    "cashConversionCycleDays",
  );

  return {
    ...input,
    daysInventoryOutstanding,
    daysSalesOutstanding,
    daysPayablesOutstanding,
    cashConversionCycleDays,
    formulas: {
      daysInventoryOutstanding: "averageInventory / costOfSales * daysInPeriod",
      daysSalesOutstanding: "averageReceivables / netCreditSales * daysInPeriod",
      daysPayablesOutstanding: "averagePayables / purchasesOrCostBasis * daysInPeriod",
      cashConversionCycleDays:
        "daysInventoryOutstanding + daysSalesOutstanding - daysPayablesOutstanding",
    },
  };
}
