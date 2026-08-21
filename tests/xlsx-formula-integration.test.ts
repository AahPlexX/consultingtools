import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { createManagedXlsx, readManagedXlsx } from "../src/tabular/xlsx-managed.js";
import { patchManagedXlsx } from "../src/tabular/xlsx-mutations.js";
import type { ManagedFormulaCell, ManagedWorkbook } from "../src/tabular/xlsx-types.js";

const formula = (value: string): ManagedFormulaCell => ({ kind: "formula", formula: value });

describe("managed XLSX formula-cell integration", () => {
  it("serializes explicit formula cells through <f> without cached values while keeping formula-looking strings literal", () => {
    const workbook: ManagedWorkbook = {
      version: 1,
      worksheets: [
        { name: "Sheet1", rows: [[1], [2], ["=SUM(A1:A2)", formula("=SUM(A1:A2)")]] },
      ],
    };

    const bytes = createManagedXlsx(workbook);
    const files = unzipSync(bytes);
    const sheetXml = new TextDecoder().decode(files["xl/worksheets/sheet1.xml"]);
    const workbookXml = new TextDecoder().decode(files["xl/workbook.xml"]);

    expect(sheetXml).toContain('<c r="A3" t="inlineStr"><is><t xml:space="preserve">=SUM(A1:A2)</t></is></c>');
    expect(sheetXml).toContain('<c r="B3"><f>SUM(A1:A2)</f></c>');
    expect(sheetXml).not.toMatch(/<c r="B3">[\s\S]*?<v>/);
    expect(workbookXml).toMatch(/<calcPr\b[^>]*calcMode="auto"[^>]*forceFullCalc="1"[^>]*fullCalcOnLoad="1"[^>]*\/>/);
    expect(readManagedXlsx(bytes)).toEqual(workbook);
  });

  it("escapes formula XML and validates same-workbook worksheet references before serialization", () => {
    const workbook: ManagedWorkbook = {
      version: 1,
      worksheets: [
        { name: "Inputs", rows: [[10]] },
        { name: "Output", rows: [[formula('=IF(Inputs!A1<20,"A&B","C")')]] },
      ],
    };
    const bytes = createManagedXlsx(workbook);
    const files = unzipSync(bytes);
    const xml = new TextDecoder().decode(files["xl/worksheets/sheet2.xml"]);
    expect(xml).toContain('<f>IF(Inputs!A1&lt;20,&quot;A&amp;B&quot;,&quot;C&quot;)</f>');
    expect(readManagedXlsx(bytes)).toEqual(workbook);

    expect(() => createManagedXlsx({
      version: 1,
      worksheets: [{ name: "Only", rows: [[formula("=Missing!A1+1")]] }],
    })).toThrow(/sheet.*not present/i);
  });

  it("rejects dangerous or malformed formula objects instead of treating them as literals", () => {
    expect(() => createManagedXlsx({
      version: 1,
      worksheets: [{ name: "Sheet1", rows: [[formula('=HYPERLINK("https://example.com","open")')]] }],
    })).toThrow();
    expect(() => createManagedXlsx({
      version: 1,
      worksheets: [{ name: "Sheet1", rows: [[{ kind: "formula", formula: "SUM(A1:A2)" }]] }],
    })).toThrow(/begin with =/i);
  });

  it("supports formula cells in managed mutations without mutating the source workbook", () => {
    const source: ManagedWorkbook = {
      version: 1,
      worksheets: [{ name: "Sheet1", rows: [[1, "=A1+1"]] }],
    };
    const bytes = createManagedXlsx(source);
    const before = Buffer.from(bytes);
    const patched = patchManagedXlsx(bytes, [
      { type: "set-cell", sheetName: "Sheet1", rowIndex: 0, columnIndex: 1, value: formula("=A1+1") },
    ]);

    expect(bytes.equals(before)).toBe(true);
    expect(readManagedXlsx(bytes)).toEqual(source);
    expect(readManagedXlsx(patched).worksheets[0]?.rows[0]?.[1]).toEqual(formula("=A1+1"));
  });
});
