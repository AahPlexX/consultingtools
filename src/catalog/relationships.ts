import { capabilities } from "./registry.js";
import type { CapabilityDefinition } from "./types.js";

export const relationshipKinds = [
  "prerequisite",
  "useful-follow-on",
  "alternative",
  "overlap",
] as const;
export type CapabilityRelationshipKind = (typeof relationshipKinds)[number];

export interface CapabilityRelationship {
  from: string;
  to: string;
  kind: CapabilityRelationshipKind;
  rationale: string;
}

export const capabilityRelationships: readonly CapabilityRelationship[] = [
  {
    from: "market-sizing",
    to: "market-attractiveness",
    kind: "useful-follow-on",
    rationale: "Demand scale can materially inform market attractiveness.",
  },
  {
    from: "market-attractiveness",
    to: "entry-strategy",
    kind: "useful-follow-on",
    rationale: "Entry strategy should follow evidence that the target market is sufficiently attractive.",
  },
  {
    from: "break-even",
    to: "investment-appraisal",
    kind: "useful-follow-on",
    rationale: "Break-even economics can inform investment feasibility before broader appraisal.",
  },
  {
    from: "data-cleaning",
    to: "descriptive-statistics",
    kind: "prerequisite",
    rationale: "Structured data should be validated and normalized before statistical summaries are treated as reliable.",
  },
  {
    from: "strategic-option-generation",
    to: "strategic-option-comparison",
    kind: "useful-follow-on",
    rationale: "Generated strategic options should be compared against explicit decision criteria before selection.",
  },
  {
    from: "synergy-identification",
    to: "synergy-sizing",
    kind: "useful-follow-on",
    rationale: "Potential synergies must be identified before their value and timing can be estimated.",
  },
  {
    from: "financial-diligence",
    to: "valuation-comparison",
    kind: "useful-follow-on",
    rationale: "Normalized diligence findings can materially change the inputs used in valuation comparison.",
  },
  {
    from: "source-discovery",
    to: "source-ranking",
    kind: "useful-follow-on",
    rationale: "Candidate evidence sources should be ranked for authority and relevance before synthesis.",
  },
  {
    from: "source-ranking",
    to: "evidence-synthesis",
    kind: "useful-follow-on",
    rationale: "Evidence synthesis should preferentially use sources whose quality and relevance have been assessed.",
  },
  {
    from: "trend-analysis",
    to: "time-series-forecasting",
    kind: "useful-follow-on",
    rationale: "Observed trend structure can inform selection and interpretation of a forecasting approach.",
  },
  {
    from: "seasonality-analysis",
    to: "time-series-forecasting",
    kind: "useful-follow-on",
    rationale: "Seasonality evidence can materially change the specification of a time-series forecast.",
  },
  {
    from: "time-series-forecasting",
    to: "forecast-backtest",
    kind: "useful-follow-on",
    rationale: "A forecasting method should be tested against withheld or historical periods before reliance.",
  },
  {
    from: "forecast-backtest",
    to: "forecast-error-metrics",
    kind: "useful-follow-on",
    rationale: "Backtest residuals provide the observations needed to calculate forecast-error metrics.",
  },
  {
    from: "project-charter",
    to: "work-breakdown-structure",
    kind: "useful-follow-on",
    rationale: "A defined project objective and scope should precede decomposition into work packages.",
  },
  {
    from: "work-breakdown-structure",
    to: "dependency-map",
    kind: "useful-follow-on",
    rationale: "Dependencies can be mapped only after the relevant work packages and activities are identified.",
  },
  {
    from: "dependency-map",
    to: "critical-path",
    kind: "prerequisite",
    rationale: "Critical-path analysis requires an activity network with explicit dependency relationships.",
  },
  {
    from: "process-map",
    to: "process-diagram",
    kind: "useful-follow-on",
    rationale: "A validated process map can be rendered as a process diagram for communication and review.",
  },
  {
    from: "sensitivity-analysis",
    to: "tornado-chart",
    kind: "useful-follow-on",
    rationale: "Tornado charts visualize the ranked effects produced by one-way sensitivity analysis.",
  },
];

export function getRelationshipsForCapability(id: string): CapabilityRelationship[] {
  return capabilityRelationships.filter(({ from, to }) => from === id || to === id);
}

export function validateRelationshipGraph(
  catalog: readonly CapabilityDefinition[] = capabilities,
): string[] {
  const problems: string[] = [];
  const ids = new Set(catalog.map(({ id }) => id));

  for (const relationship of capabilityRelationships) {
    if (relationship.from === relationship.to) problems.push(`self:${relationship.from}`);
    if (!ids.has(relationship.from)) problems.push(`missing-from:${relationship.from}`);
    if (!ids.has(relationship.to)) problems.push(`missing-to:${relationship.to}`);
  }

  return problems;
}
