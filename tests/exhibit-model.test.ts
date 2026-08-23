import { describe, expect, it } from "vitest";
import { validateExhibit } from "../src/visualization/validate.js";
import type { ExhibitSpecV1 } from "../src/visualization/types.js";

const base = {
  version: 1 as const,
  title: "Executive exhibit",
  altText: "Accessible description of the executive exhibit.",
};

const fixtures: ExhibitSpecV1[] = [
  { ...base, kind: "bar", categories: ["A", "B"], series: [{ name: "Revenue", values: [10, 20] }] },
  { ...base, kind: "line", categories: ["Q1", "Q2"], series: [{ name: "Trend", values: [1, 2] }] },
  { ...base, kind: "scatter", xLabel: "Cost", yLabel: "Value", series: [{ name: "Options", points: [{ x: 1, y: 2, label: "A" }] }] },
  { ...base, kind: "waterfall", steps: [{ label: "Start", value: 100, role: "total" }, { label: "Change", value: -20 }, { label: "End", value: 80, role: "total" }] },
  { ...base, kind: "pareto", categories: ["Delay", "Defect"], values: [60, 40] },
  { ...base, kind: "heatmap", rowLabels: ["North", "South"], columnLabels: ["Q1", "Q2"], values: [[1, 2], [3, 4]] },
  { ...base, kind: "matrix-2x2", xAxis: { label: "Effort", low: "Low", high: "High" }, yAxis: { label: "Impact", low: "Low", high: "High" }, points: [{ label: "Initiative A", x: 0.2, y: 0.8 }] },
  { ...base, kind: "risk-matrix", points: [{ label: "Supplier outage", likelihood: 3, impact: 5 }] },
  { ...base, kind: "gantt", tasks: [{ id: "a", label: "Assess", start: 0, end: 5 }, { id: "b", label: "Implement", start: 5, end: 10, group: "Phase 2" }] },
  { ...base, kind: "funnel", stages: [{ label: "Leads", value: 100 }, { label: "Qualified", value: 40 }] },
];

describe("ExhibitSpecV1 validation", () => {
  it("accepts all ten bounded exhibit types", () => {
    for (const fixture of fixtures) {
      const metrics = validateExhibit(fixture);
      expect(metrics.dataPointCount).toBeGreaterThan(0);
      expect(metrics.seriesCount).toBeGreaterThanOrEqual(0);
      expect(metrics.categoryCount).toBeGreaterThanOrEqual(0);
    }
  });

  it("reports deterministic metrics", () => {
    expect(validateExhibit(fixtures[0]!)).toEqual({ dataPointCount: 2, seriesCount: 1, categoryCount: 2 });
    expect(validateExhibit(fixtures[5]!)).toEqual({ dataPointCount: 4, seriesCount: 2, categoryCount: 2 });
    expect(validateExhibit(fixtures[8]!)).toEqual({ dataPointCount: 2, seriesCount: 1, categoryCount: 2 });
  });

  it("rejects malformed categorical and heatmap shapes", () => {
    expect(() => validateExhibit({ ...base, kind: "bar", categories: ["A", "B"], series: [{ name: "Revenue", values: [1] }] } as ExhibitSpecV1)).toThrow(/match/i);
    expect(() => validateExhibit({ ...base, kind: "heatmap", rowLabels: ["R1", "R2"], columnLabels: ["C1", "C2"], values: [[1, 2], [3]] } as ExhibitSpecV1)).toThrow(/heatmap|column/i);
  });

  it("rejects duplicate Gantt IDs invalid intervals and non-finite values", () => {
    expect(() => validateExhibit({ ...base, kind: "gantt", tasks: [{ id: "x", label: "A", start: 0, end: 1 }, { id: "x", label: "B", start: 1, end: 2 }] } as ExhibitSpecV1)).toThrow(/unique|duplicate/i);
    expect(() => validateExhibit({ ...base, kind: "gantt", tasks: [{ id: "x", label: "A", start: 2, end: 1 }] } as ExhibitSpecV1)).toThrow(/end|start/i);
    expect(() => validateExhibit({ ...base, kind: "line", categories: ["A"], series: [{ name: "Trend", values: [Number.POSITIVE_INFINITY] }] } as ExhibitSpecV1)).toThrow(/finite/i);
  });

  it("rejects empty labels and documented bounds", () => {
    expect(() => validateExhibit({ ...base, kind: "funnel", stages: [{ label: "", value: 1 }] } as ExhibitSpecV1)).toThrow(/label/i);
    expect(() => validateExhibit({ ...base, kind: "bar", categories: Array.from({ length: 101 }, (_, index) => `C${index}`), series: [{ name: "S", values: Array.from({ length: 101 }, () => 1) }] } as ExhibitSpecV1)).toThrow(/100|categor/i);
    expect(() => validateExhibit({ ...base, kind: "heatmap", rowLabels: Array.from({ length: 51 }, (_, index) => `R${index}`), columnLabels: ["C"], values: Array.from({ length: 51 }, () => [1]) } as ExhibitSpecV1)).toThrow(/50|heatmap/i);
  });

  it("rejects unknown fields and unsupported kinds at runtime", () => {
    expect(() => validateExhibit({ ...fixtures[0], surprise: true } as unknown as ExhibitSpecV1)).toThrow(/unsupported field/i);
    expect(() => validateExhibit({ ...base, kind: "pie", values: [1, 2] } as unknown as ExhibitSpecV1)).toThrow(/unsupported.*kind/i);
  });
});
