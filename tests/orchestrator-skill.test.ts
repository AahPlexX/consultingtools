import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const skill = readFileSync(
  new URL("../skills/consulting-orchestrator/SKILL.md", import.meta.url),
  "utf8",
);

describe("consulting orchestrator skill", () => {
  it("uses natural-language semantic selection plus deterministic plan validation", () => {
    expect(skill).toContain("natural-language");
    expect(skill).toContain("search_consulting_capabilities");
    expect(skill).toContain("inspect_consulting_capability");
    expect(skill).toContain("validate_consulting_workflow");
    expect(skill).toContain("anti-trigger");
    expect(skill).toContain("epistemic");
    expect(skill).toContain("quality gate");
    expect(skill).not.toContain("native slash command");
  });
});
