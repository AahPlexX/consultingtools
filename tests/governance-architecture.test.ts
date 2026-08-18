import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("approved universal consulting architecture", () => {
  it("locks the approved mission, epistemic classes, QA gate, and open access", () => {
    const spec = read(
      "docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md",
    );
    const northStar = read("governance/north-star.md");
    const policy = read("governance/capability-policy.md");

    expect(spec).toContain("Approved for implementation planning and execution");
    expect(northStar).toContain("universal consulting capability and quality layer");
    expect(northStar).toContain("open-access");
    for (const phrase of [
      "verified external fact",
      "user-supplied fact",
      "deterministic calculation",
      "bounded assumption",
      "inference",
      "hypothesis",
      "estimate",
      "scenario",
      "recommendation",
    ]) {
      expect(policy).toContain(phrase);
    }
    expect(policy).toContain("QA");
    expect(policy).not.toContain("generic provider ecosystem");
  });
});
