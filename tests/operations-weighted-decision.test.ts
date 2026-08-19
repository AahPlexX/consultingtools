import { describe, expect, it } from "vitest";
import { calculateWeightedDecision } from "../src/operations/weighted-decision.js";

describe("weighted decision scoring", () => {
  it("normalizes caller weights and ranks already-comparable option scores", () => {
    const result = calculateWeightedDecision({
      criteria: [
        { id: "cost", weight: 2 },
        { id: "quality", weight: 3 },
      ],
      options: [
        { id: "A", scores: { cost: 8, quality: 7 } },
        { id: "B", scores: { cost: 6, quality: 9 } },
      ],
    });
    expect(result.criteria).toEqual([
      { id: "cost", weight: 2, normalizedWeight: 0.4 },
      { id: "quality", weight: 3, normalizedWeight: 0.6 },
    ]);
    expect(result.options).toEqual([
      { id: "B", weightedScore: 7.8, rank: 1, scores: { cost: 6, quality: 9 } },
      { id: "A", weightedScore: 7.4, rank: 2, scores: { cost: 8, quality: 7 } },
    ]);
    expect(result.convention).toMatch(/already comparable/i);
  });

  it("preserves input order for exact weighted-score ties", () => {
    const result = calculateWeightedDecision({
      criteria: [{ id: "x", weight: 1 }],
      options: [
        { id: "first", scores: { x: 5 } },
        { id: "second", scores: { x: 5 } },
      ],
    });
    expect(result.options.map(({ id }) => id)).toEqual(["first", "second"]);
  });

  it("rejects missing/extra criterion scores, duplicate IDs, all-zero weights, and non-finite scores", () => {
    expect(() => calculateWeightedDecision({ criteria: [{ id: "x", weight: 0 }], options: [{ id: "A", scores: { x: 1 } }] })).toThrow(/weight/i);
    expect(() => calculateWeightedDecision({ criteria: [{ id: "x", weight: 1 }, { id: "x", weight: 1 }], options: [{ id: "A", scores: { x: 1 } }] })).toThrow(/duplicate criterion/i);
    expect(() => calculateWeightedDecision({ criteria: [{ id: "x", weight: 1 }], options: [{ id: "A", scores: {} }] })).toThrow(/criterion score/i);
    expect(() => calculateWeightedDecision({ criteria: [{ id: "x", weight: 1 }], options: [{ id: "A", scores: { x: 1, y: 2 } }] })).toThrow(/criterion score/i);
    expect(() => calculateWeightedDecision({ criteria: [{ id: "x", weight: 1 }], options: [{ id: "A", scores: { x: Number.NaN } }] })).toThrow(/finite/i);
  });
});
