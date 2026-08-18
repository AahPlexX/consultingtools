import {
  ResourceNotFoundError,
  ResourceTemplate,
  type McpServer,
} from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { inspectDocxTemplate, patchDocxTemplate } from "./docx-template.js";
import { detectArtifactFormat } from "./format.js";
import {
  ArtifactNotFoundError,
  ArtifactSizeLimitError,
} from "./memory-store.js";
import type {
  ArtifactMetadata,
  ArtifactReplaceInput,
  ArtifactStore,
} from "./types.js";

const DEFAULT_MAX_INLINE_ARTIFACT_BYTES = 8 * 1024 * 1024;
const MAX_DOCX_PATCH_KEYS = 100;
const MAX_DOCX_PATCH_TEXT = 500_000;

const artifactMetadataSchema = z.object({
  id: z.string().uuid(),
  uri: z.string(),
  name: z.string(),
  mimeType: z.string(),
  byteSize: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  revision: z.number().int().positive(),
  createdAt: z.string(),
  modifiedAt: z.string(),
});

const detectedArtifactFormatSchema = z.object({
  format: z.enum(["pdf", "docx", "xlsx", "pptx", "docm", "xlsm", "pptm", "zip", "unknown"]),
  detectedMimeType: z.string(),
  container: z.enum(["pdf", "zip", "binary"]),
  macroEnabled: z.boolean(),
});

const artifactUriSchema = z.string().trim().min(1).max(512);
const expectedRevisionSchema = z.number().int().positive();

const importArtifactInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(3).max(127),
  dataBase64: z.string().min(1),
});

const inspectArtifactInputSchema = z.object({
  artifactUri: artifactUriSchema,
});

const replaceArtifactInputSchema = z.object({
  artifactUri: artifactUriSchema,
  expectedRevision: expectedRevisionSchema,
  dataBase64: z.string().min(1),
  name: z.string().trim().min(1).max(255).optional(),
  mimeType: z.string().trim().min(3).max(127).optional(),
});

const deleteArtifactInputSchema = z.object({
  artifactUri: artifactUriSchema,
  expectedRevision: expectedRevisionSchema,
});

const docxPatchValuesSchema = z.record(
  z.string().trim().min(1).max(128),
  z.string().max(100_000),
);

const patchDocxTemplateInputSchema = z.object({
  artifactUri: artifactUriSchema,
  expectedRevision: expectedRevisionSchema,
  values: docxPatchValuesSchema,
  keepOriginalStyles: z.boolean().optional(),
});

const artifactOutputSchema = z.object({
  artifact: artifactMetadataSchema,
});

const artifactFormatOutputSchema = z.object({
  artifact: artifactMetadataSchema,
  detected: detectedArtifactFormatSchema,
  declaredMimeMatches: z.boolean().nullable(),
});

const docxTemplateInspectOutputSchema = z.object({
  artifactUri: z.string(),
  revision: z.number().int().positive(),
  placeholders: z.array(z.string()),
});

const docxTemplatePatchOutputSchema = z.object({
  artifact: artifactMetadataSchema,
  replacedPlaceholders: z.array(z.string()),
  remainingPlaceholders: z.array(z.string()),
});

const deleteArtifactOutputSchema = z.object({
  deleted: z.literal(true),
  artifactUri: z.string(),
  deletedRevision: z.number().int().positive(),
});

export interface ArtifactToolOptions {
  maxInlineArtifactBytes?: number;
}

function inlineLimit(value: number | undefined): number {
  const maximum = value ?? DEFAULT_MAX_INLINE_ARTIFACT_BYTES;
  if (!Number.isSafeInteger(maximum) || maximum < 1) {
    throw new Error("maxInlineArtifactBytes must be a positive safe integer.");
  }
  return maximum;
}

function decodeBoundedBase64(data: string, maximum: number): Buffer {
  if (data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
    throw new Error("Artifact dataBase64 must be canonical base64 without whitespace.");
  }

  const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
  const estimatedBytes = (data.length / 4) * 3 - padding;
  if (estimatedBytes > maximum) {
    throw new ArtifactSizeLimitError(estimatedBytes, maximum);
  }

  const bytes = Buffer.from(data, "base64");
  if (bytes.toString("base64") !== data) {
    throw new Error("Artifact dataBase64 is malformed or non-canonical.");
  }
  return bytes;
}

function artifactIdFromUri(value: string): string {
  let uri: URL;
  try {
    uri = new URL(value);
  } catch {
    throw new Error("artifactUri must be a valid artifact:// URI.");
  }

  if (
    uri.protocol !== "artifact:" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uri.hostname) ||
    uri.username !== "" ||
    uri.password !== "" ||
    uri.port !== "" ||
    (uri.pathname !== "" && uri.pathname !== "/") ||
    uri.search !== "" ||
    uri.hash !== ""
  ) {
    throw new Error("artifactUri must identify exactly one artifact:// UUID without credentials, port, query, or fragment.");
  }

  return uri.hostname.toLowerCase();
}

