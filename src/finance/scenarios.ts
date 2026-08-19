export interface FinancialScenario {
  id: string;
  metrics: Readonly<Record<string, number>>;
}

export interface FinancialScenarioComparisonInput {
  baselineId: string;
  scenarios: readonly FinancialScenario[];
}

export interface ComparedFinancialScenario {
  id: string;
  metrics: Record<string, number>;
  deltasFromBaseline: Record<string, number>;
  percentDeltasFromBaseline: Record<string, number | null>;
}

export interface FinancialScenarioComparisonResult {
  baselineId: string;
  metricKeys: string[];
  scenarios: ComparedFinancialScenario[];
  formulas: {
    delta: string;
    percentDelta: string;
  };
  convention: string;
}

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  return value;
}

function sameKeys(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

export function compareFinancialScenarios(
  input: FinancialScenarioComparisonInput,
): FinancialScenarioComparisonResult {
  if (input.scenarios.length < 2) {
    throw new Error("Scenario comparison requires at least two scenarios.");
  }

  const ids = input.scenarios.map(({ id }) => id);
  if (ids.some((id) => !id.trim())) throw new Error("Scenario IDs must not be blank.");
  if (new Set(ids).size !== ids.length) throw new Error("Scenario IDs must be unique.");

  const baseline = input.scenarios.find(({ id }) => id === input.baselineId);
  if (!baseline) throw new Error(`baselineId ${input.baselineId} does not identify a supplied baseline scenario.`);

  const metricKeys = Object.keys(baseline.metrics).sort();
  if (metricKeys.length === 0) throw new Error("Scenario metrics must contain at least one metric key.");

  for (const scenario of input.scenarios) {
    const keys = Object.keys(scenario.metrics).sort();
    if (!sameKeys(keys, metricKeys)) {
      throw new Error("All scenarios must contain identical metric keys for deterministic comparison.");
    }
    for (const key of metricKeys) {
      finite(scenario.metrics[key] as number, `scenario ${scenario.id} metric ${key}`);
    }
  }

  const scenarios = input.scenarios.map((scenario) => {
    const metrics: Record<string, number> = {};
    const deltasFromBaseline: Record<string, number> = {};
    const percentDeltasFromBaseline: Record<string, number | null> = {};

    for (const key of metricKeys) {
      const value = scenario.metrics[key] as number;
      const baselineValue = baseline.metrics[key] as number;
      const delta = finite(value - baselineValue, `scenario ${scenario.id} delta ${key}`);
      metrics[key] = value;
      deltasFromBaseline[key] = delta;
      percentDeltasFromBaseline[key] =
        baselineValue === 0
          ? null
          : finite(delta / baselineValue, `scenario ${scenario.id} percent delta ${key}`);
    }

    return { id: scenario.id, metrics, deltasFromBaseline, percentDeltasFromBaseline };
  });

  return {
    baselineId: input.baselineId,
    metricKeys,
    scenarios,
    formulas: {
      delta: "scenarioMetric - baselineMetric",
      percentDelta: "baselineMetric === 0 ? null : (scenarioMetric - baselineMetric) / baselineMetric",
    },
    convention:
      "This engine compares caller-supplied scenario metrics only; it does not generate scenario assumptions or infer missing values.",
  };
}
