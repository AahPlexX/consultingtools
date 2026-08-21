export type ConsultingTextAlignment = "left" | "center" | "right";
export type ConsultingCalloutTone = "finding" | "recommendation" | "risk" | "note";

export type ConsultingDocumentBlock =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string; emphasis?: "normal" | "lead" }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered-list"; items: string[] }
  | { kind: "key-metrics"; items: { label: string; value: string; detail?: string }[] }
  | {
      kind: "table";
      caption?: string;
      columns: string[];
      rows: string[][];
      align?: ConsultingTextAlignment[];
    }
  | {
      kind: "callout";
      tone: ConsultingCalloutTone;
      title?: string;
      text: string;
    }
  | { kind: "source-note"; text: string }
  | { kind: "page-break" };

export interface ConsultingDocumentV1 {
  version: 1;
  title: string;
  subtitle?: string;
  preparedFor?: string;
  preparedBy?: string;
  dateLabel?: string;
  confidentiality?: "none" | "confidential";
  headerLabel?: string;
  footerLabel?: string;
  pageSize?: "letter" | "a4";
  accentColorHex?: string;
  blocks: ConsultingDocumentBlock[];
}

export interface ConsultingDocumentMetrics {
  blockCount: number;
  characterCount: number;
  tableCount: number;
  tableCellCount: number;
}

export const CONSULTING_DOCUMENT_LIMITS = {
  maxBlocks: 500,
  maxTotalCharacters: 1_000_000,
  maxTextCharacters: 100_000,
  maxListItems: 200,
  maxKeyMetricsPerBlock: 4,
  maxTableColumns: 12,
  maxTableRows: 500,
  maxTableCells: 20_000,
} as const;