function assertExpectedRevision(actual: number, expected: number): void {
  if (actual !== expected) {
    throw new Error(`Artifact revision conflict: expected ${expected}, current revision is ${actual}. Re-inspect the artifact before retrying.`);
  }
}

function declaredMimeMatches(declared: string, detected: string): boolean | null {
  if (declared.toLowerCase() === "application/octet-stream") return null;
  return declared.toLowerCase() === detected.toLowerCase();
}

function assertDocxPatchBounds(values: Readonly<Record<string, string>>): void {
  const entries = Object.entries(values);
  if (entries.length > MAX_DOCX_PATCH_KEYS) {
    throw new Error(`DOCX patch request exceeds the ${MAX_DOCX_PATCH_KEYS}-placeholder limit.`);
  }
  const totalText = entries.reduce((sum, [, value]) => sum + value.length, 0);
  if (totalText > MAX_DOCX_PATCH_TEXT) {
    throw new Error(`DOCX patch text exceeds the ${MAX_DOCX_PATCH_TEXT}-character request limit.`);
  }
}

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : "Artifact operation failed.";
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}

function resourceLink(metadata: ArtifactMetadata) {
  return {
    type: "resource_link" as const,
    uri: metadata.uri,
    name: metadata.name,
    mimeType: metadata.mimeType,
    description: `Artifact revision ${metadata.revision}; ${metadata.byteSize} bytes; sha256 ${metadata.sha256}`,
  };
}

