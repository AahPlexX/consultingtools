import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { backtestForecastBaseline, type ForecastBacktestInput } from "./backtest.js";
import {
  forecastDrift,
  forecastMovingAverage,
  forecastNaive,
  forecastSeasonalNaive,
} from "./baselines.js";
import { calculateForecastErrorMetrics } from "./metrics.js";

const annotations = {
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
} as const;

const finite = z.number().finite();
const values = z.array(finite).min(1).max(100_000);
const positiveInt = z.number().int().positive().max(10_000);

const forecastInputSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("naive"), values, horizon: positiveInt }),
  z.object({
    method: z.literal("seasonal-naive"),
    values,
    horizon: positiveInt,
    seasonLength: positiveInt,
  }),
  z.object({ method: z.literal("drift"), values, horizon: positiveInt }),
  z.object({
    method: z.literal("moving-average"),
    values,
    horizon: positiveInt,
    window: positiveInt,
  }),
]);

const backtestInputSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("naive"),
    values,
    minimumTrainingSize: positiveInt,
    horizon: positiveInt,
  }),
  z.object({
    method: z.literal("seasonal-naive"),
    values,
    minimumTrainingSize: positiveInt,
    horizon: positiveInt,
    seasonLength: positiveInt,
  }),
  z.object({
    method: z.literal("drift"),
    values,
    minimumTrainingSize: positiveInt,
    horizon: positiveInt,
  }),
  z.object({
    method: z.literal("moving-average"),
    values,
    minimumTrainingSize: positiveInt,
    horizon: positiveInt,
    movingAverageWindow: positiveInt,
  }),
]);

function toolError(error: unknown) {
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: error instanceof Error ? error.message : "Forecast calculation failed.",
      },
    ],
  };
}

function success<T extends object>(result: T, text: string) {
  return {
    structuredContent: result as Record<string, unknown>,
    content: [{ type: "text" as const, text }],
  };
}

export function registerForecastingTools(server: McpServer): void {
  server.registerTool(
    "forecast_baseline",
    {
      title: "Forecast a deterministic baseline",
      description:
        "Forecast an equally spaced ordered numeric series using a naive, seasonal-naive, drift, or trailing moving-average benchmark. Season length/window are explicit; this tool does not auto-detect seasonality or optimize a forecasting model.",
      inputSchema: forecastInputSchema,
      annotations,
    },
    async (input) => {
      try {
        const result =
          input.method === "naive"
            ? forecastNaive(input.values, input.horizon)
            : input.method === "seasonal-naive"
              ? forecastSeasonalNaive(input.values, input.horizon, input.seasonLength)
              : input.method === "drift"
                ? forecastDrift(input.values, input.horizon)
                : forecastMovingAverage(input.values, input.horizon, input.window);
        return success(result, `${result.method} baseline produced ${result.forecast.length} forecast values.`);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "calculate_forecast_error_metrics",
    {
      title: "Calculate forecast error metrics",
      description:
        "Calculate signed mean error, MAE, MSE, RMSE, MAPE, and sMAPE from the same supplied actual/predicted pairs. Percentage metrics return null when their denominator convention is undefined; no observations are silently dropped and no epsilon is substituted.",
      inputSchema: z.object({
        actual: z.array(finite).min(1).max(100_000),
        predicted: z.array(finite).min(1).max(100_000),
      }),
      annotations,
    },
    async ({ actual, predicted }) => {
      try {
        const result = calculateForecastErrorMetrics(actual, predicted);
        return success(result, `Forecast MAE is ${result.mae}; RMSE is ${result.rmse}.`);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "backtest_forecast_baseline",
    {
      title: "Backtest a forecast baseline",
      description:
        "Run expanding-window rolling-origin out-of-sample evaluation for a deterministic baseline. Each origin uses only earlier observations; time order is preserved and random train/test shuffling is never used.",
      inputSchema: backtestInputSchema,
      annotations,
    },
    async (input) => {
      try {
        const backtestInput: ForecastBacktestInput = {
          values: input.values,
          method: input.method,
          minimumTrainingSize: input.minimumTrainingSize,
          horizon: input.horizon,
        };
        if (input.method === "seasonal-naive") {
          backtestInput.seasonLength = input.seasonLength;
        }
        if (input.method === "moving-average") {
          backtestInput.movingAverageWindow = input.movingAverageWindow;
        }
        const result = backtestForecastBaseline(backtestInput);
        return success(result, `Backtest produced ${result.rows.length} out-of-sample forecast rows; MAE is ${result.metrics.mae}.`);
      } catch (error) {
        return toolError(error);
      }
    },
  );
}
