export interface PaybackInput {
  cashFlows: readonly number[];
  discountRatePerPeriod?: number;
}

export interface PaybackRow {
  period: number;
  cashFlow: number;
  discountFactor: number;
  effectiveCashFlow: number;
  cumulativeCashFlow: number;
}

export interface PaybackResult {
  cashFlows: number[];
  mode: "simple" | "discounted";
  discountRatePerPeriod: number | null;
  rows: PaybackRow[];
  recovered: boolean;
  wholePeriodsBeforeRecovery: number | null;
  fractionOfRecoveryPeriod: number | null;
  paybackPeriod: number | null;
  convention: string;
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
}

function finiteResult(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must remain finite within the supported numeric range.`);
  }
  return value;
}

export function calculatePayback(input: PaybackInput): PaybackResult {
  if (input.cashFlows.length === 0) {
    throw new Error("cashFlows must contain at least one periodic cash flow.");
  }

  const rate = input.discountRatePerPeriod;
  if (rate !== undefined) {
    assertFinite(rate, "discountRatePerPeriod");
    if (rate <= -1) throw new Error("discountRatePerPeriod must be greater than -1 (-100%).");
  }

  const mode = rate === undefined ? "simple" : "discounted";
  const rows: PaybackRow[] = [];
  let cumulative = 0;
  let recovered = false;
  let wholePeriodsBeforeRecovery: number | null = null;
  let fractionOfRecoveryPeriod: number | null = null;
  let paybackPeriod: number | null = null;

  for (let period = 0; period < input.cashFlows.length; period += 1) {
    const cashFlow = input.cashFlows[period];
    if (cashFlow === undefined) throw new Error(`cashFlows[${period}] is missing.`);
    assertFinite(cashFlow, `cashFlows[${period}]`);

    const discountFactor = rate === undefined ? 1 : Math.pow(1 + rate, period);
    if (!Number.isFinite(discountFactor) || discountFactor <= 0) {
      throw new Error(`discount factor for period ${period} must remain finite and positive.`);
    }
    const effectiveCashFlow = finiteResult(cashFlow / discountFactor, `effective cash flow for period ${period}`);
    const cumulativeBefore = cumulative;
    cumulative = finiteResult(cumulative + effectiveCashFlow, `cumulative cash flow for period ${period}`);

    rows.push({ period, cashFlow, discountFactor, effectiveCashFlow, cumulativeCashFlow: cumulative });

    if (!recovered && cumulative >= 0) {
      recovered = true;
      if (period === 0 || cumulativeBefore >= 0) {
        wholePeriodsBeforeRecovery = 0;
        fractionOfRecoveryPeriod = 0;
        paybackPeriod = 0;
      } else {
        if (effectiveCashFlow <= 0) {
          throw new Error("Recovery crossing requires a positive effective cash flow in the recovery period.");
        }
        wholePeriodsBeforeRecovery = period - 1;
        fractionOfRecoveryPeriod = finiteResult(-cumulativeBefore / effectiveCashFlow, "fraction of recovery period");
        paybackPeriod = finiteResult(wholePeriodsBeforeRecovery + fractionOfRecoveryPeriod, "payback period");
      }
    }
  }

  return {
    cashFlows: [...input.cashFlows],
    mode,
    discountRatePerPeriod: rate ?? null,
    rows,
    recovered,
    wholePeriodsBeforeRecovery,
    fractionOfRecoveryPeriod,
    paybackPeriod,
    convention:
      mode === "simple"
        ? "cashFlows[0] occurs at t=0; later cash flows occur at equal periods and are accumulated without discounting."
        : "cashFlows[0] occurs at t=0; later cash flows occur at equal periods and are discounted by (1 + discountRatePerPeriod)^t before cumulative recovery is tested.",
  };
}
