export interface DescriptiveStatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  sampleVariance: number | null;
  populationVariance: number;
  sampleStandardDeviation: number | null;
  populationStandardDeviation: number;
  q1: number;
  q3: number;
  iqr: number;
  quantileMethod: "type-7";
  formulas: {
    mean: string;
    sampleVariance: string;
    populationVariance: string;
    type7Quantile: string;
  };
}

function validateValues(values: readonly number[], label: string): void {
  if (values.length === 0) throw new Error(`${label} must contain at least one value.`);
  values.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new Error(`${label}[${index}] must be finite.`);
  });
}

function finiteResult(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must remain finite.`);
  return value;
}

export function quantileType7(values: readonly number[], probability: number): number {
  validateValues(values, "values");
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
    throw new Error("probability must be finite and within [0, 1].");
  }

  const sorted = [...values].sort((left, right) => left - right);
  if (sorted.length === 1) return sorted[0] as number;

  const zeroBasedPosition = (sorted.length - 1) * probability;
  const lowerIndex = Math.floor(zeroBasedPosition);
  const upperIndex = Math.ceil(zeroBasedPosition);
  const lower = sorted[lowerIndex] as number;
  const upper = sorted[upperIndex] as number;
  const fraction = zeroBasedPosition - lowerIndex;
  return finiteResult(lower + fraction * (upper - lower), "type-7 quantile");
}

export function calculateDescriptiveStatistics(
  values: readonly number[],
): DescriptiveStatisticsResult {
  validateValues(values, "values");

  let sum = 0;
  for (const value of values) sum = finiteResult(sum + value, "sum");
  const mean = finiteResult(sum / values.length, "mean");

  let squaredDeviationSum = 0;
  for (const value of values) {
    const deviation = value - mean;
    squaredDeviationSum = finiteResult(
      squaredDeviationSum + deviation * deviation,
      "sum of squared deviations",
    );
  }

  const populationVariance = finiteResult(
    squaredDeviationSum / values.length,
    "populationVariance",
  );
  const sampleVariance =
    values.length < 2
      ? null
      : finiteResult(squaredDeviationSum / (values.length - 1), "sampleVariance");
  const populationStandardDeviation = finiteResult(
    Math.sqrt(populationVariance),
    "populationStandardDeviation",
  );
  const sampleStandardDeviation =
    sampleVariance === null
      ? null
      : finiteResult(Math.sqrt(sampleVariance), "sampleStandardDeviation");

  const q1 = quantileType7(values, 0.25);
  const median = quantileType7(values, 0.5);
  const q3 = quantileType7(values, 0.75);
  const iqr = finiteResult(q3 - q1, "iqr");

  let min = values[0] as number;
  let max = values[0] as number;
  for (let index = 1; index < values.length; index += 1) {
    const value = values[index] as number;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return {
    count: values.length,
    sum,
    mean,
    median,
    min,
    max,
    sampleVariance,
    populationVariance,
    sampleStandardDeviation,
    populationStandardDeviation,
    q1,
    q3,
    iqr,
    quantileMethod: "type-7",
    formulas: {
      mean: "sum(values) / n",
      sampleVariance: "sum((x - mean)^2) / (n - 1)",
      populationVariance: "sum((x - mean)^2) / n",
      type7Quantile: "h = 1 + (n - 1) * p; linearly interpolate adjacent order statistics",
    },
  };
}
