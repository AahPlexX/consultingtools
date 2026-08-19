export interface CapacityUtilizationInput {
  usedCapacity: number;
  availableCapacity: number;
}

export interface FlowPerformanceInput {
  completedUnits: number;
  elapsedTime: number;
}

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  if (value < 0) throw new Error(`${label} must be greater than or equal to zero.`);
}

function finitePositive(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  if (value <= 0) throw new Error(`${label} must be greater than zero.`);
}

export function calculateCapacityUtilization(input: CapacityUtilizationInput) {
  finiteNonNegative(input.usedCapacity, "usedCapacity");
  finitePositive(input.availableCapacity, "availableCapacity");
  const utilizationRatio = input.usedCapacity / input.availableCapacity;
  return {
    ...input,
    utilizationRatio,
    utilizationPercent: utilizationRatio * 100,
    formula: "usedCapacity / availableCapacity",
    convention:
      "usedCapacity and availableCapacity must use the same unit and measurement period; this ratio does not automatically represent labor utilization, OEE, productivity, or throughput.",
  };
}

export function calculateFlowPerformance(input: FlowPerformanceInput) {
  finiteNonNegative(input.completedUnits, "completedUnits");
  finitePositive(input.elapsedTime, "elapsedTime");
  return {
    ...input,
    throughput: input.completedUnits / input.elapsedTime,
    averageCycleTime: input.completedUnits === 0 ? null : input.elapsedTime / input.completedUnits,
    formulas: {
      throughput: "completedUnits / elapsedTime",
      averageCycleTime: "completedUnits === 0 ? null : elapsedTime / completedUnits",
    },
    convention:
      "completedUnits and elapsedTime describe the same observation window and time basis; the result is an aggregate flow measure, not a bottleneck or queue diagnosis.",
  };
}
