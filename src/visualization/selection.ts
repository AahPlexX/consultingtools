import { EXHIBIT_LIMITS, type AnalyticalExhibitJob, type ExhibitKind } from "./types.js";

const RECOMMENDATIONS: Record<AnalyticalExhibitJob, { kind: ExhibitKind; rationale: string }> = {
  "category-comparison": { kind: "bar", rationale: "Bar charts support precise comparison of magnitudes across discrete categories." },
  "time-trend": { kind: "line", rationale: "Line charts preserve ordered time progression and make changes in trend visible." },
  relationship: { kind: "scatter", rationale: "Scatter plots expose the relationship and dispersion between two numeric variables." },
  bridge: { kind: "waterfall", rationale: "Waterfall exhibits show how sequential positive and negative changes bridge a starting value to an ending value." },
  "contributor-priority": { kind: "pareto", rationale: "Pareto exhibits rank contributors and pair magnitude with cumulative contribution for prioritization." },
  "two-dimensional-intensity": { kind: "heatmap", rationale: "Heatmaps encode a bounded numeric matrix across two categorical dimensions while retaining row and column position." },
  "portfolio-positioning": { kind: "matrix-2x2", rationale: "A 2x2 matrix positions labeled items against two explicit quantitative dimensions without inventing a composite score." },
  "risk-prioritization": { kind: "risk-matrix", rationale: "A risk matrix places explicitly supplied likelihood and impact ratings on a shared prioritization grid." },
  schedule: { kind: "gantt", rationale: "A Gantt exhibit maps explicitly supplied task start and end positions along a common schedule axis." },
  "stage-conversion": { kind: "funnel", rationale: "A funnel exhibit compares explicitly supplied stage volumes in their supplied process order." },
};

function optionalCount(value: number | undefined, label: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer when supplied.`);
  return value;
}

export function recommendExhibit(input: {
  job: AnalyticalExhibitJob;
  categoryCount?: number;
  seriesCount?: number;
  hasNegativeValues?: boolean;
}): { kind: ExhibitKind; rationale: string; warnings: string[] } {
  const recommendation = RECOMMENDATIONS[input.job];
  if (!recommendation) throw new Error(`Unsupported analytical exhibit job: ${String(input.job)}.`);
  const categoryCount = optionalCount(input.categoryCount, "categoryCount");
  const seriesCount = optionalCount(input.seriesCount, "seriesCount");
  if (input.hasNegativeValues !== undefined && typeof input.hasNegativeValues !== "boolean") throw new Error("hasNegativeValues must be boolean when supplied.");

  const warnings: string[] = [];
  if (categoryCount !== undefined && categoryCount > EXHIBIT_LIMITS.maxCategories) {
    warnings.push(`Category count ${categoryCount} exceeds the ordinary ${EXHIBIT_LIMITS.maxCategories}-category exhibit bound; reduce or intentionally aggregate categories before rendering.`);
  }
  if (seriesCount !== undefined && seriesCount > EXHIBIT_LIMITS.maxSeries) {
    warnings.push(`Series count ${seriesCount} exceeds the ${EXHIBIT_LIMITS.maxSeries}-series exhibit bound; reduce series before rendering.`);
  }

  return { kind: recommendation.kind, rationale: recommendation.rationale, warnings };
}
