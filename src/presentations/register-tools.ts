import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import type { ArtifactMetadata, ArtifactStore } from "../artifacts/types.js";
import { exhibitSchema } from "../visualization/schemas.js";
import { createConsultingPptx } from "./pptx-create.js";
import type { PresentationDeckV1 } from "./types.js";

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

const slideSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("title"), title: z.string(), subtitle: z.string().optional() }),
  z.object({ kind: z.literal("section"), title: z.string(), subtitle: z.string().optional() }),
  z.object({
    kind: z.literal("summary"),
    title: z.string(),
    bullets: z.array(z.string()),
    takeaway: z.string().optional(),
    sourceNote: z.string().optional(),
  }),
  z.object({
    kind: z.literal("exhibit"),
    title: z.string(),
    takeaway: z.string().optional(),
    exhibit: exhibitSchema,
    sourceNote: z.string().optional(),
    speakerNotes: z.array(z.string()).optional(),
  }),
]);

const deckSchema = z.object({
  version: z.literal(1),
  title: z.string(),
  subtitle: z.string().optional(),
  preparedFor: z.string().optional(),
  preparedBy: z.string().optional(),
  dateLabel: z.string().optional(),
  confidentiality: z.enum(["none", "confidential"]).optional(),
  accentColorHex: z.string().optional(),
  slides: z.array(slideSchema),
});

const metricsSchema = z.object({
  slideCount: z.number().int().nonnegative(),
  exhibitCount: z.number().int().nonnegative(),
  totalCharacterCount: z.number().int().nonnegative(),
});

function resourceLink(metadata: ArtifactMetadata) {
  return {
    type: "resource_link" as const,
    uri: metadata.uri,
    name: metadata.name,
    mimeType: metadata.mimeType,
    description: `Artifact revision ${metadata.revision}; ${metadata.byteSize} bytes; sha256 ${metadata.sha256}`,
  };
}

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : "Presentation operation failed.";
  return { isError: true as const, content: [{ type: "text" as const, text: message }] };
}

export function registerPresentationTools(server: McpServer, artifactStore: ArtifactStore): void {
  server.registerTool(
    "create_consulting_presentation",
    {
      title: "Create consulting presentation",
      description:
        "Create one new professional macro-free PPTX artifact from the bounded PresentationDeckV1 model. The complete deck is validated and generated in memory before artifact storage. This does not edit arbitrary existing presentations.",
      inputSchema: z.object({ name: z.string().trim().min(1).max(255), deck: deckSchema }),
      outputSchema: z.object({ artifact: artifactMetadataSchema, metrics: metricsSchema }),
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ name, deck }) => {
      try {
        const created = await createConsultingPptx(deck as PresentationDeckV1);
        const artifact = await artifactStore.create({
          name,
          mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          bytes: created.bytes,
        });
        return {
          structuredContent: { artifact, metrics: created.metrics },
          content: [
            { type: "text" as const, text: `Created consulting presentation ${artifact.uri}.` },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );
}
