# 100+ Capability Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy breadth catalog with at least 100 materially distinct, fully routing-described consulting capabilities across the approved domain families while preserving truthful implementation status and a compact MCP tool surface.

**Architecture:** Build domain-family modules of `RoutableCapabilityDefinition` records behind the verified catalog registry. Routing readiness describes metadata completeness, not implementation completion; capability `status` remains an independent truth boundary. Existing stable IDs are preserved, credential/account-dependent capabilities stay `unavailable`, broad file CRUD stays `planned`, and only capabilities whose currently verified execution envelope supports the full advertised outcome remain `implemented`.

**Tech Stack:** TypeScript 7.0.2, Node 24 CI types, Vitest 4.1.10, Zod 4.4.3, `@modelcontextprotocol/server` 2.0.0, existing MCP 2026-07-28 runtime.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

**Depends on:** Subproject 1 verified on `16e5d2938c0645df996c25982213952ed53916cb`; documentation HEAD subsequently verified through `ci/verify` on `5a16b45ff2a91f530a4317abee7a7d35f4a130d9`.

## Global Constraints

- Ordinary Consulting Tools functionality must remain open-access: no user API key, OAuth flow, account linking, or private-provider credential is required.
- Natural-language use is primary; capability IDs are internal routing/discovery identities, not promised native slash commands.
- Capability count and MCP tool count are separate. Do not add one MCP tool per capability.
- The baseline must contain at least 100 materially distinct user-visible capabilities and should exceed that threshold when additional entries are genuinely non-overlapping.
- Every catalog entry in the baseline must be `routingReady: true` and include positive triggers, anti-triggers, required/optional inputs, methodology, evidence requirement, outputs, QA gates, assumption/failure rules, access boundary, risk class, relationships, and evaluation-fixture IDs.
- Routing-ready does **not** imply `implemented`. Preserve or downgrade status when execution/QA evidence does not support a complete implementation claim.
- Credentialed/private-account capabilities remain `unavailable`; analyzing a user-supplied export is separate from connecting to its source system.
- Broad PDF/DOCX/XLSX/PPTX/CSV CRUD remains `planned` until format-specific quality/preservation gates are implemented.
- The catalog must not contain cosmetic aliases, duplicate names, duplicate stable IDs, or exact duplicate trigger/question sets masquerading as breadth.
- Existing working artifact, PDF, DOCX, finance, MCP, routing, epistemic, and QA behavior must remain green.
- `main` is the sole authoritative branch.

---

## File Structure

### New files

- `src/catalog/define.ts` — construction/invariant helper for routing-ready capability records.
- `src/catalog/families/strategy-market.ts` — strategy, corporate direction, market and competitive intelligence.
- `src/catalog/families/customer-growth.ts` — customer, sales, marketing, pricing, commercial growth.
- `src/catalog/families/finance-ma.ts` — corporate finance, FP&A, investment, M&A and diligence.
- `src/catalog/families/operations-supply.ts` — operations, process improvement, quality, supply chain, procurement, vendor strategy.
- `src/catalog/families/organization-project.ts` — organization, workforce, change, project/program/portfolio execution.
- `src/catalog/families/data-forecasting.ts` — data analysis, statistics, forecasting and planning.
- `src/catalog/families/research-risk-seo.ts` — research, fact checking, risk/assessment/audit, SEO/digital.
- `src/catalog/families/innovation-delivery-artifacts.ts` — brainstorming/innovation, comparison/selection, executive delivery, artifact and visualization outcomes.
- `src/catalog/families/index.ts` — ordered composition of all family modules.
- `tests/catalog-breadth.test.ts` — 100+ count, required-family coverage, stable-ID and status expectations.
- `tests/catalog-routing-metadata.test.ts` — routing metadata completeness and open-access invariants.
- `tests/catalog-overlap.test.ts` — duplicate/overlap detection and graph-reference integrity.
- `tests/catalog-status-truth.test.ts` — capability status assertions for currently bounded implementations and unavailable/planned envelopes.

### Modified files

