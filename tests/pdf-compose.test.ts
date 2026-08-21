import { PDFDocument, degrees, rgb } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { composePdfPages } from "../src/documents/pdf-compose.js";

async function sourcePdf(
  pages: readonly { width: number; height: number; rotation: number; label: string }[],
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  for (const spec of pages) {
    const page = pdf.addPage([spec.width, spec.height]);
    page.setRotation(degrees(spec.rotation));
    page.drawText(spec.label, { x: 20, y: 30, size: 12, color: rgb(0, 0, 0) });
  }
  return Buffer.from(await pdf.save());
}

describe("derivative PDF page composition", () => {
  it("merges extracts reorders and duplicates pages while preserving page geometry", async () => {
    const first = await sourcePdf([
      { width: 300, height: 400, rotation: 0, label: "A1" },
      { width: 310, height: 410, rotation: 90, label: "A2" },
    ]);
    const second = await sourcePdf([
      { width: 500, height: 600, rotation: 180, label: "B1" },
    ]);
    const firstBefore = Buffer.from(first);
    const secondBefore = Buffer.from(second);

    const result = await composePdfPages([
      { bytes: first, pageIndices: [1, 0] },
      { bytes: second, pageIndices: [0] },
      { bytes: first, pageIndices: [0] },
    ]);

    expect(result.pageCount).toBe(4);
    expect(result.sourcePageCounts).toEqual([2, 1, 2]);
    expect(first.equals(firstBefore)).toBe(true);
    expect(second.equals(secondBefore)).toBe(true);

    const reopened = await PDFDocument.load(result.bytes, { updateMetadata: false });
    const geometry = reopened.getPages().map((page) => ({
      width: page.getWidth(),
      height: page.getHeight(),
      rotation: page.getRotation().angle,
    }));
    expect(geometry).toEqual([
      { width: 310, height: 410, rotation: 90 },
      { width: 300, height: 400, rotation: 0 },
      { width: 500, height: 600, rotation: 180 },
      { width: 300, height: 400, rotation: 0 },
    ]);
    expect(reopened.getCreator()).toBe("Consulting Tools");
    expect(reopened.getProducer()).toBe("Consulting Tools");
  });

  it("rejects empty output and unknown page indices", async () => {
    const source = await sourcePdf([{ width: 300, height: 400, rotation: 0, label: "A1" }]);
    await expect(composePdfPages([])).rejects.toThrow(/selection|source/i);
    await expect(composePdfPages([{ bytes: source, pageIndices: [] }])).rejects.toThrow(/page/i);
    await expect(composePdfPages([{ bytes: source, pageIndices: [1] }])).rejects.toThrow(/page index/i);
    await expect(composePdfPages([{ bytes: source, pageIndices: [-1] }])).rejects.toThrow(/page index/i);
  });

  it("enforces source and output-page bounds", async () => {
    const source = await sourcePdf([{ width: 300, height: 400, rotation: 0, label: "A1" }]);
    await expect(composePdfPages(Array.from({ length: 21 }, () => ({ bytes: source, pageIndices: [0] })))).rejects.toThrow(/20|source/i);
    await expect(composePdfPages([{ bytes: source, pageIndices: Array.from({ length: 501 }, () => 0) }])).rejects.toThrow(/500|page/i);
  });

  it("rejects malformed or non-PDF source bytes", async () => {
    await expect(composePdfPages([{ bytes: Buffer.from("not a pdf"), pageIndices: [0] }])).rejects.toThrow(/PDF/i);
    await expect(composePdfPages([{ bytes: Buffer.from("%PDF-broken"), pageIndices: [0] }])).rejects.toThrow(/PDF/i);
  });
});
