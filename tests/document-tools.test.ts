import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { MemoryArtifactStore } from "../src/artifacts/memory-store.js";
import type { ArtifactCreateInput, ArtifactMetadata } from "../src/artifacts/types.js";
import { createHttpHandler } from "../src/http.js";
import type { ConsultingDocumentV1 } from "../src/documents/types.js";

class CountingStore extends MemoryArtifactStore {
  createCount = 0;
  created: ArtifactMetadata[] = [];

  override async create(input: ArtifactCreateInput): Promise<ArtifactMetadata> {
    const metadata = await super.create(input);
    this.createCount += 1;
    this.created.push(metadata);
    return metadata;
  }
}

const report: ConsultingDocumentV1 = {
  version: 1,
  title: "Operating Model Assessment",
  preparedFor: "Northwind Health",
  preparedBy: "Consulting Tools",
  dateLabel: "August 21, 2026",
  blocks: [
    { kind: "heading", level: 1, text: "Executive findings" },
    { kind: "paragraph", text: "Three structural issues explain most observed delay." },
    { kind: "table", columns: ["Finding", "Impact"], rows: [["Queue imbalance", "High"]] },
  ],
};

async function connected(store = new CountingStore()) {
  const handler = createHttpHandler({ artifactStore: store });
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "document-tools-test", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(transport);
  return { client, handler, store };
}

async function sourcePdf(label: string): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([300, 400]);
  page.drawText(label, { x: 20, y: 30, size: 12 });
  return Buffer.from(await pdf.save());
}

describe("document MCP tools", () => {
  it("discovers focused creation/composition tools with closed-world non-destructive annotations", async () => {
    const { client, handler } = await connected();
    try {
      const tools = await client.listTools();
      for (const name of ["create_consulting_document", "compose_pdf_artifact"]) {
        const tool = tools.tools.find((entry) => entry.name === name);
        expect(tool, name).toBeDefined();
        expect(tool?.annotations).toMatchObject({
          readOnlyHint: false,
          openWorldHint: false,
          destructiveHint: false,
        });
      }
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("creates DOCX, PDF, or both as revision-one artifact resources", async () => {
    const { client, handler, store } = await connected();
    try {
      const result = await client.callTool({
        name: "create_consulting_document",
        arguments: { nameBase: "operating-model", formats: ["docx", "pdf"], document: report },
      });
      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        metrics: { blockCount: 3, tableCount: 1, tableCellCount: 4 },
        artifacts: [
          { name: "operating-model.docx", revision: 1 },
          { name: "operating-model.pdf", revision: 1 },
        ],
      });
      expect(store.createCount).toBe(2);
      const links = result.content.filter((entry) => entry.type === "resource_link");
      expect(links).toHaveLength(2);
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("preflights all requested formats before storage so a PDF encoding failure creates nothing", async () => {
    const { client, handler, store } = await connected();
    try {
      const result = await client.callTool({
        name: "create_consulting_document",
        arguments: {
          nameBase: "unsupported",
          formats: ["docx", "pdf"],
          document: { ...report, blocks: [{ kind: "paragraph", text: "Unsupported Δ" }] },
        },
      });
      expect(result.isError).toBe(true);
      expect(store.createCount).toBe(0);
      expect(result.content).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: "text", text: expect.stringMatching(/standard PDF font/i) }),
      ]));
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("composes a derivative PDF artifact without changing source revisions", async () => {
    const store = new CountingStore();
    const first = await store.create({ name: "one.pdf", mimeType: "application/pdf", bytes: await sourcePdf("one") });
    const second = await store.create({ name: "two.pdf", mimeType: "application/pdf", bytes: await sourcePdf("two") });
    store.createCount = 0;
    store.created = [];
    const { client, handler } = await connected(store);
    try {
      const result = await client.callTool({
        name: "compose_pdf_artifact",
        arguments: {
          name: "combined.pdf",
          sources: [
            { artifactUri: first.uri, pageIndices: [0] },
            { artifactUri: second.uri, pageIndices: [0] },
          ],
        },
      });
      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        artifact: { name: "combined.pdf", mimeType: "application/pdf", revision: 1 },
        pageCount: 2,
        sourcePageCounts: [1, 1],
      });
      expect(store.createCount).toBe(1);
      expect((await store.read(first.id)).metadata.revision).toBe(1);
      expect((await store.read(second.id)).metadata.revision).toBe(1);
    } finally {
      await client.close();
      await handler.close();
    }
  });

  it("rejects duplicate formats malformed source URIs and invalid page indices", async () => {
    const { client, handler } = await connected();
    try {
      const duplicate = await client.callTool({
        name: "create_consulting_document",
        arguments: { nameBase: "duplicate", formats: ["pdf", "pdf"], document: report },
      });
      expect(duplicate.isError).toBe(true);

      const malformed = await client.callTool({
        name: "compose_pdf_artifact",
        arguments: { name: "bad.pdf", sources: [{ artifactUri: "https://example.com/file.pdf", pageIndices: [0] }] },
      });
      expect(malformed.isError).toBe(true);
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
