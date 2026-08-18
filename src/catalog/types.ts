export const capabilityStatuses = [
  "implemented",
  "partial",
  "provider-dependent",
  "planned",
  "unavailable",
] as const;
export type CapabilityStatus = (typeof capabilityStatuses)[number];

export const capabilityDomains = [
  "strategy",
  "market",
  "customer",
  "finance",
  "m-and-a",
  "operations",
  "supply-chain",
  "organization",
  "project",
  "growth",
  "seo",
  "research",
  "risk",
  "artifacts",
  "data",
  "forecasting",
  "visualization",
  "delivery",
  "innovation",
] as const;
export type CapabilityDomain = (typeof capabilityDomains)[number];

export const executionModes = [
  "reasoning",
  "research",
  "deterministic",
  "artifact",
  "hybrid",
] as const;
export type ExecutionMode = (typeof executionModes)[number];

export const outputModalities = [
  "text",
  "structured-model",
  "dataset",
  "visualization",
  "diagram",
  "document",
  "spreadsheet",
  "presentation",
  "print-artifact",
  "interactive",
  "multi-artifact",
] as const;
export type OutputModality = (typeof outputModalities)[number];

export const artifactFormats = [
  "md",
  "html",
  "csv",
  "xlsx",
  "docx",
  "pdf",
  "pptx",
  "svg",
  "mermaid",
] as const;
export type ArtifactFormat = (typeof artifactFormats)[number];

export const riskClasses = ["standard", "elevated", "high-stakes"] as const;
export type RiskClass = (typeof riskClasses)[number];

export const evidenceLevels = [
  "user-input-sufficient",
  "current-external-evidence",
  "authoritative-primary-preferred",
] as const;
export type EvidenceLevel = (typeof evidenceLevels)[number];

export type QualityGateId =
  | "analytical.formula-correctness"
  | "analytical.internal-consistency"
  | "analytical.unit-consistency"
  | "epistemic.claim-classification"
  | "epistemic.source-support"
  | "epistemic.freshness"
  | "consulting.problem-framing"
  | "consulting.method-fit"
  | "consulting.actionability"
  | "artifact.openability"
  | "artifact.rendering"
  | "artifact.preservation";

export interface CapabilityCore {
  id: string;
  name: string;
  domain: CapabilityDomain;
  mode: ExecutionMode;
  status: CapabilityStatus;
  summary: string;
  requires?: string;
}

export interface LegacyCapabilityDefinition extends CapabilityCore {
  routingReady: false;
}

export interface RoutableCapabilityDefinition extends CapabilityCore {
  routingReady: true;
  subdomain: string;
  businessQuestions: readonly string[];
  triggers: readonly string[];
  antiTriggers: readonly string[];
  requiredInputs: readonly string[];
  optionalInputs: readonly string[];
  methodology: string;
  evidence: { level: EvidenceLevel; publicResearchAllowed: boolean };
  outputs: readonly OutputModality[];
  artifactFormats: readonly ArtifactFormat[];
  qualityGates: readonly QualityGateId[];
  assumptionPolicy: string;
  failureBehavior: string;
  access: { userCredentialRequired: boolean; privateAccountRequired: boolean };
  riskClass: RiskClass;
  relatedCapabilityIds: readonly string[];
  conflictingCapabilityIds: readonly string[];
  evaluationFixtureIds: readonly string[];
}

export type CapabilityDefinition = LegacyCapabilityDefinition | RoutableCapabilityDefinition;

export function isRoutingReadyCapability(
  capability: CapabilityDefinition,
): capability is RoutableCapabilityDefinition {
  return capability.routingReady;
}
