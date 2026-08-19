export interface ReorderPointInput {
  demandRatePerPeriod: number;
  leadTimePeriods: number;
  safetyStock: number;
}

export interface EoqInput {
  annualDemand: number;
  orderCost: number;
  carryingRate: number;
  unitCost: number;
}

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  if (value < 0) throw new Error(`${label} must be greater than or equal to zero.`);
}

function finitePositive(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
  if (value <= 0) throw new Error(`${label} must be greater than zero.`);
}

export function calculateReorderPoint(input: ReorderPointInput) {
  finiteNonNegative(input.demandRatePerPeriod, "demandRatePerPeriod");
  finiteNonNegative(input.leadTimePeriods, "leadTimePeriods");
  finiteNonNegative(input.safetyStock, "safetyStock");
  const demandDuringLeadTime = input.demandRatePerPeriod * input.leadTimePeriods;
  if (!Number.isFinite(demandDuringLeadTime)) throw new Error("demandDuringLeadTime must remain finite.");
  const reorderPoint = demandDuringLeadTime + input.safetyStock;
  if (!Number.isFinite(reorderPoint)) throw new Error("reorderPoint must remain finite.");
  return {
    ...input,
    demandDuringLeadTime,
    reorderPoint,
    formulas: {
      demandDuringLeadTime: "demandRatePerPeriod * leadTimePeriods",
      reorderPoint: "demandDuringLeadTime + safetyStock",
    },
    convention:
      "demandRatePerPeriod and leadTimePeriods must use the same time basis; safetyStock is caller supplied and no service-level or demand-variability model is inferred.",
  };
}

export function calculateEoq(input: EoqInput) {
  finiteNonNegative(input.annualDemand, "annualDemand");
  finitePositive(input.orderCost, "orderCost");
  finitePositive(input.carryingRate, "carryingRate");
  finitePositive(input.unitCost, "unitCost");
  const annualHoldingCostPerUnit = input.carryingRate * input.unitCost;
  if (!Number.isFinite(annualHoldingCostPerUnit) || annualHoldingCostPerUnit <= 0) {
    throw new Error("annualHoldingCostPerUnit must remain finite and greater than zero.");
  }
  const economicOrderQuantity = Math.sqrt(
    (2 * input.annualDemand * input.orderCost) / annualHoldingCostPerUnit,
  );
  if (!Number.isFinite(economicOrderQuantity)) {
    throw new Error("economicOrderQuantity must remain finite.");
  }
  return {
    ...input,
    annualHoldingCostPerUnit,
    economicOrderQuantity,
    formula: "sqrt(2 * annualDemand * orderCost / (carryingRate * unitCost))",
    convention:
      "Classical EOQ benchmark with fixed demand, fixed per-order cost, proportional annual holding cost, and no quantity discounts, stochastic service-level optimization, capacity constraints, perishability, or minimum order quantity.",
  };
}
