import { describe, expect, it } from "vitest";
import { defineCapability } from "../src/catalog/define.js";
import type { RoutableCapabilityDefinition } from "../src/catalog/types.js";

const base: RoutableCapabilityDefinition = {
  routingReady: true,
  id: "example",
  name: "Example",
  domain: "strategy",
  subdomain: "example",
  mode: "reasoning",
  status: "partial",
  summary: "A materially distinct example capability for metadata validation.",
  businessQuestions: ["Which option best fits the stated objective?"],
  triggers: ["compare strategic options"],
  antiTriggers: ["calculate tax liability"],
  requiredInputs: ["decision objective"],
  optionalInputs: ["supporting evidence"],
  methodology: "Compare supported options against explicit criteria.",
  deterministicEngineIds: [],
  evidence: { level: "user-input-sufficient", publicResearchAllowed: true },
  outputs: ["text"],
  artifactFormats: [],
  surfaceRequirements: ["host-reasoning"],
  qualityGates: ["consulting.problem-framing", "epistemic.claim-classification"],
  assumptionPolicy: "State material assumptions.",
  failureBehavior: "State the evidence limitation rather than fabricating support.",
  access: { userCredentialRequired: false, privateAccountRequired: false },
  riskClass: "standard",
  relatedCapabilityIds: [],
  conflictingCapabilityIds: [],
  evaluationFixtureIds: ["example-positive", "example-negative"],
};

describe("routing-ready capability definition", () => {
  it("accepts a complete open-access capability", () => {
    expect(defineCapability(base).id).toBe("example");
  });

  it("rejects a non-unavailable capability that requires private credentials", () => {
    expect(() =>
      defineCapability({
        ...base,
        access: { userCredentialRequired: true, privateAccountRequired: true },
      }),
    ).toThrow("open-access");
  });

  it("rejects empty routing and evaluation contracts", () => {
    expect(() => defineCapability({ ...base, antiTriggers: [] })).toThrow("anti-trigger");
    expect(() => defineCapability({ ...base, evaluationFixtureIds: [] })).toThrow(
      "evaluation fixture",
    );
  });

  it("rejects self references and blank method definitions", () => {
    expect(() => defineCapability({ ...base, relatedCapabilityIds: ["example"] })).toThrow(
      "self-reference",
    );
    expect(() => defineCapability({ ...base, methodology: " " })).toThrow("methodology");
  });
});
