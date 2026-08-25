import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { detectArtifactFormat } from "../src/artifacts/format.js";
import { MemoryArtifactStore } from "../src/artifacts/memory-store.js";
import { createHttpHandler } from "../src/http.js";

async function connected() {
  const store = new MemoryArtifactStore();
  const handler = createHttpHandler({ artifactStore: store });
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "presentation-tools-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler, store };
}

const deck = {
  version: 1,
  title: "Operating Model Review",
  preparedFor: "Northwind Health",
  preparedBy: "Consulting Tools",
  dateLabel: "August 25, 2026",
  slides: [
    { kind: "title", title: "Operating Model Review", subtitle: "Executive decision brief" },
    {
      kind: "summary",
      title: "Ownership is the first constraint to resolve",
      bullets: ["Queue ownership is fragmented.", "Handoffs create avoidable wait time."],
      takeaway: "Clarify ownership before automating the process.",
      sourceNote: "Source: client-supplied operating data.",
    },
  ],
} as const;

describe("presentation MCP tools", () => {
  it("discovers bounded PPTX creation as a closed-world non-destructive write", async () => {
    const { client, handler } = await connected();
    try {
      const tools = await client.listTools();
      expect(tools.tools.find((tool) => tool.name === "create_consulting_presentation")?.annotations)
        .toMatchObject({ readOnlyHint: false, openWorldHint: false, destructiveHint: false });
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("creates one macro-free revision-one PPTX artifact after full in-memory validation", async () => {
    const { client, handler, store } = await connected();
    try {
      const result = await client.callTool({
        name: "create_consulting_presentation",
        arguments: { name: "operating-model-review.pptx", deck },
      });
      expect(result.isError).not.toBe(true);
      const content = result.structuredContent as {
        artifact: { id: string; name: string; mimeType: string; revision: number };
        metrics: { slideCount: number; exhibitCount: number };
      };
      expect(content).toMatchObject({
        artifact: {
          name: "operating-model-review.pptx",
          mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          revision: 1,
        },
        metrics: { slideCount: 2, exhibitCount: 0 },
      });
      const stored = await store.read(content.artifact.id);
      expect(detectArtifactFormat(stored.bytes)).toMatchObject({ format: "pptx", macroEnabled: false });
      expect(result.content.some((entry) => entry.type === "resource_link")).toBe(true);
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("rejects an invalid deck before creating an artifact", async () => {
    const { client, handler } = await connected();
    try {
      const result = await client.callTool({
        name: "create_consulting_presentation",
        arguments: {
          name: "invalid.pptx",
          deck: {
            ...deck,
            slides: [
              { kind: "title", title: "Duplicate title" },
              { kind: "summary", title: "Duplicate title", bullets: ["Invalid duplicate title."] },
            ],
          },
        },
      });
      expect(result.isError).toBe(true);
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
