import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { buildWorkflowPlan } from "../routing/build-plan.js";
import {
  capabilities,
  getCapabilityById,
  searchCapabilities,
  type CapabilitySearch,
} from "./registry.js";
import {
  capabilityDomains,
  capabilityStatuses,
  executionModes,
  outputModalities,
} from "./types.js";

const capabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.enum(capabilityDomains),
  mode: z.enum(executionModes),
  status: z.enum(capabilityStatuses),
  summary: z.string(),
  requires: z.string().optional(),
  routingReady: z.boolean(),
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

const inspectInputSchema = z.object({
  id: z.string().trim().min(1).max(120),
});

const inspectOutputSchema = z.object({
  capability: capabilitySchema,
});

const validateWorkflowInputSchema = z.object({
  objective: z.string().trim().min(1).max(2000),
  capabilityIds: z.array(z.string().trim().min(1).max(120)).min(1).max(30),
  requestedOutputs: z.array(z.enum(outputModalities)).min(1).max(10),
});

const workflowOutputSchema = z.object({
  objective: z.string(),
  nodes: z.array(
    z.object({
      capabilityId: z.string(),
      dependsOn: z.array(z.string()),
    }),
  ),
  requestedOutputs: z.array(z.enum(outputModalities)),
  executable: z.boolean(),
  blockers: z.array(
    z.object({
      capabilityId: z.string(),
      reason: z.enum(["unavailable", "planned", "partial", "provider-dependent"]),
    }),
  ),
});

const readOnlyAnnotations = {
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
} as const;

function toolError(message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}

export function registerCapabilityTools(server: McpServer): void {
  server.registerTool(
    "search_consulting_capabilities",
    {
      title: "Search consulting capability catalog",
      description:
        "Search user-visible consulting capabilities by text, domain, status, and bounded result count. Capability status is a hard truth boundary; this catalog is distinct from lower-level MCP utilities exposed through tools/list.",
      inputSchema: searchInputSchema,
      outputSchema: searchOutputSchema,
      annotations: readOnlyAnnotations,
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
            text: `Found ${matches.length} matching cataloged capabilities out of ${capabilities.length}. Inspect status and routing readiness before promising execution.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "inspect_consulting_capability",
    {
      title: "Inspect consulting capability",
      description:
        "Inspect one consulting capability by stable ID, including its current implementation status and whether full routing metadata is available.",
      inputSchema: inspectInputSchema,
      outputSchema: inspectOutputSchema,
      annotations: readOnlyAnnotations,
    },
    async ({ id }) => {
      const capability = getCapabilityById(id);
      if (!capability) return toolError(`Unknown capability id: ${id}`);

      return {
        structuredContent: { capability },
        content: [
          {
            type: "text",
            text: `${capability.name} (${capability.id}) is ${capability.status}; routingReady=${capability.routingReady}.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "validate_consulting_workflow",
    {
      title: "Validate consulting workflow",
      description:
        "Validate a structured set of candidate consulting capability IDs, implementation statuses, requested outputs, and encoded dependencies. Semantic interpretation of raw user language is performed by the host/consulting Skill; this tool validates structured selections and does not claim standalone language understanding.",
      inputSchema: validateWorkflowInputSchema,
      outputSchema: workflowOutputSchema,
      annotations: readOnlyAnnotations,
    },
    async (input) => {
      try {
        const result = buildWorkflowPlan(input);
        return {
          structuredContent: result,
          content: [
            {
              type: "text",
              text: result.executable
                ? `Workflow is executable with ${result.nodes.length} selected capabilities.`
                : `Workflow is blocked by ${result.blockers.length} capability status constraint(s).`,
            },
          ],
        };
      } catch (error) {
        return toolError(error instanceof Error ? error.message : "Workflow validation failed.");
      }
    },
  );
}