- `src/catalog/types.ts` — add deterministic-engine and surface-requirement metadata required by the approved spec.
- `src/catalog/registry.ts` — compose the new family baseline instead of `legacyCapabilities`.
- `src/catalog/index.ts` — export family/definition helpers only when useful to tests; keep public search/lookup stable.
- `src/catalog/register-tools.ts` — make inspection expose full routing metadata while search remains concise.
- `src/catalog/relationships.ts` — expand typed prerequisite/follow-on/alternative/overlap relationships across newly cataloged capabilities.
- `src/catalog/legacy.ts` — retained temporarily only as a migration reference; no longer feeds the active registry after the family baseline lands.
- `tests/catalog.test.ts` — raise breadth expectation to 100+, preserve stable IDs/search behavior/file-CRUD truth boundaries.
- `tests/catalog-tools.test.ts` — verify detailed inspection and unchanged compact MCP tool count behavior.
- `skills/consulting-orchestrator/SKILL.md` — reference complete routing metadata and clarify that catalog breadth is discoverable without manual command memorization.
- `README.md` — document the verified 100+ baseline without implying every catalog entry is fully executable.
- `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md` — record Subproject 2 verification only after the final CI gate passes.

---

### Task 1: Strengthen the Routing Metadata Contract

**Files:**
- Modify: `src/catalog/types.ts`
- Create: `src/catalog/define.ts`
- Create: `tests/catalog-routing-metadata.test.ts`

**Interfaces:**
- Consumes: verified Subproject 1 `RoutableCapabilityDefinition`.
- Produces: `SurfaceRequirement`, complete `RoutableCapabilityDefinition`, `defineCapability(input)`.

- [ ] **Step 1: Write the failing metadata invariant tests**

```ts
import { describe, expect, it } from "vitest";
import { defineCapability } from "../src/catalog/define.js";

const base = {
  routingReady: true as const,
  id: "example",
  name: "Example",
  domain: "strategy" as const,
  subdomain: "example",
  mode: "reasoning" as const,
  status: "partial" as const,
  summary: "A materially distinct example capability for metadata validation.",
  businessQuestions: ["Which option best fits the stated objective?"],
  triggers: ["compare strategic options"],
  antiTriggers: ["calculate tax liability"],
  requiredInputs: ["decision objective"],
  optionalInputs: ["supporting evidence"],
  methodology: "Compare supported options against explicit criteria.",
  deterministicEngineIds: [],
  evidence: { level: "user-input-sufficient" as const, publicResearchAllowed: true },
  outputs: ["text" as const],
  artifactFormats: [],
  surfaceRequirements: ["host-reasoning" as const],
  qualityGates: ["consulting.problem-framing" as const, "epistemic.claim-classification" as const],
  assumptionPolicy: "State material assumptions.",
  failureBehavior: "State the evidence limitation rather than fabricating support.",
  access: { userCredentialRequired: false, privateAccountRequired: false },
  riskClass: "standard" as const,
  relatedCapabilityIds: [],
  conflictingCapabilityIds: [],
  evaluationFixtureIds: ["example-positive", "example-negative"],
};

describe("routing-ready capability definition", () => {
  it("accepts a complete open-access capability", () => {
    expect(defineCapability(base).id).toBe("example");
  });

  it("rejects a non-unavailable capability that requires private credentials", () => {
    expect(() =>
      defineCapability({
        ...base,
        access: { userCredentialRequired: true, privateAccountRequired: true },
      }),
    ).toThrow("open-access");
  });

  it("rejects empty trigger, anti-trigger, question, QA, or fixture contracts", () => {
    expect(() => defineCapability({ ...base, antiTriggers: [] })).toThrow("anti-trigger");
    expect(() => defineCapability({ ...base, evaluationFixtureIds: [] })).toThrow("evaluation fixture");
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

```bash
npm test -- tests/catalog-routing-metadata.test.ts
```

Expected: FAIL because `defineCapability` and `surfaceRequirements` do not exist.

- [ ] **Step 3: Extend `src/catalog/types.ts`**

Add:

```ts
export const surfaceRequirements = [
  "host-reasoning",
  "deterministic-engine",
  "public-web",
  "artifact-input",
  "artifact-output",
  "interactive-ui",
] as const;
export type SurfaceRequirement = (typeof surfaceRequirements)[number];
```

Add these required properties to `RoutableCapabilityDefinition`:

```ts
deterministicEngineIds: readonly string[];
surfaceRequirements: readonly SurfaceRequirement[];
```

- [ ] **Step 4: Implement `defineCapability`**

`defineCapability` must reject blank IDs/names/methodologies, empty business-question/trigger/anti-trigger/required-input/quality-gate/evaluation-fixture arrays, self references, and any capability whose `status !== "unavailable"` while `access.userCredentialRequired` or `access.privateAccountRequired` is true. Return a frozen shallow copy so family modules cannot accidentally mutate shared definitions.

- [ ] **Step 5: Run focused metadata tests**

```bash
npm test -- tests/catalog-routing-metadata.test.ts tests/catalog-metadata.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/catalog/types.ts src/catalog/define.ts tests/catalog-routing-metadata.test.ts tests/catalog-metadata.test.ts
git commit -m "feat: enforce complete capability routing metadata"
```

---

### Task 2: Build Strategy, Market, Customer, and Growth Families

**Files:**
- Create: `src/catalog/families/strategy-market.ts`
- Create: `src/catalog/families/customer-growth.ts`
- Create: `tests/catalog-breadth.test.ts`

**Interfaces:**
- Consumes: `defineCapability`.
- Produces: `strategyMarketCapabilities`, `customerGrowthCapabilities`.

- [ ] **Step 1: Write failing family-coverage tests**

```ts
import { describe, expect, it } from "vitest";
import { strategyMarketCapabilities } from "../src/catalog/families/strategy-market.js";
import { customerGrowthCapabilities } from "../src/catalog/families/customer-growth.js";

