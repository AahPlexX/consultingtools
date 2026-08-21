import { defineCapability } from "./define.js";
import type { CapabilityDefinition, RoutableCapabilityDefinition } from "./types.js";

interface Promotion {
  status: RoutableCapabilityDefinition["status"];
  deterministicEngineIds: readonly string[];
  mode: RoutableCapabilityDefinition["mode"];
  surfaceRequirements: readonly RoutableCapabilityDefinition["surfaceRequirements"][number][];
  additionalQualityGates: readonly RoutableCapabilityDefinition["qualityGates"][number][];
}

const analyticalGates: readonly RoutableCapabilityDefinition["qualityGates"][number][] = [
  "analytical.formula-correctness",
  "analytical.internal-consistency",
  "analytical.unit-consistency",
];

const hybridDeterministic = {
  mode: "hybrid" as const,
  surfaceRequirements: ["host-reasoning", "deterministic-engine"] as const,
  additionalQualityGates: analyticalGates,
};

const artifactDeterministic = {
  mode: "artifact" as const,
  surfaceRequirements: ["deterministic-engine", "artifact-input", "artifact-output"] as const,
  additionalQualityGates: ["artifact.openability", "artifact.preservation"] as const,
};

const verifiedPromotions: Readonly<Record<string, Promotion>> = {
  npv: { status: "implemented", deterministicEngineIds: ["calculate_npv"], ...hybridDeterministic },
  payback: { status: "implemented", deterministicEngineIds: ["calculate_payback"], ...hybridDeterministic },
  irr: { status: "partial", deterministicEngineIds: ["calculate_irr"], ...hybridDeterministic },
  "data-profiling": { status: "partial", deterministicEngineIds: ["profile_data_column"], ...hybridDeterministic },
  "descriptive-statistics": { status: "partial", deterministicEngineIds: ["calculate_descriptive_statistics"], ...hybridDeterministic },
  "correlation-analysis": { status: "partial", deterministicEngineIds: ["calculate_correlation"], ...hybridDeterministic },
  "confidence-interval": { status: "partial", deterministicEngineIds: ["calculate_mean_confidence_interval"], ...hybridDeterministic },
  "hypothesis-testing": { status: "partial", deterministicEngineIds: ["calculate_welch_t_test"], ...hybridDeterministic },
  "time-series-forecasting": { status: "partial", deterministicEngineIds: ["forecast_baseline"], ...hybridDeterministic },
  "forecast-backtest": { status: "partial", deterministicEngineIds: ["backtest_forecast_baseline"], ...hybridDeterministic },
  "forecast-error-metrics": { status: "partial", deterministicEngineIds: ["calculate_forecast_error_metrics"], ...hybridDeterministic },
  "critical-path": { status: "partial", deterministicEngineIds: ["calculate_critical_path"], ...hybridDeterministic },
  "earned-value": { status: "partial", deterministicEngineIds: ["calculate_earned_value_performance"], ...hybridDeterministic },
  utilization: { status: "partial", deterministicEngineIds: ["calculate_capacity_utilization"], ...hybridDeterministic },
  throughput: { status: "partial", deterministicEngineIds: ["calculate_flow_performance"], ...hybridDeterministic },
  "cycle-time": { status: "partial", deterministicEngineIds: ["calculate_flow_performance"], ...hybridDeterministic },
  "weighted-selection": { status: "partial", deterministicEngineIds: ["calculate_weighted_decision"], ...hybridDeterministic },
  "inventory-analysis": { status: "partial", deterministicEngineIds: ["calculate_reorder_point", "calculate_eoq"], ...hybridDeterministic },
  "supplier-segmentation": { status: "partial", deterministicEngineIds: ["analyze_supplier_spend"], ...hybridDeterministic },
  "csv-crud": {
    status: "partial",
    deterministicEngineIds: ["create_csv_artifact", "inspect_csv_artifact", "patch_csv_artifact"],
    ...artifactDeterministic,
  },
  "docx-crud": {
    status: "partial",
    deterministicEngineIds: ["create_consulting_document", "inspect_docx_template", "patch_docx_template"],
    ...artifactDeterministic,
  },
  "pdf-crud": {
    status: "partial",
    deterministicEngineIds: ["create_consulting_document", "inspect_pdf", "update_pdf_metadata", "compose_pdf_artifact"],
    ...artifactDeterministic,
  },
};

export function applyVerifiedCapabilityPromotions(capability: CapabilityDefinition): CapabilityDefinition {
  if (!capability.routingReady) return capability;
  const promotion = verifiedPromotions[capability.id];
  if (!promotion) return capability;

  return defineCapability({
    ...capability,
    status: promotion.status,
    deterministicEngineIds: [...promotion.deterministicEngineIds],
    mode: promotion.mode,
    surfaceRequirements: [...promotion.surfaceRequirements],
    qualityGates: [...new Set([...capability.qualityGates, ...promotion.additionalQualityGates])],
  });
}
