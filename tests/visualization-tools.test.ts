import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { MemoryArtifactStore } from "../src/artifacts/memory-store.js";
import { createHttpHandler } from "../src/http.js";

async function connected() {
  const store = new MemoryArtifactStore();
  const handler = createHttpHandler({ artifactStore: store });
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "visualization-tools-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler, store };
}

const exhibit = {
  version: 1,
  kind: "bar",
  title: "Regional revenue",
  altText: "Bar chart comparing North and South regional revenue.",
  sourceNote: "Source: verified finance model.",
  categories: ["North", "South"],
  series: [{ name: "Revenue", values: [12, 18] }],
} as const;

const diagram = {
  version: 1,
  kind: "process",
  direction: "LR",
  title: "Intake process",
  nodes: [
    { id: "start", label: "Request received", role: "start" },
    { id: "review", label: "Review request", role: "step" },
  ],
  edges: [{ from: "start", to: "review", label: "complete" }],
} as const;

describe("visualization MCP tools", () => {
  it("discovers the focused selector and artifact tools with truthful annotations", async () => {
    const { client, handler } = await connected();
    try {
      const tools = await client.listTools();
      expect(tools.tools.find((tool) => tool.name === "recommend_consulting_exhibit")?.annotations)
        .toMatchObject({ readOnlyHint: true, openWorldHint: false, destructiveHint: false });
      for (const name of ["create_consulting_exhibit", "create_mermaid_diagram"]) {
        expect(tools.tools.find((tool) => tool.name === name)?.annotations)
          .toMatchObject({ readOnlyHint: false, openWorldHint: false, destructiveHint: false });
      }
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("recommends an exhibit from explicit analytical metadata without creating an artifact", async () => {
    const { client, handler } = await connected();
    try {
      const result = await client.callTool({
        name: "recommend_consulting_exhibit",
        arguments: { job: "category-comparison", categoryCount: 5, seriesCount: 1 },
      });
      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({ kind: "bar", warnings: [] });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("creates a validated standalone SVG artifact with accessible content", async () => {
    const { client, handler, store } = await connected();
    try {
      const result = await client.callTool({
        name: "create_consulting_exhibit",
        arguments: { name: "regional-revenue.svg", exhibit },
      });
      expect(result.isError).not.toBe(true);
      const content = result.structuredContent as {
        artifact: { id: string; name: string; mimeType: string; revision: number };
        metrics: { dataPointCount: number };
      };
      expect(content).toMatchObject({
        artifact: { name: "regional-revenue.svg", mimeType: "image/svg+xml", revision: 1 },
        metrics: { dataPointCount: 2 },
      });
      const stored = (await store.read(content.artifact.id)).bytes.toString("utf8");
      expect(stored).toContain("<svg");
      expect(stored).toContain("role=\"img\"");
      expect(stored).toContain("Bar chart comparing North and South regional revenue.");
      expect(result.content.some((entry) => entry.type === "resource_link")).toBe(true);
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("creates closed-world Mermaid source as a plain-text artifact", async () => {
    const { client, handler, store } = await connected();
    try {
      const result = await client.callTool({
        name: "create_mermaid_diagram",
        arguments: { name: "intake-process.mmd", diagram },
      });
      expect(result.isError).not.toBe(true);
      const content = result.structuredContent as { artifact: { id: string; name: string; mimeType: string; revision: number } };
      expect(content.artifact).toMatchObject({ name: "intake-process.mmd", mimeType: "text/plain", revision: 1 });
      const stored = (await store.read(content.artifact.id)).bytes.toString("utf8");
      expect(stored).toContain("flowchart LR");
      expect(stored).not.toMatch(/click\s|<script|https?:\/\//i);
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("rejects malformed exhibit data without storing an artifact", async () => {
    const { client, handler } = await connected();
    try {
      const result = await client.callTool({
        name: "create_consulting_exhibit",
        arguments: {
          name: "invalid.svg",
          exhibit: { ...exhibit, categories: ["North", "South"], series: [{ name: "Revenue", values: [12] }] },
        },
      });
      expect(result.isError).toBe(true);
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
