import { describe, expect, it } from "vitest";
import { buildWorkflowPlan } from "../src/routing/build-plan.js";

describe("workflow-plan validation", () => {
  it("builds dependency graphs while preserving partial-capability blockers", () => {
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
    expect(plan.executable).toBe(false);
    expect(plan.blockers).toEqual(
      expect.arrayContaining([
        { capabilityId: "market-attractiveness", reason: "partial" },
        { capabilityId: "entry-strategy", reason: "partial" },
      ]),
    );
  });

  it("allows a structured workflow composed only of implemented capabilities", () => {
    const plan = buildWorkflowPlan({
      objective: "Calculate two bounded financial measures from supplied inputs",
      capabilityIds: ["break-even", "simple-roi"],
      requestedOutputs: ["text"],
    });
    expect(plan.executable).toBe(true);
    expect(plan.blockers).toEqual([]);
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
