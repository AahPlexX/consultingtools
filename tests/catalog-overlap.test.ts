import { describe, expect, it } from "vitest";
import { allFamilyCapabilities } from "../src/catalog/families/index.js";
import { capabilityRelationships, validateRelationshipGraph } from "../src/catalog/relationships.js";

const normalize = (value: string): string => value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
const normalizedSetKey = (values: readonly string[]): string =>
  [...values].map(normalize).sort().join(" || ");

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

describe("100+ capability catalog overlap controls", () => {
  it("contains no duplicate stable IDs or case-folded names", () => {
    expect(duplicates(allFamilyCapabilities.map(({ id }) => id))).toEqual([]);
    expect(duplicates(allFamilyCapabilities.map(({ name }) => normalize(name)))).toEqual([]);
  });

  it("contains no exact duplicate summaries, business-question sets, or trigger sets", () => {
    expect(duplicates(allFamilyCapabilities.map(({ summary }) => normalize(summary)))).toEqual([]);
    expect(duplicates(allFamilyCapabilities.map(({ businessQuestions }) => normalizedSetKey(businessQuestions)))).toEqual([]);
    expect(duplicates(allFamilyCapabilities.map(({ triggers }) => normalizedSetKey(triggers)))).toEqual([]);
  });

  it("keeps relationship references valid and avoids contradictory duplicate edges", () => {
    expect(validateRelationshipGraph(allFamilyCapabilities)).toEqual([]);
    const edgeKeys = capabilityRelationships.map(({ from, to, kind }) => `${from}|${to}|${kind}`);
    expect(duplicates(edgeKeys)).toEqual([]);
    for (const relation of capabilityRelationships) {
      expect(relation.from).not.toBe(relation.to);
      expect(relation.rationale.trim().length).toBeGreaterThan(20);
    }
  });
});
