export interface ManagedFormulaCell {
  kind: "formula";
  formula: string;
}

export type ManagedCellValue = string | number | boolean | null | ManagedFormulaCell;

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

export type ManagedXlsxMutation =
  | {
      type: "set-cell";
      sheetName: string;
      rowIndex: number;
      columnIndex: number;
      value: ManagedCellValue;
    }
  | {
      type: "insert-row";
      sheetName: string;
      rowIndex: number;
      values?: ManagedCellValue[];
    }
  | {
      type: "delete-row";
      sheetName: string;
      rowIndex: number;
    }
  | {
      type: "insert-column";
      sheetName: string;
      columnIndex: number;
      values?: ManagedCellValue[];
    }
  | {
      type: "delete-column";
      sheetName: string;
      columnIndex: number;
    }
  | {
      type: "add-worksheet";
      name: string;
      index?: number;
      rows?: ManagedCellValue[][];
    }
  | {
      type: "delete-worksheet";
      sheetName: string;
    }
  | {
      type: "rename-worksheet";
      sheetName: string;
      newName: string;
    };

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
  maxFormulaCharacters: 8_192,
  maxMutations: 1_000,
} as const;
