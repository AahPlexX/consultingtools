import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { detectArtifactFormat } from "../src/artifacts/format.js";
import { createConsultingPdf } from "../src/documents/pdf-create.js";
import type { ConsultingDocumentV1 } from "../src/documents/types.js";

const report: ConsultingDocumentV1 = {
  version: 1,
  title: "Operating Model Assessment",
  subtitle: "Executive review",
  preparedFor: "Northwind Health",
  preparedBy: "Consulting Tools",
  dateLabel: "August 21, 2026",
  confidentiality: "confidential",
  pageSize: "letter",
  accentColorHex: "1F4E79",
  blocks: [
    { kind: "heading", level: 1, text: "Executive findings" },
    { kind: "paragraph", emphasis: "lead", text: "Three structural issues explain most observed delay." },
    {
      kind: "table",
      columns: ["Finding", "Impact"],
      rows: [["Queue imbalance", "High"]],
    },
    { kind: "callout", tone: "recommendation", title: "Recommendation", text: "Pilot the revised intake model." },
    { kind: "source-note", text: "Source: client-supplied operating data." },
  ],
};

describe("professional PDF creation", () => {
  it("creates a valid PDF with expected metadata and deterministic metrics", async () => {
    const created = await createConsultingPdf(report);
    expect(detectArtifactFormat(created.bytes).format).toBe("pdf");
    expect(created.pageCount).toBeGreaterThanOrEqual(1);
    expect(created.metrics).toMatchObject({ blockCount: 5, tableCount: 1, tableCellCount: 4 });

    const reopened = await PDFDocument.load(created.bytes, { updateMetadata: false });
    expect(reopened.getPageCount()).toBe(created.pageCount);
    expect(reopened.getTitle()).toBe("Operating Model Assessment");
    expect(reopened.getAuthor()).toBe("Consulting Tools");
  });

  it("honors explicit page breaks and can paginate a long table without clipping rows", async () => {
    const rows = Array.from({ length: 85 }, (_, index) => [
      `Finding ${index + 1}`,
      "A concise but intentionally repeated explanation that requires predictable wrapping.",
    ]);
    const created = await createConsultingPdf({
      ...report,
      blocks: [
        { kind: "paragraph", text: "First page content." },
        { kind: "page-break" },
        { kind: "table", columns: ["Finding", "Explanation"], rows },
      ],
    });
    expect(created.pageCount).toBeGreaterThan(2);
    const reopened = await PDFDocument.load(created.bytes, { updateMetadata: false });
    expect(reopened.getPageCount()).toBe(created.pageCount);
  });

  it("rejects text that the standard PDF font cannot encode before returning output", async () => {
    await expect(createConsultingPdf({
      ...report,
      blocks: [{ kind: "paragraph", text: "Unsupported Δ" }],
    })).rejects.toThrow(/standard PDF font/i);
  });

  it("rejects a table row that cannot fit on an otherwise empty content page", async () => {
    await expect(createConsultingPdf({
      ...report,
      blocks: [{
        kind: "table",
        columns: ["Finding"],
        rows: [["word ".repeat(4_000)]],
      }],
    })).rejects.toThrow(/row.*fit|fit.*row/i);
  });
});
