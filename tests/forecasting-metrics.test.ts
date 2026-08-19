import { describe, expect, it } from "vitest";
import { calculateForecastErrorMetrics } from "../src/forecasting/metrics.js";

describe("forecast error metrics", () => {
  it("matches documented MAE and RMSE examples and preserves signed bias", () => {
    const result = calculateForecastErrorMetrics(
      [3, -0.5, 2, 7],
      [2.5, 0, 2, 8],
    );
    expect(result.count).toBe(4);
    expect(result.meanError).toBeCloseTo(0.25, 12);
    expect(result.mae).toBeCloseTo(0.5, 12);
    expect(result.mse).toBeCloseTo(0.375, 12);
    expect(result.rmse).toBeCloseTo(0.6123724357, 10);
  });

  it("returns null MAPE when any actual is zero instead of substituting epsilon or dropping rows", () => {
    const result = calculateForecastErrorMetrics([0, 10], [1, 8]);
    expect(result.zeroActualCount).toBe(1);
    expect(result.mape).toBeNull();
    expect(result.mae).toBe(1.5);
  });

  it("returns null sMAPE when any pair has a zero joint denominator", () => {
    const result = calculateForecastErrorMetrics([0, 10], [0, 8]);
    expect(result.zeroJointDenominatorCount).toBe(1);
    expect(result.smape).toBeNull();
  });

  it("rejects unequal, empty, and non-finite pairs", () => {
    expect(() => calculateForecastErrorMetrics([1], [1, 2])).toThrow(/same length/i);
    expect(() => calculateForecastErrorMetrics([], [])).toThrow(/at least one/i);
    expect(() => calculateForecastErrorMetrics([1, Number.NaN], [1, 2])).toThrow(/finite/i);
  });
});
