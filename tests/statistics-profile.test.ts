import { describe, expect, it } from "vitest";
import { profileColumn } from "../src/statistics/profile.js";

describe("column profiling", () => {
  it("distinguishes missing values from invalid numeric values without coercion", () => {
    const result = profileColumn([
      null,
      undefined,
      1,
      2,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      "2",
      "",
      "   ",
      true,
      [1],
      { value: 1 },
    ]);

    expect(result.totalCount).toBe(12);
    expect(result.counts).toEqual({
      missing: 2,
      finiteNumber: 2,
      nonFiniteNumber: 2,
      string: 1,
      blankString: 2,
      boolean: 1,
      array: 1,
      object: 1,
      other: 0,
    });
    expect(result.numericClean).toBe(false);
    expect(result.observedTypes).toEqual([
      "finite-number",
      "non-finite-number",
      "string",
      "blank-string",
      "boolean",
      "array",
      "object",
    ]);
  });

  it("marks finite-number-plus-missing columns numeric-clean", () => {
    const result = profileColumn([1, null, 2, undefined, 2]);
    expect(result.numericClean).toBe(true);
    expect(result.nonMissingCount).toBe(3);
    expect(result.missingCount).toBe(2);
    expect(result.uniquePrimitiveCount).toBe(2);
  });

  it("does not treat numeric-looking strings as numbers", () => {
    const result = profileColumn(["1", "2", "3"]);
    expect(result.counts.finiteNumber).toBe(0);
    expect(result.counts.string).toBe(3);
    expect(result.numericClean).toBe(false);
  });
});
