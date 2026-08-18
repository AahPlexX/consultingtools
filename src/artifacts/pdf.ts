import { PDFDocument } from "pdf-lib";
import { detectArtifactFormat } from "./format.js";

export interface PdfMetadataSnapshot {
  title: string | null;
  author: string | null;
  subject: string | null;
  keywords: string | null;
  creator: string | null;
  producer: string | null;
  creationDate: string | null;
  modificationDate: string | null;
}

export interface PdfInspection {
  pageCount: number;
  metadata: PdfMetadataSnapshot;
}

export interface PdfMetadataUpdate {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: readonly string[];
  creator?: string;
  producer?: string;
}

export interface PdfMetadataUpdateResult extends PdfInspection {
  bytes: Buffer;
  pageCountBefore: number;
}

function assertPdf(bytes: Buffer): void {
  const detected = detectArtifactFormat(bytes);
  if (detected.format !== "pdf") {
    throw new Error(`PDF tools require a detected PDF artifact; detected ${detected.format}.`);
  }
}

function dateIso(value: Date | undefined): string | null {
  return value === undefined ? null : value.toISOString();
}

function stringOrNull(value: string | undefined): string | null {
  return value === undefined ? null : value;
}

function metadata(pdf: PDFDocument): PdfMetadataSnapshot {
  return {
    title: stringOrNull(pdf.getTitle()),
    author: stringOrNull(pdf.getAuthor()),
    subject: stringOrNull(pdf.getSubject()),
    keywords: stringOrNull(pdf.getKeywords()),
    creator: stringOrNull(pdf.getCreator()),
    producer: stringOrNull(pdf.getProducer()),
    creationDate: dateIso(pdf.getCreationDate()),
    modificationDate: dateIso(pdf.getModificationDate()),
  };
}

async function loadPdf(bytes: Buffer): Promise<PDFDocument> {
  assertPdf(bytes);
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown parser error";
    throw new Error(`PDF parsing failed: ${detail}`);
  }
}

export async function inspectPdf(bytes: Buffer): Promise<PdfInspection> {
  const pdf = await loadPdf(bytes);
  return {
    pageCount: pdf.getPageCount(),
    metadata: metadata(pdf),
  };
}

export async function updatePdfMetadata(
  bytes: Buffer,
  update: PdfMetadataUpdate,
): Promise<PdfMetadataUpdateResult> {
  const supplied = Object.keys(update);
  if (supplied.length === 0) {
    throw new Error("At least one PDF metadata field must be supplied.");
  }

  const pdf = await loadPdf(bytes);
  const pageCountBefore = pdf.getPageCount();

  if (update.title !== undefined) pdf.setTitle(update.title);
  if (update.author !== undefined) pdf.setAuthor(update.author);
  if (update.subject !== undefined) pdf.setSubject(update.subject);
  if (update.keywords !== undefined) pdf.setKeywords([...update.keywords]);
  if (update.creator !== undefined) pdf.setCreator(update.creator);
  if (update.producer !== undefined) pdf.setProducer(update.producer);

  const output = Buffer.from(await pdf.save());
  assertPdf(output);
  const reopened = await loadPdf(output);
  const pageCount = reopened.getPageCount();
  if (pageCount !== pageCountBefore) {
    throw new Error(
      `PDF metadata validation failed: page count changed from ${pageCountBefore} to ${pageCount}.`,
    );
  }

  return {
    bytes: output,
    pageCountBefore,
    pageCount,
    metadata: metadata(reopened),
  };
}
