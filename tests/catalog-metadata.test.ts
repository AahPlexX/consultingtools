import { describe, expect, it } from "vitest";
import {
  artifactFormats,
  capabilityDomains,
  capabilityStatuses,
  executionModes,
  outputModalities,
  riskClasses,
  type RoutableCapabilityDefinition,
  isRoutingReadyCapability,
} from "../src/catalog/types.js";

describe("canonical capability metadata", () => {
  it("contains approved domain and output surfaces", () => {
    expect(capabilityStatuses).toEqual([
      "implemented",
      "partial",
      "provider-dependent",
      "planned",
      "unavailable",
    ]);
    expect(capabilityDomains).toEqual(
      expect.arrayContaining([
        "finance",
        "m-and-a",
        "supply-chain",
        "project",
        "forecasting",
        "visualization",
      ]),
    );
    expect(executionModes).toEqual(
      expect.arrayContaining(["reasoning", "research", "deterministic", "artifact", "hybrid"]),
    );
    expect(outputModalities).toContain("spreadsheet");
    expect(artifactFormats).toContain("xlsx");
    expect(riskClasses).toContain("high-stakes");
  });

  it("identifies only complete v2 metadata as routing-ready", () => {
    const capability: RoutableCapabilityDefinition = {
      routingReady: true,
      id: "example-capability",
      name: "Example capability",
      domain: "strategy",
      subdomain: "option-selection",
      mode: "reasoning",
      status: "implemented",
      summary: "Compare strategic options against explicit criteria and evidence.",
      businessQuestions: ["Which strategic option should be selected?"],
      triggers: ["compare strategic options"],
      antiTriggers: ["calculate tax liability"],
      requiredInputs: ["decision objective"],
      optionalInputs: ["current market evidence"],
      methodology: "Compare options against explicit decision criteria and evidence.",
      evidence: { level: "user-input-sufficient", publicResearchAllowed: true },
      outputs: ["text", "structured-model"],
      artifactFormats: [],
      qualityGates: ["consulting.problem-framing", "epistemic.claim-classification"],
      assumptionPolicy: "State bounded assumptions and test material assumptions.",
      failureBehavior: "Return missing evidence or a bounded limitation without fabricating it.",
      access: { userCredentialRequired: false, privateAccountRequired: false },
      riskClass: "standard",
      relatedCapabilityIds: [],
      conflictingCapabilityIds: [],
      evaluationFixtureIds: ["example-positive", "example-negative"],
    };

    expect(isRoutingReadyCapability(capability)).toBe(true);
  });
});
