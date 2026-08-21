import { createManagedXlsx, readManagedXlsx } from "./xlsx-managed.js";
import {
  MANAGED_XLSX_LIMITS,
  type ManagedCellValue,
  type ManagedWorkbook,
  type ManagedWorksheet,
  type ManagedXlsxMutation,
} from "./xlsx-types.js";

function cloneWorkbook(workbook: ManagedWorkbook): ManagedWorkbook {
  return {
    version: 1,
    worksheets: workbook.worksheets.map((sheet) => ({
      name: sheet.name,
      rows: sheet.rows.map((row) => [...row]),
    })),
  };
}

function requireSafeIndex(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer.`);
  }
}

function worksheetByName(workbook: ManagedWorkbook, sheetName: string): ManagedWorksheet {
  const sheet = workbook.worksheets.find((candidate) => candidate.name === sheetName);
  if (!sheet) throw new Error(`Worksheet not found: ${sheetName}.`);
  return sheet;
}

function rowAt(sheet: ManagedWorksheet, rowIndex: number): ManagedCellValue[] {
  requireSafeIndex(rowIndex, "rowIndex");
  const row = sheet.rows[rowIndex];
  if (!row) throw new Error(`rowIndex ${rowIndex} is outside worksheet ${sheet.name}.`);
  return row;
}

function maxWidth(sheet: ManagedWorksheet): number {
  return sheet.rows.reduce((maximum, row) => Math.max(maximum, row.length), 0);
}

function applyMutation(workbook: ManagedWorkbook, mutation: ManagedXlsxMutation): void {
  switch (mutation.type) {
    case "set-cell": {
      requireSafeIndex(mutation.columnIndex, "columnIndex");
      if (mutation.columnIndex >= MANAGED_XLSX_LIMITS.maxColumnsPerWorksheet) {
        throw new Error("columnIndex exceeds the managed XLSX column limit.");
      }
      const row = rowAt(worksheetByName(workbook, mutation.sheetName), mutation.rowIndex);
      while (row.length <= mutation.columnIndex) row.push(null);
      row[mutation.columnIndex] = mutation.value;
      return;
    }
    case "insert-row": {
      requireSafeIndex(mutation.rowIndex, "rowIndex");
      const sheet = worksheetByName(workbook, mutation.sheetName);
      if (mutation.rowIndex > sheet.rows.length) {
        throw new Error(`rowIndex ${mutation.rowIndex} is outside worksheet ${sheet.name}.`);
      }
      if (sheet.rows.length >= MANAGED_XLSX_LIMITS.maxRowsPerWorksheet) {
        throw new Error(`Worksheet ${sheet.name} already meets the managed row limit.`);
      }
      const values = mutation.values === undefined ? [] : [...mutation.values];
      if (values.length > MANAGED_XLSX_LIMITS.maxColumnsPerWorksheet) {
        throw new Error("Inserted row exceeds the managed XLSX column limit.");
      }
      sheet.rows.splice(mutation.rowIndex, 0, values);
      return;
    }
    case "delete-row": {
      const sheet = worksheetByName(workbook, mutation.sheetName);
      rowAt(sheet, mutation.rowIndex);
      sheet.rows.splice(mutation.rowIndex, 1);
      return;
    }
    case "insert-column": {
      requireSafeIndex(mutation.columnIndex, "columnIndex");
      const sheet = worksheetByName(workbook, mutation.sheetName);
      const width = maxWidth(sheet);
      if (mutation.columnIndex > width) {
        throw new Error(`columnIndex ${mutation.columnIndex} exceeds worksheet ${sheet.name} width ${width}.`);
      }
      if (width >= MANAGED_XLSX_LIMITS.maxColumnsPerWorksheet) {
        throw new Error(`Worksheet ${sheet.name} already meets the managed column limit.`);
      }
      const values = mutation.values ?? [];
      if (values.length > sheet.rows.length) {
        throw new Error("insert-column values cannot exceed the worksheet row count.");
      }
      for (let rowIndex = 0; rowIndex < sheet.rows.length; rowIndex += 1) {
        const row = sheet.rows[rowIndex]!;
        while (row.length < mutation.columnIndex) row.push(null);
        row.splice(mutation.columnIndex, 0, values[rowIndex] ?? null);
      }
      return;
    }
    case "delete-column": {
      requireSafeIndex(mutation.columnIndex, "columnIndex");
      const sheet = worksheetByName(workbook, mutation.sheetName);
      const width = maxWidth(sheet);
      if (mutation.columnIndex >= width) {
        throw new Error(`columnIndex ${mutation.columnIndex} is outside worksheet ${sheet.name}.`);
      }
      for (const row of sheet.rows) {
        if (mutation.columnIndex < row.length) row.splice(mutation.columnIndex, 1);
      }
      return;
    }
    case "add-worksheet": {
      const index = mutation.index ?? workbook.worksheets.length;
      requireSafeIndex(index, "index");
      if (index > workbook.worksheets.length) throw new Error("Worksheet insertion index is outside the workbook.");
      if (workbook.worksheets.length >= MANAGED_XLSX_LIMITS.maxWorksheets) {
        throw new Error("Managed XLSX already meets the worksheet limit.");
      }
      workbook.worksheets.splice(index, 0, {
        name: mutation.name,
        rows: mutation.rows?.map((row) => [...row]) ?? [],
      });
      return;
    }
    case "delete-worksheet": {
      const index = workbook.worksheets.findIndex((sheet) => sheet.name === mutation.sheetName);
      if (index < 0) throw new Error(`Worksheet not found: ${mutation.sheetName}.`);
      if (workbook.worksheets.length === 1) {
        throw new Error("Managed XLSX requires at least one worksheet; the last worksheet cannot be deleted.");
      }
      workbook.worksheets.splice(index, 1);
      return;
    }
    case "rename-worksheet": {
      worksheetByName(workbook, mutation.sheetName).name = mutation.newName;
      return;
    }
  }
}

export function patchManagedXlsx(bytes: Uint8Array, mutations: readonly ManagedXlsxMutation[]): Buffer {
  if (mutations.length < 1) throw new Error("Managed XLSX patch requires at least one mutation.");
  if (mutations.length > MANAGED_XLSX_LIMITS.maxMutations) {
    throw new Error(`Managed XLSX patch exceeds the ${MANAGED_XLSX_LIMITS.maxMutations}-mutation limit.`);
  }

  const workbook = cloneWorkbook(readManagedXlsx(bytes));
  for (const mutation of mutations) applyMutation(workbook, mutation);
  return createManagedXlsx(workbook);
}
