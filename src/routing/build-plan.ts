import { capabilityRelationships, getCapabilityById } from "../catalog/index.js";
import type { CapabilityStatus } from "../catalog/types.js";
import type { RoutingIntent, WorkflowBlocker, WorkflowPlan } from "./types.js";

function blockerFor(status: CapabilityStatus): WorkflowBlocker["reason"] | undefined {
  return status === "implemented" ? undefined : status;
}

export function buildWorkflowPlan(intent: RoutingIntent): WorkflowPlan {
  const selected = intent.capabilityIds.map((id) => {
    const capability = getCapabilityById(id);
    if (!capability) throw new Error(`Unknown capability id: ${id}`);
    return capability;
  });

  const selectedIds = new Set(selected.map(({ id }) => id));
  const nodes = selected.map((capability) => ({
    capabilityId: capability.id,
    dependsOn: capabilityRelationships
      .filter(
        ({ kind, from, to }) =>
          (kind === "prerequisite" || kind === "useful-follow-on") &&
          to === capability.id &&
          selectedIds.has(from),
      )
      .map(({ from }) => from),
  }));

  const blockers = selected.flatMap((capability) => {
    const reason = blockerFor(capability.status);
    return reason ? [{ capabilityId: capability.id, reason }] : [];
  });

  return {
    objective: intent.objective,
    nodes,
    requestedOutputs: [...intent.requestedOutputs],
    executable: blockers.length === 0,
    blockers,
  };
}
