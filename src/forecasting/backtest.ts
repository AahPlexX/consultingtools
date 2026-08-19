import {
  forecastDrift,
  forecastMovingAverage,
  forecastNaive,
  forecastSeasonalNaive,
  type ForecastBaselineResult,
} from "./baselines.js";
import {
  calculateForecastErrorMetrics,
  type ForecastErrorMetricsResult,
} from "./metrics.js";

export type ForecastBaselineMethod =
  | "naive"
  | "seasonal-naive"
  | "drift"
  | "moving-average";

export interface ForecastBacktestInput {
  values: readonly number[];
  method: ForecastBaselineMethod;
  minimumTrainingSize: number;
  horizon: number;
  seasonLength?: number;
  movingAverageWindow?: number;
}

export interface ForecastBacktestRow {
  originIndex: number;
  targetIndex: number;
  horizonStep: number;
  actual: number;
  predicted: number;
}

export interface ForecastBacktestResult {
  method: ForecastBaselineMethod;
  minimumTrainingSize: number;
  horizon: number;
  rows: ForecastBacktestRow[];
  metrics: ForecastErrorMetricsResult;
  convention: string;
}

function positiveInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${label} must be a positive safe integer.`);
  }
}

function forecastAtOrigin(
  input: ForecastBacktestInput,
  history: readonly number[],
): ForecastBaselineResult {
  switch (input.method) {
    case "naive":
      return forecastNaive(history, input.horizon);
    case "drift":
      return forecastDrift(history, input.horizon);
    case "seasonal-naive": {
      const seasonLength = input.seasonLength;
      if (seasonLength === undefined) {
        throw new Error("seasonLength is required for seasonal-naive backtesting.");
      }
      return forecastSeasonalNaive(history, input.horizon, seasonLength);
    }
    case "moving-average": {
      const window = input.movingAverageWindow;
      if (window === undefined) {
        throw new Error("movingAverageWindow is required for moving-average backtesting.");
      }
      return forecastMovingAverage(history, input.horizon, window);
    }
  }
}

export function backtestForecastBaseline(
  input: ForecastBacktestInput,
): ForecastBacktestResult {
  if (input.values.length < 2) {
    throw new Error("Backtesting requires at least two time-ordered observations.");
  }
  input.values.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new Error(`values[${index}] must be finite.`);
  });
  positiveInteger(input.minimumTrainingSize, "minimumTrainingSize");
  positiveInteger(input.horizon, "horizon");
  if (input.minimumTrainingSize > input.values.length) {
    throw new Error("minimumTrainingSize cannot exceed available observations.");
  }
  if (input.method === "drift" && input.minimumTrainingSize < 2) {
    throw new Error("minimumTrainingSize must be at least two for drift backtesting.");
  }
  if (input.method === "seasonal-naive") {
    if (input.seasonLength === undefined) {
      throw new Error("seasonLength is required for seasonal-naive backtesting.");
    }
    positiveInteger(input.seasonLength, "seasonLength");
    if (input.seasonLength > input.minimumTrainingSize) {
      throw new Error("seasonLength cannot exceed the initial minimumTrainingSize.");
    }
  }
  if (input.method === "moving-average") {
    if (input.movingAverageWindow === undefined) {
      throw new Error("movingAverageWindow is required for moving-average backtesting.");
    }
    positiveInteger(input.movingAverageWindow, "movingAverageWindow");
    if (input.movingAverageWindow > input.minimumTrainingSize) {
      throw new Error("movingAverageWindow cannot exceed the initial minimumTrainingSize.");
    }
  }

  const rows: ForecastBacktestRow[] = [];
  for (
    let originIndex = input.minimumTrainingSize;
    originIndex + input.horizon <= input.values.length;
    originIndex += 1
  ) {
    const history = input.values.slice(0, originIndex);
    const forecast = forecastAtOrigin(input, history).forecast;
    for (let horizonIndex = 0; horizonIndex < input.horizon; horizonIndex += 1) {
      const targetIndex = originIndex + horizonIndex;
      rows.push({
        originIndex,
        targetIndex,
        horizonStep: horizonIndex + 1,
        actual: input.values[targetIndex] as number,
        predicted: forecast[horizonIndex] as number,
      });
    }
  }

  if (rows.length === 0) {
    throw new Error(
      "Backtest configuration produces no out-of-sample forecasts; reduce minimumTrainingSize or horizon, or provide more observations.",
    );
  }

  const metrics = calculateForecastErrorMetrics(
    rows.map(({ actual }) => actual),
    rows.map(({ predicted }) => predicted),
  );

  return {
    method: input.method,
    minimumTrainingSize: input.minimumTrainingSize,
    horizon: input.horizon,
    rows,
    metrics,
    convention:
      "Expanding-window rolling-origin evaluation: each origin trains only on observations with indices smaller than originIndex; temporal order is preserved and no random split is used.",
  };
}
