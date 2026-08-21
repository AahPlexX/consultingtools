import { strToU8, unzipSync, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { detectArtifactFormat } from "../src/artifacts/format.js";
import {
  createManagedXlsx,
  inspectManagedXlsx,
  patchManagedXlsx,
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

describe("managed XLSX literal-cell CRUD", () => {
  it("applies cell, row, column, add, delete, and rename worksheet mutations in order", () => {
    const source: ManagedWorkbook = {
      version: 1,
      worksheets: [
        { name: "Sheet1", rows: [["A", "B"], ["C", "D"]] },
        { name: "Keep", rows: [[1]] },
      ],
    };
    const patched = patchManagedXlsx(createManagedXlsx(source), [
      { type: "set-cell", sheetName: "Sheet1", rowIndex: 0, columnIndex: 1, value: "B2" },
      { type: "insert-row", sheetName: "Sheet1", rowIndex: 1, values: ["X", "Y"] },
      { type: "insert-column", sheetName: "Sheet1", columnIndex: 1, values: [10, 20, 30] },
      { type: "delete-row", sheetName: "Sheet1", rowIndex: 2 },
      { type: "delete-column", sheetName: "Sheet1", columnIndex: 2 },
      { type: "rename-worksheet", sheetName: "Keep", newName: "Renamed" },
      { type: "add-worksheet", name: "Added", index: 1, rows: [["new"]] },
      { type: "delete-worksheet", sheetName: "Renamed" },
    ]);

    expect(readManagedXlsx(patched)).toEqual({
      version: 1,
      worksheets: [
        { name: "Sheet1", rows: [["A", 10], ["X", 20]] },
        { name: "Added", rows: [["new"]] },
      ],
    });
  });

  it("does not mutate the source buffer or unaffected workbook content", () => {
    const bytes = createManagedXlsx(workbook);
    const before = Buffer.from(bytes);
    const patched = patchManagedXlsx(bytes, [
      { type: "set-cell", sheetName: "Summary", rowIndex: 1, columnIndex: 1, value: 999 },
    ]);

    expect(bytes.equals(before)).toBe(true);
    expect(readManagedXlsx(bytes)).toEqual(workbook);
    expect(readManagedXlsx(patched).worksheets[1]).toEqual(workbook.worksheets[1]);
    expect(readManagedXlsx(patched).worksheets[0]?.rows[1]?.[1]).toBe(999);
  });

  it("rejects invalid mutation bounds, worksheet collisions, invalid names, and deleting the last worksheet", () => {
    const single = createManagedXlsx({ version: 1, worksheets: [{ name: "Sheet1", rows: [["A"]] }] });
    expect(() => patchManagedXlsx(single, [
      { type: "set-cell", sheetName: "Sheet1", rowIndex: 3, columnIndex: 0, value: "x" },
    ])).toThrow(/rowIndex/i);
    expect(() => patchManagedXlsx(single, [
      { type: "insert-row", sheetName: "Sheet1", rowIndex: 3, values: [] },
    ])).toThrow(/rowIndex/i);
    expect(() => patchManagedXlsx(single, [
      { type: "rename-worksheet", sheetName: "Sheet1", newName: "bad/name" },
    ])).toThrow(/worksheet name/i);
    expect(() => patchManagedXlsx(single, [
      { type: "rename-worksheet", sheetName: "Sheet1", newName: "x".repeat(32) },
    ])).toThrow(/worksheet name/i);
    expect(() => patchManagedXlsx(single, [
      { type: "add-worksheet", name: "sheet1" },
    ])).toThrow(/unique/i);
    expect(() => patchManagedXlsx(single, [
      { type: "delete-worksheet", sheetName: "Sheet1" },
    ])).toThrow(/at least one worksheet/i);
  });
});
