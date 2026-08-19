export interface SupplierSpendInput {
  id: string;
  name: string;
  spend: number;
}

export interface SupplierSpendAnalysisInput {
  suppliers: readonly SupplierSpendInput[];
  topN?: number;
}

export interface SupplierSpendRow extends SupplierSpendInput {
  rank: number;
  share: number | null;
  cumulativeShare: number | null;
}

export interface SupplierSpendAnalysisResult {
  totalSpend: number;
  topN: number;
  topNShare: number | null;
  suppliers: SupplierSpendRow[];
  convention: string;
}

export function analyzeSupplierSpend(
  input: SupplierSpendAnalysisInput,
): SupplierSpendAnalysisResult {
  if (input.suppliers.length === 0) {
    throw new Error("suppliers must contain at least one supplier.");
  }
  const topN = input.topN ?? Math.min(5, input.suppliers.length);
  if (!Number.isSafeInteger(topN) || topN < 1) {
    throw new Error("topN must be a positive safe integer.");
  }

  const seen = new Set<string>();
  const indexed = input.suppliers.map((supplier, index) => {
    if (!supplier.id.trim()) throw new Error(`suppliers[${index}].id must not be blank.`);
    if (!supplier.name.trim()) throw new Error(`suppliers[${index}].name must not be blank.`);
    if (seen.has(supplier.id)) throw new Error(`Duplicate supplier id: ${supplier.id}.`);
    seen.add(supplier.id);
    if (!Number.isFinite(supplier.spend) || supplier.spend < 0) {
      throw new Error(`suppliers[${index}].spend must be finite and greater than or equal to zero.`);
    }
    return { supplier, index };
  });

  const sorted = indexed.sort(
    (left, right) => right.supplier.spend - left.supplier.spend || left.index - right.index,
  );
  let totalSpend = 0;
  for (const { supplier } of sorted) {
    totalSpend += supplier.spend;
    if (!Number.isFinite(totalSpend)) throw new Error("totalSpend must remain finite.");
  }

  let cumulativeShare = 0;
  const suppliers = sorted.map(({ supplier }, index): SupplierSpendRow => {
    if (totalSpend === 0) {
      return { ...supplier, rank: index + 1, share: null, cumulativeShare: null };
    }
    const share = supplier.spend / totalSpend;
    cumulativeShare += share;
    return {
      ...supplier,
      rank: index + 1,
      share,
      cumulativeShare: index === sorted.length - 1 ? 1 : cumulativeShare,
    };
  });

  const boundedTopN = Math.min(topN, suppliers.length);
  const topNShare =
    totalSpend === 0
      ? null
      : suppliers.slice(0, boundedTopN).reduce((sum, supplier) => sum + (supplier.share ?? 0), 0);

  return {
    totalSpend,
    topN,
    topNShare,
    suppliers,
    convention:
      "Ranks and shares use caller-supplied spend only. Equal-spend ties preserve input order. This output does not infer supplier risk, quality, strategic importance, or substitutability.",
  };
}
