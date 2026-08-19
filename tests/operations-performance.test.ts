import { describe, expect, it } from "vitest";
import {
  calculateCapacityUtilization,
  calculateFlowPerformance,
} from "../src/operations/performance.js";

describe("capacity utilization", () => {
  it("calculates used capacity divided by available capacity", () => {
    expect(calculateCapacityUtilization({ usedCapacity: 80, availableCapacity: 100 })).toEqual({
      usedCapacity: 80,
      availableCapacity: 100,
      utilizationRatio: 0.8,
      utilizationPercent: 80,
      formula: "usedCapacity / availableCapacity",
      convention: expect.stringMatching(/same unit/i),
    });
  });

  it("allows utilization above 100 percent as a supplied-capacity signal", () => {
    expect(calculateCapacityUtilization({ usedCapacity: 120, availableCapacity: 100 }).utilizationRatio).toBe(1.2);
  });

  it("rejects zero available capacity and negative/non-finite values", () => {
    expect(() => calculateCapacityUtilization({ usedCapacity: 1, availableCapacity: 0 })).toThrow(/availableCapacity/i);
    expect(() => calculateCapacityUtilization({ usedCapacity: -1, availableCapacity: 1 })).toThrow(/usedCapacity/i);
  });
});

describe("flow performance", () => {
  it("calculates throughput and average cycle time from explicit completed units and elapsed time", () => {
    expect(calculateFlowPerformance({ completedUnits: 100, elapsedTime: 20 })).toEqual({
      completedUnits: 100,
      elapsedTime: 20,
      throughput: 5,
      averageCycleTime: 0.2,
      formulas: {
        throughput: "completedUnits / elapsedTime",
        averageCycleTime: "completedUnits === 0 ? null : elapsedTime / completedUnits",
      },
      convention: expect.stringMatching(/same time basis/i),
    });
  });

  it("returns null average cycle time when no units completed", () => {
    expect(calculateFlowPerformance({ completedUnits: 0, elapsedTime: 10 })).toMatchObject({
      throughput: 0,
      averageCycleTime: null,
    });
  });

  it("requires positive elapsed time and finite non-negative units", () => {
    expect(() => calculateFlowPerformance({ completedUnits: 1, elapsedTime: 0 })).toThrow(/elapsedTime/i);
    expect(() => calculateFlowPerformance({ completedUnits: Number.NaN, elapsedTime: 1 })).toThrow(/finite/i);
  });
});
