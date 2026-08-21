export interface WrappedPdfLine {
  text: string;
  width: number;
}

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`);
  }
}

function wrapLogicalLine(
  text: string,
  maxWidth: number,
  measure: (text: string) => number,
): WrappedPdfLine[] {
  if (text.length === 0) return [{ text: "", width: 0 }];
  const words = text.trim().split(/ +/u);
  if (words.length === 1 && words[0] === "") return [{ text: "", width: 0 }];

  const lines: WrappedPdfLine[] = [];
  let current = "";
  for (const word of words) {
    const wordWidth = measure(word);
    if (!Number.isFinite(wordWidth) || wordWidth < 0) {
      throw new Error("PDF text measurement must return a non-negative finite width.");
    }
    if (wordWidth > maxWidth) {
      throw new Error(`PDF word cannot fit within the requested width: ${word}.`);
    }
    const candidate = current.length === 0 ? word : `${current} ${word}`;
    const candidateWidth = measure(candidate);
    if (!Number.isFinite(candidateWidth) || candidateWidth < 0) {
      throw new Error("PDF text measurement must return a non-negative finite width.");
    }
    if (candidateWidth <= maxWidth) {
      current = candidate;
      continue;
    }
    lines.push({ text: current, width: measure(current) });
    current = word;
  }
  if (current.length > 0) lines.push({ text: current, width: measure(current) });
  return lines;
}

export function wrapPdfText(
  text: string,
  maxWidth: number,
  measure: (text: string) => number,
): WrappedPdfLine[] {
  assertPositiveFinite(maxWidth, "PDF wrap width");
  const logicalLines = text.split(/\r\n|\n|\r/u);
  return logicalLines.flatMap((line) => wrapLogicalLine(line, maxWidth, measure));
}

export function calculateTableRowHeight(
  cells: readonly string[],
  columnWidths: readonly number[],
  measure: (text: string) => number,
  lineHeight: number,
): number {
  if (cells.length === 0 || cells.length !== columnWidths.length) {
    throw new Error("PDF table cell count must match the column width count.");
  }
  assertPositiveFinite(lineHeight, "PDF table line height");
  let maxLines = 1;
  for (let index = 0; index < cells.length; index += 1) {
    const width = columnWidths[index];
    if (width === undefined) throw new Error("PDF table column width is missing.");
    assertPositiveFinite(width, `PDF table column ${index + 1} width`);
    const lines = wrapPdfText(cells[index] ?? "", width, measure);
    maxLines = Math.max(maxLines, lines.length);
  }
  return maxLines * lineHeight;
}
