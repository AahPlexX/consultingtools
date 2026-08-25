export type ExhibitKind =
  | "bar"
  | "line"
  | "scatter"
  | "waterfall"
  | "pareto"
  | "heatmap"
  | "matrix-2x2"
  | "risk-matrix"
  | "gantt"
  | "funnel";

export interface ExhibitBase {
  version: 1;
  kind: ExhibitKind;
  title: string;
  altText: string;
  sourceNote?: string;
  caveat?: string;
  accentColorHex?: string;
}

export interface NamedNumericSeries {
  name: string;
  values: number[];
}

export type ExhibitSpecV1 =
  | (ExhibitBase & {
      kind: "bar";
      categories: string[];
      series: NamedNumericSeries[];
      orientation?: "vertical" | "horizontal";
      stacked?: boolean;
    })
  | (ExhibitBase & {
      kind: "line";
      categories: string[];
      series: NamedNumericSeries[];
    })
  | (ExhibitBase & {
      kind: "scatter";
      xLabel: string;
      yLabel: string;
      series: { name: string; points: { x: number; y: number; label?: string }[] }[];
    })
  | (ExhibitBase & {
      kind: "waterfall";
      steps: { label: string; value: number; role?: "change" | "subtotal" | "total" }[];
    })
  | (ExhibitBase & {
      kind: "pareto";
      categories: string[];
      values: number[];
    })
  | (ExhibitBase & {
      kind: "heatmap";
      rowLabels: string[];
      columnLabels: string[];
      values: number[][];
    })
  | (ExhibitBase & {
      kind: "matrix-2x2";
      xAxis: { label: string; low: string; high: string };
      yAxis: { label: string; low: string; high: string };
      points: { label: string; x: number; y: number }[];
    })
  | (ExhibitBase & {
      kind: "risk-matrix";
      points: { label: string; likelihood: 1 | 2 | 3 | 4 | 5; impact: 1 | 2 | 3 | 4 | 5 }[];
    })
  | (ExhibitBase & {
      kind: "gantt";
      tasks: { id: string; label: string; start: number; end: number; group?: string }[];
    })
  | (ExhibitBase & {
      kind: "funnel";
      stages: { label: string; value: number }[];
    });

export interface ExhibitMetrics {
  dataPointCount: number;
  seriesCount: number;
  categoryCount: number;
}

export type AnalyticalExhibitJob =
  | "category-comparison"
  | "time-trend"
  | "relationship"
  | "bridge"
  | "contributor-priority"
  | "two-dimensional-intensity"
  | "portfolio-positioning"
  | "risk-prioritization"
  | "schedule"
  | "stage-conversion";

export interface DiagramNode {
  id: string;
  label: string;
  role?: "start" | "step" | "decision" | "outcome" | "milestone";
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export type DiagramSpecV1 = {
  version: 1;
  kind: "process" | "dependency" | "decision-tree";
  direction?: "LR" | "TB";
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

export const EXHIBIT_LIMITS = {
  maxTitleCharacters: 180,
  maxAltTextCharacters: 800,
  maxSourceCharacters: 2_000,
  maxCaveatCharacters: 2_000,
  maxCategories: 100,
  maxSeries: 12,
  maxDataPoints: 5_000,
  maxHeatmapRows: 50,
  maxHeatmapColumns: 50,
  maxMatrixPoints: 250,
  maxRiskPoints: 250,
  maxGanttTasks: 250,
  maxFunnelStages: 30,
} as const;

export const DIAGRAM_LIMITS = {
  maxNodes: 250,
  maxEdges: 500,
  maxTitleCharacters: 180,
  maxIdCharacters: 200,
  maxLabelCharacters: 1_000,
} as const;