describe("strategy/market/customer/growth families", () => {
  it("preserves established stable IDs", () => {
    expect(strategyMarketCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["swot", "pestle", "porter-five-forces", "market-sizing", "entry-strategy"]),
    );
    expect(customerGrowthCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["segmentation", "jobs-to-be-done", "pricing-strategy", "funnel", "cro"]),
    );
  });

  it("adds distinct approved commercial outcomes", () => {
    expect(customerGrowthCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["sales-pipeline-diagnostic", "sales-territory-analysis", "packaging-analysis", "retention-analysis", "churn-analysis"]),
    );
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

```bash
npm test -- tests/catalog-breadth.test.ts
```

- [ ] **Step 3: Implement strategy/market capabilities**

Create full routing-ready definitions for the approved strategy and market outcomes, including the existing stable IDs. Add distinct outcomes where needed for strategic-option generation/comparison, turnaround, diversification, market maturity, barriers, substitutes, whitespace, feature/price normalization, trend synthesis, and public competitive intelligence. Do not create aliases whose business question/method/output is materially the same as an existing entry.

- [ ] **Step 4: Implement customer/growth capabilities**

Create full definitions for segmentation, ICP, evidence-supported personas, JTBD, VoC, journey/service blueprint, pricing, packaging, willingness-to-pay evidence assessment, positioning, product-market fit, funnel, cohorts, retention, churn, sales-pipeline diagnostics, territory analysis, channel mix, acquisition economics, CRO, and commercial growth planning.

Most broad reasoning workflows remain `partial` until method-specific evaluation evidence justifies promotion. Preserve `implemented` only where the full advertised capability currently has a verified execution envelope.

- [ ] **Step 5: Run family tests**

```bash
npm test -- tests/catalog-breadth.test.ts tests/catalog-routing-metadata.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/catalog/families/strategy-market.ts src/catalog/families/customer-growth.ts tests/catalog-breadth.test.ts
git commit -m "feat: catalog strategy market and commercial capabilities"
```

---

### Task 3: Build Finance, FP&A, M&A, Operations, and Supply-Chain Families

**Files:**
- Create: `src/catalog/families/finance-ma.ts`
- Create: `src/catalog/families/operations-supply.ts`
- Modify: `tests/catalog-breadth.test.ts`
- Create: `tests/catalog-status-truth.test.ts`

**Interfaces:**
- Produces: `financeMaCapabilities`, `operationsSupplyCapabilities`.

- [ ] **Step 1: Add failing required-ID/status assertions**

Require distinct entries for NPV, IRR, payback, DCF, financial ratios, working capital, cash conversion, budget variance, price/volume/mix, cash-flow forecasting, TCO, target screening, commercial/financial/operational diligence, synergy identification/sizing, integration complexity/planning, demand-supply diagnostic, inventory analysis, supplier segmentation/risk, sourcing, procurement opportunity, lead time, service-level tradeoff, network/cost diagnostic, make/buy, spend analysis, capacity/utilization/throughput, Pareto, root-cause, FMEA, control-plan design, and productivity analysis.

In `tests/catalog-status-truth.test.ts`, assert:

```ts
expect(getCapabilityById("break-even")?.status).toBe("implemented");
expect(getCapabilityById("roi")?.status).not.toBe("implemented");
expect(getCapabilityById("xlsx-crud")?.status).toBe("planned");
```

The current deterministic tool implements break-even; the broad `roi` capability is wider than the existing simple-ROI calculator and therefore must not be represented as fully implemented.

- [ ] **Step 2: Run tests and confirm failure**

```bash
npm test -- tests/catalog-breadth.test.ts tests/catalog-status-truth.test.ts
```

- [ ] **Step 3: Implement finance/M&A definitions**

Use `deterministicEngineIds` only when a real engine already exists. `break-even` may reference `calculate_break_even`; broad ROI remains `partial` despite the narrower `calculate_simple_roi` primitive. Planned NPV/IRR/DCF/forecasting capabilities must not imply current deterministic execution.

- [ ] **Step 4: Implement operations/supply definitions**

Separate diagnostic, quantitative, sourcing, risk, and implementation outcomes so the catalog does not confuse a process framework with a deterministic engine or a final recommendation.

- [ ] **Step 5: Run focused tests**

```bash
npm test -- tests/catalog-breadth.test.ts tests/catalog-status-truth.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/catalog/families/finance-ma.ts src/catalog/families/operations-supply.ts tests/catalog-breadth.test.ts tests/catalog-status-truth.test.ts
git commit -m "feat: catalog finance diligence operations and supply capabilities"
```

---

### Task 4: Build Organization, Project, Data, and Forecasting Families

**Files:**
- Create: `src/catalog/families/organization-project.ts`
- Create: `src/catalog/families/data-forecasting.ts`
- Modify: `tests/catalog-breadth.test.ts`

**Interfaces:**
- Produces: `organizationProjectCapabilities`, `dataForecastingCapabilities`.

- [ ] **Step 1: Add failing coverage assertions**

Require organization design, spans/layers, decision rights, RACI/RASCI, stakeholder analysis, capability/workforce/workload assessments, change readiness/impact/adoption risk, training needs, competency matrix, performance management, OKR/KPI/balanced-scorecard, transformation roadmap; plus charter, WBS, milestones, Gantt planning, dependency mapping, critical path, PERT, RAID/risk/issue/decision/action trackers, resource/budget plans, RAG status, change control, scope/deliverable tracking, earned value, release planning, portfolio prioritization; plus profiling/cleaning/missingness/descriptive statistics/distributions/percentiles/cross-tabs/group comparisons/correlation/regression/hypothesis testing/intervals/effect sizes/outliers/anomalies/time series/seasonality/clustering/reconciliation/forecast baselines/backtesting/error metrics/uncertainty/sensitivity.

- [ ] **Step 2: Run the focused coverage test and confirm failure**

```bash
npm test -- tests/catalog-breadth.test.ts
```

- [ ] **Step 3: Implement organization/project definitions**

Project capabilities must produce user-owned artifacts or structured plans without requiring Jira/Asana/Monday/Smartsheet credentials.

- [ ] **Step 4: Implement data/forecasting definitions**

Distinguish exploratory/statistical/forecasting outcomes. Do not label causal conclusions as implied by correlation or predictive fit. Deterministic/statistical engine IDs remain empty until the corresponding later engine subproject exists.

- [ ] **Step 5: Run focused tests**

```bash
npm test -- tests/catalog-breadth.test.ts tests/catalog-routing-metadata.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/catalog/families/organization-project.ts src/catalog/families/data-forecasting.ts tests/catalog-breadth.test.ts
git commit -m "feat: catalog organization project data and forecasting capabilities"
```

---

### Task 5: Build Research, Risk, SEO, Innovation, Delivery, Artifact, and Visualization Families

**Files:**
- Create: `src/catalog/families/research-risk-seo.ts`
- Create: `src/catalog/families/innovation-delivery-artifacts.ts`
- Modify: `tests/catalog-breadth.test.ts`
- Modify: `tests/catalog-status-truth.test.ts`

**Interfaces:**
- Produces: `researchRiskSeoCapabilities`, `innovationDeliveryArtifactCapabilities`.

- [ ] **Step 1: Add failing coverage and boundary assertions**

Require source discovery/ranking/freshness/claim mapping/corroboration/conflict detection/date normalization/quote verification/benchmark normalization/evidence quality/unsupported-claim detection/citation planning/research-gap/evidence synthesis; risk registers/matrices/control/gap/maturity/readiness/vendor/decision/MCDA/scenario/dependency/implementation-risk; technical/on-page/content/local SEO; ideation/convergence/constraint ideation/assumption reversal/opportunity mapping/pre-mortem/red-team/hypothesis/experiment/prioritization; comparison/build-buy/location/weighted/TCO/risk-adjusted selection; executive brief/decision memo/business case/strategy plan/operating plan/investment memo/diligence report/feasibility/proposal/assessment/board material/implementation plan/status report; and artifact/visualization outcomes.

Assert credentialed private metrics remain unavailable:

```ts
for (const id of ["seo-keyword-metrics", "seo-backlink-metrics", "seo-search-console"]) {
  expect(getCapabilityById(id)?.status).toBe("unavailable");
}
```

- [ ] **Step 2: Run focused tests and confirm failure**

```bash
npm test -- tests/catalog-breadth.test.ts tests/catalog-status-truth.test.ts
```

- [ ] **Step 3: Implement research/risk/SEO definitions**

Public-web capabilities may be `partial` until the anonymous retrieval subsystem is implemented. Private Search Console/proprietary SEO metrics remain `unavailable`; their definitions explicitly permit analysis of user-supplied exports without implying a connector.

- [ ] **Step 4: Implement innovation/delivery/artifact/visualization definitions**

Keep broad format CRUD `planned`. Represent currently bounded DOCX-template and PDF-metadata behavior through distinct narrow capabilities if they are useful user-visible outcomes; do not relabel them as broad CRUD.

- [ ] **Step 5: Run focused tests**

```bash
npm test -- tests/catalog-breadth.test.ts tests/catalog-status-truth.test.ts tests/catalog-routing-metadata.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/catalog/families/research-risk-seo.ts src/catalog/families/innovation-delivery-artifacts.ts tests/catalog-breadth.test.ts tests/catalog-status-truth.test.ts
git commit -m "feat: catalog research risk SEO innovation and deliverables"
```

---

### Task 6: Activate the 100+ Family Registry and Enforce Non-Overlap

**Files:**
- Create: `src/catalog/families/index.ts`
- Modify: `src/catalog/registry.ts`
- Modify: `src/catalog/relationships.ts`
- Modify: `src/catalog/index.ts`
- Create: `tests/catalog-overlap.test.ts`
- Modify: `tests/catalog.test.ts`

**Interfaces:**
- Consumes: all family arrays.
- Produces: active `capabilities` registry with `routingReady === true` for every baseline entry.

- [ ] **Step 1: Write failing active-registry invariants**

```ts
import { capabilities } from "../src/catalog.js";

it("activates at least 100 fully described capabilities", () => {
  expect(capabilities.length).toBeGreaterThanOrEqual(100);
  expect(capabilities.every(({ routingReady }) => routingReady)).toBe(true);
});
```

Add `tests/catalog-overlap.test.ts` to reject duplicate IDs, case-folded names, exact normalized summaries, exact normalized business-question sets, exact normalized trigger sets, self/conflicting dual relationships, and dangling relationship IDs.

- [ ] **Step 2: Run focused registry tests and confirm failure**

```bash
npm test -- tests/catalog.test.ts tests/catalog-overlap.test.ts
```

- [ ] **Step 3: Compose family modules in `families/index.ts`**

Use deterministic family ordering so search/discovery output is stable across runs.

- [ ] **Step 4: Switch `registry.ts` from `legacyCapabilities` to the family baseline**

Retain `src/catalog/legacy.ts` only as migration reference until a later cleanup proves no stable ID was lost. `getCapabilityById` and `searchCapabilities` signatures remain unchanged.

- [ ] **Step 5: Expand relationships**

Add only decision-relevant prerequisites/follow-ons/alternatives/overlaps. Every relationship must reference an active stable ID and include a rationale.

- [ ] **Step 6: Run focused registry/overlap tests**

```bash
npm test -- tests/catalog.test.ts tests/catalog-breadth.test.ts tests/catalog-overlap.test.ts tests/catalog-relationships.test.ts
```

Expected: PASS with at least 100 routing-ready capabilities.

- [ ] **Step 7: Commit**

```bash
git add src/catalog/families src/catalog/registry.ts src/catalog/relationships.ts src/catalog/index.ts tests/catalog.test.ts tests/catalog-overlap.test.ts
git commit -m "feat: activate 100-plus capability registry"
```

---

### Task 7: Expose Complete Capability Inspection Without Tool Proliferation

**Files:**
- Modify: `src/catalog/register-tools.ts`
- Modify: `tests/catalog-tools.test.ts`
- Modify: `skills/consulting-orchestrator/SKILL.md`

**Interfaces:**
- Keeps exactly the existing capability MCP primitives: `search_consulting_capabilities`, `inspect_consulting_capability`, `validate_consulting_workflow`.
- `search_consulting_capabilities` returns concise routing/discovery data.
- `inspect_consulting_capability` returns the full routing-ready definition.

- [ ] **Step 1: Write failing MCP contract assertions**

Extend `tests/catalog-tools.test.ts` so inspection of a routing-ready capability returns `businessQuestions`, `triggers`, `antiTriggers`, `requiredInputs`, `methodology`, `evidence`, `outputs`, `qualityGates`, `access`, `riskClass`, and `evaluationFixtureIds`.

Also assert that the capability tool-name set remains exactly:

```ts
[
  "search_consulting_capabilities",
  "inspect_consulting_capability",
  "validate_consulting_workflow",
]
```

when filtered to names containing `consulting_capabilit` or `consulting_workflow`.

- [ ] **Step 2: Run focused MCP tests and confirm failure**

```bash
npm test -- tests/catalog-tools.test.ts
```

- [ ] **Step 3: Split concise and detailed capability schemas**

Search returns stable ID/name/domain/mode/status/summary/routing readiness. Inspection uses a full schema matching the complete routing metadata contract. Do not duplicate 100+ capabilities as MCP tools.

- [ ] **Step 4: Update orchestrator guidance**

State that broad capability discovery should search first and inspect only candidate capabilities whose detailed trigger/anti-trigger/evidence/output contracts matter to the decision.

- [ ] **Step 5: Run MCP/orchestrator tests**

```bash
npm test -- tests/catalog-tools.test.ts tests/orchestrator-skill.test.ts tests/http.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/catalog/register-tools.ts tests/catalog-tools.test.ts skills/consulting-orchestrator/SKILL.md
git commit -m "feat: expose complete capability inspection"
```

---

### Task 8: Verify and Record the 100+ Baseline

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`

**Interfaces:**
- Produces: truthful public development status and exact verification record.

- [ ] **Step 1: Run the complete verification gate**

```bash
npm run verify
```

Expected: typecheck, all Vitest tests, and build succeed.

- [ ] **Step 2: Verify connector-readable CI status on the exact HEAD**

Require `ci/verify: success` and a successful GitHub Actions verify job for the same commit SHA. If CI fails, inspect the run logs and fix the actual defect before documenting completion.

- [ ] **Step 3: Update README only after green verification**

Document the actual capability count and status distribution. Explicitly state that 100+ routing-ready catalog entries are a breadth/selection ontology, not a claim that all entries are fully implemented.

- [ ] **Step 4: Append the exact roadmap verification record**

Record the verified commit SHA, Actions run ID, actual capability count, and successful `npm run verify` result. Mark Subproject 3 as the next detailed plan.

- [ ] **Step 5: Verify the documentation HEAD**

Require `ci/verify: success` again after README/roadmap updates.

- [ ] **Step 6: Confirm branch integrity**

Confirm `main` remains the sole authoritative branch and no other branch is ahead.

- [ ] **Step 7: Commit documentation changes**

```bash
git add README.md docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md
git commit -m "docs: record verified 100-plus capability baseline"
```
