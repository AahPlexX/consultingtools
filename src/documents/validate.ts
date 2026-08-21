import {
  CONSULTING_DOCUMENT_LIMITS,
  type ConsultingDocumentBlock,
  type ConsultingDocumentMetrics,
  type ConsultingDocumentV1,
} from "./types.js";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(value: UnknownRecord, allowed: readonly string[], label: string): void {
  const allowedSet = new Set(allowed);
  const unknown = Object.keys(value).filter((key) => !allowedSet.has(key));
  if (unknown.length > 0) {
    throw new Error(`${label} contains unsupported field(s): ${unknown.join(", ")}.`);
  }
}

function assertArray(value: unknown, label: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
}

function assertEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`${label} must be one of: ${allowed.join(", ")}.`);
  }
}

interface TextCounter {
  total: number;
}

function countText(
  counter: TextCounter,
  value: unknown,
  label: string,
  options: { allowBlank?: boolean } = {},
): string {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  if (!options.allowBlank && value.trim().length === 0) throw new Error(`${label} must not be blank.`);
  if (value.length > CONSULTING_DOCUMENT_LIMITS.maxTextCharacters) {
    throw new Error(`${label} text exceeds the ${CONSULTING_DOCUMENT_LIMITS.maxTextCharacters}-character limit.`);
  }
  counter.total += value.length;
  if (counter.total > CONSULTING_DOCUMENT_LIMITS.maxTotalCharacters) {
    throw new Error(
      `Consulting document character count exceeds the ${CONSULTING_DOCUMENT_LIMITS.maxTotalCharacters}-character limit.`,
    );
  }
  return value;
}

function countOptionalText(
  counter: TextCounter,
  value: unknown,
  label: string,
): void {
  if (value !== undefined) countText(counter, value, label);
}

function validateList(
  counter: TextCounter,
  value: UnknownRecord,
  kind: "bullets" | "numbered-list",
): void {
  assertOnlyKeys(value, ["kind", "items"], `${kind} block`);
  const items = value.items;
  assertArray(items, `${kind} list items`);
  if (items.length < 1) throw new Error(`${kind} list must contain at least one item.`);
  if (items.length > CONSULTING_DOCUMENT_LIMITS.maxListItems) {
    throw new Error(`${kind} list exceeds the ${CONSULTING_DOCUMENT_LIMITS.maxListItems}-item limit.`);
  }
  items.forEach((item, index) => countText(counter, item, `${kind} list item ${index + 1}`));
}

function validateKeyMetrics(counter: TextCounter, value: UnknownRecord): void {
  assertOnlyKeys(value, ["kind", "items"], "key-metrics block");
  const items = value.items;
  assertArray(items, "key metric items");
  if (items.length < 1) throw new Error("Key metric block must contain at least one key metric.");
  if (items.length > CONSULTING_DOCUMENT_LIMITS.maxKeyMetricsPerBlock) {
    throw new Error(
      `Key metric block exceeds the ${CONSULTING_DOCUMENT_LIMITS.maxKeyMetricsPerBlock}-metric limit.`,
    );
  }
  items.forEach((item, index) => {
    if (!isRecord(item)) throw new Error(`Key metric ${index + 1} must be an object.`);
    assertOnlyKeys(item, ["label", "value", "detail"], `Key metric ${index + 1}`);
    countText(counter, item.label, `Key metric ${index + 1} label`);
    countText(counter, item.value, `Key metric ${index + 1} value`);
    countOptionalText(counter, item.detail, `Key metric ${index + 1} detail`);
  });
}

function validateTable(
  counter: TextCounter,
  value: UnknownRecord,
): { tableCells: number } {
  assertOnlyKeys(value, ["kind", "caption", "columns", "rows", "align"], "table block");
  countOptionalText(counter, value.caption, "Table caption");

  const columns = value.columns;
  assertArray(columns, "Table columns");
  if (columns.length < 1) throw new Error("Table must contain at least one column.");
  if (columns.length > CONSULTING_DOCUMENT_LIMITS.maxTableColumns) {
    throw new Error(`Table column count exceeds the ${CONSULTING_DOCUMENT_LIMITS.maxTableColumns}-column limit.`);
  }
  columns.forEach((column, index) => countText(counter, column, `Table column ${index + 1}`));

  const rows = value.rows;
  assertArray(rows, "Table rows");
  if (rows.length > CONSULTING_DOCUMENT_LIMITS.maxTableRows) {
    throw new Error(`Table row count exceeds the ${CONSULTING_DOCUMENT_LIMITS.maxTableRows}-row limit.`);
  }

  const align = value.align;
  if (align !== undefined) {
    assertArray(align, "Table alignment");
    if (align.length !== columns.length) {
      throw new Error("Table alignment count must match the table column count.");
    }
    align.forEach((alignment, index) =>
      assertEnum(alignment, ["left", "center", "right"] as const, `Table alignment ${index + 1}`),
    );
  }

  let tableCells = columns.length;
  rows.forEach((row, rowIndex) => {
    assertArray(row, `Table row ${rowIndex + 1}`);
    if (row.length !== columns.length) {
      throw new Error(
        `Table row ${rowIndex + 1} column count must match the ${columns.length}-column table definition.`,
      );
    }
    tableCells += row.length;
    row.forEach((cell, columnIndex) =>
      countText(counter, cell, `Table row ${rowIndex + 1} column ${columnIndex + 1}`, { allowBlank: true }),
    );
  });
  return { tableCells };
}

