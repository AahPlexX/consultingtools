export type ManagedCellValue = string | number | boolean | null;

export interface ManagedWorksheet {
  name: string;
  rows: ManagedCellValue[][];
}

export interface ManagedWorkbook {
  version: 1;
  worksheets: ManagedWorksheet[];
}

export interface ManagedXlsxInspection {
  managed: boolean;
  version: number | null;
  sheetNames: string[];
  cellCount: number;
}

export const MANAGED_XLSX_LIMITS = {
  maxArchiveBytes: 10 * 1024 * 1024,
  maxExpandedBytes: 24 * 1024 * 1024,
  maxExpandedEntryBytes: 8 * 1024 * 1024,
  maxZipEntries: 128,
  maxWorksheets: 64,
  maxRowsPerWorksheet: 100_000,
  maxColumnsPerWorksheet: 16_384,
  maxLogicalCells: 500_000,
  maxCellTextCharacters: 100_000,
} as const;
