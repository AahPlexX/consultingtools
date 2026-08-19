import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { calculateNpv, calculateNpvSensitivity } from "./discounted-cash-flow.js";
import { calculateIrr } from "./irr.js";
import { calculatePayback, type PaybackInput } from "./payback.js";
import {
  calculateEfficiencyRatios,
  calculateLeverageRatios,
  calculateLiquidityRatios,
  calculateMarginRatios,
  calculateReturnRatios,
} from "./ratios.js";
import { compareFinancialScenarios } from "./scenarios.js";
import { calculateBudgetVariance } from "./variance.js";
import {
  calculateCashConversionCycle,
  calculateWorkingCapital,
} from "./working-capital.js";

const annotations = {
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
} as const;

const finite = z.number().finite();
const finiteNonNegative = finite.min(0);
const finitePositive = finite.positive();
const discountRate = finite.gt(-1);
const cashFlows = z.array(finite).min(1).max(512);

const npvInputSchema = z.object({
  cashFlows,
  discountRatePerPeriod: discountRate,
});
const npvOutputSchema = z.object({
  cashFlows: z.array(z.number()),
  discountRatePerPeriod: z.number(),
  presentValues: z.array(z.object({
    period: z.number().int().nonnegative(),
    cashFlow: z.number(),
    discountFactor: z.number(),
    presentValue: z.number(),
  })),
  npv: z.number(),
  formula: z.string(),
  convention: z.string(),
});

const paybackInputSchema = z.object({
  cashFlows,
  discountRatePerPeriod: discountRate.optional(),
});
const paybackOutputSchema = z.object({
  cashFlows: z.array(z.number()),
  mode: z.enum(["simple", "discounted"]),
  discountRatePerPeriod: z.number().nullable(),
  rows: z.array(z.object({
    period: z.number().int().nonnegative(),
    cashFlow: z.number(),
    discountFactor: z.number(),
    effectiveCashFlow: z.number(),
    cumulativeCashFlow: z.number(),
  })),
  recovered: z.boolean(),
  wholePeriodsBeforeRecovery: z.number().int().nonnegative().nullable(),
  fractionOfRecoveryPeriod: z.number().nullable(),
  paybackPeriod: z.number().nullable(),
  convention: z.string(),
});

const irrInputSchema = z.object({ cashFlows: z.array(finite).min(2).max(512) });
const irrOutputSchema = z.object({
  cashFlows: z.array(z.number()),
  status: z.enum(["unique", "multiple", "none"]),
  roots: z.array(z.number()),
  residualNpvs: z.array(z.number()),
  searchDomain: z.object({
    minimumRate: z.number(),
    maximumRate: z.number(),
    logarithmicIntervals: z.number().int().positive(),
    rootTolerance: z.number().positive(),
  }),
  formula: z.string(),
  convention: z.string(),
  warning: z.string().nullable(),
});

const workingCapitalInputSchema = z.object({
  currentAssets: finiteNonNegative,
  currentLiabilities: finiteNonNegative,
});
const workingCapitalOutputSchema = z.object({
  currentAssets: z.number(),
  currentLiabilities: z.number(),
  workingCapital: z.number(),
  formula: z.string(),
});

const cashConversionInputSchema = z.object({
  averageInventory: finiteNonNegative,
  averageReceivables: finiteNonNegative,
  averagePayables: finiteNonNegative,
  costOfSales: finitePositive,
  netCreditSales: finitePositive,
  purchasesOrCostBasis: finitePositive,
  daysInPeriod: finitePositive,
});
const cashConversionOutputSchema = z.object({
  averageInventory: z.number(),
  averageReceivables: z.number(),
  averagePayables: z.number(),
  costOfSales: z.number(),
  netCreditSales: z.number(),
  purchasesOrCostBasis: z.number(),
  daysInPeriod: z.number(),
  daysInventoryOutstanding: z.number(),
  daysSalesOutstanding: z.number(),
  daysPayablesOutstanding: z.number(),
  cashConversionCycleDays: z.number(),
  formulas: z.object({
    daysInventoryOutstanding: z.string(),
    daysSalesOutstanding: z.string(),
    daysPayablesOutstanding: z.string(),
    cashConversionCycleDays: z.string(),
  }),
});

const ratioInputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("liquidity"),
    currentAssets: finiteNonNegative,
    currentLiabilities: finitePositive,
    cashAndEquivalents: finiteNonNegative,
    marketableSecurities: finiteNonNegative,
    accountsReceivable: finiteNonNegative,
  }),
  z.object({
    kind: z.literal("leverage"),
    debt: finiteNonNegative,
    shareholdersEquity: finite.refine((value) => value !== 0, "shareholdersEquity must be non-zero"),
  }),
  z.object({
    kind: z.literal("margins"),
    revenue: finitePositive,
    grossProfit: finite,
    operatingIncome: finite,
    netIncome: finite,
  }),
  z.object({
    kind: z.literal("efficiency"),
    costOfSales: finiteNonNegative,
    averageInventory: finitePositive,
    revenue: finiteNonNegative,
    averageAssets: finitePositive,
  }),
  z.object({
    kind: z.literal("returns"),
    netIncome: finite,
    averageAssets: finitePositive,
    averageEquity: finite.refine((value) => value !== 0, "averageEquity must be non-zero"),
  }),
]);

const budgetVarianceInputSchema = z.object({
  budget: finite,
  actual: finite,
  favorableDirection: z.enum(["higher", "lower"]),
});
const budgetVarianceOutputSchema = z.object({
  budget: z.number(),
  actual: z.number(),
  favorableDirection: z.enum(["higher", "lower"]),
  absoluteVariance: z.number(),
  percentVariance: z.number().nullable(),
  favorable: z.boolean(),
  formulas: z.object({ absoluteVariance: z.string(), percentVariance: z.string() }),
});

const scenarioInputSchema = z.object({
  baselineId: z.string().trim().min(1).max(128),
  scenarios: z.array(z.object({
    id: z.string().trim().min(1).max(128),
    metrics: z.record(z.string().trim().min(1).max(128), finite),
  })).min(2).max(20),
});
const scenarioOutputSchema = z.object({
  baselineId: z.string(),
  metricKeys: z.array(z.string()),
  scenarios: z.array(z.object({
    id: z.string(),
    metrics: z.record(z.string(), z.number()),
    deltasFromBaseline: z.record(z.string(), z.number()),
    percentDeltasFromBaseline: z.record(z.string(), z.number().nullable()),
  })),
  formulas: z.object({ delta: z.string(), percentDelta: z.string() }),
  convention: z.string(),
});

const sensitivityInputSchema = z.object({
  cashFlows,
  discountRatesPerPeriod: z.array(discountRate).min(1).max(100),
});
const sensitivityOutputSchema = z.object({
  cashFlows: z.array(z.number()),
  results: z.array(z.object({ discountRatePerPeriod: z.number(), npv: z.number() })),
  formula: z.string(),
  convention: z.string(),
});

function calculationError(error: unknown) {
  return {
    isError: true as const,
    content: [{
      type: "text" as const,
      text: error instanceof Error ? error.message : "Finance calculation failed.",
    }],
  };
}

function success<T extends object>(result: T, text: string) {
  return {
    structuredContent: result as Record<string, unknown>,
    content: [{ type: "text" as const, text }],
  };
}

