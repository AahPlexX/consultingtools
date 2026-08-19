# Project, Operations & Supply-Chain Engines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. All deterministic work is test-first.

**Goal:** Build reproducible project-schedule, earned-value, capacity/flow, inventory/replenishment, procurement-spend, and weighted-decision primitives while making dependency logic, units, denominators, calendars, and assumptions explicit.

**Architecture:** Keep pure engines under `src/project/`, `src/operations/`, and `src/supply-chain/`. Host reasoning decides when the methods fit; deterministic code owns arithmetic, graph validation, feasibility checks, denominator behavior, ordering, and reproducible results. MCP tools remain focused, read-only, closed-world, and non-destructive. Catalog promotion remains narrower than primitive availability.

**Tech Stack:** TypeScript 7.0.2, Node 24, Vitest 4.1.10, Zod 4.4.3, `@modelcontextprotocol/server` 2.0.0, MCP 2026-07-28. No new runtime dependency is required for the initial envelope.

**Depends on:** Subproject 4 code verified on `35606810a45dc4dc057451096e859053ebbd9d51` through GitHub Actions run `32300232978`; its documentation verification subsequently completed successfully through run `32300502797`.

## Global constraints

- No engine infers calendars, holidays, resource availability, lag, lead time, unit conversion, demand distributions, supplier scores, or missing values.
- Critical-path scope in this subproject is a deterministic activity-on-node DAG with finish-to-start, zero-lag dependencies and one common duration unit. Other relationship types, lags/leads, resource leveling, calendars, and probabilistic schedule risk are outside this primitive.
- Multiple critical paths are valid. Criticality is determined from total float at a documented numeric tolerance, not by picking one arbitrary longest chain.
- Activities may have zero duration; durations may not be negative or non-finite.
- Three-point estimation uses caller-supplied optimistic, most-likely, and pessimistic values with `optimistic <= mostLikely <= pessimistic`. The implemented weighted estimate is `(O + 4M + P) / 6`; standard deviation is `(P - O) / 6`; variance is its square. The result is an estimate, not a probability guarantee.
- Earned value uses explicit PV, EV, and AC values. `SV = EV - PV`, `CV = EV - AC`, `SPI = EV/PV`, `CPI = EV/AC`. Ratio results are `null` where denominators are zero rather than infinite. Forecast formulas such as EAC are not inferred unless explicitly implemented.
- Capacity utilization uses an explicit caller-defined used/available capacity pair in the same unit: `usedCapacity / availableCapacity`. It is not automatically equated with labor utilization, OEE, throughput, or productivity.
- Throughput is `completedUnits / elapsedTime`; average cycle time is `elapsedTime / completedUnits`. The tool does not claim station-level bottleneck or queueing diagnosis from those two values alone.
- Flow-time/Little-style calculations, if added, require a stated steady-state/stable-flow assumption; do not imply that identity is causal or valid during arbitrary transients.
- Reorder point is `demandDuringLeadTime + safetyStock`. When average demand rate and lead time are supplied, `demandDuringLeadTime = demandRatePerPeriod * leadTimePeriods` using the same time basis.
- EOQ in this subproject uses the classical fixed-demand/fixed-cost expression `sqrt(2 * annualDemand * orderCost / annualHoldingCostPerUnit)`. If holding cost is supplied as a carrying-rate fraction and unit cost, annual holding cost per unit is `carryingRate * unitCost`. This is a planning benchmark; quantity discounts, stochastic demand, capacity limits, perishability, minimum order quantities, and service-level optimization are outside the formula.
- Supplier-spend analysis ranks supplied spend only; it does not infer supplier risk, quality, strategic importance, or substitution difficulty.
- Weighted decision scoring accepts caller-supplied commensurate scores and non-negative weights; it must not automatically normalize unrelated raw units into a pseudo-objective score.
- `main` remains the sole authoritative branch.

## Current-date research basis

