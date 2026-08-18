import type {
  ArtifactFormat,
  CapabilityDomain,
  CapabilityStatus,
  EvidenceLevel,
  ExecutionMode,
  OutputModality,
  QualityGateId,
  RiskClass,
  RoutableCapabilityDefinition,
  SurfaceRequirement,
} from "./types.js";

function requireText(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must not be blank.`);
}

function requireItems(values: readonly string[], label: string): void {
  if (values.length === 0) throw new Error(`${label} must contain at least one item.`);
  if (values.some((value) => !value.trim())) {
    throw new Error(`${label} must not contain blank items.`);
  }
}

export function defineCapability(
  input: RoutableCapabilityDefinition,
): Readonly<RoutableCapabilityDefinition> {
  requireText(input.id, "id");
  requireText(input.name, "name");
  requireText(input.subdomain, "subdomain");
  requireText(input.summary, "summary");
  requireText(input.methodology, "methodology");
  requireText(input.assumptionPolicy, "assumptionPolicy");
  requireText(input.failureBehavior, "failureBehavior");

  requireItems(input.businessQuestions, "business question");
  requireItems(input.triggers, "trigger");
  requireItems(input.antiTriggers, "anti-trigger");
  requireItems(input.requiredInputs, "required input");
  requireItems(input.qualityGates, "quality gate");
  requireItems(input.evaluationFixtureIds, "evaluation fixture");

  if (
    input.status !== "unavailable" &&
    (input.access.userCredentialRequired || input.access.privateAccountRequired)
  ) {
    throw new Error(
      `Capability ${input.id} violates the open-access boundary: credential/private-account requirements are allowed only for unavailable catalog entries.`,
    );
  }

  if (
    input.relatedCapabilityIds.includes(input.id) ||
    input.conflictingCapabilityIds.includes(input.id)
  ) {
    throw new Error(`Capability ${input.id} contains a self-reference.`);
  }

  return Object.freeze({ ...input });
}

export interface StandardCapabilitySeed {
  id: string;
  name: string;
  domain: CapabilityDomain;
  subdomain: string;
  status: CapabilityStatus;
  summary: string;
  businessQuestion: string;
  trigger: string;
  antiTrigger: string;
  requiredInputs: readonly string[];
  methodology: string;
  mode?: ExecutionMode;
  optionalInputs?: readonly string[];
  deterministicEngineIds?: readonly string[];
  evidenceLevel?: EvidenceLevel;
  publicResearchAllowed?: boolean;
  outputs?: readonly OutputModality[];
  artifactFormats?: readonly ArtifactFormat[];
  surfaceRequirements?: readonly SurfaceRequirement[];
  qualityGates?: readonly QualityGateId[];
  riskClass?: RiskClass;
  relatedCapabilityIds?: readonly string[];
  conflictingCapabilityIds?: readonly string[];
  requires?: string;
  assumptionPolicy?: string;
  failureBehavior?: string;
  evaluationFixtureIds?: readonly string[];
  access?: {
    userCredentialRequired: boolean;
    privateAccountRequired: boolean;
  };
}

const defaultQualityGates: readonly QualityGateId[] = [
  "consulting.problem-framing",
  "consulting.method-fit",
  "epistemic.claim-classification",
  "consulting.actionability",
];

export function defineStandardCapability(
  seed: StandardCapabilitySeed,
): Readonly<RoutableCapabilityDefinition> {
  const base: RoutableCapabilityDefinition = {
    routingReady: true,
    id: seed.id,
    name: seed.name,
    domain: seed.domain,
    subdomain: seed.subdomain,
    mode: seed.mode ?? "reasoning",
    status: seed.status,
    summary: seed.summary,
    businessQuestions: [seed.businessQuestion],
    triggers: [seed.trigger],
    antiTriggers: [seed.antiTrigger],
    requiredInputs: [...seed.requiredInputs],
    optionalInputs: [...(seed.optionalInputs ?? [])],
    methodology: seed.methodology,
    deterministicEngineIds: [...(seed.deterministicEngineIds ?? [])],
    evidence: {
      level: seed.evidenceLevel ?? "user-input-sufficient",
      publicResearchAllowed: seed.publicResearchAllowed ?? true,
    },
    outputs: [...(seed.outputs ?? ["text", "structured-model"])],
    artifactFormats: [...(seed.artifactFormats ?? [])],
    surfaceRequirements: [...(seed.surfaceRequirements ?? ["host-reasoning"])],
    qualityGates: [...(seed.qualityGates ?? defaultQualityGates)],
    assumptionPolicy:
      seed.assumptionPolicy ??
      "State material assumptions, identify their basis, and test decision-sensitive assumptions when feasible.",
    failureBehavior:
      seed.failureBehavior ??
      "State missing evidence or a bounded limitation instead of fabricating support or precision.",
    access: seed.access ?? {
      userCredentialRequired: false,
      privateAccountRequired: false,
    },
    riskClass: seed.riskClass ?? "standard",
    relatedCapabilityIds: [...(seed.relatedCapabilityIds ?? [])],
    conflictingCapabilityIds: [...(seed.conflictingCapabilityIds ?? [])],
    evaluationFixtureIds: [
      ...(seed.evaluationFixtureIds ?? [`${seed.id}-positive`, `${seed.id}-negative`]),
    ],
  };

  if (seed.requires !== undefined) base.requires = seed.requires;
  return defineCapability(base);
}
