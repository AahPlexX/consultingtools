import { defineCapability } from "./define.js";
import type { CapabilityDefinition, RoutableCapabilityDefinition } from "./types.js";

interface Promotion {
  status: RoutableCapabilityDefinition["status"];
  deterministicEngineIds: readonly string[];
  mode: RoutableCapabilityDefinition["mode"];
  surfaceRequirements: readonly RoutableCapabilityDefinition["surfaceRequirements"][number][];
  additionalQualityGates: readonly RoutableCapabilityDefinition["qualityGates"][number][];
}

const verifiedPromotions: Readonly<Record<string, Promotion>> = {
  npv: {
    status: "implemented",
    deterministicEngineIds: ["calculate_npv"],
    mode: "hybrid",
    surfaceRequirements: ["host-reasoning", "deterministic-engine"],
    additionalQualityGates: [
      "analytical.formula-correctness",
      "analytical.internal-consistency",
      "analytical.unit-consistency",
    ],
  },
  payback: {
    status: "implemented",
    deterministicEngineIds: ["calculate_payback"],
    mode: "hybrid",
    surfaceRequirements: ["host-reasoning", "deterministic-engine"],
    additionalQualityGates: [
      "analytical.formula-correctness",
      "analytical.internal-consistency",
      "analytical.unit-consistency",
    ],
  },
  irr: {
    status: "partial",
    deterministicEngineIds: ["calculate_irr"],
    mode: "hybrid",
    surfaceRequirements: ["host-reasoning", "deterministic-engine"],
    additionalQualityGates: [
      "analytical.formula-correctness",
      "analytical.internal-consistency",
      "analytical.unit-consistency",
    ],
  },
};

export function applyVerifiedCapabilityPromotions(
  capability: CapabilityDefinition,
): CapabilityDefinition {
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
