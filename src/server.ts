import {
  McpServer,
  ResourceNotFoundError,
  ResourceTemplate,
} from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import {
  ArtifactNotFoundError,
  ArtifactSizeLimitError,
  MemoryArtifactStore,
} from "./artifacts/memory-store.js";
import type { ArtifactMetadata, ArtifactStore } from "./artifacts/types.js";
import {
  capabilityDomains,
  capabilities,
  capabilityStatuses,
  searchCapabilities,
  type CapabilitySearch,
} from "./catalog.js";

const DEFAULT_MAX_INLINE_ARTIFACT_BYTES = 8 * 1024 * 1024;

const capabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.enum(capabilityDomains),
  mode: z.enum(["reasoning", "research", "artifact", "data", "external"]),
  status: z.enum(capabilityStatuses),
  summary: z.string(),
  requires: z.string().optional(),
});

const searchInputSchema = z.object({
  query: z.string().trim().min(1).max(200).optional(),
  status: z.enum(capabilityStatuses).optional(),
  domain: z.enum(capabilityDomains).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

const searchOutputSchema = z.object({
  count: z.number().int().nonnegative(),
  totalCatalogSize: z.number().int().positive(),
  capabilities: z.array(capabilitySchema),
});

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

const importArtifactInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(3).max(127),
  dataBase64: z.string().min(1),
});

const importArtifactOutputSchema = z.object({
  artifact: artifactMetadataSchema,
});

export interface ConsultingServerOptions {
  artifactStore?: ArtifactStore;
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

export function createServer(options: ConsultingServerOptions = {}): McpServer {
  const artifactStore = options.artifactStore ?? new MemoryArtifactStore();
  const maxInlineArtifactBytes = inlineLimit(options.maxInlineArtifactBytes);
  const server = new McpServer(
    {
      name: "consulting-tools",
      version: "0.1.0",
    },
    {
      instructions:
        "Use capability status as a hard truth boundary. Planned, partial, provider-dependent, and unavailable capabilities must never be presented as fully executable. Prefer the smallest set of complementary consulting methods needed for the user's actual decision.",
    },
  );

  server.registerTool(
    "search_consulting_capabilities",
    {
      title: "Search consulting capabilities",
      description:
        "Discover consulting methods and operational capabilities in this installed version, including each capability's implementation status and prerequisites. Use this before promising a specialized file, data, SEO, research, or analysis operation when availability is uncertain.",
      inputSchema: searchInputSchema,
      outputSchema: searchOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ query, status, domain, limit }) => {
      const filters: CapabilitySearch = {};
      if (query !== undefined) filters.query = query;
      if (status !== undefined) filters.status = status;
      if (domain !== undefined) filters.domain = domain;
      if (limit !== undefined) filters.limit = limit;

      const matches = searchCapabilities(filters);
      const result = {
        count: matches.length,
        totalCatalogSize: capabilities.length,
        capabilities: matches,
      };

      return {
        structuredContent: result,
        content: [
          {
            type: "text",
            text: `Found ${matches.length} matching capabilities out of ${capabilities.length}. Inspect status and prerequisites before committing to an operation.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "import_artifact_inline",
    {
      title: "Import a bounded artifact",
      description:
        "Import a small binary artifact whose bytes the caller can already supply as canonical base64. This creates a plugin-owned artifact resource; it does not automatically read ChatGPT/Codex attachments, local files, cloud drives, or arbitrary URLs. Use provider-specific ingress instead when available for larger or externally stored files.",
      inputSchema: importArtifactInputSchema,
      outputSchema: importArtifactOutputSchema,
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

  return server;
}
