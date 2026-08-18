import { strFromU8, unzipSync } from "fflate";

const MAX_CONTENT_TYPES_BYTES = 1024 * 1024;

export type ArtifactFormat =
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "docm"
  | "xlsm"
  | "pptm"
  | "zip"
  | "unknown";

export interface DetectedArtifactFormat {
  format: ArtifactFormat;
  detectedMimeType: string;
  container: "pdf" | "zip" | "binary";
  macroEnabled: boolean;
}

const officeContentTypes: readonly {
  marker: string;
  format: ArtifactFormat;
  mimeType: string;
  macroEnabled: boolean;
}[] = [
  {
    marker: "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
    format: "docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    macroEnabled: false,
  },
  {
    marker: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
    format: "xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    macroEnabled: false,
  },
  {
    marker: "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
    format: "pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    macroEnabled: false,
  },
  {
    marker: "application/vnd.ms-word.document.macroenabled.main+xml",
    format: "docm",
    mimeType: "application/vnd.ms-word.document.macroenabled.12",
    macroEnabled: true,
  },
  {
    marker: "application/vnd.ms-excel.sheet.macroenabled.main+xml",
    format: "xlsm",
    mimeType: "application/vnd.ms-excel.sheet.macroenabled.12",
    macroEnabled: true,
  },
  {
    marker: "application/vnd.ms-powerpoint.presentation.macroenabled.main+xml",
    format: "pptm",
    mimeType: "application/vnd.ms-powerpoint.presentation.macroenabled.12",
    macroEnabled: true,
  },
];

function isZip(bytes: Buffer): boolean {
  if (bytes.byteLength < 4) return false;
  return (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
      (bytes[2] === 0x05 && bytes[3] === 0x06) ||
      (bytes[2] === 0x07 && bytes[3] === 0x08))
  );
}

function detectOfficeFormat(bytes: Buffer): DetectedArtifactFormat | undefined {
  let selected: Uint8Array | undefined;
  try {
    const parts = unzipSync(bytes, {
      filter(file) {
        return (
          file.name === "[Content_Types].xml" &&
          file.originalSize >= 0 &&
          file.originalSize <= MAX_CONTENT_TYPES_BYTES
        );
      },
    });
    selected = parts["[Content_Types].xml"];
  } catch {
    return undefined;
  }

  if (!selected) return undefined;
  const contentTypes = strFromU8(selected).toLowerCase();
  const match = officeContentTypes.find((candidate) => contentTypes.includes(candidate.marker));
  if (!match) return undefined;

  return {
    format: match.format,
    detectedMimeType: match.mimeType,
    container: "zip",
    macroEnabled: match.macroEnabled,
  };
}

export function detectArtifactFormat(bytes: Buffer): DetectedArtifactFormat {
  if (bytes.subarray(0, 5).toString("ascii") === "%PDF-") {
    return {
      format: "pdf",
      detectedMimeType: "application/pdf",
      container: "pdf",
      macroEnabled: false,
    };
  }

  if (isZip(bytes)) {
    return (
      detectOfficeFormat(bytes) ?? {
        format: "zip",
        detectedMimeType: "application/zip",
        container: "zip",
        macroEnabled: false,
      }
    );
  }

  return {
    format: "unknown",
    detectedMimeType: "application/octet-stream",
    container: "binary",
    macroEnabled: false,
  };
}
