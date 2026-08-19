import { McpServer } from "@modelcontextprotocol/server";
import { MemoryArtifactStore } from "./artifacts/memory-store.js";
import { registerArtifactTools } from "./artifacts/register-tools.js";
import { registerPdfTools } from "./artifacts/register-pdf-tools.js";
import type { ArtifactStore } from "./artifacts/types.js";
import { registerCapabilityTools } from "./catalog/register-tools.js";
import { registerFinanceTools } from "./finance/register-tools.js";
import { registerForecastingTools } from "./forecasting/register-tools.js";
import { registerStatisticsTools } from "./statistics/register-tools.js";

export interface ConsultingServerOptions {
  artifactStore?: ArtifactStore;
  maxInlineArtifactBytes?: number;
}

export function createServer(options: ConsultingServerOptions = {}): McpServer {
  const artifactStore = options.artifactStore ?? new MemoryArtifactStore();
  const server = new McpServer(
    {
      name: "consulting-tools",
      version: "0.1.0",
    },
    {
      instructions:
        "Natural-language semantic interpretation belongs to the consulting orchestration workflow. Select candidate capability IDs from the catalog, validate substantive multi-capability plans before presenting them as executable, treat capability status and open-access limits as hard truth boundaries, and use epistemic labels plus applicable QA gates instead of invented confidence percentages. The consulting capability catalog is distinct from lower-level MCP utilities exposed through tools/list. Prefer deterministic finance, statistics, and forecasting tools over hand arithmetic when their exact definitions and assumptions match the requested analysis.",
    },
  );

  registerCapabilityTools(server);

  const artifactOptions =
    options.maxInlineArtifactBytes === undefined
      ? undefined
      : { maxInlineArtifactBytes: options.maxInlineArtifactBytes };
  registerArtifactTools(server, artifactStore, artifactOptions);
  registerPdfTools(server, artifactStore);
  registerFinanceTools(server);
  registerStatisticsTools(server);
  registerForecastingTools(server);

  return server;
}
