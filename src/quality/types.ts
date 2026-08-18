import type { QualityGateId } from "../catalog/types.js";

export const qualityDimensions = ["analytical", "epistemic", "consulting", "artifact"] as const;
export type QualityDimension = (typeof qualityDimensions)[number];
export type QualitySeverity = "info" | "warning" | "error";

export interface QualityFinding {
  gateId: QualityGateId;
  dimension: QualityDimension;
  severity: QualitySeverity;
  message: string;
}

export interface QualityEvaluationInput {
  requiredGateIds: readonly QualityGateId[];
  passedGateIds: readonly QualityGateId[];
  findings: readonly QualityFinding[];
}

export interface QualityReport {
  passed: boolean;
  requiredGateIds: QualityGateId[];
  passedGateIds: QualityGateId[];
  missingGateIds: QualityGateId[];
  findings: QualityFinding[];
}