export function registerAdvancedFinanceTools(server: McpServer): void {
  server.registerTool(
    "calculate_npv",
    {
      title: "Calculate periodic NPV",
      description:
        "Calculate periodic NPV from caller-supplied cash flows with cashFlows[0] at t=0. This intentionally differs from Excel NPV's future-end-of-period argument convention and does not select or infer a discount rate.",
      inputSchema: npvInputSchema,
      outputSchema: npvOutputSchema,
      annotations,
    },
    async (input) => {
      try {
        const result = calculateNpv(input);
        return success(result, `Periodic NPV is ${result.npv} using the supplied rate and explicit t=0 convention.`);
      } catch (error) { return calculationError(error); }
    },
  );

  server.registerTool(
    "calculate_payback",
    {
      title: "Calculate payback period",
      description:
        "Calculate simple or discounted periodic payback from explicit cash flows. Supply discountRatePerPeriod for discounted payback; omit it for simple payback. Returns null when recovery never occurs.",
      inputSchema: paybackInputSchema,
      outputSchema: paybackOutputSchema,
      annotations,
    },
    async ({ cashFlows: values, discountRatePerPeriod }) => {
      try {
        const input: PaybackInput = { cashFlows: values };
        if (discountRatePerPeriod !== undefined) input.discountRatePerPeriod = discountRatePerPeriod;
        const result = calculatePayback(input);
        return success(result, result.recovered ? `${result.mode} payback occurs at period ${result.paybackPeriod}.` : `No ${result.mode} payback occurs in the supplied cash-flow horizon.`);
      } catch (error) { return calculationError(error); }
    },
  );

  server.registerTool(
    "calculate_irr",
    {
      title: "Calculate periodic IRR",
      description:
        "Search for periodic IRR roots that make NPV zero over the documented bounded domain. Detects none, one, or multiple roots and does not present the first numerical root as uniquely correct when multiple roots are found. This is not irregular-date XIRR.",
      inputSchema: irrInputSchema,
      outputSchema: irrOutputSchema,
      annotations,
    },
    async (input) => {
      try {
        const result = calculateIrr(input);
        return success(result, result.status === "unique" ? `Unique detected periodic IRR: ${result.roots[0]}.` : result.warning ?? "IRR calculation completed.");
      } catch (error) { return calculationError(error); }
    },
  );

  server.registerTool(
    "calculate_working_capital",
    {
      title: "Calculate working capital",
      description: "Calculate working capital strictly as currentAssets - currentLiabilities from caller-supplied statement values.",
      inputSchema: workingCapitalInputSchema,
      outputSchema: workingCapitalOutputSchema,
      annotations,
    },
    async (input) => {
      try {
        const result = calculateWorkingCapital(input);
        return success(result, `Working capital is ${result.workingCapital}.`);
      } catch (error) { return calculationError(error); }
    },
  );

  server.registerTool(
    "calculate_cash_conversion_cycle",
    {
      title: "Calculate cash conversion cycle",
      description:
        "Calculate DIO, DSO, DPO, and cash-conversion-cycle days from explicit average balances, flow denominators, and day-count basis. No missing accounting basis is inferred.",
      inputSchema: cashConversionInputSchema,
      outputSchema: cashConversionOutputSchema,
      annotations,
    },
    async (input) => {
      try {
        const result = calculateCashConversionCycle(input);
        return success(result, `Cash conversion cycle is ${result.cashConversionCycleDays} days on the supplied basis.`);
      } catch (error) { return calculationError(error); }
    },
  );

  server.registerTool(
    "calculate_financial_ratios",
    {
      title: "Calculate explicit financial ratios",
      description:
        "Calculate one explicit ratio family: liquidity, leverage, margins, efficiency, or returns. Formula definitions and required accounting bases are fixed by the selected kind; the tool does not substitute missing values or alternative definitions.",
      inputSchema: ratioInputSchema,
      annotations,
    },
    async (input) => {
      try {
        let result: Record<string, unknown>;
        switch (input.kind) {
          case "liquidity": result = calculateLiquidityRatios(input); break;
          case "leverage": result = calculateLeverageRatios(input); break;
          case "margins": result = calculateMarginRatios(input); break;
          case "efficiency": result = calculateEfficiencyRatios(input); break;
          case "returns": result = calculateReturnRatios(input); break;
        }
        return success({ kind: input.kind, result }, `Calculated ${input.kind} ratios using the explicit returned formulas.`);
      } catch (error) { return calculationError(error); }
    },
  );

  server.registerTool(
    "calculate_budget_variance",
    {
      title: "Calculate budget variance",
      description:
        "Calculate actual-minus-budget absolute and percentage variance and evaluate favorability only against the caller-supplied higher/lower direction. Percentage variance is null when budget is zero.",
      inputSchema: budgetVarianceInputSchema,
      outputSchema: budgetVarianceOutputSchema,
      annotations,
    },
    async (input) => {
      try {
        const result = calculateBudgetVariance(input);
        return success(result, `Absolute variance is ${result.absoluteVariance}; percent variance is ${result.percentVariance}.`);
      } catch (error) { return calculationError(error); }
    },
  );

  server.registerTool(
    "compare_financial_scenarios",
    {
      title: "Compare financial scenarios",
      description:
        "Compare caller-supplied scenarios with identical metric keys against a named baseline. Computes absolute and percentage deltas only; it does not generate assumptions, scenario values, or forecasts.",
      inputSchema: scenarioInputSchema,
      outputSchema: scenarioOutputSchema,
      annotations,
    },
    async (input) => {
      try {
        const result = compareFinancialScenarios(input);
        return success(result, `Compared ${result.scenarios.length} supplied scenarios across ${result.metricKeys.length} common metrics.`);
      } catch (error) { return calculationError(error); }
    },
  );

  server.registerTool(
    "calculate_npv_sensitivity",
    {
      title: "Calculate NPV sensitivity",
      description:
        "Recalculate the canonical periodic NPV across caller-supplied discount rates while preserving rate order. This is a bounded NPV sensitivity surface, not a general linked-driver scenario model.",
      inputSchema: sensitivityInputSchema,
      outputSchema: sensitivityOutputSchema,
      annotations,
    },
    async (input) => {
      try {
        const result = calculateNpvSensitivity(input);
        return success(result, `Calculated NPV at ${result.results.length} supplied discount rates.`);
      } catch (error) { return calculationError(error); }
    },
  );
}
