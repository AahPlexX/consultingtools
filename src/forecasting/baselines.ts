export interface ForecastBaselineResult {
  method: "naive" | "seasonal-naive" | "drift" | "moving-average";
  historyCount: number;
  horizon: number;
  forecast: number[];
  formula: string;
  convention: string;
}

function validateHistory(values: readonly number[]): void {
  if (values.length === 0) throw new Error("Forecast history must contain at least one observation.");
  values.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new Error(`values[${index}] must be finite.`);
  });
}

function validateHorizon(horizon: number): void {
  if (!Number.isSafeInteger(horizon) || horizon < 1 || horizon > 10_000) {
    throw new Error("horizon must be a positive safe integer no greater than 10000.");
  }
}

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must remain finite.`);
  return value;
}

export function forecastNaive(values: readonly number[], horizon: number): ForecastBaselineResult {
  validateHistory(values);
  validateHorizon(horizon);
  const last = values[values.length - 1] as number;
  return {
    method: "naive",
    historyCount: values.length,
    horizon,
    forecast: Array.from({ length: horizon }, () => last),
    formula: "forecast[t+h] = lastObservedValue",
    convention: "Observations are equally spaced and ordered; no trend or seasonality is inferred.",
  };
}

export function forecastSeasonalNaive(
  values: readonly number[],
  horizon: number,
  seasonLength: number,
): ForecastBaselineResult {
  validateHistory(values);
  validateHorizon(horizon);
  if (!Number.isSafeInteger(seasonLength) || seasonLength < 1 || seasonLength > values.length) {
    throw new Error("seasonLength must be a positive integer no greater than available history.");
  }
  const seasonalStart = values.length - seasonLength;
  const forecast = Array.from({ length: horizon }, (_, index) =>
    values[seasonalStart + (index % seasonLength)] as number,
  );
  return {
    method: "seasonal-naive",
    historyCount: values.length,
    horizon,
    forecast,
    formula: "forecast[t+h] = mostRecentObservedValueAtSameSeasonalPosition",
    convention:
      "Observations are equally spaced and seasonLength is caller supplied; the engine does not detect or optimize seasonality.",
  };
}

export function forecastDrift(values: readonly number[], horizon: number): ForecastBaselineResult {
  validateHistory(values);
  validateHorizon(horizon);
  if (values.length < 2) throw new Error("Drift forecast requires at least two historical observations.");

  const first = values[0] as number;
  const last = values[values.length - 1] as number;
  const driftPerPeriod = finite((last - first) / (values.length - 1), "driftPerPeriod");
  const forecast = Array.from({ length: horizon }, (_, index) =>
    finite(last + (index + 1) * driftPerPeriod, `forecast[${index}]`),
  );
  return {
    method: "drift",
    historyCount: values.length,
    horizon,
    forecast,
    formula: "forecast[t+h] = last + h * (last - first) / (n - 1)",
    convention:
      "Observations are equally spaced; drift is the average first-to-last change per observed period and is extrapolated without damping.",
  };
}

export function forecastMovingAverage(
  values: readonly number[],
  horizon: number,
  window: number,
): ForecastBaselineResult {
  validateHistory(values);
  validateHorizon(horizon);
  if (!Number.isSafeInteger(window) || window < 1 || window > values.length) {
    throw new Error("window must be a positive integer no greater than available history.");
  }

  let sum = 0;
  for (let index = values.length - window; index < values.length; index += 1) {
    sum += values[index] as number;
  }
  const average = finite(sum / window, "movingAverage");
  return {
    method: "moving-average",
    historyCount: values.length,
    horizon,
    forecast: Array.from({ length: horizon }, () => average),
    formula: "forecast[t+h] = mean(last window observations)",
    convention:
      "The trailing moving-average benchmark is held constant across the requested horizon; the engine does not recursively insert its own forecasts into the window.",
  };
}
