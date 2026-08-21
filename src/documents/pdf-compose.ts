import { PDFDocument } from "pdf-lib";
import { detectArtifactFormat } from "../artifacts/format.js";

export interface PdfPageSelection {
  bytes: Buffer;
  pageIndices: readonly number[];
}

export interface PdfCompositionResult {
  bytes: Buffer;
  pageCount: number;
  sourcePageCounts: number[];
}

const MAX_SOURCES = 20;
const MAX_OUTPUT_PAGES = 500;

async function loadSource(bytes: Buffer, sourceIndex: number): Promise<PDFDocument> {
  const detected = detectArtifactFormat(bytes);
  if (detected.format !== "pdf") {
    throw new Error(`PDF composition source ${sourceIndex + 1} must be a detected PDF; detected ${detected.format}.`);
  }
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown parser error";
    throw new Error(`PDF composition source ${sourceIndex + 1} could not be parsed: ${detail}`);
  }
}

export async function composePdfPages(
  selections: readonly PdfPageSelection[],
): Promise<PdfCompositionResult> {
  if (selections.length < 1) throw new Error("At least one PDF source selection is required.");
  if (selections.length > MAX_SOURCES) {
    throw new Error(`PDF composition supports at most ${MAX_SOURCES} source selections.`);
  }

  let requestedPages = 0;
  for (const [sourceIndex, selection] of selections.entries()) {
    if (selection.pageIndices.length < 1) {
      throw new Error(`PDF source selection ${sourceIndex + 1} must request at least one page.`);
    }
    requestedPages += selection.pageIndices.length;
    if (requestedPages > MAX_OUTPUT_PAGES) {
      throw new Error(`PDF composition supports at most ${MAX_OUTPUT_PAGES} output pages.`);
    }
    for (const pageIndex of selection.pageIndices) {
      if (!Number.isSafeInteger(pageIndex) || pageIndex < 0) {
        throw new Error(`PDF page index must be a non-negative safe integer; received ${pageIndex}.`);
      }
    }
  }

  const loaded: PDFDocument[] = [];
  const sourcePageCounts: number[] = [];
  for (let sourceIndex = 0; sourceIndex < selections.length; sourceIndex += 1) {
    const selection = selections[sourceIndex];
    if (!selection) throw new Error("PDF source selection is missing.");
    const source = await loadSource(selection.bytes, sourceIndex);
    const pageCount = source.getPageCount();
    sourcePageCounts.push(pageCount);
    for (const pageIndex of selection.pageIndices) {
      if (pageIndex >= pageCount) {
        throw new Error(
          `PDF page index ${pageIndex} is outside source ${sourceIndex + 1}, which has ${pageCount} page(s).`,
        );
      }
    }
    loaded.push(source);
  }

  const output = await PDFDocument.create();
  output.setCreator("Consulting Tools");
  output.setProducer("Consulting Tools");

  for (let sourceIndex = 0; sourceIndex < selections.length; sourceIndex += 1) {
    const selection = selections[sourceIndex];
    const source = loaded[sourceIndex];
    if (!selection || !source) throw new Error("Validated PDF source is missing during composition.");
    const copied = await output.copyPages(source, [...selection.pageIndices]);
    for (const page of copied) output.addPage(page);
  }

  const bytes = Buffer.from(await output.save());
  const detected = detectArtifactFormat(bytes);
  if (detected.format !== "pdf") {
    throw new Error(`Composed PDF failed format validation; detected ${detected.format}.`);
  }
  const reopened = await PDFDocument.load(bytes, { updateMetadata: false });
  const pageCount = reopened.getPageCount();
  if (pageCount !== requestedPages) {
    throw new Error(`Composed PDF page count changed during reopen validation (${requestedPages} -> ${pageCount}).`);
  }

  return { bytes, pageCount, sourcePageCounts };
}
