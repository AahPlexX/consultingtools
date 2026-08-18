import type { QualityEvaluationInput, QualityReport } from "./types.js";

export function evaluateQuality(input: QualityEvaluationInput): QualityReport {
  const passed = new Set(input.passedGateIds);
  const missingGateIds = input.requiredGateIds.filter((gateId) => !passed.has(gateId));
  const hasErrors = input.findings.some(({ severity }) => severity === "error");

  return {
    passed: missingGateIds.length === 0 && !hasErrors,
    requiredGateIds: [...input.requiredGateIds],
    passedGateIds: [...input.passedGateIds],
    missingGateIds,
    findings: [...input.findings],
  };
}

export function canPromoteCapability(report: QualityReport): boolean {
  return report.passed;
}
