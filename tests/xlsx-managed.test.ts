import { strToU8, unzipSync, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { detectArtifactFormat } from "../src/artifacts/format.js";
import {
  createManagedXlsx,
  inspectManagedXlsx,
  readManagedXlsx,
} from "../src/tabular/xlsx-managed.js";
import type { ManagedWorkbook } from "../src/tabular/xlsx-types.js";

const workbook: ManagedWorkbook = {
  version: 1,
  worksheets: [
    {
      name: "Summary",
      rows: [
        ["Label", "Value", "Active", "Blank"],
        ["Revenue & growth <plan>", 1234.5, true, null],
        ["=literal text", -2.5, false, ""],
        [],
      ],
    },
    { name: "Second", rows: [["é", 42]] },
  ],
};

describe("managed XLSX literal-cell envelope", () => {
  it("creates a macro-free SpreadsheetML ZIP package with required managed parts", () => {
    const bytes = createManagedXlsx(workbook);
    expect(Buffer.from(bytes.subarray(0, 2)).toString("ascii")).toBe("PK");
    expect(detectArtifactFormat(Buffer.from(bytes)).format).toBe("xlsx");

    const files = unzipSync(bytes);
    expect(Object.keys(files).sort()).toEqual([
      "[Content_Types].xml",
      "_rels/.rels",
      "docProps/custom.xml",
      "xl/_rels/workbook.xml.rels",
      "xl/workbook.xml",
      "xl/worksheets/sheet1.xml",
      "xl/worksheets/sheet2.xml",
    ]);
    expect(new TextDecoder().decode(files["docProps/custom.xml"])).toMatch(/ConsultingToolsManagedWorkbook/);
    expect(new TextDecoder().decode(files["xl/worksheets/sheet1.xml"])).toContain('t="inlineStr"');
  });

  it("round-trips literal strings, finite numbers, booleans, blanks, empty strings, empty rows, and sheet names", () => {
    const bytes = createManagedXlsx(workbook);
    expect(readManagedXlsx(bytes)).toEqual(workbook);
    expect(inspectManagedXlsx(bytes)).toEqual({
      managed: true,
      version: 1,
      sheetNames: ["Summary", "Second"],
      cellCount: 14,
    });
  });

  it("keeps formula-looking text as an inline string", () => {
    const bytes = createManagedXlsx({
      version: 1,
      worksheets: [{ name: "Sheet1", rows: [["=1+1", "+2", "@SUM(A1:A2)"]] }],
    });
    const files = unzipSync(bytes);
    const xml = new TextDecoder().decode(files["xl/worksheets/sheet1.xml"]);
    expect(xml).toContain("=1+1");
    expect(xml).not.toContain("<f>");
    expect(readManagedXlsx(bytes).worksheets[0]?.rows[0]).toEqual(["=1+1", "+2", "@SUM(A1:A2)"]);
  });

  it("escapes XML-sensitive text and restores it exactly", () => {
    const source: ManagedWorkbook = {
      version: 1,
      worksheets: [{ name: "A&B", rows: [["<&>\"'", "  spaced  "]] }],
    };
    const bytes = createManagedXlsx(source);
    const files = unzipSync(bytes);
    const workbookXml = new TextDecoder().decode(files["xl/workbook.xml"]);
    const sheetXml = new TextDecoder().decode(files["xl/worksheets/sheet1.xml"]);
    expect(workbookXml).toContain("A&amp;B");
    expect(sheetXml).toContain("&lt;&amp;&gt;");
    expect(readManagedXlsx(bytes)).toEqual(source);
  });

  it("rejects invalid worksheet names, non-finite numbers, and managed-envelope bounds", () => {
    expect(() => createManagedXlsx({ version: 1, worksheets: [] })).toThrow(/at least one worksheet/i);
    expect(() => createManagedXlsx({ version: 1, worksheets: [{ name: "bad/name", rows: [] }] })).toThrow(/worksheet name/i);
    expect(() => createManagedXlsx({ version: 1, worksheets: [
      { name: "Same", rows: [] },
      { name: "same", rows: [] },
    ] })).toThrow(/unique/i);
    expect(() => createManagedXlsx({ version: 1, worksheets: [{ name: "Sheet1", rows: [[Number.NaN]] }] })).toThrow(/finite/i);
  });

  it("identifies ordinary non-managed ZIP/XLSX input without treating it as editable managed content", () => {
    const generic = zipSync({ "hello.txt": strToU8("world") });
    expect(inspectManagedXlsx(generic)).toEqual({ managed: false, version: null, sheetNames: [], cellCount: 0 });
    expect(() => readManagedXlsx(generic)).toThrow(/not a Consulting Tools managed workbook/i);
  });

  it("rejects traversal entries before extraction", () => {
    const malicious = zipSync({ "../evil.xml": strToU8("<evil/>") });
    expect(() => inspectManagedXlsx(malicious)).toThrow(/unsafe ZIP entry path/i);
  });

  it("rejects macro-enabled content types instead of treating them as managed XLSX", () => {
    const macro = zipSync({
      "[Content_Types].xml": strToU8(
        '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.ms-excel.sheet.macroEnabled.main+xml"/></Types>',
      ),
      "docProps/custom.xml": strToU8("ConsultingToolsManagedWorkbook"),
    });
    expect(() => inspectManagedXlsx(macro)).toThrow(/macro-enabled/i);
  });
});
