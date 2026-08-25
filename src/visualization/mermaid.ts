import {
  DIAGRAM_LIMITS,
  type DiagramEdge,
  type DiagramNode,
  type DiagramSpecV1,
} from "./types.js";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(value: UnknownRecord, allowed: readonly string[], label: string): void {
  const allowedSet = new Set(allowed);
  const extras = Object.keys(value).filter((key) => !allowedSet.has(key));
  if (extras.length > 0) throw new Error(`${label} contains unsupported field(s): ${extras.join(", ")}.`);
}

function requiredText(value: unknown, label: string, maximum: number): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} must be non-empty text.`);
  if (value.length > maximum) throw new Error(`${label} exceeds the ${maximum}-character limit.`);
  return value;
}

function optionalText(value: unknown, label: string, maximum: number): string | undefined {
  return value === undefined ? undefined : requiredText(value, label, maximum);
}

function validateNode(value: unknown, index: number): DiagramNode {
  if (!isRecord(value)) throw new Error(`Diagram node ${index + 1} must be an object.`);
  assertOnlyKeys(value, ["id", "label", "role"], `Diagram node ${index + 1}`);
  const id = requiredText(value.id, `Diagram node ${index + 1} id`, DIAGRAM_LIMITS.maxIdCharacters);
  const label = requiredText(value.label, `Diagram node ${index + 1} label`, DIAGRAM_LIMITS.maxLabelCharacters);
  if (
    value.role !== undefined &&
    value.role !== "start" &&
    value.role !== "step" &&
    value.role !== "decision" &&
    value.role !== "outcome" &&
    value.role !== "milestone"
  ) {
    throw new Error(`Diagram node ${index + 1} role is unsupported.`);
  }
  return value.role === undefined ? { id, label } : { id, label, role: value.role };
}

function validateEdge(value: unknown, index: number): DiagramEdge {
  if (!isRecord(value)) throw new Error(`Diagram edge ${index + 1} must be an object.`);
  assertOnlyKeys(value, ["from", "to", "label"], `Diagram edge ${index + 1}`);
  const from = requiredText(value.from, `Diagram edge ${index + 1} from`, DIAGRAM_LIMITS.maxIdCharacters);
  const to = requiredText(value.to, `Diagram edge ${index + 1} to`, DIAGRAM_LIMITS.maxIdCharacters);
  const label = optionalText(value.label, `Diagram edge ${index + 1} label`, DIAGRAM_LIMITS.maxLabelCharacters);
  return label === undefined ? { from, to } : { from, to, label };
}

function validateDiagram(spec: DiagramSpecV1): { nodes: DiagramNode[]; edges: DiagramEdge[]; direction: "LR" | "TB"; title: string } {
  if (!isRecord(spec)) throw new Error("Diagram must be an object.");
  assertOnlyKeys(spec, ["version", "kind", "direction", "title", "nodes", "edges"], "Diagram");
  if (spec.version !== 1) throw new Error("Diagram version must be exactly 1.");
  if (spec.kind !== "process" && spec.kind !== "dependency" && spec.kind !== "decision-tree") {
    throw new Error("Diagram kind must be process, dependency, or decision-tree.");
  }
  if (spec.direction !== undefined && spec.direction !== "LR" && spec.direction !== "TB") {
    throw new Error("Diagram direction must be LR or TB.");
  }
  const title = requiredText(spec.title, "Diagram title", DIAGRAM_LIMITS.maxTitleCharacters);
  if (!Array.isArray(spec.nodes)) throw new Error("Diagram nodes must be an array.");
  if (spec.nodes.length < 1) throw new Error("Diagram must contain at least one node.");
  if (spec.nodes.length > DIAGRAM_LIMITS.maxNodes) {
    throw new Error(`Diagram node count exceeds the ${DIAGRAM_LIMITS.maxNodes}-node limit.`);
  }
  if (!Array.isArray(spec.edges)) throw new Error("Diagram edges must be an array.");
  if (spec.edges.length > DIAGRAM_LIMITS.maxEdges) {
    throw new Error(`Diagram edge count exceeds the ${DIAGRAM_LIMITS.maxEdges}-edge limit.`);
  }

  const nodes = spec.nodes.map(validateNode);
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) throw new Error(`Diagram node IDs must be unique; duplicate ID: ${node.id}.`);
    nodeIds.add(node.id);
  }

  const edges = spec.edges.map(validateEdge);
  edges.forEach((edge, index) => {
    if (!nodeIds.has(edge.from)) throw new Error(`Diagram edge ${index + 1} references unknown from-node ID: ${edge.from}.`);
    if (!nodeIds.has(edge.to)) throw new Error(`Diagram edge ${index + 1} references unknown to-node ID: ${edge.to}.`);
    if (edge.from === edge.to) throw new Error(`Diagram edge ${index + 1} creates a prohibited self-loop.`);
  });

  return { nodes, edges, direction: spec.direction ?? "TB", title };
}

function encodeMermaidText(value: string): string {
  let encoded = "";
  for (const character of value) encoded += `#${character.codePointAt(0)!};`;
  return encoded;
}

function renderNode(internalId: string, node: DiagramNode): string {
  const label = encodeMermaidText(node.label);
  switch (node.role ?? "step") {
    case "start":
    case "outcome":
      return `${internalId}(["${label}"])`;
    case "decision":
      return `${internalId}{"${label}"}`;
    case "milestone":
      return `${internalId}(("${label}"))`;
    case "step":
      return `${internalId}["${label}"]`;
  }
}

export function generateMermaidSource(spec: DiagramSpecV1): string {
  const validated = validateDiagram(spec);
  const ids = new Map(validated.nodes.map((node, index) => [node.id, `n${index}`]));
  const lines = [
    `flowchart ${validated.direction}`,
    `    %% title: ${encodeMermaidText(validated.title)}`,
  ];

  validated.nodes.forEach((node, index) => {
    lines.push(`    ${renderNode(`n${index}`, node)}`);
  });

  validated.edges.forEach((edge) => {
    const from = ids.get(edge.from)!;
    const to = ids.get(edge.to)!;
    if (edge.label === undefined) lines.push(`    ${from} --> ${to}`);
    else lines.push(`    ${from} -->|${encodeMermaidText(edge.label)}| ${to}`);
  });

  return `${lines.join("\n")}\n`;
}
