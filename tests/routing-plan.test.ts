import { describe, expect, it } from "vitest";
import { buildWorkflowPlan } from "../src/routing/build-plan.js";

describe("workflow-plan validation", () => {
  it("builds a bounded dependency graph from host-selected capability ids", () => {
    const plan = buildWorkflowPlan({
      objective: "Assess a new market and choose an entry approach",
      capabilityIds: ["market-attractiveness", "entry-strategy"],
      requestedOutputs: ["text"],
    });
    expect(plan.nodes.map(({ capabilityId }) => capabilityId)).toEqual([
      "market-attractiveness",
      "entry-strategy",
    ]);
    expect(plan.nodes[1]?.dependsOn).toContain("market-attractiveness");
    expect(plan.executable).toBe(true);
  });

  it("blocks an unavailable capability", () => {
    const plan = buildWorkflowPlan({
      objective: "Use my live Search Console account",
      capabilityIds: ["seo-search-console"],
      requestedOutputs: ["text"],
    });
    expect(plan.executable).toBe(false);
    expect(plan.blockers).toContainEqual({
      capabilityId: "seo-search-console",
      reason: "unavailable",
    });
  });

  it("rejects unknown capability ids", () => {
    expect(() =>
      buildWorkflowPlan({
        objective: "Unknown capability",
        capabilityIds: ["does-not-exist"],
        requestedOutputs: ["text"],
      }),
    ).toThrow("Unknown capability id: does-not-exist");
  });
});
