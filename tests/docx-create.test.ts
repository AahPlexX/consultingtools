import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { detectArtifactFormat } from "../src/artifacts/format.js";
import { createConsultingDocx } from "../src/documents/docx-create.js";
import type { ConsultingDocumentV1 } from "../src/documents/types.js";

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
    { kind: "heading", level: 2, text: "Primary issue" },
    { kind: "heading", level: 3, text: "Evidence" },
    { kind: "paragraph", emphasis: "lead", text: "Résumé – café operations remain stable." },
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
    { kind: "paragraph", text: "Appendix content." },
  ],
};

function xmlPart(parts: ReturnType<typeof unzipSync>, name: string): string {
  const part = parts[name];
  if (!part) throw new Error(`Generated DOCX is missing ${name}.`);
  return Buffer.from(part).toString("utf8");
}

describe("professional DOCX creation", () => {
  it("creates a macro-free Word package with professional structural parts", async () => {
    const created = await createConsultingDocx(report);
    expect(detectArtifactFormat(created.bytes).format).toBe("docx");
    expect(created.metrics).toMatchObject({ blockCount: 12, tableCount: 1, tableCellCount: 4 });

    const parts = unzipSync(created.bytes);
    for (const required of [
      "[Content_Types].xml",
      "word/document.xml",
      "word/styles.xml",
      "word/numbering.xml",
      "word/header1.xml",
      "word/footer1.xml",
      "word/_rels/document.xml.rels",
    ]) {
      expect(parts[required], required).toBeDefined();
    }

    const relationships = xmlPart(parts, "word/_rels/document.xml.rels");
    expect(relationships).toContain("/header");
    expect(relationships).toContain("/footer");
  });

  it("renders title metadata headings lists tables callouts page numbers and Unicode text", async () => {
    const created = await createConsultingDocx(report);
    const parts = unzipSync(created.bytes);
    const documentXml = xmlPart(parts, "word/document.xml");
    const stylesXml = xmlPart(parts, "word/styles.xml");
    const numberingXml = xmlPart(parts, "word/numbering.xml");
    const footerXml = xmlPart(parts, "word/footer1.xml");

    for (const text of [
      "Operating Model Assessment",
      "Executive review",
      "Northwind Health",
      "Consulting Tools",
      "August 21, 2026",
      "Executive findings",
      "Primary issue",
      "Evidence",
      "Résumé – café operations remain stable.",
      "Cycle time",
      "14.2 days",
      "Priority findings",
      "Finding",
      "Impact",
      "Clarify ownership",
      "Confirm scope",
      "Recommendation",
      "Pilot the revised intake model before scaling it.",
      "Source: client-supplied operating data.",
      "Appendix content.",
    ]) {
      expect(documentXml, text).toContain(text);
    }

    expect(documentXml).toMatch(/w:pStyle[^>]+w:val="Heading1"/);
    expect(documentXml).toMatch(/w:pStyle[^>]+w:val="Heading2"/);
    expect(documentXml).toMatch(/w:pStyle[^>]+w:val="Heading3"/);
    expect(documentXml).toMatch(/w:br[^>]+w:type="page"/);
    expect(stylesXml).toContain("ConsultingTitle");
    expect(numberingXml).toMatch(/w:numFmt[^>]+w:val="bullet"/);
    expect(numberingXml).toMatch(/w:numFmt[^>]+w:val="decimal"/);
    expect(footerXml).toContain("PAGE");
  });

  it("uses a brand-neutral default accent when none is supplied", async () => {
    const { accentColorHex: _accent, ...withoutAccent } = report;
    const created = await createConsultingDocx(withoutAccent);
    const stylesXml = xmlPart(unzipSync(created.bytes), "word/styles.xml");
    expect(stylesXml).toContain("2F5597");
  });
});