As of 2026-08-19, GAO's schedule-assessment guidance treats a logic-driven critical path as a core schedule-reliability control and emphasizes that schedules should be complete, logically sequenced, and traceable. DOE project-management guidance defines critical-path and earned-value concepts and documents PV/EV/AC-based variance/performance relationships. Microsoft Project documentation describes total slack as the delay available before a task affects the project finish. NIST operations guidance treats capacity, throughput, productivity, utilization, and cycle time as distinct performance measures rather than interchangeable labels. Oracle/SAP replenishment documentation defines reorder point around forecast/demand during lead time plus safety stock; Oracle inventory documentation provides the classical EOQ relation between demand, ordering cost, and holding cost.

---

### Task 1: Critical Path and Float Engine

**Files:**
- Create: `src/project/critical-path.ts`
- Create: `tests/project-critical-path.test.ts`

**Interfaces:**
- `calculateCriticalPath({ activities })` where each activity has `{ id, duration, predecessorIds }`.
- Result returns topological order, project duration, each activity's ES/EF/LS/LF/totalFloat, critical IDs, and all critical finish paths that can be reconstructed without exponential unbounded output.

- [ ] Write RED tests for a known network, parallel paths, multiple critical paths, zero-duration milestones, unknown predecessor, duplicate ID, negative duration, and cycle rejection.
- [ ] Implement deterministic Kahn topological ordering, forward pass, backward pass, float, and bounded critical-path reconstruction.
- [ ] Verify full suite GREEN.

---

### Task 2: Three-Point / PERT-Style Estimate Primitive

**Files:**
- Create: `src/project/three-point.ts`
- Create: `tests/project-three-point.test.ts`

**Interfaces:**
- `calculateThreePointEstimate({ optimistic, mostLikely, pessimistic })` returns weighted expected value, standard deviation, variance, simple triangular mean `(O+M+P)/3` for comparison, and formulas.

- [ ] RED tests for exact fixtures and order/finite validation.
- [ ] Implement only the named arithmetic; do not turn the output into a schedule-confidence percentile.
- [ ] Verify GREEN.

---

### Task 3: Earned Value Performance Engine

**Files:**
- Create: `src/project/earned-value.ts`
- Create: `tests/project-earned-value.test.ts`

**Interfaces:**
- `calculateEarnedValuePerformance({ plannedValue, earnedValue, actualCost })`.
- Result returns SV, CV, SPI/CPI-or-null, and formulas.

- [ ] RED tests for on/under/over-plan fixtures and zero denominators.
- [ ] Implement finite non-negative PV/EV/AC checks and null ratios at zero denominator.
- [ ] Verify GREEN.

---

### Task 4: Capacity, Utilization, Throughput, and Cycle-Time Primitives

**Files:**
- Create: `src/operations/performance.ts`
- Create: `tests/operations-performance.test.ts`

**Interfaces:**
- `calculateCapacityUtilization({ usedCapacity, availableCapacity })`.
- `calculateFlowPerformance({ completedUnits, elapsedTime })` returns throughput and average cycle time.

- [ ] RED tests for exact ratios, >100% utilization as a mathematically valid signal rather than automatic rejection, zero denominators, non-finite/negative values, and formula metadata.
- [ ] Implement without inventing capacity definitions or unit conversions.
- [ ] Verify GREEN.

---

### Task 5: Reorder Point and Classical EOQ

**Files:**
- Create: `src/supply-chain/inventory.ts`
- Create: `tests/supply-chain-inventory.test.ts`

**Interfaces:**
- `calculateReorderPoint({ demandRatePerPeriod, leadTimePeriods, safetyStock })`.
- `calculateEoq({ annualDemand, orderCost, carryingRate, unitCost })`.

- [ ] RED tests for exact reorder-point/EOQ fixtures, zero-demand behavior, positive lead/cost conditions, and finite values.
- [ ] Implement explicit formula/convention metadata and classical-model limitations.
- [ ] Verify GREEN.

---

### Task 6: Supplier Spend Concentration

**Files:**
- Create: `src/supply-chain/spend.ts`
- Create: `tests/supply-chain-spend.test.ts`

