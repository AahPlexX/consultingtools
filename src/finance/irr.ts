export interface IrrInput {
  cashFlows: readonly number[];
}

export interface IrrSearchDomain {
  minimumRate: number;
  maximumRate: number;
  logarithmicIntervals: number;
  rootTolerance: number;
}

export interface IrrResult {
  cashFlows: number[];
  status: "unique" | "multiple" | "none";
  roots: number[];
  residualNpvs: number[];
  searchDomain: IrrSearchDomain;
  formula: string;
  convention: string;
  warning: string | null;
}

const MAX_CASH_FLOWS = 512;
const MINIMUM_RATE = -0.9999;
const MAXIMUM_RATE = 1000;
const LOG_INTERVALS = 20_000;
const ROOT_TOLERANCE = 1e-12;
const RATE_DEDUP_TOLERANCE = 1e-7;

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
}

function evaluateNpv(cashFlows: readonly number[], rate: number): number {
  const onePlusRate = 1 + rate;
  if (!(onePlusRate > 0) || !Number.isFinite(onePlusRate)) return Number.NaN;
  const inverse = 1 / onePlusRate;
  let value = cashFlows[cashFlows.length - 1] ?? 0;
  for (let index = cashFlows.length - 2; index >= 0; index -= 1) {
    value = value * inverse + (cashFlows[index] ?? 0);
  }
  return value;
}

function bisection(
  cashFlows: readonly number[],
  leftRate: number,
  rightRate: number,
  valueTolerance: number,
): number {
  let left = leftRate;
  let right = rightRate;
  let leftValue = evaluateNpv(cashFlows, left);

  for (let iteration = 0; iteration < 120; iteration += 1) {
    const middle = left + (right - left) / 2;
    const middleValue = evaluateNpv(cashFlows, middle);
    if (Number.isFinite(middleValue) && Math.abs(middleValue) <= valueTolerance) return middle;

    if (middle === left || middle === right) return middle;
    if (Math.sign(leftValue) === Math.sign(middleValue)) {
      left = middle;
      leftValue = middleValue;
    } else {
      right = middle;
    }
  }
  return left + (right - left) / 2;
}

function addRoot(roots: number[], candidate: number): void {
  if (!Number.isFinite(candidate) || candidate <= MINIMUM_RATE || candidate > MAXIMUM_RATE) return;
  const duplicate = roots.some(
    (existing) => Math.abs(existing - candidate) <= RATE_DEDUP_TOLERANCE * (1 + Math.abs(existing)),
  );
  if (!duplicate) roots.push(candidate);
}

export function calculateIrr(input: IrrInput): IrrResult {
  if (input.cashFlows.length < 2) {
    throw new Error("cashFlows must contain at least two periodic cash flows.");
  }
  if (input.cashFlows.length > MAX_CASH_FLOWS) {
    throw new Error(`cashFlows may contain at most ${MAX_CASH_FLOWS} values.`);
  }

  let hasPositive = false;
  let hasNegative = false;
  let absoluteScale = 0;
  input.cashFlows.forEach((cashFlow, index) => {
    assertFinite(cashFlow, `cashFlows[${index}]`);
    hasPositive ||= cashFlow > 0;
    hasNegative ||= cashFlow < 0;
    absoluteScale += Math.abs(cashFlow);
  });
  if (!hasPositive || !hasNegative) {
    throw new Error("IRR requires at least one positive and one negative periodic cash flow.");
  }

  const valueTolerance = ROOT_TOLERANCE * Math.max(1, absoluteScale);
  const minLog = Math.log1p(MINIMUM_RATE);
  const maxLog = Math.log1p(MAXIMUM_RATE);
  const roots: number[] = [];

  let previousRate = Math.expm1(minLog);
  let previousValue = evaluateNpv(input.cashFlows, previousRate);
  if (Number.isFinite(previousValue) && Math.abs(previousValue) <= valueTolerance) addRoot(roots, previousRate);

  for (let step = 1; step <= LOG_INTERVALS; step += 1) {
    const logRate = minLog + ((maxLog - minLog) * step) / LOG_INTERVALS;
    const rate = Math.expm1(logRate);
    const value = evaluateNpv(input.cashFlows, rate);

    if (Number.isFinite(value) && Math.abs(value) <= valueTolerance) {
      addRoot(roots, rate);
    }
    if (
      !Number.isNaN(previousValue) &&
      !Number.isNaN(value) &&
      previousValue !== 0 &&
      value !== 0 &&
      Math.sign(previousValue) !== Math.sign(value)
    ) {
      addRoot(roots, bisection(input.cashFlows, previousRate, rate, valueTolerance));
    }

    previousRate = rate;
    previousValue = value;
  }

  roots.sort((left, right) => left - right);
  const residualNpvs = roots.map((rate) => evaluateNpv(input.cashFlows, rate));
  const status = roots.length === 0 ? "none" : roots.length === 1 ? "unique" : "multiple";
  const warning =
    status === "multiple"
      ? "Multiple periodic IRR roots were detected in the documented search domain; no single root should be presented as uniquely correct."
      : status === "none"
        ? "No periodic IRR root was detected in the documented search domain."
        : null;

  return {
    cashFlows: [...input.cashFlows],
    status,
    roots,
    residualNpvs,
    searchDomain: {
      minimumRate: MINIMUM_RATE,
      maximumRate: MAXIMUM_RATE,
      logarithmicIntervals: LOG_INTERVALS,
      rootTolerance: ROOT_TOLERANCE,
    },
    formula: "Find r such that sum(cashFlows[t] / (1 + r)^t) = 0, t=0..n",
    convention:
      "cashFlows[0] occurs at t=0; all later cash flows occur at equal periodic intervals. Irregular-date XIRR is outside this engine.",
    warning,
  };
}
