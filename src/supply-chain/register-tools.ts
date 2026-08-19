import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { calculateEoq, calculateReorderPoint } from "./inventory.js";
import { analyzeSupplierSpend } from "./spend.js";

const annotations = { readOnlyHint: true, openWorldHint: false, destructiveHint: false } as const;
const finiteNonNegative = z.number().finite().min(0);
const finitePositive = z.number().finite().positive();

function toolError(error: unknown) {
  return { isError: true as const, content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Supply-chain calculation failed." }] };
}
function success<T extends object>(result: T, text: string) {
  return { structuredContent: result as Record<string, unknown>, content: [{ type: "text" as const, text }] };
}

export function registerSupplyChainTools(server: McpServer): void {
  server.registerTool(
    "calculate_reorder_point",
    {
      title: "Calculate reorder point",
      description: "Calculate lead-time demand plus caller-supplied safety stock using an explicit common time basis. The tool does not infer service level, demand variability, or safety stock.",
      inputSchema: z.object({ demandRatePerPeriod: finiteNonNegative, leadTimePeriods: finiteNonNegative, safetyStock: finiteNonNegative }),
      annotations,
    },
    async (input) => { try { const result = calculateReorderPoint(input); return success(result, `Reorder point is ${result.reorderPoint}.`); } catch (error) { return toolError(error); } },
  );

  server.registerTool(
    "calculate_eoq",
    {
      title: "Calculate classical EOQ",
      description: "Calculate the classical economic order quantity from annual demand, per-order cost, annual carrying-rate fraction, and unit cost. Quantity discounts, stochastic demand/service levels, capacity constraints, perishability, and minimum order quantities are outside this benchmark.",
      inputSchema: z.object({ annualDemand: finiteNonNegative, orderCost: finitePositive, carryingRate: finitePositive, unitCost: finitePositive }),
      annotations,
    },
    async (input) => { try { const result = calculateEoq(input); return success(result, `Classical EOQ is ${result.economicOrderQuantity}.`); } catch (error) { return toolError(error); } },
  );

  server.registerTool(
    "analyze_supplier_spend",
    {
      title: "Analyze supplier spend concentration",
      description: "Rank caller-supplied supplier spend and calculate spend shares, cumulative shares, and top-N share. This tool does not infer supplier risk, quality, strategic importance, or substitutability.",
      inputSchema: z.object({
        suppliers: z.array(z.object({ id: z.string().trim().min(1).max(128), name: z.string().trim().min(1).max(256), spend: finiteNonNegative })).min(1).max(100_000),
        topN: z.number().int().positive().max(100_000).optional(),
      }),
      annotations,
    },
    async ({ suppliers, topN }) => {
      try {
        const input = topN === undefined ? { suppliers } : { suppliers, topN };
        const result = analyzeSupplierSpend(input);
        return success(result, `Analyzed ${result.suppliers.length} suppliers; top-N share is ${result.topNShare}.`);
      } catch (error) { return toolError(error); }
    },
  );
}
