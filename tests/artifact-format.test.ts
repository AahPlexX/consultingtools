import { zipSync, strToU8 } from "fflate";
import { describe, expect, it } from "vitest";
import { detectArtifactFormat } from "../src/artifacts/format.js";

function officePackage(mainPart: string, contentType: string): Buffer {
  const types = `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/${mainPart}" ContentType="${contentType}"/></Types>`;
  return Buffer.from(
    zipSync({
      "[Content_Types].xml": strToU8(types),
      [mainPart]: strToU8("fixture"),
    }),
  );
}

describe("detectArtifactFormat", () => {
  it("recognizes a PDF by its required header", () => {
    expect(detectArtifactFormat(Buffer.from("%PDF-1.7\nfixture", "ascii"))).toEqual({
      format: "pdf",
      detectedMimeType: "application/pdf",
      container: "pdf",
      macroEnabled: false,
    });
  });

  it.each([
    [
      "docx",
      "word/document.xml",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    [
      "xlsx",
      "xl/workbook.xml",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    [
      "pptx",
      "ppt/presentation.xml",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  ] as const)("recognizes %s from the OOXML content-types part", (format, mainPart, contentType, mimeType) => {
    expect(detectArtifactFormat(officePackage(mainPart, contentType))).toEqual({
      format,
      detectedMimeType: mimeType,
      container: "zip",
      macroEnabled: false,
    });
  });

  it.each([
    ["docm", "word/document.xml", "application/vnd.ms-word.document.macroEnabled.main+xml"],
    ["xlsm", "xl/workbook.xml", "application/vnd.ms-excel.sheet.macroEnabled.main+xml"],
    ["pptm", "ppt/presentation.xml", "application/vnd.ms-powerpoint.presentation.macroEnabled.main+xml"],
  ] as const)("flags %s as macro-enabled instead of treating it as ordinary OOXML", (format, mainPart, contentType) => {
    expect(detectArtifactFormat(officePackage(mainPart, contentType))).toMatchObject({
      format,
      container: "zip",
      macroEnabled: true,
    });
  });

  it("leaves a generic ZIP as zip rather than guessing an Office format", () => {
    const bytes = Buffer.from(zipSync({ "hello.txt": strToU8("hello") }));
    expect(detectArtifactFormat(bytes)).toEqual({
      format: "zip",
      detectedMimeType: "application/zip",
      container: "zip",
      macroEnabled: false,
    });
  });

  it("returns unknown for unrecognized binary bytes", () => {
    expect(detectArtifactFormat(Buffer.from([0, 1, 2, 3, 4]))).toEqual({
      format: "unknown",
      detectedMimeType: "application/octet-stream",
      container: "binary",
      macroEnabled: false,
    });
  });
});
