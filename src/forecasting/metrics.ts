export interface ForecastErrorMetricsResult {
  count: number;
  meanError: number;
  mae: number;
  mse: number;
  rmse: number;
  mape: number | null;
  smape: number | null;
  zeroActualCount: number;
  zeroJointDenominatorCount: number;
  formulas: {
    meanError: string;
    mae: string;
    mse: string;
    rmse: string;
    mape: string;
    smape: string;
  };
  convention: string;
}

function validatePairs(actual: readonly number[], predicted: readonly number[]): void {
  if (actual.length !== predicted.length) {
    throw new Error("actual and predicted must have the same length.");
  }
  if (actual.length === 0) {
    throw new Error("Forecast error metrics require at least one actual/predicted pair.");
  }
  actual.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new Error(`actual[${index}] must be finite.`);
  });
  predicted.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new Error(`predicted[${index}] must be finite.`);
  });
}

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must remain finite.`);
  return value;
}

export function calculateForecastErrorMetrics(
  actual: readonly number[],
  predicted: readonly number[],
): ForecastErrorMetricsResult {
  validatePairs(actual, predicted);

  let signedSum = 0;
  let absoluteSum = 0;
  let squaredSum = 0;
  let absolutePercentageSum = 0;
  let symmetricPercentageSum = 0;
  let zeroActualCount = 0;
  let zeroJointDenominatorCount = 0;

  for (let index = 0; index < actual.length; index += 1) {
    const observed = actual[index] as number;
    const forecast = predicted[index] as number;
    const error = finite(forecast - observed, `error[${index}]`);
    const absoluteError = Math.abs(error);

    signedSum = finite(signedSum + error, "signed error sum");
    absoluteSum = finite(absoluteSum + absoluteError, "absolute error sum");
    squaredSum = finite(squaredSum + error * error, "squared error sum");

    if (observed === 0) {
      zeroActualCount += 1;
    } else {
      absolutePercentageSum = finite(
        absolutePercentageSum + absoluteError / Math.abs(observed),
        "absolute percentage error sum",
      );
    }

    const symmetricDenominator = Math.abs(observed) + Math.abs(forecast);
    if (symmetricDenominator === 0) {
      zeroJointDenominatorCount += 1;
    } else {
      symmetricPercentageSum = finite(
        symmetricPercentageSum + (2 * absoluteError) / symmetricDenominator,
        "symmetric percentage error sum",
      );
    }
  }

  const count = actual.length;
  const mse = finite(squaredSum / count, "mse");
  return {
    count,
    meanError: finite(signedSum / count, "meanError"),
    mae: finite(absoluteSum / count, "mae"),
    mse,
    rmse: finite(Math.sqrt(mse), "rmse"),
    mape: zeroActualCount > 0 ? null : finite(absolutePercentageSum / count, "mape"),
    smape:
      zeroJointDenominatorCount > 0
        ? null
        : finite(symmetricPercentageSum / count, "smape"),
    zeroActualCount,
    zeroJointDenominatorCount,
    formulas: {
      meanError: "mean(predicted - actual)",
      mae: "mean(abs(predicted - actual))",
      mse: "mean((predicted - actual)^2)",
      rmse: "sqrt(mse)",
      mape: "mean(abs(predicted - actual) / abs(actual)); null if any actual == 0",
      smape:
        "mean(2 * abs(predicted - actual) / (abs(actual) + abs(predicted))); null if any joint denominator == 0",
    },
    convention:
      "All metrics use the same supplied pairs. Percentage metrics return null when their denominator convention is undefined; no rows are silently dropped and no epsilon is substituted.",
  };
}
