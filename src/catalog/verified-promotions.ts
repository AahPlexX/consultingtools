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

const visualizationArtifact = {
  mode: "artifact" as const,
  surfaceRequirements: ["deterministic-engine", "artifact-output"] as const,
  additionalQualityGates: ["artifact.openability", "artifact.rendering"] as const,
};

const visualizationHybrid = {
  mode: "hybrid" as const,
  surfaceRequirements: ["host-reasoning", "deterministic-engine", "artifact-output"] as const,
  additionalQualityGates: ["consulting.method-fit", "artifact.openability", "artifact.rendering"] as const,
};

const mermaidArtifact = {
  mode: "artifact" as const,
  surfaceRequirements: ["deterministic-engine", "artifact-output"] as const,
  additionalQualityGates: ["artifact.openability"] as const,
};

const presentationHybrid = {
  mode: "hybrid" as const,
  surfaceRequirements: ["host-reasoning", "deterministic-engine", "artifact-output"] as const,
  additionalQualityGates: ["consulting.actionability", "artifact.openability", "artifact.rendering"] as const,
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
  "data-visualization": {
    status: "partial",
    deterministicEngineIds: ["recommend_consulting_exhibit", "create_consulting_exhibit"],
    ...visualizationHybrid,
  },
  "bar-chart": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "stacked-bar-chart": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "line-chart": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "scatter-plot": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "waterfall-chart": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "pareto-chart": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  heatmap: { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "two-by-two-matrix": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "risk-heatmap": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "gantt-visual": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "funnel-chart": { status: "partial", deterministicEngineIds: ["create_consulting_exhibit"], ...visualizationArtifact },
  "process-diagram": { status: "partial", deterministicEngineIds: ["create_mermaid_diagram"], ...mermaidArtifact },
  "dependency-diagram": { status: "partial", deterministicEngineIds: ["create_mermaid_diagram"], ...mermaidArtifact },
  "decision-tree-visual": { status: "partial", deterministicEngineIds: ["create_mermaid_diagram"], ...mermaidArtifact },
  "board-material": { status: "partial", deterministicEngineIds: ["create_consulting_presentation"], ...presentationHybrid },
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
