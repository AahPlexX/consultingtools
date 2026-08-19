import { describe, expect, it } from "vitest";
import { calculateCriticalPath } from "../src/project/critical-path.js";

describe("critical path", () => {
  it("calculates early/late dates, total float, project duration, and the critical path", () => {
    const result = calculateCriticalPath({
      activities: [
        { id: "A", duration: 3, predecessorIds: [] },
        { id: "B", duration: 2, predecessorIds: ["A"] },
        { id: "C", duration: 4, predecessorIds: ["A"] },
        { id: "D", duration: 2, predecessorIds: ["B", "C"] },
      ],
    });

    expect(result.projectDuration).toBe(9);
    expect(result.topologicalOrder).toEqual(["A", "B", "C", "D"]);
    expect(result.activities).toEqual([
      { id: "A", duration: 3, predecessorIds: [], earlyStart: 0, earlyFinish: 3, lateStart: 0, lateFinish: 3, totalFloat: 0, critical: true },
      { id: "B", duration: 2, predecessorIds: ["A"], earlyStart: 3, earlyFinish: 5, lateStart: 5, lateFinish: 7, totalFloat: 2, critical: false },
      { id: "C", duration: 4, predecessorIds: ["A"], earlyStart: 3, earlyFinish: 7, lateStart: 3, lateFinish: 7, totalFloat: 0, critical: true },
      { id: "D", duration: 2, predecessorIds: ["B", "C"], earlyStart: 7, earlyFinish: 9, lateStart: 7, lateFinish: 9, totalFloat: 0, critical: true },
    ]);
    expect(result.criticalActivityIds).toEqual(["A", "C", "D"]);
    expect(result.criticalPaths).toEqual([["A", "C", "D"]]);
    expect(result.criticalPathsTruncated).toBe(false);
  });

  it("preserves multiple equally critical paths instead of choosing one arbitrarily", () => {
    const result = calculateCriticalPath({
      activities: [
        { id: "A", duration: 2, predecessorIds: [] },
        { id: "B", duration: 2, predecessorIds: ["A"] },
        { id: "C", duration: 2, predecessorIds: ["A"] },
        { id: "D", duration: 2, predecessorIds: ["B", "C"] },
      ],
    });
    expect(result.projectDuration).toBe(6);
    expect(result.criticalPaths).toEqual([
      ["A", "B", "D"],
      ["A", "C", "D"],
    ]);
  });

  it("supports zero-duration milestones", () => {
    const result = calculateCriticalPath({
      activities: [
        { id: "start", duration: 0, predecessorIds: [] },
        { id: "work", duration: 5, predecessorIds: ["start"] },
        { id: "finish", duration: 0, predecessorIds: ["work"] },
      ],
    });
    expect(result.projectDuration).toBe(5);
    expect(result.criticalActivityIds).toEqual(["start", "work", "finish"]);
  });

  it("rejects unknown predecessors, duplicate IDs, negative durations, and cycles", () => {
    expect(() => calculateCriticalPath({ activities: [{ id: "A", duration: 1, predecessorIds: ["missing"] }] })).toThrow(/unknown predecessor/i);
    expect(() => calculateCriticalPath({ activities: [{ id: "A", duration: 1, predecessorIds: [] }, { id: "A", duration: 2, predecessorIds: [] }] })).toThrow(/duplicate/i);
    expect(() => calculateCriticalPath({ activities: [{ id: "A", duration: -1, predecessorIds: [] }] })).toThrow(/duration/i);
    expect(() => calculateCriticalPath({ activities: [{ id: "A", duration: 1, predecessorIds: ["B"] }, { id: "B", duration: 1, predecessorIds: ["A"] }] })).toThrow(/cycle/i);
  });
});