export function registerArtifactTools(
  server: McpServer,
  artifactStore: ArtifactStore,
  options: ArtifactToolOptions = {},
): void {
  const maxInlineArtifactBytes = inlineLimit(options.maxInlineArtifactBytes);

  server.registerTool(
    "import_artifact_inline",
    {
      title: "Import a bounded artifact",
      description:
        "Import a small binary artifact whose bytes the caller can already supply as canonical base64. This creates a plugin-owned artifact resource; it does not automatically read ChatGPT/Codex attachments, local files, cloud drives, or arbitrary URLs. Use provider-specific ingress instead when available for larger or externally stored files.",
      inputSchema: importArtifactInputSchema,
      outputSchema: artifactOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ name, mimeType, dataBase64 }) => {
      try {
        const bytes = decodeBoundedBase64(dataBase64, maxInlineArtifactBytes);
        const artifact = await artifactStore.create({ name, mimeType, bytes });
        return {
          structuredContent: { artifact },
          content: [
            {
              type: "text",
              text: `Imported ${artifact.name} as ${artifact.uri}. Verify its digest and revision before any format mutation.`,
            },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "inspect_artifact",
    {
      title: "Inspect artifact metadata",
      description:
        "Read the current name, MIME type, byte size, SHA-256 digest, and revision for a plugin-owned artifact without embedding its binary payload.",
      inputSchema: inspectArtifactInputSchema,
      outputSchema: artifactOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ artifactUri }) => {
      try {
        const snapshot = await artifactStore.read(artifactIdFromUri(artifactUri));
        return {
          structuredContent: { artifact: snapshot.metadata },
          content: [
            {
              type: "text",
              text: `${snapshot.metadata.name} is revision ${snapshot.metadata.revision}, ${snapshot.metadata.byteSize} bytes, sha256 ${snapshot.metadata.sha256}.`,
            },
            resourceLink(snapshot.metadata),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "inspect_artifact_format",
    {
      title: "Inspect artifact format",
      description:
        "Detect the actual binary/package format of a plugin-owned artifact independently of its filename or declared MIME type. Recognizes PDF, ordinary OOXML Word/Excel/PowerPoint packages, macro-enabled Office variants, generic ZIP, and unknown binary content. This tool never executes macros or embedded active content.",
      inputSchema: inspectArtifactInputSchema,
      outputSchema: artifactFormatOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ artifactUri }) => {
      try {
        const snapshot = await artifactStore.read(artifactIdFromUri(artifactUri));
        const detected = detectArtifactFormat(snapshot.bytes);
        const mimeMatch = declaredMimeMatches(snapshot.metadata.mimeType, detected.detectedMimeType);
        const safety = detected.macroEnabled
          ? " This is a macro-enabled Office package. Consulting Tools must not execute its macros or treat it as an ordinary macro-free OOXML document."
          : "";
        return {
          structuredContent: {
            artifact: snapshot.metadata,
            detected,
            declaredMimeMatches: mimeMatch,
          },
          content: [
            {
              type: "text",
              text: `Detected ${detected.format} (${detected.detectedMimeType}); declared MIME ${mimeMatch === null ? "is generic and was not treated as a match claim" : mimeMatch ? "matches" : "does not match"}.${safety}`,
            },
            resourceLink(snapshot.metadata),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "inspect_docx_template",
    {
      title: "Inspect DOCX template placeholders",
      description:
        "List placeholder keys in a detected macro-free DOCX template without modifying it. This is a bounded template workflow, not arbitrary Word-document editing.",
      inputSchema: inspectArtifactInputSchema,
      outputSchema: docxTemplateInspectOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ artifactUri }) => {
      try {
        const snapshot = await artifactStore.read(artifactIdFromUri(artifactUri));
        const placeholders = await inspectDocxTemplate(snapshot.bytes);
        return {
          structuredContent: {
            artifactUri: snapshot.metadata.uri,
            revision: snapshot.metadata.revision,
            placeholders,
          },
          content: [
            {
              type: "text",
              text: `Detected ${placeholders.length} DOCX template placeholder(s): ${placeholders.join(", ") || "none"}.`,
            },
            resourceLink(snapshot.metadata),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "patch_docx_template",
    {
      title: "Patch DOCX template placeholders",
      description:
        "Replace explicitly supplied placeholders in a detected macro-free DOCX template, validate the patched package, and store it as a new artifact revision. Unknown keys are rejected. This does not provide arbitrary DOCX text/layout CRUD.",
      inputSchema: patchDocxTemplateInputSchema,
      outputSchema: docxTemplatePatchOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: true,
      },
    },
    async ({ artifactUri, expectedRevision, values, keepOriginalStyles }) => {
      try {
        assertDocxPatchBounds(values);
        const id = artifactIdFromUri(artifactUri);
        const current = await artifactStore.read(id);
        assertExpectedRevision(current.metadata.revision, expectedRevision);
        const patched = await patchDocxTemplate(
          current.bytes,
          values,
          keepOriginalStyles ?? true,
        );
        const artifact = await artifactStore.replace(id, { bytes: patched.bytes });
        return {
          structuredContent: {
            artifact,
            replacedPlaceholders: patched.replacedPlaceholders,
            remainingPlaceholders: patched.remainingPlaceholders,
          },
          content: [
            {
              type: "text",
              text: `Patched ${patched.replacedPlaceholders.length} DOCX placeholder(s); artifact revision is now ${artifact.revision}. ${patched.remainingPlaceholders.length} unrelated placeholder(s) remain.`,
            },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "replace_artifact_inline",
    {
      title: "Replace artifact bytes",
      description:
        "Replace the current bytes of a plugin-owned artifact using canonical base64 while preserving the prior revision internally. The expectedRevision precondition prevents lost updates. This changes the active artifact state and does not automatically read external files or URLs.",
      inputSchema: replaceArtifactInputSchema,
      outputSchema: artifactOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: true,
      },
    },
    async ({ artifactUri, expectedRevision, dataBase64, name, mimeType }) => {
      try {
        const id = artifactIdFromUri(artifactUri);
        const current = await artifactStore.read(id);
        assertExpectedRevision(current.metadata.revision, expectedRevision);
        const bytes = decodeBoundedBase64(dataBase64, maxInlineArtifactBytes);
        const replacement: ArtifactReplaceInput = { bytes };
        if (name !== undefined) replacement.name = name;
        if (mimeType !== undefined) replacement.mimeType = mimeType;
        const artifact = await artifactStore.replace(id, replacement);
        return {
          structuredContent: { artifact },
          content: [
            {
              type: "text",
              text: `Replaced ${artifact.name}; active revision is now ${artifact.revision}. Prior revisions remain preserved inside the artifact store until the artifact is deleted under the active retention policy.`,
            },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "delete_artifact",
    {
      title: "Delete an artifact",
      description:
        "Delete a plugin-owned artifact after verifying its expected current revision. Deletion makes the active artifact and its revision history unavailable through the MCP resource interface.",
      inputSchema: deleteArtifactInputSchema,
      outputSchema: deleteArtifactOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: true,
      },
    },
    async ({ artifactUri, expectedRevision }) => {
      try {
        const id = artifactIdFromUri(artifactUri);
        const current = await artifactStore.read(id);
        assertExpectedRevision(current.metadata.revision, expectedRevision);
        await artifactStore.delete(id);
        return {
          structuredContent: {
            deleted: true as const,
            artifactUri: current.metadata.uri,
            deletedRevision: current.metadata.revision,
          },
          content: [
            {
              type: "text",
              text: `Deleted ${current.metadata.name} at revision ${current.metadata.revision}.`,
            },
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerResource(
    "artifact",
    new ResourceTemplate("artifact://{id}", { list: undefined }),
    {
      title: "Consulting artifact",
      description:
        "Binary artifact stored in the Consulting Tools workspace. Tool results provide concrete artifact:// URIs; resources/read returns the current bytes as a base64 blob.",
    },
    async (uri, { id }) => {
      try {
        const snapshot = await artifactStore.read(String(id));
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: snapshot.metadata.mimeType,
              blob: snapshot.bytes.toString("base64"),
            },
          ],
        };
      } catch (error) {
        if (error instanceof ArtifactNotFoundError) {
          throw new ResourceNotFoundError(uri.href);
        }
        throw error;
      }
    },
  );
}
