import type { RoutableCapabilityDefinition } from "./types.js";

function requireText(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must not be blank.`);
}

function requireItems(values: readonly string[], label: string): void {
  if (values.length === 0) throw new Error(`${label} must contain at least one item.`);
  if (values.some((value) => !value.trim())) {
    throw new Error(`${label} must not contain blank items.`);
  }
}

export function defineCapability(
  input: RoutableCapabilityDefinition,
): Readonly<RoutableCapabilityDefinition> {
  requireText(input.id, "id");
  requireText(input.name, "name");
  requireText(input.subdomain, "subdomain");
  requireText(input.summary, "summary");
  requireText(input.methodology, "methodology");
  requireText(input.assumptionPolicy, "assumptionPolicy");
  requireText(input.failureBehavior, "failureBehavior");

  requireItems(input.businessQuestions, "business question");
  requireItems(input.triggers, "trigger");
  requireItems(input.antiTriggers, "anti-trigger");
  requireItems(input.requiredInputs, "required input");
  requireItems(input.qualityGates, "quality gate");
  requireItems(input.evaluationFixtureIds, "evaluation fixture");

  if (
    input.status !== "unavailable" &&
    (input.access.userCredentialRequired || input.access.privateAccountRequired)
  ) {
    throw new Error(
      `Capability ${input.id} violates the open-access boundary: credential/private-account requirements are allowed only for unavailable catalog entries.`,
    );
  }

  if (
    input.relatedCapabilityIds.includes(input.id) ||
    input.conflictingCapabilityIds.includes(input.id)
  ) {
    throw new Error(`Capability ${input.id} contains a self-reference.`);
  }

  return Object.freeze({ ...input });
}
