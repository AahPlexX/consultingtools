import { describe, expect, it } from "vitest";
import { parseCsv } from "../src/tabular/csv.js";
import {
  deleteCsvColumn,
  deleteCsvRow,
  insertCsvColumn,
  insertCsvRow,
  setCsvCell,
  validateCsvShape,
} from "../src/tabular/csv-mutations.js";

describe("CSV validation and immutable mutations", () => {
  it("reports ragged shape without changing the document", () => {
    const source = parseCsv("a,b,c\n1,2\nx");
    const before = structuredClone(source);
    expect(validateCsvShape(source)).toEqual({
      rowCount: 3,
      maxColumnCount: 3,
      uniformWidth: false,
      widthByRow: [3, 2, 1],
    });
    expect(source).toEqual(before);
  });

  it("sets an existing cell without mutating the source", () => {
    const source = parseCsv("a,b\n1,2");
    const updated = setCsvCell(source, 1, 0, "x");
    expect(updated.rows).toEqual([["a", "b"], ["x", "2"]]);
    expect(source.rows).toEqual([["a", "b"], ["1", "2"]]);
  });

  it("extends a ragged row with empty cells when an explicit distant cell is set", () => {
    const source = parseCsv("a,b,c\nx");
    const updated = setCsvCell(source, 1, 2, "z");
    expect(updated.rows[1]).toEqual(["x", "", "z"]);
  });

  it("inserts and deletes rows at edges", () => {
    const source = parseCsv("a,b\n1,2");
    const withHeader = insertCsvRow(source, 0, ["h1", "h2"]);
    expect(withHeader.rows[0]).toEqual(["h1", "h2"]);
    expect(deleteCsvRow(withHeader, 2).rows).toEqual([["h1", "h2"], ["a", "b"]]);
  });

  it("inserts columns with explicit per-row values and preserves ragged rows", () => {
    const source = parseCsv("a,b\n1\nx,y,z");
    const updated = insertCsvColumn(source, 1, ["A", "B", "C"]);
    expect(updated.rows).toEqual([
      ["a", "A", "b"],
      ["1", "B"],
      ["x", "C", "y", "z"],
    ]);
    expect(source.rows).toEqual([["a", "b"], ["1"], ["x", "y", "z"]]);
  });

  it("inserts empty column cells when values are omitted", () => {
    const source = parseCsv("a,b\n1,2");
    expect(insertCsvColumn(source, 1).rows).toEqual([
      ["a", "", "b"],
      ["1", "", "2"],
    ]);
  });

  it("deletes a column where present without inventing cells in shorter rows", () => {
    const source = parseCsv("a,b,c\n1\nx,y");
    expect(deleteCsvColumn(source, 1).rows).toEqual([
      ["a", "c"],
      ["1"],
      ["x"],
    ]);
  });

  it("rejects invalid indexes, mismatched column values, and non-string cell data", () => {
    const source = parseCsv("a,b\n1,2");
    expect(() => setCsvCell(source, 2, 0, "x")).toThrow(/rowIndex/i);
    expect(() => setCsvCell(source, 0, -1, "x")).toThrow(/columnIndex/i);
    expect(() => insertCsvRow(source, 3, ["x"])).toThrow(/rowIndex/i);
    expect(() => deleteCsvRow(source, 2)).toThrow(/rowIndex/i);
    expect(() => insertCsvColumn(source, 1, ["only-one"])).toThrow(/one value per existing row/i);
    expect(() => deleteCsvColumn(source, 2)).toThrow(/columnIndex/i);
    expect(() => insertCsvRow(source, 1, ["x", 2 as unknown as string])).toThrow(/string/i);
  });

  it("preserves serialization metadata across mutations", () => {
    const source = parseCsv("a,b\n1,2\n");
    const updated = setCsvCell(source, 1, 1, "3");
    expect(updated.lineEnding).toBe("lf");
    expect(updated.terminalLineBreak).toBe(true);
  });
});
