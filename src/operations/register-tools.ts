import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { calculateCapacityUtilization, calculateFlowPerformance } from "./performance.js";
import { calculateWeightedDecision } from "./weighted-decision.js";

const annotations = { readOnlyHint: true, openWorldHint: false, destructiveHint: false } as const;
const finiteNonNegative = z.number().finite().min(0);
const finitePositive = z.number().finite().positive();

function toolError(error: unknown) {
  return { isError: true as const, content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Operations calculation failed." }] };
}
function success<T extends object>(result: T, text: string) {
  return { structuredContent: result as Record<string, unknown>, content: [{ type: "text" as const, text }] };
}

export function registerOperationsTools(server: McpServer): void {
  server.registerTool(
    "calculate_capacity_utilization",
    {
      title: "Calculate capacity utilization",
      description: "Calculate usedCapacity / availableCapacity from caller-supplied values in the same unit and period. Values above 100% are reported rather than automatically rejected; no labor/OEE/productivity interpretation is inferred.",
      inputSchema: z.object({ usedCapacity: finiteNonNegative, availableCapacity: finitePositive }),
      annotations,
    },
    async (input) => { try { const result = calculateCapacityUtilization(input); return success(result, `Capacity utilization is ${result.utilizationPercent}%.`); } catch (error) { return toolError(error); } },
  );

  server.registerTool(
    "calculate_flow_performance",
    {
      title: "Calculate flow performance",
      description: "Calculate aggregate throughput and average cycle time from explicit completed units and elapsed time. No bottleneck, queue, or station-level diagnosis is inferred.",
      inputSchema: z.object({ completedUnits: finiteNonNegative, elapsedTime: finitePositive }),
      annotations,
    },
    async (input) => { try { const result = calculateFlowPerformance(input); return success(result, `Throughput is ${result.throughput}; average cycle time is ${result.averageCycleTime}.`); } catch (error) { return toolError(error); } },
  );

  server.registerTool(
    "calculate_weighted_decision",
    {
      title: "Calculate weighted decision score",
      description: "Normalize non-negative caller-supplied criterion weights and rank options whose scores are already on a comparable decision scale. The tool does not normalize unlike raw units or infer criterion direction or missing scores.",
      inputSchema: z.object({
        criteria: z.array(z.object({ id: z.string().trim().min(1).max(128), weight: finiteNonNegative })).min(1).max(100),
        options: z.array(z.object({ id: z.string().trim().min(1).max(128), scores: z.record(z.string().trim().min(1).max(128), z.number().finite()) })).min(1).max(1_000),
      }),
      annotations,
    },
    async (input) => { try { const result = calculateWeightedDecision(input); return success(result, `Ranked ${result.options.length} options across ${result.criteria.length} weighted criteria.`); } catch (error) { return toolError(error); } },
  );
}
