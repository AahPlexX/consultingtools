import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { calculateCriticalPath } from "./critical-path.js";
import { calculateEarnedValuePerformance } from "./earned-value.js";
import { calculateThreePointEstimate } from "./three-point.js";

const annotations = { readOnlyHint: true, openWorldHint: false, destructiveHint: false } as const;
const finiteNonNegative = z.number().finite().min(0);

function toolError(error: unknown) {
  return { isError: true as const, content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Project calculation failed." }] };
}
function success<T extends object>(result: T, text: string) {
  return { structuredContent: result as Record<string, unknown>, content: [{ type: "text" as const, text }] };
}

export function registerProjectTools(server: McpServer): void {
  server.registerTool(
    "calculate_critical_path",
    {
      title: "Calculate critical path",
      description: "Calculate activity-on-node critical path, early/late timing, total float, and bounded multiple critical paths for finish-to-start zero-lag dependencies in one duration unit. Calendars, resource leveling, and other dependency types are not inferred.",
      inputSchema: z.object({ activities: z.array(z.object({
        id: z.string().trim().min(1).max(128),
        duration: finiteNonNegative,
        predecessorIds: z.array(z.string().trim().min(1).max(128)).max(10_000),
      })).min(1).max(10_000) }),
      annotations,
    },
    async (input) => { try { const result = calculateCriticalPath(input); return success(result, `Project duration is ${result.projectDuration}; ${result.criticalActivityIds.length} activities are critical.`); } catch (error) { return toolError(error); } },
  );

  server.registerTool(
    "calculate_three_point_estimate",
    {
      title: "Calculate three-point estimate",
      description: "Calculate a PERT-style weighted three-point expected value, standard deviation, variance, and triangular mean from caller-supplied optimistic, most-likely, and pessimistic values. The result is an estimate, not a probability guarantee.",
      inputSchema: z.object({ optimistic: finiteNonNegative, mostLikely: finiteNonNegative, pessimistic: finiteNonNegative }),
      annotations,
    },
    async (input) => { try { const result = calculateThreePointEstimate(input); return success(result, `Weighted three-point estimate is ${result.weightedExpectedValue}.`); } catch (error) { return toolError(error); } },
  );

  server.registerTool(
    "calculate_earned_value_performance",
    {
      title: "Calculate earned value performance",
      description: "Calculate schedule variance, cost variance, SPI, and CPI from explicit planned value, earned value, and actual cost. Zero ratio denominators return null; no EAC forecast is inferred.",
      inputSchema: z.object({ plannedValue: finiteNonNegative, earnedValue: finiteNonNegative, actualCost: finiteNonNegative }),
      annotations,
    },
    async (input) => { try { const result = calculateEarnedValuePerformance(input); return success(result, `Schedule variance is ${result.scheduleVariance}; cost variance is ${result.costVariance}.`); } catch (error) { return toolError(error); } },
  );
}
