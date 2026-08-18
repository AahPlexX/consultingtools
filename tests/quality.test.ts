import { describe, expect, it } from "vitest";
import { canPromoteCapability, evaluateQuality } from "../src/quality/evaluate.js";

describe("common QA contracts", () => {
  it("fails when a required gate is missing or an error exists", () => {
    const report = evaluateQuality({
      requiredGateIds: ["epistemic.source-support", "consulting.problem-framing"],
      passedGateIds: ["consulting.problem-framing"],
      findings: [
        {
          gateId: "epistemic.source-support",
          dimension: "epistemic",
          severity: "error",
          message: "A verified fact has no source.",
        },
      ],
    });
    expect(report.passed).toBe(false);
    expect(report.missingGateIds).toEqual(["epistemic.source-support"]);
    expect(canPromoteCapability(report)).toBe(false);
  });

  it("passes only when all required gates pass and no error remains", () => {
    const report = evaluateQuality({
      requiredGateIds: ["consulting.problem-framing"],
      passedGateIds: ["consulting.problem-framing"],
      findings: [],
    });
    expect(report.passed).toBe(true);
    expect(canPromoteCapability(report)).toBe(true);
  });
});
