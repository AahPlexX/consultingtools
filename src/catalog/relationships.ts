import { getCapabilityById } from "./registry.js";

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
];

export function getRelationshipsForCapability(id: string): CapabilityRelationship[] {
  return capabilityRelationships.filter(({ from, to }) => from === id || to === id);
}

export function validateRelationshipGraph(): string[] {
  const problems: string[] = [];
  for (const relationship of capabilityRelationships) {
    if (relationship.from === relationship.to) problems.push(`self:${relationship.from}`);
    if (!getCapabilityById(relationship.from)) problems.push(`missing-from:${relationship.from}`);
    if (!getCapabilityById(relationship.to)) problems.push(`missing-to:${relationship.to}`);
  }
  return problems;
}
