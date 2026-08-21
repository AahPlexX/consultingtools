import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createConsultingDocx } from "../dist/documents/docx-create.js";
import { createConsultingPdf } from "../dist/documents/pdf-create.js";

const outputDirectory = process.argv[2];
if (!outputDirectory) {
  throw new Error("Usage: node scripts/generate-document-render-fixtures.mjs <output-dir>");
}

const output = resolve(outputDirectory);
await mkdir(output, { recursive: true });

const rows = Array.from({ length: 70 }, (_, index) => [
  `Finding ${index + 1}`,
  index % 3 === 0 ? "High" : index % 3 === 1 ? "Medium" : "Low",
  "Representative evidence for independent document rendering validation.",
]);

const document = {
  version: 1,
  title: "Consulting Tools Rendering Validation",
  subtitle: "Independent DOCX and PDF openability fixture",
  preparedFor: "Validation environment",
  preparedBy: "Consulting Tools",
  dateLabel: "Deterministic fixture",
  confidentiality: "confidential",
  headerLabel: "Consulting Tools Rendering Validation",
  footerLabel: "Independent validation",
  pageSize: "letter",
  accentColorHex: "2F5597",
  blocks: [
    { kind: "heading", level: 1, text: "Executive findings" },
    { kind: "paragraph", emphasis: "lead", text: "This fixture exercises headings, body copy, tables, lists, callouts, source notes, and multi-page rendering." },
    { kind: "key-metrics", items: [
      { label: "Validated formats", value: "2", detail: "DOCX and PDF" },
      { label: "Table rows", value: String(rows.length), detail: "For pagination" },
    ] },
    { kind: "bullets", items: ["Preserve readable structure", "Render without clipping", "Validate first and last pages"] },
    { kind: "numbered-list", items: ["Generate", "Convert", "Inspect", "Rasterize"] },
    { kind: "callout", tone: "recommendation", title: "Validation rule", text: "A document is not accepted merely because its generating library can reopen it." },
    { kind: "table", caption: "Representative findings", columns: ["Finding", "Priority", "Evidence"], rows },
    { kind: "source-note", text: "Source: deterministic repository validation fixture." },
    { kind: "page-break" },
    { kind: "heading", level: 1, text: "Appendix" },
    { kind: "paragraph", text: "The explicit page break guarantees a final page for first-and-last-page raster validation." },
  ],
};

const [docx, pdf] = await Promise.all([
  createConsultingDocx(document),
  createConsultingPdf(document),
]);

await Promise.all([
  writeFile(resolve(output, "consulting-report.docx"), docx.bytes),
  writeFile(resolve(output, "consulting-report.pdf"), pdf.bytes),
]);

console.log(JSON.stringify({
  docxBytes: docx.bytes.byteLength,
  pdfBytes: pdf.bytes.byteLength,
  pdfPages: pdf.pageCount,
}));
