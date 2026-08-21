import {
  Document,
  Footer,
  Header,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
} from "docx";
import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { patchDocxTemplate } from "../src/artifacts/docx-template.js";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function richTemplate(): Promise<Buffer> {
  const document = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "UnrelatedStyle",
          name: "Unrelated Style",
          basedOn: "Normal",
          next: "Normal",
          run: { bold: true, color: "336699" },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "unrelated-bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•" }],
        },
      ],
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [new Paragraph({ children: [new TextRun("Unrelated header") ] })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({ children: [new TextRun("Unrelated footer") ] })],
          }),
        },
        children: [
          new Paragraph({ style: "UnrelatedStyle", children: [new TextRun("Styled unrelated content")] }),
          new Paragraph({ children: [new TextRun("Client: {{client}}")]}),
          new Paragraph({ numbering: { reference: "unrelated-bullets", level: 0 }, children: [new TextRun("Unrelated bullet")] }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Unrelated table cell")] }),
                ],
              }),
            ],
          }),
          new Paragraph({
            children: [
              new ImageRun({ data: PNG_1X1, transformation: { width: 8, height: 8 }, type: "png" }),
            ],
          }),
        ],
      },
    ],
  });
  return Buffer.from(await Packer.toBuffer(document));
}

function xml(parts: ReturnType<typeof unzipSync>, name: string): string {
  const entry = parts[name];
  if (!entry) throw new Error(`DOCX fixture is missing ${name}`);
  return Buffer.from(entry).toString("utf8");
}

describe("DOCX template preservation", () => {
  it("patches the requested body placeholder while preserving unrelated structures and media", async () => {
    const source = await richTemplate();
    const sourceBefore = Buffer.from(source);
    const before = unzipSync(source);
    const result = await patchDocxTemplate(source, { client: "Northwind Health" }, true);
    const after = unzipSync(result.bytes);

    expect(source.equals(sourceBefore)).toBe(true);
    expect(result.replacedPlaceholders).toEqual(["client"]);
    expect(result.remainingPlaceholders).toEqual([]);

    const documentXml = xml(after, "word/document.xml");
    expect(documentXml).toContain("Northwind Health");
    expect(documentXml).not.toContain("{{client}}");
    expect(documentXml).toContain("Styled unrelated content");
    expect(documentXml).toContain("Unrelated bullet");
    expect(documentXml).toContain("Unrelated table cell");
    expect(documentXml).toContain("w:sectPr");

    expect(xml(after, "word/header1.xml")).toContain("Unrelated header");
    expect(xml(after, "word/footer1.xml")).toContain("Unrelated footer");
    expect(xml(after, "word/styles.xml")).toContain("UnrelatedStyle");
    expect(xml(after, "word/numbering.xml")).toMatch(/w:numFmt[^>]+w:val="bullet"/);

    const beforeMedia = Object.keys(before).filter((name) => name.startsWith("word/media/")).sort();
    const afterMedia = Object.keys(after).filter((name) => name.startsWith("word/media/")).sort();
    expect(afterMedia).toEqual(beforeMedia);
    for (const name of beforeMedia) {
      expect(Buffer.from(after[name]!).equals(Buffer.from(before[name]!))).toBe(true);
    }
  });

  it("still rejects non-DOCX input instead of normalizing it", async () => {
    await expect(patchDocxTemplate(Buffer.from("not a docx"), { client: "x" })).rejects.toThrow(/DOCX/i);
  });
});
