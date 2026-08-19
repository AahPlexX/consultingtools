export interface EarnedValuePerformanceInput {
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
}

export interface EarnedValuePerformanceResult extends EarnedValuePerformanceInput {
  scheduleVariance: number;
  costVariance: number;
  schedulePerformanceIndex: number | null;
  costPerformanceIndex: number | null;
  formulas: {
    scheduleVariance: string;
    costVariance: string;
    schedulePerformanceIndex: string;
    costPerformanceIndex: string;
  };
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  if (value < 0) throw new Error(`${label} must be greater than or equal to zero.`);
}

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must remain finite.`);
  return value;
}

export function calculateEarnedValuePerformance(
  input: EarnedValuePerformanceInput,
): EarnedValuePerformanceResult {
  assertFiniteNonNegative(input.plannedValue, "plannedValue");
  assertFiniteNonNegative(input.earnedValue, "earnedValue");
  assertFiniteNonNegative(input.actualCost, "actualCost");

  const scheduleVariance = finite(input.earnedValue - input.plannedValue, "scheduleVariance");
  const costVariance = finite(input.earnedValue - input.actualCost, "costVariance");
  const schedulePerformanceIndex =
    input.plannedValue === 0
      ? null
      : finite(input.earnedValue / input.plannedValue, "schedulePerformanceIndex");
  const costPerformanceIndex =
    input.actualCost === 0
      ? null
      : finite(input.earnedValue / input.actualCost, "costPerformanceIndex");

  return {
    ...input,
    scheduleVariance,
    costVariance,
    schedulePerformanceIndex,
    costPerformanceIndex,
    formulas: {
      scheduleVariance: "earnedValue - plannedValue",
      costVariance: "earnedValue - actualCost",
      schedulePerformanceIndex: "plannedValue === 0 ? null : earnedValue / plannedValue",
      costPerformanceIndex: "actualCost === 0 ? null : earnedValue / actualCost",
    },
  };
}
