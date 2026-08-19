import { describe, expect, it } from "vitest";
import {
  forecastDrift,
  forecastMovingAverage,
  forecastNaive,
  forecastSeasonalNaive,
} from "../src/forecasting/baselines.js";

describe("forecast baselines", () => {
  it("naive repeats the last observed value", () => {
    expect(forecastNaive([10, 12, 15], 3).forecast).toEqual([15, 15, 15]);
  });

  it("seasonal naive repeats the most recent complete seasonal pattern", () => {
    expect(forecastSeasonalNaive([10, 20, 30, 11, 21, 31], 5, 3).forecast).toEqual([
      11,
      21,
      31,
      11,
      21,
    ]);
  });

  it("drift extends the first-to-last average change per period", () => {
    const result = forecastDrift([10, 13, 16], 3);
    expect(result.forecast).toEqual([19, 22, 25]);
    expect(result.formula).toContain("last");
  });

  it("moving average holds the trailing-window mean constant", () => {
    expect(forecastMovingAverage([1, 2, 3, 4, 5], 3, 3).forecast).toEqual([4, 4, 4]);
  });

  it("rejects invalid history, horizon, season length, window, and non-finite values", () => {
    expect(() => forecastNaive([], 1)).toThrow(/history/i);
    expect(() => forecastNaive([1], 0)).toThrow(/horizon/i);
    expect(() => forecastSeasonalNaive([1, 2], 1, 3)).toThrow(/seasonLength/i);
    expect(() => forecastDrift([1], 1)).toThrow(/at least two/i);
    expect(() => forecastMovingAverage([1, 2], 1, 3)).toThrow(/window/i);
    expect(() => forecastNaive([1, Number.NaN], 1)).toThrow(/finite/i);
  });
});
