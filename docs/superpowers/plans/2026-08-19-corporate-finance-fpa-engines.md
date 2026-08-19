# Corporate Finance & FP&A Engines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Consulting Tools from break-even/simple-ROI arithmetic into reproducible corporate-finance and FP&A engines for periodic discounted cash flow analysis, IRR/payback, working capital, financial ratios, variance analysis, and bounded scenario/sensitivity operations while preserving explicit formulas, strict domain checks, and truthful catalog status.

**Architecture:** Keep pure deterministic calculation functions under `src/finance/` and expose only focused read-only MCP tools whose schemas match one financial definition. Calculations never fetch financial data or infer missing numbers. Host-model reasoning may interpret results, but deterministic tools own formulas, numeric validation, ambiguous-root detection, and reproducibility. Broad catalog capabilities are promoted only when the verified tool envelope covers the complete advertised outcome.

**Tech Stack:** TypeScript 7.0.2, Node 24, Vitest 4.1.10, Zod 4.4.3, `@modelcontextprotocol/server` 2.0.0, MCP 2026-07-28.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

**Depends on:** Subproject 2 verified on `e755062819629ae1eddf0abaece21dec47810748` through GitHub Actions run `32295888556`; documentation HEAD `03f2fb8adc0ed7881e10d4d9dadc5f3e1362b7a1` subsequently verified by `ci/verify`.

## Global Constraints

- Ordinary operation remains open-access and credential-free.
- Every tool is read-only, closed-world, non-destructive unless a later specification explicitly changes that boundary.
- Every numeric input must be finite; every result must be finite or return a deterministic validation error.
- Calculations must return explicit formula/convention metadata sufficient for independent reproduction.
- No engine may silently infer discount rates, forecast periods, cash-flow timing, accounting definitions, tax rates, or missing statement values.
- Discount rates are caller supplied. Do not hard-code government, market, hurdle, WACC, or benchmark rates.
- Periodic NPV in this product uses an explicit `cashFlows[0]` at `t=0`: `sum(cashFlows[t] / (1 + rate)^t)`. This intentionally differs from Excel `NPV`, which discounts listed values as future end-of-period cash flows and requires a beginning-of-period initial cash flow to be added separately.
- Periodic IRR requires at least one negative and one positive cash flow. The engine must detect zero, one, or multiple roots over its documented search domain and must never label one root as uniquely correct when multiple roots are detected.
- Irregular-date XNPV/XIRR are not part of this subproject and must not be implied by periodic NPV/IRR tools.
- Working capital uses `currentAssets - currentLiabilities`; cash-conversion calculations require explicit average balances, flow denominators, and day-count basis.
- Ratio names and formulas must be returned explicitly because accounting and analytical conventions can vary.
- Existing `calculate_break_even` and `calculate_simple_roi` behavior must remain backward compatible.
- Broad DCF valuation, cash-flow forecasting, PVM decomposition, and broad scenario-model generation remain `planned`/`partial` unless separately implemented and verified in this plan.
- `main` remains the sole authoritative branch.

## Current-date research basis

As of 2026-08-19, Microsoft Support documents periodic NPV values as equally spaced end-of-period future cash flows and notes that a beginning-of-period initial cash flow is added outside Excel's `NPV()` call. Microsoft documents IRR as a periodic cash-flow rate where NPV equals zero, requiring at least one positive and one negative cash flow, and notes that different starting guesses may return different acceptable IRRs when multiple roots exist. SEC financial-statement guidance defines working capital as current assets minus current liabilities and illustrates operating margin as income from operations divided by net revenues. OMB published 2026 A-94 discount-rate guidance, but generic business engines must still require the caller to supply the rate rather than embedding a government rate.

---

### Task 1: Periodic NPV Engine

**Files:**
- Create: `src/finance/discounted-cash-flow.ts`
- Create: `tests/finance-npv.test.ts`

