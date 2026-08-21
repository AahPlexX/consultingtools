import { describe, expect, it } from "vitest";
import { validateManagedFormula } from "../src/tabular/xlsx-formula.js";

describe("managed XLSX formula allowlist", () => {
  it("validates arithmetic, comparisons, ranges, and pure allowlisted functions", () => {
    expect(validateManagedFormula("=SUM(A1:B2)+ROUND(C3/2,2)")).toEqual({
      normalized: "=SUM(A1:B2)+ROUND(C3/2,2)",
      references: ["A1:B2", "C3"],
    });
    expect(validateManagedFormula("=AND(TRUE,A1<>0,OR(FALSE,B2=1))")).toEqual({
      normalized: "=AND(TRUE,A1<>0,OR(FALSE,B2=1))",
      references: ["A1", "B2"],
    });
    expect(validateManagedFormula("=AVERAGE($A$1:$A$5)")).toEqual({
      normalized: "=AVERAGE($A$1:$A$5)",
      references: ["$A$1:$A$5"],
    });
  });

  it("accepts same-workbook sheet references only when the sheet exists", () => {
    expect(validateManagedFormula(
      '=IF(\'Other Sheet\'!A1>=10,"yes","no")',
      { sheetNames: ["Sheet1", "Other Sheet"] },
    )).toEqual({
      normalized: '=IF(\'Other Sheet\'!A1>=10,"yes","no")',
      references: ["'Other Sheet'!A1"],
    });
    expect(validateManagedFormula("=Sheet2!B2+1", { sheetNames: ["Sheet1", "Sheet2"] }).references)
      .toEqual(["Sheet2!B2"]);
    expect(() => validateManagedFormula("='Missing'!A1", { sheetNames: ["Sheet1"] }))
      .toThrow(/sheet.*not present/i);
  });

  it("supports string, numeric, boolean, unary, concatenation, and comparison expressions", () => {
    expect(validateManagedFormula('=IF((-A1+2.5E2)>=0,"ok"&"!",FALSE)').normalized)
      .toBe('=IF((-A1+2.5E2)>=0,"ok"&"!",FALSE)');
  });

  it("rejects formulas without the explicit leading equals marker or beyond the length bound", () => {
    expect(() => validateManagedFormula("SUM(A1:A2)")).toThrow(/begin with =/i);
    expect(() => validateManagedFormula(`=${"1+".repeat(5_000)}1`)).toThrow(/length/i);
    expect(() => validateManagedFormula("=\u0000A1")).toThrow(/control/i);
  });

  it("rejects external workbook, URL, DDE, add-in, and external-data constructs", () => {
    for (const formula of [
      "=SUM([Budget.xlsx]Annual!C10:C25)",
      '=HYPERLINK("https://example.com","open")',
      '=WEBSERVICE("https://example.com")',
      '=FILTERXML("<a/>","/a")',
      '=RTD("prog.id","","topic")',
      "=_xll.foo()",
      "=cmd|' /C calc'!A0",
    ]) {
      expect(() => validateManagedFormula(formula)).toThrow();
    }
  });

  it("rejects non-allowlisted functions, names, malformed tokens, and malformed argument lists", () => {
    for (const formula of [
      "=NOW()",
      "=OFFSET(A1,1,1)",
      "=NamedRange+1",
      "=SUM(A1,,B2)",
      "=SUM(A1:B2",
      "=A1;B2",
    ]) {
      expect(() => validateManagedFormula(formula)).toThrow();
    }
  });
});
