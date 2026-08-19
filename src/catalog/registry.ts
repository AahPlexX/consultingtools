import { allFamilyCapabilities } from "./families/index.js";
import type { CapabilityDefinition, CapabilityDomain, CapabilityStatus } from "./types.js";
import { applyVerifiedCapabilityPromotions } from "./verified-promotions.js";

export interface CapabilitySearch {
  query?: string;
  status?: CapabilityStatus;
  domain?: CapabilityDomain;
  limit?: number;
}

export const capabilities: readonly CapabilityDefinition[] = allFamilyCapabilities.map(
  applyVerifiedCapabilityPromotions,
);
const byId = new Map(capabilities.map((capability) => [capability.id, capability]));

export function getCapabilityById(id: string): CapabilityDefinition | undefined {
  return byId.get(id);
}

function normalized(value: string): string {
  return value.toLocaleLowerCase();
}

function matchScore(capability: CapabilityDefinition, query: string): number {
  const directFields = [
    capability.id,
    capability.name,
    capability.summary,
    capability.routingReady ? capability.subdomain : "",
  ];
  if (normalized(directFields.join(" ")).includes(query)) return 3;

  if (!capability.routingReady) {
    return normalized(capability.requires ?? "").includes(query) ? 1 : 0;
  }

  const decisionFields = [
    ...capability.businessQuestions,
    ...capability.triggers,
    capability.methodology,
  ];
  if (normalized(decisionFields.join(" ")).includes(query)) return 2;

  const supportingFields = [
    ...capability.antiTriggers,
    ...capability.requiredInputs,
    ...capability.optionalInputs,
    ...capability.deterministicEngineIds,
    ...capability.outputs,
    ...capability.artifactFormats,
    ...capability.surfaceRequirements,
    capability.requires ?? "",
  ];
  return normalized(supportingFields.join(" ")).includes(query) ? 1 : 0;
}

export function searchCapabilities({
  query,
  status,
  domain,
  limit = 20,
}: CapabilitySearch = {}): CapabilityDefinition[] {
  const normalizedQuery = query?.trim().toLocaleLowerCase();
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);

  return capabilities
    .map((capability, index) => ({
      capability,
      index,
      score: normalizedQuery ? matchScore(capability, normalizedQuery) : 1,
    }))
    .filter(({ capability }) => status === undefined || capability.status === status)
    .filter(({ capability }) => domain === undefined || capability.domain === domain)
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, boundedLimit)
    .map(({ capability }) => ({ ...capability }));
}
