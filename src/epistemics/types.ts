export const epistemicClasses = [
  "verified-external-fact",
  "user-supplied-fact",
  "deterministic-calculation",
  "bounded-assumption",
  "inference",
  "hypothesis",
  "estimate",
  "scenario",
  "recommendation",
] as const;
export type EpistemicClass = (typeof epistemicClasses)[number];

export interface ClaimRecord {
  id: string;
  text: string;
  classification: EpistemicClass;
  sourceIds?: readonly string[];
  calculationRef?: string;
  assumptionBasis?: string;
}

export interface ClaimValidationFinding {
  code:
    | "verified-fact-missing-source"
    | "calculation-missing-reference"
    | "assumption-missing-basis";
  severity: "error";
  claimId: string;
}
