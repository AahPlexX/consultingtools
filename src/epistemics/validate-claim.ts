import type { ClaimRecord, ClaimValidationFinding } from "./types.js";

export function validateClaimRecord(claim: ClaimRecord): ClaimValidationFinding[] {
  const findings: ClaimValidationFinding[] = [];

  if (
    claim.classification === "verified-external-fact" &&
    (claim.sourceIds?.length ?? 0) === 0
  ) {
    findings.push({
      code: "verified-fact-missing-source",
      severity: "error",
      claimId: claim.id,
    });
  }

  if (
    claim.classification === "deterministic-calculation" &&
    !claim.calculationRef?.trim()
  ) {
    findings.push({
      code: "calculation-missing-reference",
      severity: "error",
      claimId: claim.id,
    });
  }

  if (claim.classification === "bounded-assumption" && !claim.assumptionBasis?.trim()) {
    findings.push({
      code: "assumption-missing-basis",
      severity: "error",
      claimId: claim.id,
    });
  }

  return findings;
}
