import type { OutputModality } from "../catalog/types.js";

export interface RoutingIntent {
  objective: string;
  capabilityIds: readonly string[];
  requestedOutputs: readonly OutputModality[];
}

export interface WorkflowNode {
  capabilityId: string;
  dependsOn: string[];
}

export interface WorkflowBlocker {
  capabilityId: string;
  reason: "unavailable" | "planned" | "partial" | "provider-dependent";
}

export interface WorkflowPlan {
  objective: string;
  nodes: WorkflowNode[];
  requestedOutputs: OutputModality[];
  executable: boolean;
  blockers: WorkflowBlocker[];
}
