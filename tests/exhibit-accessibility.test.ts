import { describe, expect, it } from "vitest";
import { contrastRatio, validateExhibitAccessibility } from "../src/visualization/accessibility.js";
import type { ExhibitSpecV1 } from "../src/visualization/types.js";

const accessibleBar: ExhibitSpecV1 = {
  version: 1,
  kind: "bar",
  title: "Revenue by segment",
  altText: "Bar chart comparing revenue across three segments.",
  accentColorHex: "1F4E79",
  categories: ["A", "B", "C"],
  series: [{ name: "Revenue", values: [10, 20, 30] }],
};

describe("exhibit accessibility helpers", () => {
  it("calculates WCAG contrast ratios", () => {
    expect(contrastRatio("000000", "FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("777777", "FFFFFF")).toBeLessThan(4.5);
    expect(contrastRatio("595959", "FFFFFF")).toBeGreaterThan(4.5);
  });

  it("accepts meaningful accessible text and a sufficiently contrasted accent", () => {
    expect(validateExhibitAccessibility(accessibleBar).findings).toEqual([]);
  });

  it("reports missing accessible descriptions and low-contrast accent colors", () => {
    const missingAlt = { ...accessibleBar, altText: " " } as ExhibitSpecV1;
    expect(validateExhibitAccessibility(missingAlt).findings.join(" ")).toMatch(/alt|description/i);

    const weakAccent = { ...accessibleBar, accentColorHex: "DDDDDD" };
    expect(validateExhibitAccessibility(weakAccent).findings.join(" ")).toMatch(/contrast/i);
  });

  it("requires multi-series line rendering to use a non-color secondary cue", () => {
    const line: ExhibitSpecV1 = {
      version: 1,
      kind: "line",
      title: "Trend comparison",
      altText: "Two line series showing quarterly trends.",
      categories: ["Q1", "Q2"],
      series: [
        { name: "Actual", values: [1, 2] },
        { name: "Plan", values: [2, 3] },
      ],
    };
    expect(validateExhibitAccessibility(line).findings.join(" ")).toMatch(/secondary|non-color|line style|marker/i);
  });
});
