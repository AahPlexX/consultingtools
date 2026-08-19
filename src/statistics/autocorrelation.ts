export interface AutocorrelationResult {
  count: number;
  lag: number;
  autocorrelation: number;
  formula: string;
  convention: string;
}

function validateSeries(values: readonly number[]): void {
  if (values.length < 2) throw new Error("Autocorrelation requires at least two observations.");
  values.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new Error(`values[${index}] must be finite.`);
  });
}

export function calculateAutocorrelation(
  values: readonly number[],
  lag: number,
): AutocorrelationResult {
  validateSeries(values);
  if (!Number.isSafeInteger(lag) || lag < 1 || lag >= values.length) {
    throw new Error("lag must be a positive integer smaller than the number of observations.");
  }

  let sum = 0;
  for (const value of values) sum += value;
  const mean = sum / values.length;

  let denominator = 0;
  for (const value of values) {
    const centered = value - mean;
    denominator += centered * centered;
  }
  if (!(denominator > 0) || !Number.isFinite(denominator)) {
    throw new Error("Autocorrelation is undefined for a constant or numerically degenerate series.");
  }

  let numerator = 0;
  for (let index = 0; index < values.length - lag; index += 1) {
    numerator += ((values[index] as number) - mean) * ((values[index + lag] as number) - mean);
  }
  if (!Number.isFinite(numerator)) throw new Error("Autocorrelation numerator must remain finite.");

  const raw = numerator / denominator;
  if (!Number.isFinite(raw)) throw new Error("Autocorrelation must remain finite.");
  const autocorrelation = Math.max(-1, Math.min(1, raw));

  return {
    count: values.length,
    lag,
    autocorrelation,
    formula:
      "sum_(i=1..N-lag)((Y_i - mean)(Y_(i+lag) - mean)) / sum_(i=1..N)((Y_i - mean)^2)",
    convention:
      "Observations are assumed to be equally spaced and supplied in time order; timestamps are not inferred or repaired by this calculation.",
  };
}

export function calculateAutocorrelationSeries(
  values: readonly number[],
  maxLag: number,
): AutocorrelationResult[] {
  validateSeries(values);
  if (!Number.isSafeInteger(maxLag) || maxLag < 1 || maxLag >= values.length) {
    throw new Error("maxLag must be a positive integer smaller than the number of observations.");
  }
  return Array.from({ length: maxLag }, (_, index) =>
    calculateAutocorrelation(values, index + 1),
  );
}
