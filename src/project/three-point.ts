export interface ThreePointEstimateInput {
  optimistic: number;
  mostLikely: number;
  pessimistic: number;
}

export interface ThreePointEstimateResult extends ThreePointEstimateInput {
  weightedExpectedValue: number;
  standardDeviation: number;
  variance: number;
  triangularMean: number;
  formulas: {
    weightedExpectedValue: string;
    standardDeviation: string;
    variance: string;
    triangularMean: string;
  };
  convention: string;
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  if (value < 0) throw new Error(`${label} must be greater than or equal to zero.`);
}

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must remain finite.`);
  return value;
}

export function calculateThreePointEstimate(
  input: ThreePointEstimateInput,
): ThreePointEstimateResult {
  assertFiniteNonNegative(input.optimistic, "optimistic");
  assertFiniteNonNegative(input.mostLikely, "mostLikely");
  assertFiniteNonNegative(input.pessimistic, "pessimistic");
  if (input.optimistic > input.mostLikely) {
    throw new Error("optimistic must be less than or equal to mostLikely.");
  }
  if (input.mostLikely > input.pessimistic) {
    throw new Error("mostLikely must be less than or equal to pessimistic.");
  }

  const weightedExpectedValue = finite(
    (input.optimistic + 4 * input.mostLikely + input.pessimistic) / 6,
    "weightedExpectedValue",
  );
  const standardDeviation = finite(
    (input.pessimistic - input.optimistic) / 6,
    "standardDeviation",
  );
  const variance = finite(standardDeviation * standardDeviation, "variance");
  const triangularMean = finite(
    (input.optimistic + input.mostLikely + input.pessimistic) / 3,
    "triangularMean",
  );

  return {
    ...input,
    weightedExpectedValue,
    standardDeviation,
    variance,
    triangularMean,
    formulas: {
      weightedExpectedValue: "(optimistic + 4 * mostLikely + pessimistic) / 6",
      standardDeviation: "(pessimistic - optimistic) / 6",
      variance: "standardDeviation^2",
      triangularMean: "(optimistic + mostLikely + pessimistic) / 3",
    },
    convention:
      "Three-point arithmetic produces an estimate from caller-supplied optimistic, most-likely, and pessimistic values; it is not a probability guarantee or a schedule-confidence percentile.",
  };
}
