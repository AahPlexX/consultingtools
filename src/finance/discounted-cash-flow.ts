export interface NpvInput {
  cashFlows: readonly number[];
  discountRatePerPeriod: number;
}

export interface NpvPresentValueRow {
  period: number;
  cashFlow: number;
  discountFactor: number;
  presentValue: number;
}

export interface NpvResult {
  cashFlows: number[];
  discountRatePerPeriod: number;
  presentValues: NpvPresentValueRow[];
  npv: number;
  formula: string;
  convention: string;
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be finite.`);
  }
}

function assertFiniteResult(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must remain finite within the supported numeric range.`);
  }
  return value;
}

export function calculateNpv(input: NpvInput): NpvResult {
  if (input.cashFlows.length === 0) {
    throw new Error("cashFlows must contain at least one periodic cash flow.");
  }

  assertFinite(input.discountRatePerPeriod, "discountRatePerPeriod");
  if (input.discountRatePerPeriod <= -1) {
    throw new Error("discountRatePerPeriod must be greater than -1 (-100%).");
  }

  const presentValues = input.cashFlows.map((cashFlow, period) => {
    assertFinite(cashFlow, `cashFlows[${period}]`);
    const discountFactor = Math.pow(1 + input.discountRatePerPeriod, period);
    if (!Number.isFinite(discountFactor) || discountFactor <= 0) {
      throw new Error(`discount factor for period ${period} must remain finite and positive.`);
    }
    const presentValue = assertFiniteResult(
      cashFlow / discountFactor,
      `present value for period ${period}`,
    );
    return { period, cashFlow, discountFactor, presentValue };
  });

  let npv = 0;
  for (const row of presentValues) {
    npv = assertFiniteResult(npv + row.presentValue, "NPV");
  }

  return {
    cashFlows: [...input.cashFlows],
    discountRatePerPeriod: input.discountRatePerPeriod,
    presentValues,
    npv,
    formula: "NPV = sum(cashFlows[t] / (1 + discountRatePerPeriod)^t), t=0..n",
    convention:
      "cashFlows[0] occurs at t=0 and is not discounted; each later array element occurs one equal period later.",
  };
}
