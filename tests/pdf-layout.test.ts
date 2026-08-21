import { describe, expect, it } from "vitest";
import { calculateTableRowHeight, wrapPdfText } from "../src/documents/pdf-layout.js";

const measure = (text: string) => text.length * 5;

describe("deterministic PDF layout", () => {
  it("wraps words without exceeding the requested width", () => {
    expect(wrapPdfText("alpha beta gamma", 50, measure)).toEqual([
      { text: "alpha beta", width: 50 },
      { text: "gamma", width: 25 },
    ]);
  });

  it("preserves explicit blank lines and exact-boundary lines", () => {
    expect(wrapPdfText("abcdefghij\n\nz", 50, measure)).toEqual([
      { text: "abcdefghij", width: 50 },
      { text: "", width: 0 },
      { text: "z", width: 5 },
    ]);
  });

  it("rejects an unbreakable word that cannot fit instead of clipping it", () => {
    expect(() => wrapPdfText("abcdefghijkl", 50, measure)).toThrow(/word.*width|fit/i);
  });

  it("calculates row height from the tallest wrapped cell", () => {
    expect(calculateTableRowHeight(
      ["alpha beta gamma", "short"],
      [50, 100],
      measure,
      12,
    )).toBe(24);
  });

  it("rejects invalid widths, line heights, and mismatched table definitions", () => {
    expect(() => wrapPdfText("x", 0, measure)).toThrow(/width/i);
    expect(() => calculateTableRowHeight(["a"], [], measure, 12)).toThrow(/column/i);
    expect(() => calculateTableRowHeight(["a"], [20], measure, 0)).toThrow(/line height/i);
  });
});
