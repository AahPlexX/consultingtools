import { describe, expect, it } from "vitest";
import {
  escapeSpreadsheetFormulaField,
  parseCsv,
  serializeCsv,
} from "../src/tabular/csv.js";

describe("CSV codec", () => {
  it("parses RFC-style quoted fields, delimiters, escaped quotes, and CRLF records", () => {
    const parsed = parseCsv('a,"b,b",c\r\n1,"x""y",3');
    expect(parsed).toEqual({
      rows: [
        ["a", "b,b", "c"],
        ["1", 'x"y', "3"],
      ],
      lineEnding: "crlf",
      terminalLineBreak: false,
    });
  });

  it("accepts LF records and preserves embedded line breaks inside quoted fields", () => {
    const parsed = parseCsv('a,b\n"line 1\nline 2",z\n');
    expect(parsed.rows).toEqual([
      ["a", "b"],
      ["line 1\nline 2", "z"],
    ]);
    expect(parsed.lineEnding).toBe("lf");
    expect(parsed.terminalLineBreak).toBe(true);
  });

  it("preserves all parsed values as strings without type or formula coercion", () => {
    expect(parseCsv('001,true,2026-08-20,=1+1').rows[0]).toEqual([
      "001",
      "true",
      "2026-08-20",
      "=1+1",
    ]);
  });

  it("handles empty fields, UTF-8 text, and an empty document", () => {
    expect(parseCsv(',é,\r\n').rows).toEqual([["", "é", ""]]);
    expect(parseCsv("")).toEqual({ rows: [], lineEnding: "crlf", terminalLineBreak: false });
  });

  it("rejects malformed quotes and bare CR record separators", () => {
    expect(() => parseCsv('a,"unterminated')).toThrow(/unterminated quoted field/i);
    expect(() => parseCsv('a,b"c')).toThrow(/quote.*unquoted/i);
    expect(() => parseCsv('"a"x,b')).toThrow(/after a closing quote/i);
    expect(() => parseCsv("a,b\rc,d")).toThrow(/bare carriage return/i);
  });

  it("escapes spreadsheet formula-leading characters without changing ordinary text", () => {
    for (const value of ["=1+1", "+2", "-3", "@SUM(A1:A2)", "\tcmd", "\0payload"]) {
      expect(escapeSpreadsheetFormulaField(value)).toBe(`'${value}`);
    }
    expect(escapeSpreadsheetFormulaField("safe")).toBe("safe");
    expect(escapeSpreadsheetFormulaField("'=already-safe")).toBe("'=already-safe");
  });

  it("serializes with spreadsheet-safe formula escaping by default", () => {
    const text = serializeCsv({
      rows: [["=1+1", "+2", "safe", "a,b", 'x"y']],
      lineEnding: "crlf",
      terminalLineBreak: false,
    });
    expect(text).toBe("'=1+1,'+2,safe,\"a,b\",\"x\"\"y\"");
  });

  it("requires an explicit preserve policy to emit formula-leading text unchanged", () => {
    const text = serializeCsv(
      { rows: [["=1+1", "@x"]], lineEnding: "lf", terminalLineBreak: true },
      { spreadsheetFormulaPolicy: "preserve" },
    );
    expect(text).toBe("=1+1,@x\n");
  });

  it("round-trips quoted content and respects explicit output line-ending options", () => {
    const source = 'a,"b,b","x""y"\n"line 1\nline 2",z,q';
    const parsed = parseCsv(source);
    const serialized = serializeCsv(parsed, {
      lineEnding: "crlf",
      terminalLineBreak: true,
      spreadsheetFormulaPolicy: "preserve",
    });
    expect(serialized).toBe('a,"b,b","x""y"\r\n"line 1\nline 2",z,q\r\n');
    expect(parseCsv(serialized).rows).toEqual(parsed.rows);
  });
});
