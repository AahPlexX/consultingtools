export interface BreakEvenInput {
  fixedCosts: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
}

export interface BreakEvenResult extends BreakEvenInput {
  contributionMarginPerUnit: number;
  contributionMarginRatio: number;
  breakEvenUnitsExact: number;
  breakEvenUnitsWhole: number;
  breakEvenRevenue: number;
  formulas: {
    contributionMarginPerUnit: string;
    contributionMarginRatio: string;
    breakEvenUnitsExact: string;
    breakEvenRevenue: string;
  };
}

export interface SimpleRoiInput {
  totalBenefits: number;
  totalCosts: number;
  periodMonths?: number;
}

export interface SimpleRoiResult {
  totalBenefits: number;
  totalCosts: number;
  netBenefit: number;
  roiRatio: number;
  roiPercent: number;
  periodMonths: number | null;
  formula: string;
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite number greater than or equal to zero.`);
  }
}

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a finite number greater than zero.`);
  }
}

function assertFiniteResult(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} is outside the supported finite numeric range.`);
  }
  return value;
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  assertFiniteNonNegative(input.fixedCosts, "fixedCosts");
  assertFinitePositive(input.pricePerUnit, "pricePerUnit");
  assertFiniteNonNegative(input.variableCostPerUnit, "variableCostPerUnit");

  const contributionMarginPerUnit = input.pricePerUnit - input.variableCostPerUnit;
  if (contributionMarginPerUnit <= 0) {
    throw new Error(
      "Break-even requires a positive contribution margin: pricePerUnit must exceed variableCostPerUnit.",
    );
  }

  const contributionMarginRatio = assertFiniteResult(
    contributionMarginPerUnit / input.pricePerUnit,
    "contributionMarginRatio",
  );
  const breakEvenUnitsExact = assertFiniteResult(
    input.fixedCosts / contributionMarginPerUnit,
    "breakEvenUnitsExact",
  );
  const breakEvenRevenue = assertFiniteResult(
    input.fixedCosts / contributionMarginRatio,
    "breakEvenRevenue",
  );
  const breakEvenUnitsWhole = Math.ceil(breakEvenUnitsExact);

  return {
    ...input,
    contributionMarginPerUnit,
    contributionMarginRatio,
    breakEvenUnitsExact,
    breakEvenUnitsWhole,
    breakEvenRevenue,
    formulas: {
      contributionMarginPerUnit: "pricePerUnit - variableCostPerUnit",
      contributionMarginRatio: "contributionMarginPerUnit / pricePerUnit",
      breakEvenUnitsExact: "fixedCosts / contributionMarginPerUnit",
      breakEvenRevenue: "fixedCosts / contributionMarginRatio",
    },
  };
}

export function calculateSimpleRoi(input: SimpleRoiInput): SimpleRoiResult {
  assertFiniteNonNegative(input.totalBenefits, "totalBenefits");
  assertFinitePositive(input.totalCosts, "totalCosts");
  if (input.periodMonths !== undefined) {
    assertFinitePositive(input.periodMonths, "periodMonths");
  }

  const netBenefit = assertFiniteResult(
    input.totalBenefits - input.totalCosts,
    "netBenefit",
  );
  const roiRatio = assertFiniteResult(netBenefit / input.totalCosts, "roiRatio");
  const roiPercent = assertFiniteResult(roiRatio * 100, "roiPercent");

  return {
    totalBenefits: input.totalBenefits,
    totalCosts: input.totalCosts,
    netBenefit,
    roiRatio,
    roiPercent,
    periodMonths: input.periodMonths ?? null,
    formula: "(totalBenefits - totalCosts) / totalCosts",
  };
}
