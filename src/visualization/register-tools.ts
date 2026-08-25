import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import type { ArtifactMetadata, ArtifactStore } from "../artifacts/types.js";
import { generateMermaidSource } from "./mermaid.js";
import { renderExhibitSvg } from "./render-exhibit.js";
import { analyticalJobSchema, diagramSchema, exhibitSchema } from "./schemas.js";
import { recommendExhibit } from "./selection.js";
import type { DiagramSpecV1, ExhibitSpecV1 } from "./types.js";

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

const exhibitMetricsSchema = z.object({
  dataPointCount: z.number().int().nonnegative(),
  seriesCount: z.number().int().nonnegative(),
  categoryCount: z.number().int().nonnegative(),
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
  const message = error instanceof Error ? error.message : "Visualization operation failed.";
  return { isError: true as const, content: [{ type: "text" as const, text: message }] };
}

export function registerVisualizationTools(server: McpServer, artifactStore: ArtifactStore): void {
  server.registerTool(
    "recommend_consulting_exhibit",
    {
      title: "Recommend consulting exhibit",
      description:
        "Recommend one bounded exhibit kind from explicit analytical-job and data-shape metadata. This tool does not interpret arbitrary natural language and does not create an artifact.",
      inputSchema: z.object({
        job: analyticalJobSchema,
        categoryCount: z.number().int().nonnegative().optional(),
        seriesCount: z.number().int().nonnegative().optional(),
        hasNegativeValues: z.boolean().optional(),
      }),
      outputSchema: z.object({
        kind: z.enum(["bar", "line", "scatter", "waterfall", "pareto", "heatmap", "matrix-2x2", "risk-matrix", "gantt", "funnel"]),
        rationale: z.string(),
        warnings: z.array(z.string()),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async (input) => {
      try {
        const result = recommendExhibit(input);
        return {
          structuredContent: result,
          content: [{ type: "text" as const, text: `${result.kind}: ${result.rationale}` }],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "create_consulting_exhibit",
    {
      title: "Create consulting SVG exhibit",
      description:
        "Create a standalone accessible SVG artifact from the closed-world ExhibitSpecV1 model. No arbitrary SVG markup, scripts, external resources, or remote URLs are accepted.",
      inputSchema: z.object({ name: z.string().trim().min(1).max(255), exhibit: exhibitSchema }),
      outputSchema: z.object({ artifact: artifactMetadataSchema, metrics: exhibitMetricsSchema }),
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ name, exhibit }) => {
      try {
        const rendered = renderExhibitSvg(exhibit as ExhibitSpecV1);
        const artifact = await artifactStore.create({
          name,
          mimeType: "image/svg+xml",
          bytes: Buffer.from(rendered.svg, "utf8"),
        });
        return {
          structuredContent: { artifact, metrics: rendered.metrics },
          content: [
            { type: "text" as const, text: `Created accessible SVG exhibit ${artifact.uri}.` },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "create_mermaid_diagram",
    {
      title: "Create bounded Mermaid diagram source",
      description:
        "Create a plain-text .mmd artifact from the structured DiagramSpecV1 model. Arbitrary Mermaid source, directives, click actions, HTML, links, scripts, and user-controlled configuration are not accepted.",
      inputSchema: z.object({ name: z.string().trim().min(1).max(255), diagram: diagramSchema }),
      outputSchema: z.object({ artifact: artifactMetadataSchema }),
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ name, diagram }) => {
      try {
        const source = generateMermaidSource(diagram as DiagramSpecV1);
        const artifact = await artifactStore.create({
          name,
          mimeType: "text/plain",
          bytes: Buffer.from(source, "utf8"),
        });
        return {
          structuredContent: { artifact },
          content: [
            { type: "text" as const, text: `Created bounded Mermaid source ${artifact.uri}.` },
            resourceLink(artifact),
          ],
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );
}
