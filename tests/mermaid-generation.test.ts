import { describe, expect, it } from "vitest";
import { generateMermaidSource } from "../src/visualization/mermaid.js";
import type { DiagramSpecV1 } from "../src/visualization/types.js";

const process: DiagramSpecV1 = {
  version: 1,
  kind: "process",
  direction: "LR",
  title: "Order intake",
  nodes: [
    { id: "start", label: "Request received", role: "start" },
    { id: "review", label: "Review request", role: "step" },
    { id: "approve", label: "Approved?", role: "decision" },
    { id: "done", label: "Complete", role: "outcome" },
  ],
  edges: [
    { from: "start", to: "review" },
    { from: "review", to: "approve" },
    { from: "approve", to: "done", label: "Yes" },
  ],
};

describe("closed-world Mermaid source generation", () => {
  it.each(["process", "dependency", "decision-tree"] as const)("generates a deterministic %s flowchart using generated internal node IDs", (kind) => {
    const source = generateMermaidSource({ ...process, kind });
    expect(source).toContain("flowchart LR");
    expect(source).toContain("n0");
    expect(source).toContain("n1");
    expect(source).not.toMatch(/\bstart\s*(?:\[|\(|\{|--)/i);
    expect(source).not.toMatch(/\breview\s*(?:\[|\(|\{|--)/i);
    expect(generateMermaidSource({ ...process, kind })).toBe(source);
  });

  it("entity-encodes adversarial node edge and title text so it cannot become Mermaid syntax", () => {
    const source = generateMermaidSource({
      version: 1,
      kind: "process",
      direction: "TB",
      title: "---\nconfig:\n securityLevel: loose",
      nodes: [
        { id: "a", label: 'click A "https://evil.example" <script> %%{init:{securityLevel:"loose"}}%%', role: "step" },
        { id: "b", label: "end ] } | ` <b> javascript: alert(1)", role: "outcome" },
      ],
      edges: [{ from: "a", to: "b", label: "click | style classDef\nnext" }],
    });

    expect(source).toContain("flowchart TB");
    expect(source).not.toContain("%%{");
    expect(source).not.toMatch(/^---/m);
    expect(source).not.toMatch(/\bclick\b/i);
    expect(source).not.toMatch(/javascript:/i);
    expect(source).not.toMatch(/https?:\/\//i);
    expect(source).not.toMatch(/<\/?[a-z][^>]*>/i);
    expect(source).not.toMatch(/\b(?:style|classDef)\b/i);
    expect(source).not.toContain("`");
    expect(source).not.toContain("[");
    expect(source).not.toContain("]");
  });

  it("rejects duplicate IDs unknown references self loops blank fields and unsupported directions", () => {
    expect(() => generateMermaidSource({ ...process, nodes: [...process.nodes, { id: "start", label: "Again" }] })).toThrow(/duplicate/i);
    expect(() => generateMermaidSource({ ...process, edges: [{ from: "missing", to: "done" }] })).toThrow(/unknown/i);
    expect(() => generateMermaidSource({ ...process, edges: [{ from: "start", to: "start" }] })).toThrow(/self/i);
    expect(() => generateMermaidSource({ ...process, title: "   " })).toThrow(/title/i);
    expect(() => generateMermaidSource({ ...process, nodes: [{ id: "a", label: "   " }], edges: [] })).toThrow(/label/i);
    expect(() => generateMermaidSource({ ...process, direction: "RL" as never })).toThrow(/direction/i);
  });

  it("rejects node and edge counts beyond the bounded v1 envelope", () => {
    const nodes = Array.from({ length: 251 }, (_, index) => ({ id: `node-${index}`, label: `Node ${index}` }));
    expect(() => generateMermaidSource({ version: 1, kind: "dependency", title: "Too many", nodes, edges: [] })).toThrow(/250/);

    const boundedNodes = [{ id: "a", label: "A" }, { id: "b", label: "B" }];
    const edges = Array.from({ length: 501 }, () => ({ from: "a", to: "b" }));
    expect(() => generateMermaidSource({ version: 1, kind: "dependency", title: "Too many", nodes: boundedNodes, edges })).toThrow(/500/);
  });

  it("uses role-specific shapes without exposing user IDs as Mermaid identifiers", () => {
    const source = generateMermaidSource(process);
    expect(source).toMatch(/n0\(\[/);
    expect(source).toMatch(/n2\{/);
    expect(source).toMatch(/n3\(\[/);
    expect(source).toContain("n0 --> n1");
    expect(source).toMatch(/n2 --\|[^|]+\|--> n3/);
  });
});
