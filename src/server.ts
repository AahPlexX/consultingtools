import { McpServer } from "@modelcontextprotocol/server";
import { MemoryArtifactStore } from "./artifacts/memory-store.js";
import { registerArtifactTools } from "./artifacts/register-tools.js";
import { registerPdfTools } from "./artifacts/register-pdf-tools.js";
import type { ArtifactStore } from "./artifacts/types.js";
import { registerCapabilityTools } from "./catalog/register-tools.js";
import { registerDocumentTools } from "./documents/register-tools.js";
import { registerFinanceTools } from "./finance/register-tools.js";
import { registerForecastingTools } from "./forecasting/register-tools.js";
import { registerOperationsTools } from "./operations/register-tools.js";
import { registerProjectTools } from "./project/register-tools.js";
import { registerStatisticsTools } from "./statistics/register-tools.js";
import { registerSupplyChainTools } from "./supply-chain/register-tools.js";
import { registerTabularTools } from "./tabular/register-tools.js";
import { registerManagedXlsxTools } from "./tabular/register-xlsx-tools.js";

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
        "Natural-language semantic interpretation belongs to the consulting orchestration workflow. Select candidate capability IDs from the catalog, validate substantive multi-capability plans before presenting them as executable, treat capability status and open-access limits as hard truth boundaries, and use epistemic labels plus applicable QA gates instead of invented confidence percentages. The consulting capability catalog is distinct from lower-level MCP utilities exposed through tools/list. Prefer deterministic finance, statistics, forecasting, project, operations, supply-chain, and governed artifact tools over hand arithmetic or ad hoc file rewriting when their exact definitions and assumptions match the requested work. Managed XLSX tools operate only on the explicit Consulting Tools managed workbook envelope; never present them as arbitrary third-party Excel preservation or CRUD. Consulting document creation uses the bounded ConsultingDocumentV1 model; derivative PDF composition copies selected pages into a new artifact and does not imply arbitrary existing-document editing.",
    },
  );

  registerCapabilityTools(server);

  const artifactOptions =
    options.maxInlineArtifactBytes === undefined
      ? undefined
      : { maxInlineArtifactBytes: options.maxInlineArtifactBytes };
  registerArtifactTools(server, artifactStore, artifactOptions);
  registerPdfTools(server, artifactStore);
  registerDocumentTools(server, artifactStore);
  registerTabularTools(server, artifactStore);
  registerManagedXlsxTools(server, artifactStore);
  registerFinanceTools(server);
  registerStatisticsTools(server);
  registerForecastingTools(server);
  registerProjectTools(server);
  registerOperationsTools(server);
  registerSupplyChainTools(server);

  return server;
}
