import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  capabilityDomains,
  capabilities,
  capabilityStatuses,
  searchCapabilities,
  type CapabilitySearch,
} from "./catalog.js";

const capabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.enum(capabilityDomains),
  mode: z.enum(["reasoning", "research", "artifact", "data", "external"]),
  status: z.enum(capabilityStatuses),
  summary: z.string(),
  requires: z.string().optional(),
});

export function createServer(): McpServer {
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
      inputSchema: {
        query: z.string().trim().min(1).max(200).optional(),
        status: z.enum(capabilityStatuses).optional(),
        domain: z.enum(capabilityDomains).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      },
      outputSchema: {
        count: z.number().int().nonnegative(),
        totalCatalogSize: z.number().int().positive(),
        capabilities: z.array(capabilitySchema),
      },
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

  return server;
}
