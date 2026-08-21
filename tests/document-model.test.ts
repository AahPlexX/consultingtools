import { describe, expect, it } from "vitest";
import {
  CONSULTING_DOCUMENT_LIMITS,
  type ConsultingDocumentV1,
} from "../src/documents/types.js";
import { validateConsultingDocument } from "../src/documents/validate.js";

const report: ConsultingDocumentV1 = {
  version: 1,
  title: "Operating Model Assessment",
  subtitle: "Executive review",
  preparedFor: "Northwind Health",
  preparedBy: "Consulting Tools",
  dateLabel: "August 21, 2026",
  confidentiality: "confidential",
  headerLabel: "Operating Model Assessment",
  footerLabel: "Northwind Health",
  pageSize: "letter",
  accentColorHex: "1F4E79",
  blocks: [
    { kind: "heading", level: 1, text: "Executive findings" },
    {
      kind: "paragraph",
      emphasis: "lead",
      text: "Three structural issues explain most observed delay.",
    },
    {
      kind: "key-metrics",
      items: [
        { label: "Cycle time", value: "14.2 days", detail: "+18% vs baseline" },
        { label: "Utilization", value: "82%" },
      ],
    },
    {
      kind: "table",
      caption: "Priority findings",
      columns: ["Finding", "Impact"],
      rows: [["Queue imbalance", "High"]],
      align: ["left", "center"],
    },
    { kind: "bullets", items: ["Clarify ownership", "Reduce handoffs"] },
    { kind: "numbered-list", items: ["Confirm scope", "Sequence changes"] },
    {
      kind: "callout",
      tone: "recommendation",
      title: "Recommendation",
      text: "Pilot the revised intake model before scaling it.",
    },
    { kind: "source-note", text: "Source: client-supplied operating data." },
    { kind: "page-break" },
  ],
};

describe("ConsultingDocumentV1 validation", () => {
  it("accepts a representative professional report and reports deterministic metrics", () => {
    expect(validateConsultingDocument(report)).toEqual({
      blockCount: 9,
      characterCount: 394,
      tableCount: 1,
      tableCellCount: 4,
    });
  });

  it("rejects blank required text and malformed accent colors", () => {
    expect(() => validateConsultingDocument({ ...report, title: "   " })).toThrow(/title/i);
    expect(() => validateConsultingDocument({ ...report, accentColorHex: "#123456" })).toThrow(/accent/i);
    expect(() => validateConsultingDocument({ ...report, accentColorHex: "XYZ123" })).toThrow(/accent/i);
  });

  it("rejects table width and alignment mismatches instead of truncating or padding", () => {
    expect(() => validateConsultingDocument({
      ...report,
      blocks: [{ kind: "table", columns: ["A", "B"], rows: [["only one"]] }],
    })).toThrow(/row.*column/i);

    expect(() => validateConsultingDocument({
      ...report,
      blocks: [{ kind: "table", columns: ["A", "B"], rows: [["1", "2"]], align: ["left"] }],
    })).toThrow(/alignment/i);
  });

  it("enforces per-block table and key-metric bounds", () => {
    expect(() => validateConsultingDocument({
      ...report,
      blocks: [{
        kind: "table",
        columns: Array.from({ length: CONSULTING_DOCUMENT_LIMITS.maxTableColumns + 1 }, (_, index) => `C${index}`),
        rows: [],
      }],
    })).toThrow(/table.*column/i);

    expect(() => validateConsultingDocument({
      ...report,
      blocks: [{
        kind: "key-metrics",
        items: Array.from({ length: CONSULTING_DOCUMENT_LIMITS.maxKeyMetricsPerBlock + 1 }, (_, index) => ({
          label: `Metric ${index}`,
          value: String(index),
        })),
      }],
    })).toThrow(/key metric/i);
  });

  it("enforces list, block, individual text, aggregate character, and table-cell bounds", () => {
    expect(() => validateConsultingDocument({
      ...report,
      blocks: [{
        kind: "bullets",
        items: Array.from({ length: CONSULTING_DOCUMENT_LIMITS.maxListItems + 1 }, () => "item"),
      }],
    })).toThrow(/list/i);

    expect(() => validateConsultingDocument({
      ...report,
      blocks: Array.from({ length: CONSULTING_DOCUMENT_LIMITS.maxBlocks + 1 }, () => ({
        kind: "paragraph" as const,
        text: "x",
      })),
    })).toThrow(/block/i);

    expect(() => validateConsultingDocument({
      ...report,
      blocks: [{ kind: "paragraph", text: "x".repeat(CONSULTING_DOCUMENT_LIMITS.maxTextCharacters + 1) }],
    })).toThrow(/text/i);

    const aggregateText = "x".repeat(Math.ceil(CONSULTING_DOCUMENT_LIMITS.maxTotalCharacters / 2));
    expect(() => validateConsultingDocument({
      ...report,
      blocks: [
        { kind: "paragraph", text: aggregateText },
        { kind: "paragraph", text: aggregateText },
      ],
    })).toThrow(/character/i);

    const cellRows = Array.from(
      { length: Math.ceil((CONSULTING_DOCUMENT_LIMITS.maxTableCells + 1) / 2) },
      () => ["a", "b"],
    );
    expect(() => validateConsultingDocument({
      ...report,
      blocks: [{ kind: "table", columns: ["A", "B"], rows: cellRows }],
    })).toThrow(/table cell/i);
  });

  it("rejects empty block values instead of producing invisible structure", () => {
    expect(() => validateConsultingDocument({ ...report, blocks: [{ kind: "heading", level: 1, text: "" }] })).toThrow(/heading/i);
    expect(() => validateConsultingDocument({ ...report, blocks: [{ kind: "bullets", items: [] }] })).toThrow(/list/i);
    expect(() => validateConsultingDocument({ ...report, blocks: [{ kind: "table", columns: [], rows: [] }] })).toThrow(/table/i);
    expect(() => validateConsultingDocument({
      ...report,
      blocks: [{ kind: "key-metrics", items: [{ label: "", value: "1" }] }],
    })).toThrow(/key metric/i);
  });
});
