import { legacyCapabilities } from "./legacy.js";
import type { CapabilityDefinition, CapabilityDomain, CapabilityStatus } from "./types.js";

export interface CapabilitySearch {
  query?: string;
  status?: CapabilityStatus;
  domain?: CapabilityDomain;
  limit?: number;
}

export const capabilities: readonly CapabilityDefinition[] = legacyCapabilities;
const byId = new Map(capabilities.map((capability) => [capability.id, capability]));

export function getCapabilityById(id: string): CapabilityDefinition | undefined {
  return byId.get(id);
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
      return [
        capability.id,
        capability.name,
        capability.domain,
        capability.mode,
        capability.status,
        capability.summary,
        capability.requires ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    })
    .slice(0, boundedLimit)
    .map((capability) => ({ ...capability }));
}