**Interfaces:**
- `analyzeSupplierSpend({ suppliers, topN? })` where each supplier has unique ID/name and non-negative spend.
- Result returns total spend, descending rank, share, cumulative share, selected top-N share, and zero-total handling.

- [ ] RED tests for ranking, ties, cumulative shares, duplicate IDs, zero-spend portfolio, and finite values.
- [ ] Implement stable deterministic sorting and no supplier-risk inference.
- [ ] Verify GREEN.

---

### Task 7: Weighted Decision Scoring

**Files:**
- Create: `src/operations/weighted-decision.ts`
- Create: `tests/operations-weighted-decision.test.ts`

**Interfaces:**
- `calculateWeightedDecision({ criteria, options })` where criteria provide ID and non-negative weight and each option provides one finite already-comparable score per criterion.
- Result normalizes weights to sum 1, calculates weighted totals, and ranks options.

- [ ] RED tests for exact weighted scores, tie stability, missing/extra criteria, all-zero weights, duplicate IDs, and finite values.
- [ ] Implement no automatic score normalization across unlike units.
- [ ] Verify GREEN.

---

### Task 8: Expose Focused Project/Operations/Supply-Chain MCP Tools

**Files:**
- Create: `src/project/register-tools.ts`
- Create: `src/operations/register-tools.ts`
- Create: `src/supply-chain/register-tools.ts`
- Modify: `src/server.ts`
- Create: `tests/project-tools.test.ts`
- Create: `tests/operations-tools.test.ts`
- Create: `tests/supply-chain-tools.test.ts`

**MCP tools:**
- `calculate_critical_path`
- `calculate_three_point_estimate`
- `calculate_earned_value_performance`
- `calculate_capacity_utilization`
- `calculate_flow_performance`
- `calculate_weighted_decision`
- `calculate_reorder_point`
- `calculate_eoq`
- `analyze_supplier_spend`

All annotations: read-only true, open-world false, destructive false.

- [ ] Write failing HTTP MCP tests before registration.
- [ ] Register bounded Zod schemas matching the pure engines.
- [ ] Verify invalid-domain errors and full MCP 2026-07-28 regression suite.

---

### Task 9: Catalog Truth Bindings

**Files:**
- Modify: `src/catalog/verified-promotions.ts`
- Modify: `tests/catalog-status-truth.test.ts`

**Promotion policy:**
- `critical-path` may be implemented only if the catalog claim matches the zero-lag FS DAG envelope; otherwise partial with engine binding.
- `pert-estimate`, `earned-value`, capacity/utilization/throughput/cycle-time, inventory, sourcing/spend, and weighted-decision capabilities receive engine bindings but remain partial whenever their user-visible claim contains broader diagnosis or planning interpretation.
- No supplier-risk, network optimization, service-level optimization, capacity planning, or resource-leveling capability becomes implemented from these primitives alone.

- [ ] Write RED status/engine-binding assertions.
- [ ] Apply the narrowest truthful promotions through `verified-promotions.ts`.
- [ ] Verify breadth, overlap, routing, and full regressions.

---

### Task 10: Documentation and Full Verification

**Files:**
- Modify: `README.md`
- Modify: `skills/analysis-and-reporting/SKILL.md`
- Modify: `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`

- [ ] Document exact schedule, EVM, capacity, reorder-point, EOQ, spend, and weighted-score boundaries.
- [ ] Run/observe `npm run verify` on code HEAD; require terminal success.
- [ ] Record exact verified SHA and Actions run ID.
- [ ] Verify documentation HEAD again.
- [ ] Confirm only `main` exists.

## Self-review

- The plan satisfies the Subproject 5 roadmap minimum: critical path/schedule, capacity/utilization/throughput, weighted decisions, inventory/procurement, and operational diagnostics where definitions are deterministic.
- Calendar/resource-leveling complexity is excluded from the first CPM primitive rather than hidden.
- Replenishment formulas expose their classical assumptions and do not claim stochastic service-level optimization.
- Procurement-spend ranking is not relabeled as supplier-risk assessment.
- No capability promotion is implied merely because a primitive exists.
