import { describe, expect, it } from "vitest";
import { analyzeSupplierSpend } from "../src/supply-chain/spend.js";

describe("supplier spend concentration", () => {
  it("ranks suppliers by spend and calculates shares and cumulative shares", () => {
    const result = analyzeSupplierSpend({
      suppliers: [
        { id: "b", name: "Beta", spend: 20 },
        { id: "a", name: "Alpha", spend: 50 },
        { id: "c", name: "Gamma", spend: 30 },
      ],
      topN: 2,
    });
    expect(result.totalSpend).toBe(100);
    expect(result.suppliers).toEqual([
      { id: "a", name: "Alpha", spend: 50, rank: 1, share: 0.5, cumulativeShare: 0.5 },
      { id: "c", name: "Gamma", spend: 30, rank: 2, share: 0.3, cumulativeShare: 0.8 },
      { id: "b", name: "Beta", spend: 20, rank: 3, share: 0.2, cumulativeShare: 1 },
    ]);
    expect(result.topNShare).toBe(0.8);
  });

  it("uses stable input order to break equal-spend ties", () => {
    const result = analyzeSupplierSpend({
      suppliers: [
        { id: "first", name: "First", spend: 10 },
        { id: "second", name: "Second", spend: 10 },
      ],
    });
    expect(result.suppliers.map(({ id }) => id)).toEqual(["first", "second"]);
  });

  it("returns null shares for an all-zero portfolio instead of dividing by zero", () => {
    const result = analyzeSupplierSpend({
      suppliers: [
        { id: "a", name: "A", spend: 0 },
        { id: "b", name: "B", spend: 0 },
      ],
      topN: 1,
    });
    expect(result.totalSpend).toBe(0);
    expect(result.topNShare).toBeNull();
    expect(result.suppliers.every(({ share, cumulativeShare }) => share === null && cumulativeShare === null)).toBe(true);
  });

  it("rejects duplicate IDs, blank names, invalid topN, and negative/non-finite spend", () => {
    expect(() => analyzeSupplierSpend({ suppliers: [{ id: "a", name: "A", spend: 1 }, { id: "a", name: "B", spend: 2 }] })).toThrow(/duplicate/i);
    expect(() => analyzeSupplierSpend({ suppliers: [{ id: "a", name: " ", spend: 1 }] })).toThrow(/name/i);
    expect(() => analyzeSupplierSpend({ suppliers: [{ id: "a", name: "A", spend: 1 }], topN: 0 })).toThrow(/topN/i);
    expect(() => analyzeSupplierSpend({ suppliers: [{ id: "a", name: "A", spend: -1 }] })).toThrow(/spend/i);
  });
});