function validateBlock(
  counter: TextCounter,
  block: unknown,
): { tableCount: number; tableCells: number } {
  if (!isRecord(block)) throw new Error("Consulting document block must be an object.");
  const kind = block.kind;
  if (typeof kind !== "string") throw new Error("Consulting document block kind must be text.");

  switch (kind) {
    case "heading": {
      assertOnlyKeys(block, ["kind", "level", "text"], "heading block");
      if (block.level !== 1 && block.level !== 2 && block.level !== 3) {
        throw new Error("Heading level must be 1, 2, or 3.");
      }
      countText(counter, block.text, "Heading text");
      return { tableCount: 0, tableCells: 0 };
    }
    case "paragraph": {
      assertOnlyKeys(block, ["kind", "text", "emphasis"], "paragraph block");
      if (block.emphasis !== undefined) {
        assertEnum(block.emphasis, ["normal", "lead"] as const, "Paragraph emphasis");
      }
      countText(counter, block.text, "Paragraph text");
      return { tableCount: 0, tableCells: 0 };
    }
    case "bullets":
    case "numbered-list":
      validateList(counter, block, kind);
      return { tableCount: 0, tableCells: 0 };
    case "key-metrics":
      validateKeyMetrics(counter, block);
      return { tableCount: 0, tableCells: 0 };
    case "table": {
      const table = validateTable(counter, block);
      return { tableCount: 1, tableCells: table.tableCells };
    }
    case "callout": {
      assertOnlyKeys(block, ["kind", "tone", "title", "text"], "callout block");
      assertEnum(block.tone, ["finding", "recommendation", "risk", "note"] as const, "Callout tone");
      countOptionalText(counter, block.title, "Callout title");
      countText(counter, block.text, "Callout text");
      return { tableCount: 0, tableCells: 0 };
    }
    case "source-note": {
      assertOnlyKeys(block, ["kind", "text"], "source-note block");
      countText(counter, block.text, "Source note text");
      return { tableCount: 0, tableCells: 0 };
    }
    case "page-break":
      assertOnlyKeys(block, ["kind"], "page-break block");
      return { tableCount: 0, tableCells: 0 };
    default:
      throw new Error(`Unsupported consulting document block kind: ${kind}.`);
  }
}

export function validateConsultingDocument(document: ConsultingDocumentV1): ConsultingDocumentMetrics {
  if (!isRecord(document)) throw new Error("Consulting document must be an object.");
  assertOnlyKeys(
    document,
    [
      "version",
      "title",
      "subtitle",
      "preparedFor",
      "preparedBy",
      "dateLabel",
      "confidentiality",
      "headerLabel",
      "footerLabel",
      "pageSize",
      "accentColorHex",
      "blocks",
    ],
    "Consulting document",
  );
  if (document.version !== 1) throw new Error("Consulting document version must be exactly 1.");

  const counter: TextCounter = { total: 0 };
  countText(counter, document.title, "Consulting document title");
  countOptionalText(counter, document.subtitle, "Consulting document subtitle");
  countOptionalText(counter, document.preparedFor, "Prepared-for text");
  countOptionalText(counter, document.preparedBy, "Prepared-by text");
  countOptionalText(counter, document.dateLabel, "Date label");
  countOptionalText(counter, document.headerLabel, "Header label");
  countOptionalText(counter, document.footerLabel, "Footer label");

  if (document.confidentiality !== undefined) {
    assertEnum(document.confidentiality, ["none", "confidential"] as const, "Confidentiality");
  }
  if (document.pageSize !== undefined) {
    assertEnum(document.pageSize, ["letter", "a4"] as const, "Page size");
  }
  if (document.accentColorHex !== undefined && !/^[0-9A-Fa-f]{6}$/.test(document.accentColorHex)) {
    throw new Error("Accent color must be exactly six hexadecimal digits without a leading #.");
  }

  const blocks = document.blocks;
  assertArray(blocks, "Consulting document blocks");
  if (blocks.length > CONSULTING_DOCUMENT_LIMITS.maxBlocks) {
    throw new Error(`Consulting document block count exceeds the ${CONSULTING_DOCUMENT_LIMITS.maxBlocks}-block limit.`);
  }

  let tableCount = 0;
  let tableCellCount = 0;
  blocks.forEach((block: ConsultingDocumentBlock) => {
    const metrics = validateBlock(counter, block);
    tableCount += metrics.tableCount;
    tableCellCount += metrics.tableCells;
    if (tableCellCount > CONSULTING_DOCUMENT_LIMITS.maxTableCells) {
      throw new Error(
        `Consulting document table cell count exceeds the ${CONSULTING_DOCUMENT_LIMITS.maxTableCells}-cell limit.`,
      );
    }
  });

  return {
    blockCount: blocks.length,
    characterCount: counter.total,
    tableCount,
    tableCellCount,
  };
}
