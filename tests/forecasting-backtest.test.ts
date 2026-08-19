import { describe, expect, it } from "vitest";
import { backtestForecastBaseline } from "../src/forecasting/backtest.js";

describe("rolling-origin baseline backtesting", () => {
  it("uses only observations before each forecast origin", () => {
    const result = backtestForecastBaseline({
      values: [1, 2, 3, 100, 200],
      method: "naive",
      minimumTrainingSize: 3,
      horizon: 1,
    });

    expect(result.rows).toEqual([
      { originIndex: 3, targetIndex: 3, horizonStep: 1, actual: 100, predicted: 3 },
      { originIndex: 4, targetIndex: 4, horizonStep: 1, actual: 200, predicted: 100 },
    ]);
    expect(result.metrics.count).toBe(2);
    expect(result.metrics.mae).toBe(98.5);
  });

  it("supports multi-step rolling-origin rows without crossing beyond available actuals", () => {
    const result = backtestForecastBaseline({
      values: [1, 2, 3, 4, 5, 6],
      method: "drift",
      minimumTrainingSize: 3,
      horizon: 2,
    });
    expect(result.rows.map(({ originIndex, targetIndex, horizonStep }) => ({ originIndex, targetIndex, horizonStep }))).toEqual([
      { originIndex: 3, targetIndex: 3, horizonStep: 1 },
      { originIndex: 3, targetIndex: 4, horizonStep: 2 },
      { originIndex: 4, targetIndex: 4, horizonStep: 1 },
      { originIndex: 4, targetIndex: 5, horizonStep: 2 },
    ]);
  });

  it("validates seasonal and moving-average requirements against every initial training window", () => {
    expect(() =>
      backtestForecastBaseline({
        values: [1, 2, 3, 4, 5],
        method: "seasonal-naive",
        minimumTrainingSize: 2,
        horizon: 1,
        seasonLength: 3,
      }),
    ).toThrow(/seasonLength/i);

    expect(() =>
      backtestForecastBaseline({
        values: [1, 2, 3, 4, 5],
        method: "moving-average",
        minimumTrainingSize: 2,
        horizon: 1,
        movingAverageWindow: 3,
      }),
    ).toThrow(/movingAverageWindow/i);
  });

  it("rejects configurations that produce no out-of-sample forecast", () => {
    expect(() =>
      backtestForecastBaseline({
        values: [1, 2, 3],
        method: "naive",
        minimumTrainingSize: 3,
        horizon: 1,
      }),
    ).toThrow(/out-of-sample/i);
  });
});
