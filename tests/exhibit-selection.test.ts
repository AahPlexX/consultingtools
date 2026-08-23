import { describe, expect, it } from "vitest";
import { recommendExhibit } from "../src/visualization/selection.js";

const expected = [
  ["category-comparison", "bar"],
  ["time-trend", "line"],
  ["relationship", "scatter"],
  ["bridge", "waterfall"],
  ["contributor-priority", "pareto"],
  ["two-dimensional-intensity", "heatmap"],
  ["portfolio-positioning", "matrix-2x2"],
  ["risk-prioritization", "risk-matrix"],
  ["schedule", "gantt"],
  ["stage-conversion", "funnel"],
] as const;

describe("deterministic exhibit selection", () => {
  it("maps explicit analytical jobs to one stable exhibit kind", () => {
    for (const [job, kind] of expected) {
      const result = recommendExhibit({ job });
      expect(result.kind).toBe(kind);
      expect(result.rationale.trim().length).toBeGreaterThan(10);
    }
  });

  it("warns on excessive shape without silently changing chart kind", () => {
    const categories = recommendExhibit({ job: "category-comparison", categoryCount: 101 });
    expect(categories.kind).toBe("bar");
    expect(categories.warnings.join(" ")).toMatch(/categor/i);

    const series = recommendExhibit({ job: "time-trend", seriesCount: 13 });
    expect(series.kind).toBe("line");
    expect(series.warnings.join(" ")).toMatch(/series/i);
  });

  it("does not silently switch negative bridges away from waterfall", () => {
    const result = recommendExhibit({ job: "bridge", hasNegativeValues: true });
    expect(result.kind).toBe("waterfall");
    expect(result.warnings).toEqual([]);
  });
});
