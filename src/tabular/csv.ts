export type CsvLineEnding = "crlf" | "lf";
export type CsvSpreadsheetFormulaPolicy = "escape" | "preserve";

export interface CsvDocument {
  rows: string[][];
  lineEnding: CsvLineEnding;
  terminalLineBreak: boolean;
}

export interface SerializeCsvOptions {
  lineEnding?: CsvLineEnding;
  terminalLineBreak?: boolean;
  spreadsheetFormulaPolicy?: CsvSpreadsheetFormulaPolicy;
}

const MAX_CSV_CHARACTERS = 8 * 1024 * 1024;
const MAX_CSV_ROWS = 250_000;
const MAX_CSV_FIELDS = 2_000_000;

function assertCsvSize(text: string): void {
  if (text.length > MAX_CSV_CHARACTERS) {
    throw new Error(`CSV text exceeds the ${MAX_CSV_CHARACTERS}-character limit.`);
  }
}

function pushField(row: string[], field: string, fieldCount: { value: number }): void {
  fieldCount.value += 1;
  if (fieldCount.value > MAX_CSV_FIELDS) {
    throw new Error(`CSV exceeds the ${MAX_CSV_FIELDS}-field limit.`);
  }
  row.push(field);
}

function pushRow(rows: string[][], row: string[]): void {
  if (rows.length >= MAX_CSV_ROWS) {
    throw new Error(`CSV exceeds the ${MAX_CSV_ROWS}-row limit.`);
  }
  rows.push(row);
}

export function parseCsv(text: string): CsvDocument {
  assertCsvSize(text);
  if (text.length === 0) {
    return { rows: [], lineEnding: "crlf", terminalLineBreak: false };
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let closedQuote = false;
  let firstLineEnding: CsvLineEnding | null = null;
  let terminalLineBreak = false;
  const fieldCount = { value: 0 };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index] as string;

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          closedQuote = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (closedQuote) {
      if (character === ",") {
        pushField(row, field, fieldCount);
        field = "";
        closedQuote = false;
        terminalLineBreak = false;
        continue;
      }
      if (character === "\r") {
        if (text[index + 1] !== "\n") {
          throw new Error("CSV contains a bare carriage return after a closing quote; record separators must be CRLF or LF.");
        }
        pushField(row, field, fieldCount);
        pushRow(rows, row);
        row = [];
        field = "";
        closedQuote = false;
        firstLineEnding ??= "crlf";
        terminalLineBreak = true;
        index += 1;
        continue;
      }
      if (character === "\n") {
        pushField(row, field, fieldCount);
        pushRow(rows, row);
        row = [];
        field = "";
        closedQuote = false;
        firstLineEnding ??= "lf";
        terminalLineBreak = true;
        continue;
      }
      throw new Error("CSV contains unexpected data after a closing quote.");
    }

    if (character === '"') {
      if (field.length !== 0) {
        throw new Error("CSV contains a quote inside an unquoted field.");
      }
      inQuotes = true;
      terminalLineBreak = false;
      continue;
    }

    if (character === ",") {
      pushField(row, field, fieldCount);
      field = "";
      terminalLineBreak = false;
      continue;
    }

    if (character === "\r") {
      if (text[index + 1] !== "\n") {
        throw new Error("CSV contains a bare carriage return; record separators must be CRLF or LF.");
      }
      pushField(row, field, fieldCount);
      pushRow(rows, row);
      row = [];
      field = "";
      firstLineEnding ??= "crlf";
      terminalLineBreak = true;
      index += 1;
      continue;
    }

    if (character === "\n") {
      pushField(row, field, fieldCount);
      pushRow(rows, row);
      row = [];
      field = "";
      firstLineEnding ??= "lf";
      terminalLineBreak = true;
      continue;
    }

    field += character;
    terminalLineBreak = false;
  }

  if (inQuotes) {
    throw new Error("CSV contains an unterminated quoted field.");
  }

  if (!terminalLineBreak) {
    pushField(row, field, fieldCount);
    pushRow(rows, row);
  }

  return {
    rows,
    lineEnding: firstLineEnding ?? "crlf",
    terminalLineBreak,
  };
}

export function escapeSpreadsheetFormulaField(value: string): string {
  if (value.length === 0) return value;
  const first = value[0] as string;
  return first === "=" ||
    first === "+" ||
    first === "-" ||
    first === "@" ||
    first === "\t" ||
    first === "\0"
    ? `'${value}`
    : value;
}

function encodeField(value: string, formulaPolicy: CsvSpreadsheetFormulaPolicy): string {
  const safeValue = formulaPolicy === "escape" ? escapeSpreadsheetFormulaField(value) : value;
  return /[",\r\n]/.test(safeValue) ? `"${safeValue.replaceAll('"', '""')}"` : safeValue;
}

export function serializeCsv(document: CsvDocument, options: SerializeCsvOptions = {}): string {
  if (document.rows.length > MAX_CSV_ROWS) {
    throw new Error(`CSV exceeds the ${MAX_CSV_ROWS}-row limit.`);
  }

  const lineEnding = options.lineEnding ?? document.lineEnding;
  const terminalLineBreak = options.terminalLineBreak ?? document.terminalLineBreak;
  const formulaPolicy = options.spreadsheetFormulaPolicy ?? "escape";
  const separator = lineEnding === "crlf" ? "\r\n" : "\n";
  let fieldCount = 0;

  const records = document.rows.map((row, rowIndex) => {
    if (!Array.isArray(row)) throw new Error(`CSV row ${rowIndex} must be an array.`);
    return row.map((value, columnIndex) => {
      fieldCount += 1;
      if (fieldCount > MAX_CSV_FIELDS) {
        throw new Error(`CSV exceeds the ${MAX_CSV_FIELDS}-field limit.`);
      }
      if (typeof value !== "string") {
        throw new Error(`CSV cell [${rowIndex},${columnIndex}] must be a string; implicit type coercion is not allowed.`);
      }
      return encodeField(value, formulaPolicy);
    }).join(",");
  });

  const result = records.join(separator) + (records.length > 0 && terminalLineBreak ? separator : "");
  assertCsvSize(result);
  return result;
}
