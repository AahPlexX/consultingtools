import { describe, expect, it } from "vitest";
import { renderExhibitSvg } from "../src/visualization/render-exhibit.js";
import type { ExhibitSpecV1 } from "../src/visualization/types.js";

const common = {
  version: 1 as const,
  title: "Executive exhibit",
  altText: "Accessible description of the analytical exhibit.",
  sourceNote: "Source: verified fixture data.",
};

const fixtures: ExhibitSpecV1[] = [
  {
    ...common,
    kind: "bar",
    categories: ["North", "South", "West"],
    series: [{ name: "Revenue", values: [12, 18, 9] }],
  },
  {
    ...common,
    kind: "line",
    categories: ["Q1", "Q2", "Q3"],
    series: [
      { name: "Plan", values: [10, 12, 14] },
      { name: "Actual", values: [9, 13, 15] },
    ],
  },
  {
    ...common,
    kind: "scatter",
    xLabel: "Complexity",
    yLabel: "Value",
    series: [{ name: "Portfolio", points: [{ x: 2, y: 7, label: "A" }, { x: 8, y: 4, label: "B" }] }],
  },
  {
    ...common,
    kind: "waterfall",
    steps: [
      { label: "Base", value: 100, role: "total" },
      { label: "Price", value: 20 },
      { label: "Volume", value: -15 },
      { label: "Ending", value: 105, role: "total" },
    ],
  },
  {
    ...common,
    kind: "pareto",
    categories: ["C", "A", "B"],
    values: [10, 50, 25],
  },
  {
    ...common,
    kind: "heatmap",
    rowLabels: ["Product A", "Product B"],
    columnLabels: ["Low", "High"],
    values: [[1, 4], [3, 2]],
  },
  {
    ...common,
    kind: "matrix-2x2",
    xAxis: { label: "Attractiveness", low: "Low", high: "High" },
    yAxis: { label: "Capability", low: "Low", high: "High" },
    points: [{ label: "Invest", x: 8, y: 9 }, { label: "Watch", x: 3, y: 5 }],
  },
  {
    ...common,
    kind: "risk-matrix",
    points: [{ label: "Supplier outage", likelihood: 4, impact: 5 }, { label: "Delay", likelihood: 2, impact: 3 }],
  },
  {
    ...common,
    kind: "gantt",
    tasks: [
      { id: "discover", label: "Discover", start: 0, end: 4, group: "Phase 1" },
      { id: "design", label: "Design", start: 3, end: 8, group: "Phase 2" },
    ],
  },
  {
    ...common,
    kind: "funnel",
    stages: [{ label: "Leads", value: 100 }, { label: "Qualified", value: 60 }, { label: "Won", value: 24 }],
  },
];

describe("accessible deterministic exhibit SVG rendering", () => {
  it.each(fixtures)("renders $kind as a self-contained accessible 16:9 SVG", (fixture) => {
    const rendered = renderExhibitSvg(fixture);
    expect(rendered.width).toBe(1200);
    expect(rendered.height).toBe(675);
    expect(rendered.svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(rendered.svg).toContain('viewBox="0 0 1200 675"');
    expect(rendered.svg).toContain('role="img"');
    expect(rendered.svg).toContain('aria-labelledby="exhibit-title exhibit-desc"');
    expect(rendered.svg).toContain('<title id="exhibit-title">Executive exhibit</title>');
    expect(rendered.svg).toContain('<desc id="exhibit-desc">Accessible description of the analytical exhibit.</desc>');
    expect(rendered.metrics.dataPointCount).toBeGreaterThan(0);
    expect(rendered.svg).not.toMatch(/<script|foreignObject|javascript:|<a\b|onload=|onclick=|@import|\bhref=|xlink:href=/i);
    expect(renderExhibitSvg(fixture).svg).toBe(rendered.svg);
  });

  it("escapes all user-controlled XML text instead of emitting active markup", () => {
    const rendered = renderExhibitSvg({
      ...common,
      title: 'Risk <script>alert("x")</script> & review',
      altText: 'Description <img src=x onerror=alert(1)> & details',
      kind: "bar",
      categories: ['A < B & "quoted"'],
      series: [{ name: "Series > one", values: [5] }],
    });
    expect(rendered.svg).toContain("Risk &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; review");
    expect(rendered.svg).toContain("A &lt; B &amp; &quot;quoted&quot;");
    expect(rendered.svg).not.toContain("<script>");
    expect(rendered.svg).not.toContain("<img");
  });

  it("uses an explicit zero baseline for bars and a secondary non-color cue for multi-series lines", () => {
    const bars = renderExhibitSvg(fixtures[0]!);
    expect(bars.svg).toContain('data-role="zero-baseline"');

    const lines = renderExhibitSvg(fixtures[1]!);
    expect(lines.svg).toContain('data-role="line-marker"');
    expect(lines.svg).toContain('stroke-dasharray="8 5"');
  });

  it("encodes waterfall running totals and Pareto descending order with cumulative percentage semantics", () => {
    const waterfall = renderExhibitSvg(fixtures[3]!);
    expect(waterfall.svg).toContain('data-running-total="120"');
    expect(waterfall.svg).toContain('data-running-total="105"');

    const pareto = renderExhibitSvg(fixtures[4]!);
    const a = pareto.svg.indexOf(">A<");
    const b = pareto.svg.indexOf(">B<");
    const c = pareto.svg.indexOf(">C<");
    expect(a).toBeGreaterThan(-1);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(pareto.svg).toContain('data-role="pareto-cumulative"');
    expect(pareto.svg).toContain('data-cumulative-percent="100"');
  });

  it("renders heatmap values, matrix/risk positions, Gantt spans, and proportional funnel stages without color-only meaning", () => {
    const heatmap = renderExhibitSvg(fixtures[5]!);
    expect(heatmap.svg).toContain('data-role="heatmap-cell"');
    expect(heatmap.svg).toContain(">4<");

    const matrix = renderExhibitSvg(fixtures[6]!);
    expect(matrix.svg).toContain('data-role="matrix-point"');
    expect(matrix.svg).toContain(">Invest<");

    const risk = renderExhibitSvg(fixtures[7]!);
    expect(risk.svg).toContain('data-role="risk-point"');
    expect(risk.svg).toContain("Supplier outage");

    const gantt = renderExhibitSvg(fixtures[8]!);
    expect(gantt.svg).toContain('data-role="gantt-task"');
    expect(gantt.svg).toContain('data-start="0"');
    expect(gantt.svg).toContain('data-end="4"');

    const funnel = renderExhibitSvg(fixtures[9]!);
    const widths = [...funnel.svg.matchAll(/data-role="funnel-stage"[^>]*data-width="([0-9.]+)"/g)].map((match) => Number(match[1]));
    expect(widths).toHaveLength(3);
    expect(widths[0]).toBeGreaterThan(widths[1]!);
    expect(widths[1]).toBeGreaterThan(widths[2]!);
  });
});
