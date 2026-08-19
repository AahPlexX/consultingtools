import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { calculateAutocorrelation } from "./autocorrelation.js";
import {
  calculatePearsonCorrelation,
  calculateSpearmanCorrelation,
} from "./correlation.js";
import { calculateDescriptiveStatistics } from "./descriptive.js";
import {
  calculateMeanConfidenceInterval,
  calculateWelchTTest,
} from "./inference.js";
import { profileColumn } from "./profile.js";

const annotations = {
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
} as const;

const finite = z.number().finite();
const finiteSeries = z.array(finite).min(1).max(100_000);
const pairedSeries = z.array(finite).min(2).max(100_000);
const confidenceLevel = z.number().finite().gt(0).lt(1);

function toolError(error: unknown) {
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: error instanceof Error ? error.message : "Statistics calculation failed.",
      },
    ],
  };
}

function success<T extends object>(result: T, text: string) {
  return {
    structuredContent: result as Record<string, unknown>,
    content: [{ type: "text" as const, text }],
  };
}

export function registerStatisticsTools(server: McpServer): void {
  server.registerTool(
    "profile_data_column",
    {
      title: "Profile a data column",
      description:
        "Classify caller-supplied column values without coercion. Distinguishes null/undefined missingness, finite and non-finite numbers, strings, blank strings, booleans, arrays, objects, and other values; it does not convert numeric-looking strings into numbers.",
      inputSchema: z.object({ values: z.array(z.unknown()).max(100_000) }),
      annotations,
    },
    async ({ values }) => {
      try {
        const result = profileColumn(values);
        return success(result, `Profiled ${result.totalCount} values; ${result.missingCount} are missing and numericClean=${result.numericClean}.`);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "calculate_descriptive_statistics",
    {
      title: "Calculate descriptive statistics",
      description:
        "Calculate finite-number descriptive statistics using explicit N-1 sample variance and type-7 quantiles. Missing or non-numeric values must be handled before calling this tool; no coercion or silent omission occurs.",
      inputSchema: z.object({ values: finiteSeries }),
      annotations,
    },
    async ({ values }) => {
      try {
        const result = calculateDescriptiveStatistics(values);
        return success(result, `Calculated descriptive statistics for ${result.count} finite observations using ${result.quantileMethod} quantiles.`);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "calculate_correlation",
    {
      title: "Calculate correlation",
      description:
        "Calculate Pearson or tie-aware Spearman correlation for explicitly paired finite numeric observations. Correlation is rejected when either series has zero variance and does not imply causation.",
      inputSchema: z.object({
        kind: z.enum(["pearson", "spearman"]),
        x: pairedSeries,
        y: pairedSeries,
      }),
      annotations,
    },
    async ({ kind, x, y }) => {
      try {
        const result =
          kind === "pearson"
            ? calculatePearsonCorrelation(x, y)
            : calculateSpearmanCorrelation(x, y);
        return success(
          { kind, result },
          `${kind} correlation is ${result.correlation} across ${result.count} paired observations.`,
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "calculate_mean_confidence_interval",
    {
      title: "Calculate mean confidence interval",
      description:
        "Calculate a two-sided Student-t confidence interval for a population mean when population standard deviation is unknown. Returns assumptions, degrees of freedom, critical value, standard error, and interval bounds.",
      inputSchema: z.object({
        values: z.array(finite).min(2).max(100_000),
        confidenceLevel,
      }),
      annotations,
    },
    async (input) => {
      try {
        const result = calculateMeanConfidenceInterval(input);
        return success(result, `${result.confidenceLevel * 100}% mean confidence interval: [${result.lower}, ${result.upper}].`);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "calculate_welch_t_test",
    {
      title: "Calculate Welch two-sample t-test",
      description:
        "Calculate a two-sided unequal-variance Welch t-test for two independent finite numeric samples. Returns means, mean difference, Welch-Satterthwaite degrees of freedom, t statistic, p-value, confidence interval, assumptions, and a non-overstated interpretation.",
      inputSchema: z.object({
        sampleA: z.array(finite).min(2).max(100_000),
        sampleB: z.array(finite).min(2).max(100_000),
        confidenceLevel,
      }),
      annotations,
    },
    async (input) => {
      try {
        const result = calculateWelchTTest(input);
        return success(result, result.interpretation);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "calculate_autocorrelation",
    {
      title: "Calculate autocorrelation",
      description:
        "Calculate one lag autocorrelation for a finite, ordered, equally spaced series using the documented centered NIST-style convention. The tool does not infer, repair, or validate timestamps and rejects constant series.",
      inputSchema: z.object({
        values: z.array(finite).min(2).max(100_000),
        lag: z.number().int().positive(),
      }),
      annotations,
    },
    async ({ values, lag }) => {
      try {
        const result = calculateAutocorrelation(values, lag);
        return success(result, `Lag-${result.lag} autocorrelation is ${result.autocorrelation}.`);
      } catch (error) {
        return toolError(error);
      }
    },
  );
}