**Interfaces:**
- Produces `calculateNpv(input: NpvInput): NpvResult`.
- `NpvInput = { cashFlows: readonly number[]; discountRatePerPeriod: number }`.
- `NpvResult` returns the original values, per-period present-value rows, total NPV, and the exact formula convention.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { calculateNpv } from "../src/finance/discounted-cash-flow.js";

describe("periodic NPV", () => {
  it("treats cashFlows[0] as t=0 and discounts later periodic cash flows", () => {
    const result = calculateNpv({ cashFlows: [-1000, 600, 600], discountRatePerPeriod: 0.1 });
    expect(result.npv).toBeCloseTo(41.3223140496, 10);
    expect(result.presentValues[0]).toMatchObject({ period: 0, cashFlow: -1000, presentValue: -1000 });
    expect(result.formula).toContain("t=0");
  });

  it("rejects an empty cash-flow series and a rate at or below -100 percent", () => {
    expect(() => calculateNpv({ cashFlows: [], discountRatePerPeriod: 0.1 })).toThrow(/cashFlows/);
    expect(() => calculateNpv({ cashFlows: [-1, 2], discountRatePerPeriod: -1 })).toThrow(/greater than -1/);
  });
});
```

- [ ] **Step 2: Run `npm test -- tests/finance-npv.test.ts` and verify RED**
- [ ] **Step 3: Implement finite-value checks and `sum(CF_t / (1+r)^t)` with t=0 explicit**
- [ ] **Step 4: Run focused tests and verify GREEN**
- [ ] **Step 5: Commit `feat: add periodic NPV engine`**

---

### Task 2: Simple and Discounted Payback Engine

**Files:**
- Create: `src/finance/payback.ts`
- Create: `tests/finance-payback.test.ts`

**Interfaces:**
- Produces `calculatePayback(input: PaybackInput): PaybackResult`.
- `PaybackInput = { cashFlows: readonly number[]; discountRatePerPeriod?: number }` where index 0 is t=0.
- Result reports cumulative rows, whether recovery occurs, whole period before recovery, fractional period when valid, and `paybackPeriod: number | null`.

- [ ] **Step 1: Write failing tests covering recovery inside a period, immediate recovery, never-recovered cash flows, and discounted payback**

```ts
expect(calculatePayback({ cashFlows: [-100, 60, 60] }).paybackPeriod).toBeCloseTo(1.6666666667, 10);
expect(calculatePayback({ cashFlows: [-100, 60, 60], discountRatePerPeriod: 0.1 }).paybackPeriod).toBeGreaterThan(1.8);
expect(calculatePayback({ cashFlows: [-100, 20, 20] }).paybackPeriod).toBeNull();
```

- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement cumulative recovery with linear interpolation only within the crossing period; reject invalid discount rates**
- [ ] **Step 4: Verify GREEN**
- [ ] **Step 5: Commit `feat: add payback engines`**

---

### Task 3: Periodic IRR with Ambiguity Detection

**Files:**
- Create: `src/finance/irr.ts`
- Create: `tests/finance-irr.test.ts`

**Interfaces:**
- Produces `calculateIrr(input: IrrInput): IrrResult`.
- Result `status` is `"unique" | "multiple" | "none"`; `roots` is a sorted finite array of periodic rates.
- Search domain is explicitly documented in the result. Root-finding uses bounded bracketing plus bisection, not a single Newton guess.

- [ ] **Step 1: Write failing tests**

```ts
expect(calculateIrr({ cashFlows: [-100, 110] })).toMatchObject({ status: "unique" });
expect(calculateIrr({ cashFlows: [-100, 230, -132] }).status).toBe("multiple");
expect(() => calculateIrr({ cashFlows: [1, 2, 3] })).toThrow(/positive.*negative/i);
```

The non-conventional series `[-100, 230, -132]` has two real periodic IRRs (10% and 20%) and is the required ambiguity fixture.

- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement NPV evaluation, a deterministic rate grid over `(-0.9999, 1000]`, sign-change bracketing, near-zero detection, bisection, root de-duplication, and explicit no/multiple-root output**
- [ ] **Step 4: Verify roots near 0.10 and 0.20 and run regression tests**
- [ ] **Step 5: Commit `feat: add ambiguity-aware periodic IRR`**

---

### Task 4: Working Capital and Cash Conversion Cycle

**Files:**
- Create: `src/finance/working-capital.ts`
- Create: `tests/finance-working-capital.test.ts`

**Interfaces:**
- `calculateWorkingCapital({ currentAssets, currentLiabilities })`.
- `calculateCashConversionCycle({ averageInventory, averageReceivables, averagePayables, costOfSales, netCreditSales, purchasesOrCostBasis, daysInPeriod })`.

- [ ] **Step 1: Write failing tests for working capital and DIO/DSO/DPO/CCC**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement `workingCapital = currentAssets - currentLiabilities`; `DIO = averageInventory / costOfSales * days`; `DSO = averageReceivables / netCreditSales * days`; `DPO = averagePayables / purchasesOrCostBasis * days`; `CCC = DIO + DSO - DPO`; reject zero/non-positive flow denominators and non-positive day count**
- [ ] **Step 4: Verify GREEN**
- [ ] **Step 5: Commit `feat: add working capital and cash conversion engines`**

---

### Task 5: Explicit Financial Ratio Engine

**Files:**
- Create: `src/finance/ratios.ts`
- Create: `tests/finance-ratios.test.ts`

**Interfaces:**
- Produce focused functions rather than one formula-string evaluator: `calculateLiquidityRatios`, `calculateLeverageRatios`, `calculateMarginRatios`, and `calculateEfficiencyRatios`.
- Return formula strings with every result.

- [ ] **Step 1: Write failing tests for current ratio, quick ratio, debt-to-equity, gross margin, operating margin, net margin, inventory turnover, asset turnover, ROA, and ROE with denominator guards**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement explicit definitions only; do not silently substitute missing values or alternative accounting bases**
- [ ] **Step 4: Verify GREEN**
- [ ] **Step 5: Commit `feat: add explicit financial ratio engines`**

---

### Task 6: Budget Variance and Bounded Scenario Comparison

**Files:**
- Create: `src/finance/variance.ts`
- Create: `src/finance/scenarios.ts`
- Create: `tests/finance-variance.test.ts`
- Create: `tests/finance-scenarios.test.ts`

**Interfaces:**
- `calculateBudgetVariance({ budget, actual, favorableDirection })` where `favorableDirection` is `"higher" | "lower"`.
- `compareFinancialScenarios({ baselineId, scenarios })` where each scenario contains a unique ID and a common finite metric map.

- [ ] **Step 1: Write failing variance tests**

```ts
expect(calculateBudgetVariance({ budget: 100, actual: 115, favorableDirection: "higher" })).toMatchObject({ absoluteVariance: 15, percentVariance: 0.15, favorable: true });
expect(calculateBudgetVariance({ budget: 0, actual: 10, favorableDirection: "higher" }).percentVariance).toBeNull();
```

- [ ] **Step 2: Write failing scenario-comparison tests requiring identical metric keys, unique IDs, finite values, and deltas from the baseline**
- [ ] **Step 3: Verify RED**
- [ ] **Step 4: Implement arithmetic only. Scenario comparison must not invent scenario values or claim that it generated the scenario model.**
- [ ] **Step 5: Verify GREEN**
- [ ] **Step 6: Commit `feat: add variance and scenario comparison engines`**

Broad price/volume/mix and full linked-driver scenario generation remain separate work because their decomposition conventions require a dedicated specification.

---

### Task 7: NPV Sensitivity Surface

**Files:**
- Modify: `src/finance/discounted-cash-flow.ts`
- Create: `tests/finance-sensitivity.test.ts`

**Interfaces:**
- Produces `calculateNpvSensitivity({ cashFlows, discountRatesPerPeriod })` returning one NPV for each caller-supplied rate using the exact Task 1 convention.

- [ ] **Step 1: Write failing tests verifying deterministic rate-order preservation, repeated use of the NPV convention, and rejection of empty/rate-invalid grids**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement by composing `calculateNpv`; do not create a second discounting formula**
- [ ] **Step 4: Verify GREEN**
- [ ] **Step 5: Commit `feat: add NPV sensitivity engine`**

This improves sensitivity support without falsely promoting the broad `sensitivity` capability to fully implemented.

---

### Task 8: Expose Focused Finance MCP Tools

**Files:**
- Modify: `src/finance/register-tools.ts`
- Modify/Create: `tests/finance-tools.test.ts`

**Interfaces:**
- Preserve `calculate_break_even`, `calculate_simple_roi`.
- Add focused tools: `calculate_npv`, `calculate_payback`, `calculate_irr`, `calculate_working_capital`, `calculate_cash_conversion_cycle`, `calculate_financial_ratios`, `calculate_budget_variance`, `compare_financial_scenarios`, `calculate_npv_sensitivity`.

- [ ] **Step 1: Add failing MCP contract tests for tool names, annotations, success results, and invalid-domain MCP errors**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Add Zod schemas matching each deterministic engine exactly. All annotations are `{ readOnlyHint: true, openWorldHint: false, destructiveHint: false }`.**
- [ ] **Step 4: Return structured content containing formulas/conventions, never opaque text-only arithmetic**
- [ ] **Step 5: Verify focused MCP and HTTP protocol tests**
- [ ] **Step 6: Commit `feat: expose corporate finance MCP tools`**

---

### Task 9: Promote Only Fully Covered Catalog Capabilities

**Files:**
- Modify: `src/catalog/families/finance-ma.ts`
- Modify: `tests/catalog-status-truth.test.ts`

**Interfaces:**
- `npv` may become `implemented` once `calculate_npv` and its QA tests are green.
- `irr` may become `implemented` only if ambiguity/no-root behavior is verified.
- `payback` may become `implemented` only if simple and discounted conventions are both represented by the engine.
- Broad `financial-ratios`, `working-capital`, `budget-variance`, `sensitivity`, and `scenario-modeling` remain `partial` because their catalog outcomes include interpretation/modeling beyond the narrow deterministic primitives.
- `dcf`, `cash-flow-forecast`, and PVM remain `planned` until separate engines exist.

- [ ] **Step 1: Write failing status/tool-ID assertions for NPV, IRR, and payback promotion**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Update only those three capability definitions with verified deterministic engine IDs and status**
- [ ] **Step 4: Verify status truth, routing metadata, breadth, and overlap suites**
- [ ] **Step 5: Commit `feat: promote verified investment appraisal capabilities`**

---

### Task 10: Documentation and Full Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`
- Modify: `skills/analysis-and-reporting/SKILL.md` only if deterministic finance routing guidance needs the new tool names.

- [ ] **Step 1: Update documentation with the exact implemented finance envelope and explicit periodic-vs-irregular cash-flow boundary**
- [ ] **Step 2: Run/observe `npm run verify` on the code HEAD and require `ci/verify: success`**
- [ ] **Step 3: Record exact verified SHA and GitHub Actions run ID in the roadmap**
- [ ] **Step 4: Verify the documentation HEAD again through `ci/verify`**
- [ ] **Step 5: Confirm branch enumeration contains only `main`**
- [ ] **Step 6: Commit `docs: record finance engine verification`**

## Self-review

- Spec coverage: the plan covers the Subproject 3 roadmap minimum—NPV, payback, financial ratios, working capital, variance, scenario/sensitivity—and additionally includes ambiguity-aware periodic IRR. DCF, forecasting, and PVM are intentionally not mislabeled as implemented.
- Placeholder scan: no TBD/TODO placeholders are used as implementation instructions.
- Type consistency: all later MCP/catalog tasks consume the named functions defined in earlier tasks.
- Safety/truth check: no engine fetches data, chooses a discount rate, infers accounting values, or turns a narrow arithmetic primitive into a broader consulting claim.
