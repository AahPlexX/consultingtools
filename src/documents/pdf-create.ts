import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { detectArtifactFormat } from "../artifacts/format.js";
import { calculateTableRowHeight, wrapPdfText } from "./pdf-layout.js";
import type {
  ConsultingCalloutTone,
  ConsultingDocumentBlock,
  ConsultingDocumentMetrics,
  ConsultingDocumentV1,
  ConsultingTextAlignment,
} from "./types.js";
import { validateConsultingDocument } from "./validate.js";

export interface CreatedPdfReport {
  bytes: Buffer;
  pageCount: number;
  metrics: ConsultingDocumentMetrics;
}

const PAGE_SIZES = {
  letter: [612, 792] as const,
  a4: [595.28, 841.89] as const,
};
const MARGIN = 54;
const HEADER_RESERVE = 28;
const FOOTER_RESERVE = 28;
const DEFAULT_ACCENT = "2F5597";
const BODY_SIZE = 10;
const BODY_LINE = 14;
const CELL_PADDING = 6;

function hexColor(hex: string): ReturnType<typeof rgb> {
  const value = Number.parseInt(hex, 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

const COLORS = {
  text: rgb(0.13, 0.13, 0.13),
  muted: rgb(0.4, 0.4, 0.4),
  border: rgb(0.84, 0.84, 0.84),
  stripe: rgb(0.97, 0.975, 0.98),
  white: rgb(1, 1, 1),
};

function collectText(document: ConsultingDocumentV1): string[] {
  const values: string[] = [document.title];
  for (const value of [
    document.subtitle,
    document.preparedFor,
    document.preparedBy,
    document.dateLabel,
    document.headerLabel,
    document.footerLabel,
  ]) {
    if (value !== undefined) values.push(value);
  }
  for (const block of document.blocks) {
    switch (block.kind) {
      case "heading":
      case "paragraph":
      case "source-note":
        values.push(block.text);
        break;
      case "bullets":
      case "numbered-list":
        values.push(...block.items);
        break;
      case "key-metrics":
        for (const item of block.items) {
          values.push(item.label, item.value);
          if (item.detail !== undefined) values.push(item.detail);
        }
        break;
      case "table":
        if (block.caption !== undefined) values.push(block.caption);
        values.push(...block.columns, ...block.rows.flat());
        break;
      case "callout":
        if (block.title !== undefined) values.push(block.title);
        values.push(block.text);
        break;
      case "page-break":
        break;
    }
  }
  values.push("CONFIDENTIAL", "Page", "of", "•");
  return values;
}

function preflightStandardFont(font: PDFFont, texts: readonly string[]): void {
  for (const text of texts) {
    try {
      font.encodeText(text);
    } catch {
      throw new Error(
        `Text cannot be encoded by the standard PDF font. PDF v1 does not silently substitute unsupported characters: ${JSON.stringify(text.slice(0, 120))}.`,
      );
    }
  }
}

interface RenderState {
  pdf: PDFDocument;
  regular: PDFFont;
  bold: PDFFont;
  accentHex: string;
  accent: ReturnType<typeof rgb>;
  pageSize: readonly [number, number];
  contentWidth: number;
  contentTop: number;
  contentBottom: number;
  pages: PDFPage[];
  page: PDFPage;
  y: number;
  document: ConsultingDocumentV1;
}

function newPage(state: RenderState): void {
  const page = state.pdf.addPage([...state.pageSize]);
  state.pages.push(page);
  state.page = page;
  const [width, height] = state.pageSize;
  const header = state.document.headerLabel ?? state.document.title;
  page.drawText(header, {
    x: MARGIN,
    y: height - MARGIN + 12,
    size: 8,
    font: state.regular,
    color: COLORS.muted,
    maxWidth: width - MARGIN * 2,
  });
  state.y = state.contentTop;
}

function availableHeight(state: RenderState): number {
  return state.y - state.contentBottom;
}

function ensureSpace(state: RenderState, height: number, label: string): void {
  const max = state.contentTop - state.contentBottom;
  if (height > max) throw new Error(`${label} cannot fit on an otherwise empty PDF content page.`);
  if (availableHeight(state) < height) newPage(state);
}

function measure(font: PDFFont, size: number): (text: string) => number {
  return (text) => font.widthOfTextAtSize(text, size);
}

function drawWrapped(
  state: RenderState,
  text: string,
  options: {
    font?: PDFFont;
    size?: number;
    lineHeight?: number;
    color?: ReturnType<typeof rgb>;
    x?: number;
    maxWidth?: number;
    spacingAfter?: number;
    splittable?: boolean;
  } = {},
): void {
  const font = options.font ?? state.regular;
  const size = options.size ?? BODY_SIZE;
  const lineHeight = options.lineHeight ?? BODY_LINE;
  const x = options.x ?? MARGIN;
  const maxWidth = options.maxWidth ?? state.contentWidth;
  const lines = wrapPdfText(text, maxWidth, measure(font, size));
  const totalHeight = lines.length * lineHeight;
  const splittable = options.splittable ?? true;
  if (!splittable) ensureSpace(state, totalHeight, "PDF text block");

  if (splittable && lines.length >= 2) {
    const fitting = Math.floor(availableHeight(state) / lineHeight);
    if (fitting === 1) newPage(state);
  }

  for (const line of lines) {
    if (availableHeight(state) < lineHeight) newPage(state);
    if (line.text.length > 0) {
      state.page.drawText(line.text, {
        x,
        y: state.y - size,
        size,
        font,
        color: options.color ?? COLORS.text,
      });
    }
    state.y -= lineHeight;
  }
  state.y -= options.spacingAfter ?? 6;
}

function drawTitle(state: RenderState): void {
  drawWrapped(state, state.document.title, {
    font: state.bold,
    size: 23,
    lineHeight: 28,
    color: state.accent,
    spacingAfter: 5,
    splittable: false,
  });
  if (state.document.subtitle) {
    drawWrapped(state, state.document.subtitle, {
      size: 13,
      lineHeight: 17,
      color: COLORS.muted,
      spacingAfter: 9,
      splittable: false,
    });
  }
  const metadata = [
    state.document.preparedFor ? `Prepared for: ${state.document.preparedFor}` : undefined,
    state.document.preparedBy ? `Prepared by: ${state.document.preparedBy}` : undefined,
    state.document.dateLabel,
  ].filter((value): value is string => value !== undefined);
  for (const line of metadata) {
    drawWrapped(state, line, { size: 9, lineHeight: 12, color: COLORS.muted, spacingAfter: 1, splittable: false });
  }
  if (state.document.confidentiality === "confidential") {
    drawWrapped(state, "CONFIDENTIAL", { font: state.bold, size: 8, lineHeight: 11, color: COLORS.muted, spacingAfter: 14, splittable: false });
  } else {
    state.y -= 14;
  }
}

function headingSpec(level: 1 | 2 | 3): { size: number; line: number; before: number; after: number } {
  if (level === 1) return { size: 17, line: 21, before: 10, after: 5 };
  if (level === 2) return { size: 14, line: 18, before: 8, after: 4 };
  return { size: 12, line: 16, before: 7, after: 3 };
}

function drawHeading(state: RenderState, level: 1 | 2 | 3, text: string): void {
  const spec = headingSpec(level);
  const lines = wrapPdfText(text, state.contentWidth, measure(state.bold, spec.size));
  const required = spec.before + lines.length * spec.line + spec.after + BODY_LINE;
  ensureSpace(state, required, "PDF heading");
  state.y -= spec.before;
  drawWrapped(state, text, {
    font: state.bold,
    size: spec.size,
    lineHeight: spec.line,
    color: level === 1 ? state.accent : COLORS.text,
    spacingAfter: spec.after,
    splittable: false,
  });
}

function drawList(state: RenderState, items: readonly string[], numbered: boolean): void {
  items.forEach((item, index) => {
    const prefix = numbered ? `${index + 1}.` : "•";
    const prefixWidth = state.bold.widthOfTextAtSize(prefix, BODY_SIZE);
    const indent = 18;
    const lines = wrapPdfText(item, state.contentWidth - indent, measure(state.regular, BODY_SIZE));
    const height = lines.length * BODY_LINE;
    if (height > state.contentTop - state.contentBottom) {
      throw new Error("PDF list item cannot fit on an otherwise empty content page.");
    }
    if (availableHeight(state) < Math.min(height, BODY_LINE * 2)) newPage(state);
    state.page.drawText(prefix, { x: MARGIN, y: state.y - BODY_SIZE, size: BODY_SIZE, font: state.bold, color: COLORS.text });
    for (const line of lines) {
      if (availableHeight(state) < BODY_LINE) newPage(state);
      if (line.text.length > 0) {
        state.page.drawText(line.text, {
          x: MARGIN + Math.max(indent, prefixWidth + 6),
          y: state.y - BODY_SIZE,
          size: BODY_SIZE,
          font: state.regular,
          color: COLORS.text,
        });
      }
      state.y -= BODY_LINE;
    }
    state.y -= 3;
  });
}

function drawMetrics(state: RenderState, block: Extract<ConsultingDocumentBlock, { kind: "key-metrics" }>): void {
  const count = block.items.length;
  const gap = 6;
  const width = (state.contentWidth - gap * (count - 1)) / count;
  const wrappedDetails = block.items.map((item) =>
    item.detail ? wrapPdfText(item.detail, width - CELL_PADDING * 2, measure(state.regular, 7.5)) : [],
  );
  const height = Math.max(...wrappedDetails.map((lines) => 42 + lines.length * 10), 52);
  ensureSpace(state, height + 8, "PDF key-metric block");
  block.items.forEach((item, index) => {
    const x = MARGIN + index * (width + gap);
    const bottom = state.y - height;
    state.page.drawRectangle({ x, y: bottom, width, height, color: rgb(0.95, 0.965, 0.98), borderColor: COLORS.border, borderWidth: 0.5 });
    state.page.drawText(item.label, { x: x + CELL_PADDING, y: state.y - 14, size: 7.5, font: state.bold, color: COLORS.muted, maxWidth: width - CELL_PADDING * 2 });
    state.page.drawText(item.value, { x: x + CELL_PADDING, y: state.y - 32, size: 14, font: state.bold, color: state.accent, maxWidth: width - CELL_PADDING * 2 });
    let detailY = state.y - 44;
    for (const line of wrappedDetails[index] ?? []) {
      state.page.drawText(line.text, { x: x + CELL_PADDING, y: detailY, size: 7.5, font: state.regular, color: COLORS.muted });
      detailY -= 10;
    }
  });
  state.y -= height + 8;
}

function cellLines(font: PDFFont, text: string, width: number, size: number): ReturnType<typeof wrapPdfText> {
  return wrapPdfText(text, width - CELL_PADDING * 2, measure(font, size));
}

function drawTableRow(
  state: RenderState,
  cells: readonly string[],
  columnWidths: readonly number[],
  height: number,
  header: boolean,
  alignments?: readonly ConsultingTextAlignment[],
  stripe = false,
): void {
  let x = MARGIN;
  const font = header ? state.bold : state.regular;
  const size = header ? 8 : 8.5;
  cells.forEach((text, index) => {
    const width = columnWidths[index] ?? 0;
    const bottom = state.y - height;
    state.page.drawRectangle({
      x,
      y: bottom,
      width,
      height,
      color: header ? state.accent : stripe ? COLORS.stripe : COLORS.white,
      borderColor: COLORS.border,
      borderWidth: 0.5,
    });
    const lines = cellLines(font, text, width, size);
    let lineY = state.y - CELL_PADDING - size;
    for (const line of lines) {
      let textX = x + CELL_PADDING;
      const align = alignments?.[index] ?? "left";
      if (align === "right") textX = x + width - CELL_PADDING - line.width;
      if (align === "center") textX = x + (width - line.width) / 2;
      state.page.drawText(line.text, {
        x: textX,
        y: lineY,
        size,
        font,
        color: header ? COLORS.white : COLORS.text,
      });
      lineY -= 11;
    }
    x += width;
  });
  state.y -= height;
}

function drawTable(state: RenderState, block: Extract<ConsultingDocumentBlock, { kind: "table" }>): void {
  if (block.caption) drawWrapped(state, block.caption, { font: state.bold, size: 9, lineHeight: 12, color: COLORS.muted, spacingAfter: 4, splittable: false });
  const widths = block.columns.map(() => state.contentWidth / block.columns.length);
  const headerHeight = calculateTableRowHeight(
    block.columns,
    widths.map((width) => width - CELL_PADDING * 2),
    measure(state.bold, 8),
    11,
  ) + CELL_PADDING * 2;
  if (headerHeight > state.contentTop - state.contentBottom) throw new Error("PDF table header cannot fit on an otherwise empty content page.");

  const drawHeader = () => {
    ensureSpace(state, headerHeight, "PDF table header");
    drawTableRow(state, block.columns, widths, headerHeight, true, block.align);
  };
  drawHeader();

  block.rows.forEach((row, rowIndex) => {
    const rowHeight = calculateTableRowHeight(
      row,
      widths.map((width) => width - CELL_PADDING * 2),
      measure(state.regular, 8.5),
      11,
    ) + CELL_PADDING * 2;
    const maxRow = state.contentTop - state.contentBottom - headerHeight;
    if (rowHeight > maxRow) throw new Error(`PDF table row ${rowIndex + 1} cannot fit on an otherwise empty content page.`);
    if (availableHeight(state) < rowHeight) {
      newPage(state);
      drawHeader();
    }
    drawTableRow(state, row, widths, rowHeight, false, block.align, rowIndex % 2 === 1);
  });
  state.y -= 8;
}

function calloutFill(tone: ConsultingCalloutTone): ReturnType<typeof rgb> {
  if (tone === "risk") return rgb(0.99, 0.92, 0.91);
  if (tone === "recommendation") return rgb(0.91, 0.95, 0.98);
  if (tone === "finding") return rgb(1, 0.96, 0.84);
  return rgb(0.95, 0.95, 0.95);
}

function drawCallout(state: RenderState, block: Extract<ConsultingDocumentBlock, { kind: "callout" }>): void {
  const innerWidth = state.contentWidth - 20;
  const titleLines = block.title ? wrapPdfText(block.title, innerWidth, measure(state.bold, 10)) : [];
  const textLines = wrapPdfText(block.text, innerWidth, measure(state.regular, 9));
  const height = 14 + titleLines.length * 13 + textLines.length * 12 + 12;
  ensureSpace(state, height, "PDF callout");
  const bottom = state.y - height;
  state.page.drawRectangle({ x: MARGIN, y: bottom, width: state.contentWidth, height, color: calloutFill(block.tone) });
  state.page.drawRectangle({ x: MARGIN, y: bottom, width: 4, height, color: state.accent });
  let y = state.y - 13;
  for (const line of titleLines) {
    state.page.drawText(line.text, { x: MARGIN + 10, y, size: 10, font: state.bold, color: state.accent });
    y -= 13;
  }
  for (const line of textLines) {
    state.page.drawText(line.text, { x: MARGIN + 10, y, size: 9, font: state.regular, color: COLORS.text });
    y -= 12;
  }
  state.y -= height + 8;
}

function drawBlock(state: RenderState, block: ConsultingDocumentBlock): void {
  switch (block.kind) {
    case "heading":
      drawHeading(state, block.level, block.text);
      break;
    case "paragraph":
      drawWrapped(state, block.text, {
        size: block.emphasis === "lead" ? 11 : BODY_SIZE,
        lineHeight: block.emphasis === "lead" ? 15 : BODY_LINE,
        color: block.emphasis === "lead" ? rgb(0.2, 0.2, 0.2) : COLORS.text,
        spacingAfter: block.emphasis === "lead" ? 9 : 6,
      });
      break;
    case "bullets":
      drawList(state, block.items, false);
      break;
    case "numbered-list":
      drawList(state, block.items, true);
      break;
    case "key-metrics":
      drawMetrics(state, block);
      break;
    case "table":
      drawTable(state, block);
      break;
    case "callout":
      drawCallout(state, block);
      break;
    case "source-note":
      drawWrapped(state, block.text, { size: 8, lineHeight: 11, color: COLORS.muted, spacingAfter: 5 });
      break;
    case "page-break":
      newPage(state);
      break;
  }
}

function drawFooters(state: RenderState): void {
  const total = state.pages.length;
  const [width] = state.pageSize;
  state.pages.forEach((page, index) => {
    const left = state.document.footerLabel ?? state.document.preparedFor ?? "Consulting Tools";
    page.drawText(left, { x: MARGIN, y: MARGIN - 22, size: 7.5, font: state.regular, color: COLORS.muted, maxWidth: state.contentWidth / 2 });
    const label = `Page ${index + 1} of ${total}`;
    const labelWidth = state.regular.widthOfTextAtSize(label, 7.5);
    page.drawText(label, { x: width - MARGIN - labelWidth, y: MARGIN - 22, size: 7.5, font: state.regular, color: COLORS.muted });
  });
}

export async function createConsultingPdf(document: ConsultingDocumentV1): Promise<CreatedPdfReport> {
  const metrics = validateConsultingDocument(document);
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  preflightStandardFont(regular, collectText(document));

  pdf.setTitle(document.title);
  pdf.setAuthor(document.preparedBy ?? "Consulting Tools");
  if (document.subtitle !== undefined) pdf.setSubject(document.subtitle);
  pdf.setCreator("Consulting Tools");
  pdf.setProducer("Consulting Tools");

  const pageSize = PAGE_SIZES[document.pageSize ?? "letter"];
  const contentTop = pageSize[1] - MARGIN - HEADER_RESERVE;
  const contentBottom = MARGIN + FOOTER_RESERVE;
  const accentHex = (document.accentColorHex ?? DEFAULT_ACCENT).toUpperCase();
  const first = pdf.addPage([...pageSize]);
  const state: RenderState = {
    pdf,
    regular,
    bold,
    accentHex,
    accent: hexColor(accentHex),
    pageSize,
    contentWidth: pageSize[0] - MARGIN * 2,
    contentTop,
    contentBottom,
    pages: [first],
    page: first,
    y: contentTop,
    document,
  };
  const header = document.headerLabel ?? document.title;
  first.drawText(header, { x: MARGIN, y: pageSize[1] - MARGIN + 12, size: 8, font: regular, color: COLORS.muted, maxWidth: state.contentWidth });

  drawTitle(state);
  for (const block of document.blocks) drawBlock(state, block);
  drawFooters(state);

  const bytes = Buffer.from(await pdf.save());
  const detected = detectArtifactFormat(bytes);
  if (detected.format !== "pdf") throw new Error(`Generated consulting PDF failed format validation; detected ${detected.format}.`);
  const reopened = await PDFDocument.load(bytes, { updateMetadata: false });
  const pageCount = reopened.getPageCount();
  if (pageCount !== state.pages.length) {
    throw new Error(`Generated consulting PDF page count changed during reopen validation (${state.pages.length} -> ${pageCount}).`);
  }
  if (reopened.getTitle() !== document.title) throw new Error("Generated consulting PDF title metadata failed reopen validation.");
  if (reopened.getAuthor() !== (document.preparedBy ?? "Consulting Tools")) {
    throw new Error("Generated consulting PDF author metadata failed reopen validation.");
  }
  return { bytes, pageCount, metrics };
}
