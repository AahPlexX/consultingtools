import { allFamilyCapabilities } from "./families/index.js";
import type { CapabilityDefinition, CapabilityDomain, CapabilityStatus } from "./types.js";

export interface CapabilitySearch {
  query?: string;
  status?: CapabilityStatus;
  domain?: CapabilityDomain;
  limit?: number;
}

export const capabilities: readonly CapabilityDefinition[] = allFamilyCapabilities;
const byId = new Map(capabilities.map((capability) => [capability.id, capability]));

export function getCapabilityById(id: string): CapabilityDefinition | undefined {
  return byId.get(id);
}

function searchableText(capability: CapabilityDefinition): string {
  const base = [
    capability.id,
    capability.name,
    capability.domain,
    capability.mode,
    capability.status,
    capability.summary,
    capability.requires ?? "",
  ];

  if (!capability.routingReady) return base.join(" ");

  return [
    ...base,
    capability.subdomain,
    ...capability.businessQuestions,
    ...capability.triggers,
    ...capability.antiTriggers,
    ...capability.requiredInputs,
    ...capability.optionalInputs,
    capability.methodology,
    ...capability.deterministicEngineIds,
    ...capability.outputs,
    ...capability.artifactFormats,
    ...capability.surfaceRequirements,
  ].join(" ");
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
    .filter((capability) => status === undefined || capability.status === status)
    .filter((capability) => domain === undefined || capability.domain === domain)
    .filter((capability) => {
      if (!normalizedQuery) return true;
      return searchableText(capability).toLocaleLowerCase().includes(normalizedQuery);
    })
    .slice(0, boundedLimit)
    .map((capability) => ({ ...capability }));
}
