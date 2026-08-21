import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
  type FileChild,
} from "docx";
import { detectArtifactFormat } from "../artifacts/format.js";
import type {
  ConsultingCalloutTone,
  ConsultingDocumentMetrics,
  ConsultingDocumentV1,
  ConsultingTextAlignment,
} from "./types.js";
import { validateConsultingDocument } from "./validate.js";

export interface CreatedDocxReport {
  bytes: Buffer;
  metrics: ConsultingDocumentMetrics;
}

const DEFAULT_ACCENT = "2F5597";
const PAGE_SIZES = {
  letter: { width: 12_240, height: 15_840 },
  a4: { width: 11_906, height: 16_838 },
} as const;
const PAGE_MARGIN = 1_080;
const CELL_MARGIN = 100;

type DocxAlignment = (typeof AlignmentType)[keyof typeof AlignmentType];

function alignment(value: ConsultingTextAlignment | undefined): DocxAlignment {
  switch (value) {
    case "center": return AlignmentType.CENTER;
    case "right": return AlignmentType.RIGHT;
    default: return AlignmentType.LEFT;
  }
}

function textParagraph(
  text: string,
  options: {
    bold?: boolean;
    color?: string;
    size?: number;
    italics?: boolean;
    alignment?: ConsultingTextAlignment;
    spacingAfter?: number;
  } = {},
): Paragraph {
  return new Paragraph({
    alignment: alignment(options.alignment),
    spacing: { after: options.spacingAfter ?? 80 },
    children: [
      new TextRun({
        text,
        ...(options.bold === undefined ? {} : { bold: options.bold }),
        ...(options.color === undefined ? {} : { color: options.color }),
        ...(options.size === undefined ? {} : { size: options.size }),
        ...(options.italics === undefined ? {} : { italics: options.italics }),
      }),
    ],
  });
}

function pageHeader(document: ConsultingDocumentV1): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0 },
        children: [new TextRun({ text: document.headerLabel ?? document.title, size: 16, color: "666666" })],
      }),
    ],
  });
}

function pageFooter(document: ConsultingDocumentV1): Footer {
  const left = document.footerLabel ?? document.preparedFor ?? "Consulting Tools";
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({ text: `${left}  |  Page `, size: 16, color: "666666" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "666666" }),
        ],
      }),
    ],
  });
}

function tableBorders() {
  const edge = { style: BorderStyle.SINGLE, size: 2, color: "D9D9D9" } as const;
  return {
    top: edge,
    bottom: edge,
    left: edge,
    right: edge,
    insideHorizontal: edge,
    insideVertical: edge,
  };
}

function cell(
  text: string,
  options: {
    bold?: boolean;
    color?: string;
    fill?: string;
    alignment?: ConsultingTextAlignment;
    width?: number;
  } = {},
): TableCell {
  return new TableCell({
    margins: { top: CELL_MARGIN, bottom: CELL_MARGIN, left: CELL_MARGIN, right: CELL_MARGIN },
    ...(options.width === undefined ? {} : { width: { size: options.width, type: WidthType.DXA } }),
    ...(options.fill === undefined ? {} : {
      shading: { type: ShadingType.CLEAR, fill: options.fill, color: "auto" },
    }),
    children: [
      new Paragraph({
        alignment: alignment(options.alignment),
        spacing: { before: 0, after: 0 },
        children: [new TextRun({
          text,
          size: 18,
          ...(options.bold === undefined ? {} : { bold: options.bold }),
          ...(options.color === undefined ? {} : { color: options.color }),
        })],
      }),
    ],
  });
}

function dataTable(
  columns: readonly string[],
  rows: readonly (readonly string[])[],
  alignments: readonly ConsultingTextAlignment[] | undefined,
  accent: string,
  contentWidth: number,
): Table {
  const columnWidth = Math.floor(contentWidth / columns.length);
  const header = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: columns.map((column, index) => {
      const requestedAlignment = alignments?.[index];
      return cell(column, {
        bold: true,
        color: "FFFFFF",
        fill: accent,
        width: columnWidth,
        ...(requestedAlignment === undefined ? {} : { alignment: requestedAlignment }),
      });
    }),
  });
  const body = rows.map((row, rowIndex) =>
    new TableRow({
      cantSplit: true,
      children: row.map((value, columnIndex) => {
        const requestedAlignment = alignments?.[columnIndex];
        return cell(value, {
          fill: rowIndex % 2 === 1 ? "F7F8FA" : "FFFFFF",
          width: columnWidth,
          ...(requestedAlignment === undefined ? {} : { alignment: requestedAlignment }),
        });
      }),
    }),
  );
  return new Table({
    rows: [header, ...body],
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: columns.map(() => columnWidth),
    layout: TableLayoutType.FIXED,
    borders: tableBorders(),
  });
}

