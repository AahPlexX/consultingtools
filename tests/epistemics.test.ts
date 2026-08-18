import { describe, expect, it } from "vitest";
import { validateClaimRecord } from "../src/epistemics/validate-claim.js";

describe("epistemic claim contracts", () => {
  it("requires provenance for verified external facts", () => {
    expect(
      validateClaimRecord({
        id: "fact-1",
        text: "The market grew 12% last year.",
        classification: "verified-external-fact",
        sourceIds: [],
      }),
    ).toContainEqual({
      code: "verified-fact-missing-source",
      severity: "error",
      claimId: "fact-1",
    });
  });

  it("requires calculation provenance for deterministic calculations", () => {
    expect(
      validateClaimRecord({
        id: "calc-1",
        text: "Break-even volume is 1,000 units.",
        classification: "deterministic-calculation",
      }),
    ).toContainEqual({
      code: "calculation-missing-reference",
      severity: "error",
      claimId: "calc-1",
    });
  });

  it("accepts an explicitly bounded assumption", () => {
    expect(
      validateClaimRecord({
        id: "assumption-1",
        text: "Assume flat demand in the base case.",
        classification: "bounded-assumption",
        assumptionBasis: "The user requested a flat-demand base case.",
      }),
    ).toEqual([]);
  });
});
