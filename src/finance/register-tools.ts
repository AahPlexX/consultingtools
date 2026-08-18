import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { calculateBreakEven, calculateSimpleRoi } from "./calculations.js";

const finiteNonNegative = z.number().finite().min(0);
const finitePositive = z.number().finite().positive();

const breakEvenInputSchema = z.object({
  fixedCosts: finiteNonNegative,
  pricePerUnit: finitePositive,
  variableCostPerUnit: finiteNonNegative,
});

const breakEvenOutputSchema = z.object({
  fixedCosts: z.number(),
  pricePerUnit: z.number(),
  variableCostPerUnit: z.number(),
  contributionMarginPerUnit: z.number(),
  contributionMarginRatio: z.number(),
  breakEvenUnitsExact: z.number(),
  breakEvenUnitsWhole: z.number().int(),
  breakEvenRevenue: z.number(),
  formulas: z.object({
    contributionMarginPerUnit: z.string(),
    contributionMarginRatio: z.string(),
    breakEvenUnitsExact: z.string(),
    breakEvenRevenue: z.string(),
  }),
});

const simpleRoiInputSchema = z.object({
  totalBenefits: finiteNonNegative,
  totalCosts: finitePositive,
  periodMonths: finitePositive.optional(),
});

const simpleRoiOutputSchema = z.object({
  totalBenefits: z.number(),
  totalCosts: z.number(),
  netBenefit: z.number(),
  roiRatio: z.number(),
  roiPercent: z.number(),
  periodMonths: z.number().nullable(),
  formula: z.string(),
});

function calculationError(error: unknown) {
  const message = error instanceof Error ? error.message : "Finance calculation failed.";
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}

export function registerFinanceTools(server: McpServer): void {
  server.registerTool(
    "calculate_break_even",
    {
      title: "Calculate break-even",
      description:
        "Deterministically calculate contribution margin, exact and whole-unit break-even volume, and break-even revenue from supplied fixed cost, unit price, and unit variable cost. The formulas are returned explicitly; this tool does not fetch financial data or infer missing costs.",
      inputSchema: breakEvenInputSchema,
      outputSchema: breakEvenOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async (input) => {
      try {
        const result = calculateBreakEven(input);
        return {
          structuredContent: result,
          content: [
            {
              type: "text",
              text: `Break-even is ${result.breakEvenUnitsExact} exact units (${result.breakEvenUnitsWhole} whole units when indivisible) or ${result.breakEvenRevenue} in revenue under the supplied cost/price assumptions.`,
            },
          ],
        };
      } catch (error) {
        return calculationError(error);
      }
    },
  );

  server.registerTool(
    "calculate_simple_roi",
    {
      title: "Calculate simple ROI",
      description:
        "Deterministically calculate simple, undiscounted ROI as (totalBenefits - totalCosts) / totalCosts from supplied totals, optionally preserving the caller's period in months. This is not NPV, IRR, annualized return, or a cash-flow timing model.",
      inputSchema: simpleRoiInputSchema,
      outputSchema: simpleRoiOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async (input) => {
      try {
        const result = calculateSimpleRoi(input);
        return {
          structuredContent: result,
          content: [
            {
              type: "text",
              text: `Simple ROI is ${result.roiPercent}% using ${result.formula}${result.periodMonths === null ? "; no time period was supplied" : ` over the supplied ${result.periodMonths}-month basis`}.`,
            },
          ],
        };
      } catch (error) {
        return calculationError(error);
      }
    },
  );
}
