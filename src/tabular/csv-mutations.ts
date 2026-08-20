import type { CsvDocument } from "./csv.js";

const MAX_CSV_ROWS = 250_000;
const MAX_CSV_COLUMNS = 100_000;
const MAX_CSV_CELL_CHARACTERS = 1_000_000;

export interface CsvShapeReport {
  rowCount: number;
  maxColumnCount: number;
  uniformWidth: boolean;
  widthByRow: number[];
}

function cloneDocument(document: CsvDocument): CsvDocument {
  return {
    rows: document.rows.map((row) => [...row]),
    lineEnding: document.lineEnding,
    terminalLineBreak: document.terminalLineBreak,
  };
}

function assertCellValue(value: string, label: string): void {
  if (typeof value !== "string") throw new Error(`${label} must be a string.`);
  if (value.length > MAX_CSV_CELL_CHARACTERS) {
    throw new Error(`${label} exceeds the ${MAX_CSV_CELL_CHARACTERS}-character cell limit.`);
  }
}

function assertRowValues(values: readonly string[], label: string): void {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array of strings.`);
  if (values.length > MAX_CSV_COLUMNS) {
    throw new Error(`${label} exceeds the ${MAX_CSV_COLUMNS}-column limit.`);
  }
  values.forEach((value, index) => assertCellValue(value, `${label}[${index}]`));
}

function assertExistingRowIndex(document: CsvDocument, rowIndex: number): void {
  if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= document.rows.length) {
    throw new Error(`rowIndex must identify an existing row from 0 to ${Math.max(document.rows.length - 1, 0)}.`);
  }
}

function assertInsertRowIndex(document: CsvDocument, rowIndex: number): void {
  if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex > document.rows.length) {
    throw new Error(`rowIndex must be an insertion position from 0 to ${document.rows.length}.`);
  }
}

function assertColumnIndex(columnIndex: number): void {
  if (!Number.isInteger(columnIndex) || columnIndex < 0 || columnIndex >= MAX_CSV_COLUMNS) {
    throw new Error(`columnIndex must be an integer from 0 to ${MAX_CSV_COLUMNS - 1}.`);
  }
}

export function validateCsvShape(document: CsvDocument): CsvShapeReport {
  const widthByRow = document.rows.map((row, rowIndex) => {
    assertRowValues(row, `rows[${rowIndex}]`);
    return row.length;
  });
  const maxColumnCount = widthByRow.length === 0 ? 0 : Math.max(...widthByRow);
  const firstWidth = widthByRow[0] ?? 0;
  return {
    rowCount: document.rows.length,
    maxColumnCount,
    uniformWidth: widthByRow.every((width) => width === firstWidth),
    widthByRow,
  };
}

export function setCsvCell(
  document: CsvDocument,
  rowIndex: number,
  columnIndex: number,
  value: string,
): CsvDocument {
  assertExistingRowIndex(document, rowIndex);
  assertColumnIndex(columnIndex);
  assertCellValue(value, "value");
  const updated = cloneDocument(document);
  const row = updated.rows[rowIndex] as string[];
  while (row.length <= columnIndex) row.push("");
  row[columnIndex] = value;
  return updated;
}

export function insertCsvRow(
  document: CsvDocument,
  rowIndex: number,
  values: readonly string[],
): CsvDocument {
  assertInsertRowIndex(document, rowIndex);
  if (document.rows.length >= MAX_CSV_ROWS) {
    throw new Error(`CSV already contains the maximum ${MAX_CSV_ROWS} rows.`);
  }
  assertRowValues(values, "values");
  const updated = cloneDocument(document);
  updated.rows.splice(rowIndex, 0, [...values]);
  return updated;
}

export function deleteCsvRow(document: CsvDocument, rowIndex: number): CsvDocument {
  assertExistingRowIndex(document, rowIndex);
  const updated = cloneDocument(document);
  updated.rows.splice(rowIndex, 1);
  return updated;
}

export function insertCsvColumn(
  document: CsvDocument,
  columnIndex: number,
  values?: readonly string[],
): CsvDocument {
  assertColumnIndex(columnIndex);
  const shape = validateCsvShape(document);
  if (shape.maxColumnCount >= MAX_CSV_COLUMNS) {
    throw new Error(`CSV already contains the maximum ${MAX_CSV_COLUMNS} columns.`);
  }
  if (columnIndex > shape.maxColumnCount) {
    throw new Error(`columnIndex must be an insertion position from 0 to ${shape.maxColumnCount}.`);
  }
  if (values !== undefined && values.length !== document.rows.length) {
    throw new Error("Column insertion values must provide exactly one value per existing row.");
  }
  values?.forEach((value, rowIndex) => assertCellValue(value, `values[${rowIndex}]`));

  const updated = cloneDocument(document);
  updated.rows.forEach((row, rowIndex) => {
    const value = values?.[rowIndex] ?? "";
    if (columnIndex < row.length) {
      row.splice(columnIndex, 0, value);
    } else if (columnIndex === row.length) {
      row.push(value);
    } else {
      while (row.length < columnIndex) row.push("");
      row.push(value);
    }
  });
  return updated;
}

export function deleteCsvColumn(document: CsvDocument, columnIndex: number): CsvDocument {
  assertColumnIndex(columnIndex);
  const shape = validateCsvShape(document);
  if (columnIndex >= shape.maxColumnCount) {
    throw new Error(`columnIndex must identify an existing column from 0 to ${Math.max(shape.maxColumnCount - 1, 0)}.`);
  }
  const updated = cloneDocument(document);
  updated.rows.forEach((row) => {
    if (columnIndex < row.length) row.splice(columnIndex, 1);
  });
  return updated;
}
