import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const readText = (path: string): string => readFileSync(resolve(root, path), "utf8").replace(/\r\n?/g, "\n");
const manifest = JSON.parse(readText(".codex-plugin/plugin.json")) as Record<string, unknown>;

describe("plugin package contract", () => {
  it("has the required stable manifest identity and component paths", () => {
    expect(manifest.name).toBe("consulting-tools");
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.mcpServers).toBe("./.mcp.json");
  });

  it("keeps public interface metadata within documented bounds", () => {
    const ui = manifest.interface as {
      displayName: string;
      shortDescription: string;
      longDescription: string;
      developerName: string;
      capabilities: string[];
      defaultPrompt: string[];
    };

    expect(ui.displayName.length).toBeLessThanOrEqual(30);
    expect(ui.shortDescription.length).toBeLessThanOrEqual(30);
    expect(ui.longDescription.length).toBeLessThanOrEqual(4000);
    expect(ui.developerName.length).toBeLessThanOrEqual(80);
    expect(ui.capabilities.length).toBeLessThanOrEqual(20);
    expect(ui.capabilities.every((item) => item.length <= 120)).toBe(true);
    expect(ui.defaultPrompt.length).toBeLessThanOrEqual(3);
    expect(ui.defaultPrompt.every((item) => item.length <= 128)).toBe(true);
  });

  it("defines a bundled MCP server map", () => {
    const mcp = JSON.parse(readText(".mcp.json")) as Record<
      string,
      { command?: string; args?: string[] }
    >;
    expect(mcp["consulting-tools"]?.command).toBe("node");
    expect(mcp["consulting-tools"]?.args).toEqual(["dist/stdio.js"]);
  });

  it("has valid bundled skill identity front matter", () => {
    for (const skill of [
      "consulting-orchestrator",
      "analysis-and-reporting",
      "artifact-operations",
      "seo-research",
    ]) {
      const text = readText(`skills/${skill}/SKILL.md`);
      expect(text.startsWith("---\n")).toBe(true);
      expect(text).toContain(`\nname: ${skill}\n`);
      const description = text.match(/\ndescription: ([^\n]+)/)?.[1] ?? "";
      expect(description.length).toBeGreaterThan(20);
      expect(description.length).toBeLessThanOrEqual(1024);
    }
  });

  it("keeps universal governance entry points present and non-forking", () => {
    const agents = readText("AGENTS.md");
    const claude = readText("CLAUDE.md");
    const gemini = readText("GEMINI.md");
    expect(agents).toContain("governance/README.md");
    expect(agents).toContain("main` is the sole authoritative branch");
    expect(claude).toContain("`AGENTS.md` is the universal agent entry point");
    expect(gemini).toContain("`AGENTS.md` is the universal agent entry point");
  });
});
