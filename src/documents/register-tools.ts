import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import type { ArtifactMetadata, ArtifactStore } from "../artifacts/types.js";
import { createConsultingDocx } from "./docx-create.js";
import { createConsultingPdf } from "./pdf-create.js";
import { composePdfPages } from "./pdf-compose.js";
import type { ConsultingDocumentV1 } from "./types.js";
import { validateConsultingDocument } from "./validate.js";

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

const alignmentSchema = z.enum(["left", "center", "right"]);
const blockSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("heading"), level: z.union([z.literal(1), z.literal(2), z.literal(3)]), text: z.string() }),
  z.object({ kind: z.literal("paragraph"), text: z.string(), emphasis: z.enum(["normal", "lead"]).optional() }),
  z.object({ kind: z.literal("bullets"), items: z.array(z.string()) }),
  z.object({ kind: z.literal("numbered-list"), items: z.array(z.string()) }),
  z.object({
    kind: z.literal("key-metrics"),
    items: z.array(z.object({ label: z.string(), value: z.string(), detail: z.string().optional() })),
  }),
  z.object({
    kind: z.literal("table"),
    caption: z.string().optional(),
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    align: z.array(alignmentSchema).optional(),
  }),
  z.object({
    kind: z.literal("callout"),
    tone: z.enum(["finding", "recommendation", "risk", "note"]),
    title: z.string().optional(),
    text: z.string(),
  }),
  z.object({ kind: z.literal("source-note"), text: z.string() }),
  z.object({ kind: z.literal("page-break") }),
]);

const documentSchema = z.object({
  version: z.literal(1),
  title: z.string(),
  subtitle: z.string().optional(),
  preparedFor: z.string().optional(),
  preparedBy: z.string().optional(),
  dateLabel: z.string().optional(),
  confidentiality: z.enum(["none", "confidential"]).optional(),
  headerLabel: z.string().optional(),
  footerLabel: z.string().optional(),
  pageSize: z.enum(["letter", "a4"]).optional(),
  accentColorHex: z.string().optional(),
  blocks: z.array(blockSchema),
});

const formatsSchema = z.array(z.enum(["docx", "pdf"])).min(1).max(2).refine(
  (formats) => new Set(formats).size === formats.length,
  { message: "formats must contain unique values." },
);

const createDocumentInputSchema = z.object({
  nameBase: z.string().trim().min(1).max(240),
  formats: formatsSchema,
  document: documentSchema,
});
const createDocumentOutputSchema = z.object({
  artifacts: z.array(artifactMetadataSchema).min(1).max(2),
  metrics: z.object({
    blockCount: z.number().int().nonnegative(),
    characterCount: z.number().int().nonnegative(),
    tableCount: z.number().int().nonnegative(),
    tableCellCount: z.number().int().nonnegative(),
  }),
});

const composePdfInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  sources: z.array(z.object({
    artifactUri: z.string().trim().min(1).max(512),
    pageIndices: z.array(z.number().int().nonnegative()).min(1).max(500),
  })).min(1).max(20),
});
const composePdfOutputSchema = z.object({
  artifact: artifactMetadataSchema,
  pageCount: z.number().int().positive(),
  sourcePageCounts: z.array(z.number().int().nonnegative()),
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
  const message = error instanceof Error ? error.message : "Document operation failed.";
  return { isError: true as const, content: [{ type: "text" as const, text: message }] };
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

interface PendingArtifact {
  name: string;
  mimeType: string;
  bytes: Buffer;
}

async function storeAtomically(
  artifactStore: ArtifactStore,
  pending: readonly PendingArtifact[],
): Promise<ArtifactMetadata[]> {
  const created: ArtifactMetadata[] = [];
  try {
    for (const item of pending) {
      created.push(await artifactStore.create(item));
    }
    return created;
  } catch (error) {
    let rollbackError: unknown;
    for (const artifact of [...created].reverse()) {
      try {
        await artifactStore.delete(artifact.id);
      } catch (rollback) {
        rollbackError ??= rollback;
      }
    }
    if (rollbackError !== undefined) {
      const primary = error instanceof Error ? error.message : "artifact creation failed";
      const rollback = rollbackError instanceof Error ? rollbackError.message : "artifact rollback failed";
      throw new Error(`Document artifact creation failed (${primary}) and rollback was incomplete (${rollback}).`);
    }
    throw error;
  }
}

export function registerDocumentTools(server: McpServer, artifactStore: ArtifactStore): void {
  server.registerTool(
    "create_consulting_document",
    {
      title: "Create consulting document artifacts",
      description:
        "Create one or both professional DOCX/PDF artifacts from the bounded ConsultingDocumentV1 model. All requested formats are generated and validated before storage; PDF uses the explicit standard-font encoding boundary. This does not edit arbitrary existing documents.",
      inputSchema: createDocumentInputSchema,
      outputSchema: createDocumentOutputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ nameBase, formats, document }) => {
      try {
        const typedDocument = document as ConsultingDocumentV1;
        const metrics = validateConsultingDocument(typedDocument);
        const pending: PendingArtifact[] = [];
        for (const format of formats) {
          if (format === "docx") {
            const created = await createConsultingDocx(typedDocument);
            pending.push({
              name: `${nameBase}.docx`,
              mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              bytes: created.bytes,
            });
          } else {
            const created = await createConsultingPdf(typedDocument);
            pending.push({ name: `${nameBase}.pdf`, mimeType: "application/pdf", bytes: created.bytes });
          }
        }
        const artifacts = await storeAtomically(artifactStore, pending);
        return {
          structuredContent: { artifacts, metrics },
          content: [
            { type: "text" as const, text: `Created ${artifacts.length} consulting document artifact(s) from one validated document model.` },
            ...artifacts.map(resourceLink),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "compose_pdf_artifact",
    {
      title: "Compose derivative PDF pages",
      description:
        "Create a new PDF artifact from explicit page selections in plugin-owned PDF artifacts. Source artifacts are read-only and retain their revisions. The derivative copies selected pages only and does not claim preservation of source-level forms, outlines, signatures, attachments, JavaScript, or metadata.",
      inputSchema: composePdfInputSchema,
      outputSchema: composePdfOutputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ name, sources }) => {
      try {
        const selections = [];
        for (const source of sources) {
          const snapshot = await artifactStore.read(artifactIdFromUri(source.artifactUri));
          selections.push({ bytes: snapshot.bytes, pageIndices: source.pageIndices });
        }
        const composed = await composePdfPages(selections);
        const artifact = await artifactStore.create({ name, mimeType: "application/pdf", bytes: composed.bytes });
        return {
          structuredContent: {
            artifact,
            pageCount: composed.pageCount,
            sourcePageCounts: composed.sourcePageCounts,
          },
          content: [
            { type: "text" as const, text: `Created derivative PDF ${artifact.uri} with ${composed.pageCount} page(s); source artifacts were not modified.` },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );
}
