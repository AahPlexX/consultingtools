import * as z from "zod/v4";

const baseExhibitShape = {
  version: z.literal(1),
  title: z.string(),
  altText: z.string(),
  sourceNote: z.string().optional(),
  caveat: z.string().optional(),
  accentColorHex: z.string().optional(),
};

const numericSeriesSchema = z.object({ name: z.string(), values: z.array(z.number()) });

export const exhibitSchema = z.discriminatedUnion("kind", [
  z.object({
    ...baseExhibitShape,
    kind: z.literal("bar"),
    categories: z.array(z.string()),
    series: z.array(numericSeriesSchema),
    orientation: z.enum(["vertical", "horizontal"]).optional(),
    stacked: z.boolean().optional(),
  }),
  z.object({
    ...baseExhibitShape,
    kind: z.literal("line"),
    categories: z.array(z.string()),
    series: z.array(numericSeriesSchema),
  }),
  z.object({
    ...baseExhibitShape,
    kind: z.literal("scatter"),
    xLabel: z.string(),
    yLabel: z.string(),
    series: z.array(z.object({
      name: z.string(),
      points: z.array(z.object({ x: z.number(), y: z.number(), label: z.string().optional() })),
    })),
  }),
  z.object({
    ...baseExhibitShape,
    kind: z.literal("waterfall"),
    steps: z.array(z.object({
      label: z.string(),
      value: z.number(),
      role: z.enum(["change", "subtotal", "total"]).optional(),
    })),
  }),
  z.object({
    ...baseExhibitShape,
    kind: z.literal("pareto"),
    categories: z.array(z.string()),
    values: z.array(z.number()),
  }),
  z.object({
    ...baseExhibitShape,
    kind: z.literal("heatmap"),
    rowLabels: z.array(z.string()),
    columnLabels: z.array(z.string()),
    values: z.array(z.array(z.number())),
  }),
  z.object({
    ...baseExhibitShape,
    kind: z.literal("matrix-2x2"),
    xAxis: z.object({ label: z.string(), low: z.string(), high: z.string() }),
    yAxis: z.object({ label: z.string(), low: z.string(), high: z.string() }),
    points: z.array(z.object({ label: z.string(), x: z.number(), y: z.number() })),
  }),
  z.object({
    ...baseExhibitShape,
    kind: z.literal("risk-matrix"),
    points: z.array(z.object({
      label: z.string(),
      likelihood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
      impact: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    })),
  }),
  z.object({
    ...baseExhibitShape,
    kind: z.literal("gantt"),
    tasks: z.array(z.object({
      id: z.string(),
      label: z.string(),
      start: z.number(),
      end: z.number(),
      group: z.string().optional(),
    })),
  }),
  z.object({
    ...baseExhibitShape,
    kind: z.literal("funnel"),
    stages: z.array(z.object({ label: z.string(), value: z.number() })),
  }),
]);

export const diagramSchema = z.object({
  version: z.literal(1),
  kind: z.enum(["process", "dependency", "decision-tree"]),
  direction: z.enum(["LR", "TB"]).optional(),
  title: z.string(),
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    role: z.enum(["start", "step", "decision", "outcome", "milestone"]).optional(),
  })),
  edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional() })),
});

export const analyticalJobSchema = z.enum([
  "category-comparison",
  "time-trend",
  "relationship",
  "bridge",
  "contributor-priority",
  "two-dimensional-intensity",
  "portfolio-positioning",
  "risk-prioritization",
  "schedule",
  "stage-conversion",
]);
