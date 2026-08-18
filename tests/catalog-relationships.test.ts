import { describe, expect, it } from "vitest";
import {
  capabilityRelationships,
  getRelationshipsForCapability,
  validateRelationshipGraph,
} from "../src/catalog.js";

describe("capability relationship graph", () => {
  it("contains no dangling or self relationships", () => {
    expect(validateRelationshipGraph()).toEqual([]);
  });

  it("encodes useful dependency relationships", () => {
    expect(getRelationshipsForCapability("entry-strategy")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: "market-attractiveness", to: "entry-strategy" }),
      ]),
    );
    expect(capabilityRelationships.length).toBeGreaterThan(0);
  });
});