function metricsTable(
  items: readonly { label: string; value: string; detail?: string }[],
  accent: string,
  contentWidth: number,
): Table {
  const columnWidth = Math.floor(contentWidth / items.length);
  return new Table({
    rows: [
      new TableRow({
        cantSplit: true,
        children: items.map((item) =>
          new TableCell({
            width: { size: columnWidth, type: WidthType.DXA },
            margins: { top: 160, bottom: 160, left: 160, right: 160 },
            shading: { type: ShadingType.CLEAR, fill: "F3F6FA", color: "auto" },
            borders: tableBorders(),
            children: [
              textParagraph(item.label, { bold: true, color: "5A5A5A", size: 16, spacingAfter: 30 }),
              textParagraph(item.value, { bold: true, color: accent, size: 28, spacingAfter: 20 }),
              ...(item.detail ? [textParagraph(item.detail, { color: "666666", size: 15, spacingAfter: 0 })] : []),
            ],
          }),
        ),
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: items.map(() => columnWidth),
    layout: TableLayoutType.FIXED,
    borders: tableBorders(),
  });
}

function calloutFill(tone: ConsultingCalloutTone): string {
  switch (tone) {
    case "risk": return "FDE9E7";
    case "recommendation": return "EAF2F8";
    case "finding": return "FFF4D6";
    default: return "F2F2F2";
  }
}

function calloutTable(
  tone: ConsultingCalloutTone,
  title: string | undefined,
  text: string,
  accent: string,
): Table {
  return new Table({
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: calloutFill(tone), color: "auto" },
            margins: { top: 160, bottom: 160, left: 180, right: 180 },
            borders: {
              left: { style: BorderStyle.SINGLE, size: 16, color: accent },
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [
              ...(title ? [textParagraph(title, { bold: true, color: accent, size: 19, spacingAfter: 40 })] : []),
              textParagraph(text, { size: 18, spacingAfter: 0 }),
            ],
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });
}

function titleArea(document: ConsultingDocumentV1): FileChild[] {
  const lines: FileChild[] = [
    new Paragraph({
      style: "ConsultingTitle",
      spacing: { before: 200, after: 120 },
      children: [new TextRun(document.title)],
    }),
  ];
  if (document.subtitle) {
    lines.push(new Paragraph({ style: "ConsultingSubtitle", children: [new TextRun(document.subtitle)] }));
  }
  if (document.preparedFor) lines.push(textParagraph(`Prepared for: ${document.preparedFor}`, { spacingAfter: 30 }));
  if (document.preparedBy) lines.push(textParagraph(`Prepared by: ${document.preparedBy}`, { spacingAfter: 30 }));
  if (document.dateLabel) lines.push(textParagraph(document.dateLabel, { spacingAfter: 30 }));
  if (document.confidentiality === "confidential") {
    lines.push(textParagraph("CONFIDENTIAL", { bold: true, color: "777777", size: 16, spacingAfter: 260 }));
  } else {
    lines.push(new Paragraph({ spacing: { after: 240 } }));
  }
  return lines;
}

function renderBlocks(
  document: ConsultingDocumentV1,
  accent: string,
  contentWidth: number,
): FileChild[] {
  const children: FileChild[] = [];
  let numberedInstance = 1;
  for (const block of document.blocks) {
    switch (block.kind) {
      case "heading":
        children.push(new Paragraph({
          heading:
            block.level === 1 ? HeadingLevel.HEADING_1 :
            block.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          keepNext: true,
          children: [new TextRun(block.text)],
        }));
        break;
      case "paragraph":
        children.push(new Paragraph({
          style: block.emphasis === "lead" ? "ConsultingLead" : "ConsultingBody",
          children: [new TextRun(block.text)],
        }));
        break;
      case "bullets":
        children.push(...block.items.map((item) => new Paragraph({
          style: "ListParagraph",
          numbering: { reference: "consulting-bullets", level: 0 },
          children: [new TextRun(item)],
        })));
        break;
      case "numbered-list": {
        const instance = numberedInstance++;
        children.push(...block.items.map((item) => new Paragraph({
          style: "ListParagraph",
          numbering: { reference: "consulting-numbered", level: 0, instance },
          children: [new TextRun(item)],
        })));
        break;
      }
      case "key-metrics":
        children.push(metricsTable(block.items, accent, contentWidth));
        children.push(new Paragraph({ spacing: { after: 100 } }));
        break;
      case "table":
        if (block.caption) children.push(textParagraph(block.caption, { bold: true, color: "555555", size: 17, spacingAfter: 60 }));
        children.push(dataTable(block.columns, block.rows, block.align, accent, contentWidth));
        children.push(new Paragraph({ spacing: { after: 100 } }));
        break;
      case "callout":
        children.push(calloutTable(block.tone, block.title, block.text, accent));
        children.push(new Paragraph({ spacing: { after: 100 } }));
        break;
      case "source-note":
        children.push(new Paragraph({
          style: "ConsultingSourceNote",
          children: [new TextRun({ text: block.text, italics: true })],
        }));
        break;
      case "page-break":
        children.push(new Paragraph({ children: [new PageBreak()] }));
        break;
    }
  }
  return children;
}

export async function createConsultingDocx(document: ConsultingDocumentV1): Promise<CreatedDocxReport> {
  const metrics = validateConsultingDocument(document);
  const accent = (document.accentColorHex ?? DEFAULT_ACCENT).toUpperCase();
  const pageSize = PAGE_SIZES[document.pageSize ?? "letter"];
  const contentWidth = pageSize.width - PAGE_MARGIN * 2;

  const file = new Document({
    creator: document.preparedBy ?? "Consulting Tools",
    title: document.title,
    ...(document.subtitle === undefined ? {} : { subject: document.subtitle }),
    styles: {
      paragraphStyles: [
        {
          id: "ConsultingTitle",
          name: "Consulting Title",
          basedOn: "Normal",
          next: "ConsultingBody",
          quickFormat: true,
          run: { bold: true, size: 40, color: accent },
          paragraph: { spacing: { after: 120 } },
        },
        {
          id: "ConsultingSubtitle",
          name: "Consulting Subtitle",
          basedOn: "Normal",
          next: "ConsultingBody",
          quickFormat: true,
          run: { size: 24, color: "666666" },
          paragraph: { spacing: { after: 180 } },
        },
        {
          id: "ConsultingBody",
          name: "Consulting Body",
          basedOn: "Normal",
          next: "ConsultingBody",
          run: { size: 20, color: "222222" },
          paragraph: { spacing: { after: 120, line: 276 } },
        },
        {
          id: "ConsultingLead",
          name: "Consulting Lead",
          basedOn: "ConsultingBody",
          next: "ConsultingBody",
          run: { size: 22, color: "333333" },
          paragraph: { spacing: { after: 180, line: 300 } },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "ConsultingBody",
          quickFormat: true,
          run: { bold: true, size: 30, color: accent },
          paragraph: { spacing: { before: 260, after: 100 }, outlineLevel: 0, keepNext: true },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "ConsultingBody",
          quickFormat: true,
          run: { bold: true, size: 25, color: "333333" },
          paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 1, keepNext: true },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "ConsultingBody",
          quickFormat: true,
          run: { bold: true, size: 21, color: "444444" },
          paragraph: { spacing: { before: 180, after: 60 }, outlineLevel: 2, keepNext: true },
        },
        {
          id: "ListParagraph",
          name: "List Paragraph",
          basedOn: "ConsultingBody",
          next: "ListParagraph",
          run: { size: 20, color: "222222" },
          paragraph: { spacing: { after: 60 } },
        },
        {
          id: "ConsultingSourceNote",
          name: "Consulting Source Note",
          basedOn: "Normal",
          next: "ConsultingBody",
          run: { size: 16, color: "666666", italics: true },
          paragraph: { spacing: { before: 80, after: 100 } },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "consulting-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 300 } } },
            },
          ],
        },
        {
          reference: "consulting-numbered",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 300 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: pageSize.width, height: pageSize.height },
            margin: { top: PAGE_MARGIN, right: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN },
          },
        },
        headers: { default: pageHeader(document) },
        footers: { default: pageFooter(document) },
        children: [...titleArea(document), ...renderBlocks(document, accent, contentWidth)],
      },
    ],
  });

  const bytes = Buffer.from(await Packer.toBuffer(file));
  const detected = detectArtifactFormat(bytes);
  if (detected.format !== "docx" || detected.macroEnabled) {
    throw new Error(`Generated consulting document failed DOCX validation; detected ${detected.format}.`);
  }
  return { bytes, metrics };
}
