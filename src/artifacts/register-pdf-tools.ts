import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { inspectPdf, updatePdfMetadata, type PdfMetadataUpdate } from "./pdf.js";
import type { ArtifactMetadata, ArtifactStore } from "./types.js";

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

const artifactUriSchema = z.string().trim().min(1).max(512);
const pdfMetadataSnapshotSchema = z.object({
  title: z.string().nullable(),
  author: z.string().nullable(),
  subject: z.string().nullable(),
  keywords: z.string().nullable(),
  creator: z.string().nullable(),
  producer: z.string().nullable(),
  creationDate: z.string().nullable(),
  modificationDate: z.string().nullable(),
});

const inspectPdfInputSchema = z.object({ artifactUri: artifactUriSchema });
const inspectPdfOutputSchema = z.object({
  artifactUri: z.string(),
  revision: z.number().int().positive(),
  pageCount: z.number().int().nonnegative(),
  metadata: pdfMetadataSnapshotSchema,
});

const updatePdfMetadataInputSchema = z.object({
  artifactUri: artifactUriSchema,
  expectedRevision: z.number().int().positive(),
  metadata: z.object({
    title: z.string().max(10_000).optional(),
    author: z.string().max(10_000).optional(),
    subject: z.string().max(10_000).optional(),
    keywords: z.array(z.string().max(1_000)).max(100).optional(),
    creator: z.string().max(10_000).optional(),
    producer: z.string().max(10_000).optional(),
  }),
});

const updatePdfMetadataOutputSchema = z.object({
  artifact: artifactMetadataSchema,
  pageCountBefore: z.number().int().nonnegative(),
  pageCountAfter: z.number().int().nonnegative(),
  metadata: pdfMetadataSnapshotSchema,
});

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

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : "PDF operation failed.";
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
    description: `Artifact ${metadata.id}, revision ${metadata.revision}, ${metadata.byteSize} bytes, sha256 ${metadata.sha256}`,
  };
}

function toPdfMetadataUpdate(metadata: {
  title?: string | undefined;
  author?: string | undefined;
  subject?: string | undefined;
  keywords?: string[] | undefined;
  creator?: string | undefined;
  producer?: string | undefined;
}): PdfMetadataUpdate {
  const update: PdfMetadataUpdate = {};
  if (metadata.title !== undefined) update.title = metadata.title;
  if (metadata.author !== undefined) update.author = metadata.author;
  if (metadata.subject !== undefined) update.subject = metadata.subject;
  if (metadata.keywords !== undefined) update.keywords = metadata.keywords;
  if (metadata.creator !== undefined) update.creator = metadata.creator;
  if (metadata.producer !== undefined) update.producer = metadata.producer;
  return update;
}

export function registerPdfTools(server: McpServer, artifactStore: ArtifactStore): void {
  server.registerTool(
    "inspect_pdf",
    {
      title: "Inspect PDF",
      description:
        "Load a detected PDF and report page count plus document-level metadata without modifying it. This does not extract or edit arbitrary existing page text.",
      inputSchema: inspectPdfInputSchema,
      outputSchema: inspectPdfOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ artifactUri }) => {
      try {
        const id = artifactIdFromUri(artifactUri);
        const current = await artifactStore.read(id);
        const result = await inspectPdf(current.bytes);
        return {
          structuredContent: {
            artifactUri: current.metadata.uri,
            revision: current.metadata.revision,
            pageCount: result.pageCount,
            metadata: result.metadata,
          },
          content: [
            {
              type: "text",
              text: `PDF has ${result.pageCount} page(s). Document metadata was inspected without modifying page content.`,
            },
            resourceLink(current.metadata),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "update_pdf_metadata",
    {
      title: "Update PDF document metadata",
      description:
        "Update only explicitly supplied document-level PDF metadata fields, preserve page count, validate the saved PDF, and store it as a new artifact revision. This does not edit existing page text or page layout.",
      inputSchema: updatePdfMetadataInputSchema,
      outputSchema: updatePdfMetadataOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: true,
      },
    },
    async ({ artifactUri, expectedRevision, metadata }) => {
      try {
        const id = artifactIdFromUri(artifactUri);
        const current = await artifactStore.read(id);
        if (current.metadata.revision !== expectedRevision) {
          throw new Error(
            `Artifact revision conflict: expected ${expectedRevision}, current revision is ${current.metadata.revision}. Re-inspect the artifact before retrying.`,
          );
        }

        const result = await updatePdfMetadata(current.bytes, toPdfMetadataUpdate(metadata));
        const artifact = await artifactStore.replace(id, { bytes: result.bytes });
        return {
          structuredContent: {
            artifact,
            pageCountBefore: result.pageCountBefore,
            pageCountAfter: result.pageCount,
            metadata: result.metadata,
          },
          content: [
            {
              type: "text",
              text: `Updated PDF document metadata only. Page count remained ${result.pageCount}; artifact revision is now ${artifact.revision}.`,
            },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );
}
