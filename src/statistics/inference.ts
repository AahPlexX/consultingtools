import { calculateDescriptiveStatistics } from "./descriptive.js";
import { studentTCdf, studentTQuantile } from "./student-t.js";

export interface MeanConfidenceIntervalInput {
  values: readonly number[];
  confidenceLevel: number;
}

export interface MeanConfidenceIntervalResult {
  count: number;
  mean: number;
  sampleStandardDeviation: number;
  standardError: number;
  confidenceLevel: number;
  alpha: number;
  degreesOfFreedom: number;
  criticalValue: number;
  lower: number;
  upper: number;
  formula: string;
  assumptions: string[];
}

export interface WelchTTestInput {
  sampleA: readonly number[];
  sampleB: readonly number[];
  confidenceLevel: number;
}

export interface WelchTTestResult {
  countA: number;
  countB: number;
  meanA: number;
  meanB: number;
  sampleVarianceA: number;
  sampleVarianceB: number;
  meanDifference: number;
  standardError: number;
  degreesOfFreedom: number;
  tStatistic: number;
  twoSidedPValue: number;
  confidenceLevel: number;
  alpha: number;
  criticalValue: number;
  confidenceInterval: { lower: number; upper: number };
  rejectNullAtAlpha: boolean;
  interpretation: string;
  formulas: {
    tStatistic: string;
    degreesOfFreedom: string;
    confidenceInterval: string;
  };
  assumptions: string[];
}

function validateConfidenceLevel(confidenceLevel: number): void {
  if (!Number.isFinite(confidenceLevel) || confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error("confidenceLevel must be finite and strictly between 0 and 1.");
  }
}

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must remain finite.`);
  return value;
}

export function calculateMeanConfidenceInterval(
  input: MeanConfidenceIntervalInput,
): MeanConfidenceIntervalResult {
  validateConfidenceLevel(input.confidenceLevel);
  if (input.values.length < 2) {
    throw new Error("Mean confidence interval requires at least two observations.");
  }

  const stats = calculateDescriptiveStatistics(input.values);
  if (stats.sampleStandardDeviation === null) {
    throw new Error("Sample standard deviation is undefined for fewer than two observations.");
  }

  const degreesOfFreedom = stats.count - 1;
  const alpha = 1 - input.confidenceLevel;
  const criticalValue = studentTQuantile(1 - alpha / 2, degreesOfFreedom);
  const standardError = finite(
    stats.sampleStandardDeviation / Math.sqrt(stats.count),
    "standardError",
  );
  const margin = finite(criticalValue * standardError, "confidence interval margin");

  return {
    count: stats.count,
    mean: stats.mean,
    sampleStandardDeviation: stats.sampleStandardDeviation,
    standardError,
    confidenceLevel: input.confidenceLevel,
    alpha,
    degreesOfFreedom,
    criticalValue,
    lower: finite(stats.mean - margin, "confidence interval lower bound"),
    upper: finite(stats.mean + margin, "confidence interval upper bound"),
    formula: "mean ± t_(1-alpha/2, n-1) * sampleStandardDeviation / sqrt(n)",
    assumptions: [
      "Observations are an independent sample for the population parameter being estimated.",
      "The Student-t mean interval is appropriate for the sampling situation; strong non-normality or dependence may invalidate the stated coverage, especially for small samples.",
      "Population standard deviation is unknown and is estimated by the sample standard deviation.",
    ],
  };
}

export function calculateWelchTTest(input: WelchTTestInput): WelchTTestResult {
  validateConfidenceLevel(input.confidenceLevel);
  if (input.sampleA.length < 2 || input.sampleB.length < 2) {
    throw new Error("Welch t-test requires at least two observations in each sample.");
  }

  const a = calculateDescriptiveStatistics(input.sampleA);
  const b = calculateDescriptiveStatistics(input.sampleB);
  if (a.sampleVariance === null || b.sampleVariance === null) {
    throw new Error("Sample variance is undefined for the supplied sample size.");
  }

  const varianceTermA = a.sampleVariance / a.count;
  const varianceTermB = b.sampleVariance / b.count;
  const varianceOfDifference = finite(varianceTermA + varianceTermB, "variance of mean difference");
  if (varianceOfDifference <= Number.EPSILON * Math.max(1, Math.abs(a.mean), Math.abs(b.mean))) {
    throw new Error("Welch t-test is undefined because the estimated variance of the mean difference is effectively zero.");
  }

  const standardError = finite(Math.sqrt(varianceOfDifference), "standardError");
  const meanDifference = finite(a.mean - b.mean, "meanDifference");
  const tStatistic = finite(meanDifference / standardError, "tStatistic");

  const numerator = varianceOfDifference * varianceOfDifference;
  const denominator =
    (varianceTermA * varianceTermA) / (a.count - 1) +
    (varianceTermB * varianceTermB) / (b.count - 1);
  if (!(denominator > 0) || !Number.isFinite(denominator)) {
    throw new Error("Welch-Satterthwaite degrees of freedom are undefined because sample variance is effectively zero.");
  }
  const degreesOfFreedom = finite(numerator / denominator, "degreesOfFreedom");

  const upperTail = 1 - studentTCdf(Math.abs(tStatistic), degreesOfFreedom);
  const twoSidedPValue = Math.max(0, Math.min(1, finite(2 * upperTail, "twoSidedPValue")));
  const alpha = 1 - input.confidenceLevel;
  const criticalValue = studentTQuantile(1 - alpha / 2, degreesOfFreedom);
  const margin = finite(criticalValue * standardError, "confidence interval margin");
  const rejectNullAtAlpha = twoSidedPValue < alpha;

  return {
    countA: a.count,
    countB: b.count,
    meanA: a.mean,
    meanB: b.mean,
    sampleVarianceA: a.sampleVariance,
    sampleVarianceB: b.sampleVariance,
    meanDifference,
    standardError,
    degreesOfFreedom,
    tStatistic,
    twoSidedPValue,
    confidenceLevel: input.confidenceLevel,
    alpha,
    criticalValue,
    confidenceInterval: {
      lower: finite(meanDifference - margin, "confidence interval lower bound"),
      upper: finite(meanDifference + margin, "confidence interval upper bound"),
    },
    rejectNullAtAlpha,
    interpretation: rejectNullAtAlpha
      ? `The two-sided Welch test rejects the zero mean-difference null at alpha=${alpha}.`
      : `The two-sided Welch test has insufficient evidence to reject the zero mean-difference null at alpha=${alpha}; this does not prove the population means are equal.`,
    formulas: {
      tStatistic: "(meanA - meanB) / sqrt(sampleVarianceA/nA + sampleVarianceB/nB)",
      degreesOfFreedom:
        "(sA^2/nA + sB^2/nB)^2 / ((sA^2/nA)^2/(nA-1) + (sB^2/nB)^2/(nB-1))",
      confidenceInterval:
        "(meanA - meanB) ± t_(1-alpha/2, WelchDegreesOfFreedom) * standardError",
    },
    assumptions: [
      "The two samples are independent of each other and observations are independent within each sample.",
      "Welch's unequal-variance formulation is used; equal population variances are not assumed.",
      "The t-test model is appropriate for the sampling situation; dependence, severe non-normality, or influential outliers can invalidate inference.",
    ],
  };
}
