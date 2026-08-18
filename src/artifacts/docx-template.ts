import {
  PatchType,
  TextRun,
  patchDetector,
  patchDocument,
  type IPatch,
} from "docx";
import { detectArtifactFormat } from "./format.js";

export interface DocxTemplatePatchResult {
  bytes: Buffer;
  replacedPlaceholders: string[];
  remainingPlaceholders: string[];
}

function assertMacroFreeDocx(bytes: Buffer): void {
  const detected = detectArtifactFormat(bytes);
  if (detected.format !== "docx") {
    if (detected.macroEnabled) {
      throw new Error(
        `DOCX template tools refuse macro-enabled ${detected.format.toUpperCase()} packages. Macros must not be executed or silently removed.`,
      );
    }
    throw new Error(
      `DOCX template tools require a detected macro-free DOCX package; detected ${detected.format}.`,
    );
  }
}

export async function inspectDocxTemplate(bytes: Buffer): Promise<string[]> {
  assertMacroFreeDocx(bytes);
  const placeholders = await patchDetector({ data: bytes });
  return [...new Set(placeholders)].sort((left, right) => left.localeCompare(right));
}

export async function patchDocxTemplate(
  bytes: Buffer,
  values: Readonly<Record<string, string>>,
  keepOriginalStyles = true,
): Promise<DocxTemplatePatchResult> {
  const placeholders = await inspectDocxTemplate(bytes);
  const keys = Object.keys(values).sort((left, right) => left.localeCompare(right));

  if (keys.length === 0) {
    throw new Error("At least one DOCX placeholder replacement is required.");
  }

  const available = new Set(placeholders);
  const unknown = keys.filter((key) => !available.has(key));
  if (unknown.length > 0) {
    throw new Error(`Unknown placeholder key(s): ${unknown.join(", ")}. Inspect the template before patching.`);
  }

  const patches: Record<string, IPatch> = Object.fromEntries(
    keys.map((key) => [
      key,
      {
        type: PatchType.PARAGRAPH,
        children: [new TextRun(values[key] ?? "")],
      },
    ]),
  );

  const output = await patchDocument({
    outputType: "nodebuffer",
    data: bytes,
    patches,
    keepOriginalStyles,
  });
  const patchedBytes = Buffer.from(output);
  assertMacroFreeDocx(patchedBytes);

  const remainingPlaceholders = await inspectDocxTemplate(patchedBytes);
  const unresolvedTarget = keys.filter((key) => remainingPlaceholders.includes(key));
  if (unresolvedTarget.length > 0) {
    throw new Error(
      `DOCX patch validation failed; placeholder(s) remain unresolved: ${unresolvedTarget.join(", ")}.`,
    );
  }

  return {
    bytes: patchedBytes,
    replacedPlaceholders: keys,
    remainingPlaceholders,
  };
}
