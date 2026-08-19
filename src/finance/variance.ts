export interface BudgetVarianceInput {
  budget: number;
  actual: number;
  favorableDirection: "higher" | "lower";
}

export interface BudgetVarianceResult extends BudgetVarianceInput {
  absoluteVariance: number;
  percentVariance: number | null;
  favorable: boolean;
  formulas: {
    absoluteVariance: string;
    percentVariance: string;
  };
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
}

export function calculateBudgetVariance(input: BudgetVarianceInput): BudgetVarianceResult {
  assertFinite(input.budget, "budget");
  assertFinite(input.actual, "actual");

  const absoluteVariance = input.actual - input.budget;
  if (!Number.isFinite(absoluteVariance)) throw new Error("absoluteVariance must remain finite.");

  const percentVariance = input.budget === 0 ? null : absoluteVariance / input.budget;
  if (percentVariance !== null && !Number.isFinite(percentVariance)) {
    throw new Error("percentVariance must remain finite when defined.");
  }

  return {
    ...input,
    absoluteVariance,
    percentVariance,
    favorable:
      input.favorableDirection === "higher"
        ? input.actual >= input.budget
        : input.actual <= input.budget,
    formulas: {
      absoluteVariance: "actual - budget",
      percentVariance: "budget === 0 ? null : (actual - budget) / budget",
    },
  };
}
