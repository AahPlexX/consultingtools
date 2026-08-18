# Capability Platform Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the typed capability, composition, routing-validation, epistemic, and QA contracts that every later consulting capability, deterministic engine, artifact engine, research workflow, and production claim will depend on.

**Architecture:** Preserve the existing MCP v2 runtime and all currently validated artifact/finance behavior. Semantic interpretation of raw natural language remains a host-model/Skill responsibility; the TypeScript foundation supplies a typed capability ontology plus deterministic validation of capability identity, status, dependencies, access boundaries, output requirements, epistemic records, and QA reports. This avoids both a brittle keyword router and a giant opaque `analyze_anything` tool.

**Tech Stack:** TypeScript 7.0.2, Node 24 CI types, Vitest 4.1.10, Zod 4.4.3, `@modelcontextprotocol/server` 2.0.0, existing MCP 2026-07-28 runtime.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Global Constraints

- Ordinary Consulting Tools functionality must not require a user-supplied API key, OAuth flow, account link, or private third-party provider credential.
- Natural-language requests are primary; do not claim native plugin slash-command support.
- At least 100 materially distinct user-visible capabilities is a later breadth milestone; this foundation must scale there without equating capability count with MCP tool count.
- Capability, Skill, MCP tool, artifact engine, and workflow remain separate concepts.
- Fabrication, invented citations, invented metrics, invented file contents, invented tool execution, false precision, and unsupported certainty are prohibited.
- Meaningful claims must be distinguishable as verified external fact, user-supplied fact, deterministic calculation, bounded assumption, inference, hypothesis, estimate, scenario, or recommendation when the distinction affects interpretation.
- Do not invent universal 95%/99% confidence values for qualitative work.
- Credential/private-account-dependent capabilities are `unavailable` under the current product boundary, not merely `provider-dependent`.
- Existing validated MCP, artifact, DOCX, PDF, finance, runtime-freshness, and security behavior must be preserved.
- No new runtime dependency is introduced by this foundation.
- `main` is the sole authoritative branch.

---

## File Structure

### New files

- `src/catalog/types.ts` — canonical capability metadata contracts.
- `src/catalog/legacy.ts` — adapter for current catalog entries during migration.
- `src/catalog/registry.ts` — lookup/search/invariant functions.
- `src/catalog/relationships.ts` — typed composition relationships.
- `src/catalog/index.ts` — catalog package exports.
- `src/catalog/register-tools.ts` — capability discovery/inspection/workflow-validation MCP registration.
- `src/routing/types.ts` — routing intent/workflow-plan contracts.
- `src/routing/build-plan.ts` — deterministic workflow-plan construction.
- `src/epistemics/types.ts` — epistemic classes and claim records.
- `src/epistemics/validate-claim.ts` — deterministic claim validation.
- `src/quality/types.ts` — QA dimensions/findings/reports.
- `src/quality/evaluate.ts` — common quality evaluation and promotion gate.
- `tests/governance-architecture.test.ts`
- `tests/catalog-metadata.test.ts`
- `tests/catalog-relationships.test.ts`
- `tests/routing-plan.test.ts`
- `tests/epistemics.test.ts`
- `tests/quality.test.ts`
- `tests/catalog-tools.test.ts`
- `tests/orchestrator-skill.test.ts`

### Modified files

- `src/catalog.ts` — compatibility re-export of `src/catalog/index.ts`.
- `src/server.ts` — delegates catalog tool registration without disturbing artifact/PDF/finance registration.
- `tests/catalog.test.ts` — preserves existing catalog behavior tests and corrects credential-dependent status expectations.
- `tests/server.test.ts` — keeps construction coverage.
- `skills/consulting-orchestrator/SKILL.md` — semantic selection + deterministic validation sequence.
- `governance/north-star.md`
- `governance/capability-policy.md`
- `README.md`
- `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`
- `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`

---

### Task 1: Lock the Approved Architecture Into Governance

**Files:**
- Modify: `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`
- Modify: `governance/north-star.md`
- Modify: `governance/capability-policy.md`
- Create: `tests/governance-architecture.test.ts`

**Interfaces:**
- Consumes: approved design and existing `governance/open-access-boundary.md`.
- Produces: text invariants that later code and capability promotion must obey.

- [ ] **Step 1: Write the failing governance test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("approved universal consulting architecture", () => {
  it("locks the approved mission, epistemic classes, QA gate, and open access", () => {
    const spec = read("docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md");
    const northStar = read("governance/north-star.md");
    const policy = read("governance/capability-policy.md");

    expect(spec).toContain("Approved for implementation planning and execution");
    expect(northStar).toContain("universal consulting capability and quality layer");
    expect(northStar).toContain("open-access");
    for (const phrase of [
      "verified external fact",
      "user-supplied fact",
      "deterministic calculation",
      "bounded assumption",
      "inference",
      "hypothesis",
      "estimate",
      "scenario",
      "recommendation",
    ]) {
      expect(policy).toContain(phrase);
    }
    expect(policy).toContain("QA");
    expect(policy).not.toContain("generic provider ecosystem");
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails before the doc changes**

```bash
npm test -- tests/governance-architecture.test.ts
```

Expected: FAIL because the approved spec status and strengthened policy text are not yet all present.

- [ ] **Step 3: Apply the approved governance wording**

Change the spec status line exactly to:

```markdown
**Status:** Approved for implementation planning and execution
```

Set the North Star mission to define Consulting Tools as an **open-access universal consulting capability and quality layer for ChatGPT and Codex** whose purpose is measurable correctness, analytical rigor, evidentiary quality, usefulness, clarity, and professional quality across the approved consulting domains.

Add this section to `governance/capability-policy.md`:

```markdown
## Epistemic and quality contracts

Routing and delivery must preserve the distinction among verified external fact, user-supplied fact, deterministic calculation, bounded assumption, inference, hypothesis, estimate, scenario, and recommendation whenever that distinction affects interpretation. A lower-evidence class may not be represented as a higher-evidence class.

A capability may be promoted to `implemented` only when its execution path and required QA gates are executable and verified. QA means machine-testable analytical, epistemic, consulting, and artifact checks appropriate to the capability; it does not mean an invented universal confidence percentage.
```

- [ ] **Step 4: Re-run the focused governance test**

```bash
npm test -- tests/governance-architecture.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md governance/north-star.md governance/capability-policy.md tests/governance-architecture.test.ts
git commit -m "docs: govern universal consulting architecture"
```

---

### Task 2: Define Canonical Capability Metadata Without Breaking Legacy Entries

**Files:**
- Create: `src/catalog/types.ts`
- Create: `tests/catalog-metadata.test.ts`

**Interfaces:**
- Produces: `CapabilityCore`, `LegacyCapabilityDefinition`, `RoutableCapabilityDefinition`, `CapabilityDefinition`, governed enum types, `isRoutingReadyCapability()`.

- [ ] **Step 1: Write the failing metadata tests**

```ts
import { describe, expect, it } from "vitest";
import {
  artifactFormats,
  capabilityDomains,
  capabilityStatuses,
  executionModes,
  outputModalities,
  riskClasses,
  type RoutableCapabilityDefinition,
  isRoutingReadyCapability,
} from "../src/catalog/types.js";

describe("canonical capability metadata", () => {
  it("contains approved domain and output surfaces", () => {
    expect(capabilityStatuses).toEqual([
      "implemented",
      "partial",
      "provider-dependent",
      "planned",
      "unavailable",
    ]);
    expect(capabilityDomains).toEqual(
      expect.arrayContaining(["finance", "m-and-a", "supply-chain", "project", "forecasting", "visualization"]),
    );
    expect(executionModes).toEqual(
      expect.arrayContaining(["reasoning", "research", "deterministic", "artifact", "hybrid"]),
    );
    expect(outputModalities).toContain("spreadsheet");
    expect(artifactFormats).toContain("xlsx");
    expect(riskClasses).toContain("high-stakes");
  });

  it("identifies only complete v2 metadata as routing-ready", () => {
    const capability: RoutableCapabilityDefinition = {
      routingReady: true,
      id: "example-capability",
      name: "Example capability",
      domain: "strategy",
      subdomain: "option-selection",
      mode: "reasoning",
      status: "implemented",
      summary: "Compare strategic options against explicit criteria and evidence.",
      businessQuestions: ["Which strategic option should be selected?"],
      triggers: ["compare strategic options"],
      antiTriggers: ["calculate tax liability"],
      requiredInputs: ["decision objective"],
      optionalInputs: ["current market evidence"],
      methodology: "Compare options against explicit decision criteria and evidence.",
      evidence: { level: "user-input-sufficient", publicResearchAllowed: true },
      outputs: ["text", "structured-model"],
      artifactFormats: [],
      qualityGates: ["consulting.problem-framing", "epistemic.claim-classification"],
      assumptionPolicy: "State bounded assumptions and test material assumptions.",
      failureBehavior: "Return missing evidence or a bounded limitation without fabricating it.",
      access: { userCredentialRequired: false, privateAccountRequired: false },
      riskClass: "standard",
      relatedCapabilityIds: [],
      conflictingCapabilityIds: [],
      evaluationFixtureIds: ["example-positive", "example-negative"],
    };

    expect(isRoutingReadyCapability(capability)).toBe(true);
  });
});
```

- [ ] **Step 2: Verify the tests fail because the module does not exist**

```bash
npm test -- tests/catalog-metadata.test.ts
```

- [ ] **Step 3: Create `src/catalog/types.ts`**

```ts
export const capabilityStatuses = [
  "implemented",
  "partial",
  "provider-dependent",
  "planned",
  "unavailable",
] as const;
export type CapabilityStatus = (typeof capabilityStatuses)[number];

export const capabilityDomains = [
  "strategy",
  "market",
  "customer",
  "finance",
  "m-and-a",
  "operations",
  "supply-chain",
  "organization",
  "project",
  "growth",
  "seo",
  "research",
  "risk",
  "artifacts",
  "data",
  "forecasting",
  "visualization",
  "delivery",
  "innovation",
] as const;
export type CapabilityDomain = (typeof capabilityDomains)[number];

export const executionModes = ["reasoning", "research", "deterministic", "artifact", "hybrid"] as const;
export type ExecutionMode = (typeof executionModes)[number];

export const outputModalities = [
  "text",
  "structured-model",
  "dataset",
  "visualization",
  "diagram",
  "document",
  "spreadsheet",
  "presentation",
  "print-artifact",
  "interactive",
  "multi-artifact",
] as const;
export type OutputModality = (typeof outputModalities)[number];

export const artifactFormats = ["md", "html", "csv", "xlsx", "docx", "pdf", "pptx", "svg", "mermaid"] as const;
export type ArtifactFormat = (typeof artifactFormats)[number];

export const riskClasses = ["standard", "elevated", "high-stakes"] as const;
export type RiskClass = (typeof riskClasses)[number];

export const evidenceLevels = [
  "user-input-sufficient",
  "current-external-evidence",
  "authoritative-primary-preferred",
] as const;
export type EvidenceLevel = (typeof evidenceLevels)[number];

export type QualityGateId =
  | "analytical.formula-correctness"
  | "analytical.internal-consistency"
  | "analytical.unit-consistency"
  | "epistemic.claim-classification"
  | "epistemic.source-support"
  | "epistemic.freshness"
  | "consulting.problem-framing"
  | "consulting.method-fit"
  | "consulting.actionability"
  | "artifact.openability"
  | "artifact.rendering"
  | "artifact.preservation";

export interface CapabilityCore {
  id: string;
  name: string;
  domain: CapabilityDomain;
  mode: ExecutionMode;
  status: CapabilityStatus;
  summary: string;
  requires?: string;
}

export interface LegacyCapabilityDefinition extends CapabilityCore {
  routingReady: false;
}

export interface RoutableCapabilityDefinition extends CapabilityCore {
  routingReady: true;
  subdomain: string;
  businessQuestions: readonly string[];
  triggers: readonly string[];
  antiTriggers: readonly string[];
  requiredInputs: readonly string[];
  optionalInputs: readonly string[];
  methodology: string;
  evidence: { level: EvidenceLevel; publicResearchAllowed: boolean };
  outputs: readonly OutputModality[];
  artifactFormats: readonly ArtifactFormat[];
  qualityGates: readonly QualityGateId[];
  assumptionPolicy: string;
  failureBehavior: string;
  access: { userCredentialRequired: boolean; privateAccountRequired: boolean };
  riskClass: RiskClass;
  relatedCapabilityIds: readonly string[];
  conflictingCapabilityIds: readonly string[];
  evaluationFixtureIds: readonly string[];
}

export type CapabilityDefinition = LegacyCapabilityDefinition | RoutableCapabilityDefinition;

export function isRoutingReadyCapability(
  capability: CapabilityDefinition,
): capability is RoutableCapabilityDefinition {
  return capability.routingReady;
}
```

- [ ] **Step 4: Run the metadata tests**

```bash
npm test -- tests/catalog-metadata.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/catalog/types.ts tests/catalog-metadata.test.ts
git commit -m "feat: define capability metadata contracts"
```

---

### Task 3: Modularize the Existing Catalog With an Explicit Legacy Adapter

**Files:**
- Create: `src/catalog/legacy.ts`
- Create: `src/catalog/registry.ts`
- Create: `src/catalog/index.ts`
- Modify: `src/catalog.ts`
- Modify: `tests/catalog.test.ts`

**Interfaces:**
- Consumes: every current capability entry in `src/catalog.ts`.
- Produces: `capabilities`, `getCapabilityById()`, `searchCapabilities()`, existing public imports through `src/catalog.ts`.

- [ ] **Step 1: Add failing compatibility assertions to `tests/catalog.test.ts`**

```ts
import { getCapabilityById } from "../src/catalog.js";

it("preserves stable ids during catalog modularization", () => {
  expect(getCapabilityById("swot")?.name).toBe("SWOT analysis");
  expect(getCapabilityById("break-even")?.domain).toBe("finance");
  expect(getCapabilityById("pdf-crud")?.status).toBe("planned");
});

it("marks private-account SEO metrics unavailable under open access", () => {
  for (const id of ["seo-keyword-metrics", "seo-backlink-metrics", "seo-search-console"]) {
    expect(getCapabilityById(id)?.status).toBe("unavailable");
  }
});
```

- [ ] **Step 2: Run the catalog test and confirm failure**

```bash
npm test -- tests/catalog.test.ts
```

Expected: FAIL because `getCapabilityById()` does not exist and the three SEO entries still use the old status.

- [ ] **Step 3: Move the current raw catalog into `src/catalog/legacy.ts` without dropping any ID**

Move the existing `capabilities` literal from `src/catalog.ts` into a local `rawLegacyCapabilities` array. Keep every current ID, name, summary, and status except the three credential-dependent SEO entries described below. Use this local migration type so legacy `data` and `external` modes can be normalized without polluting the approved v2 execution-mode enum:

```ts
import type { LegacyCapabilityDefinition } from "./types.js";

interface RawLegacyCapability {
  id: string;
  name: string;
  domain: LegacyCapabilityDefinition["domain"];
  mode: "reasoning" | "research" | "artifact" | "data" | "external";
  status: LegacyCapabilityDefinition["status"];
  summary: string;
  requires?: string;
}

const normalizeMode = (mode: RawLegacyCapability["mode"]): LegacyCapabilityDefinition["mode"] => {
  if (mode === "data") return "deterministic";
  if (mode === "external") return "research";
  return mode;
};

export const legacyCapabilities: readonly LegacyCapabilityDefinition[] = rawLegacyCapabilities.map(
  (capability) => ({
    ...capability,
    mode: normalizeMode(capability.mode),
    routingReady: false,
  }),
);
```

For the three old account-dependent SEO entries, keep their IDs but replace their status/summary/requirement with these exact records inside `rawLegacyCapabilities`:

```ts
{
  id: "seo-keyword-metrics",
  name: "Keyword opportunity metrics",
  domain: "seo",
  mode: "research",
  status: "unavailable",
  summary: "Analyze user-supplied keyword metrics when provided; Consulting Tools does not obtain proprietary keyword-demand or difficulty metrics through credentialed providers.",
  requires: "User-supplied exported metrics when proprietary demand or difficulty data is required.",
},
{
  id: "seo-backlink-metrics",
  name: "Backlink and authority metrics",
  domain: "seo",
  mode: "research",
  status: "unavailable",
  summary: "Analyze user-supplied backlink exports or openly verifiable link evidence without requiring a commercial backlink account.",
  requires: "User-supplied export when proprietary backlink-index metrics are required.",
},
{
  id: "seo-search-console",
  name: "Search performance analysis",
  domain: "seo",
  mode: "research",
  status: "unavailable",
  summary: "Analyze Search Console exports supplied by the user; Consulting Tools does not request Search Console OAuth or account access.",
  requires: "User-supplied Search Console export.",
},
```

- [ ] **Step 4: Create `src/catalog/registry.ts`**

```ts
import { legacyCapabilities } from "./legacy.js";
import type { CapabilityDefinition, CapabilityDomain, CapabilityStatus } from "./types.js";

export interface CapabilitySearch {
  query?: string;
  status?: CapabilityStatus;
  domain?: CapabilityDomain;
  limit?: number;
}

export const capabilities: readonly CapabilityDefinition[] = legacyCapabilities;
const byId = new Map(capabilities.map((capability) => [capability.id, capability]));

export function getCapabilityById(id: string): CapabilityDefinition | undefined {
  return byId.get(id);
}

export function searchCapabilities({ query, status, domain, limit = 20 }: CapabilitySearch = {}): CapabilityDefinition[] {
  const normalizedQuery = query?.trim().toLocaleLowerCase();
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);

  return capabilities
    .filter((capability) => status === undefined || capability.status === status)
    .filter((capability) => domain === undefined || capability.domain === domain)
    .filter((capability) => {
      if (!normalizedQuery) return true;
      return [
        capability.id,
        capability.name,
        capability.domain,
        capability.mode,
        capability.status,
        capability.summary,
        capability.requires ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    })
    .slice(0, boundedLimit)
    .map((capability) => ({ ...capability }));
}
```

- [ ] **Step 5: Add exports and compatibility shim**

`src/catalog/index.ts`:

```ts
export * from "./types.js";
export * from "./registry.js";
```

Replace `src/catalog.ts` with:

```ts
export * from "./catalog/index.js";
```

- [ ] **Step 6: Run catalog tests**

```bash
npm test -- tests/catalog.test.ts tests/catalog-metadata.test.ts
```

Expected: PASS; current stable IDs remain available and the open-access SEO status correction is enforced.

- [ ] **Step 7: Commit**

```bash
git add src/catalog.ts src/catalog tests/catalog.test.ts
git commit -m "refactor: modularize capability registry"
```

---

### Task 4: Add Capability Composition Relationships

**Files:**
- Create: `src/catalog/relationships.ts`
- Modify: `src/catalog/index.ts`
- Create: `tests/catalog-relationships.test.ts`

**Interfaces:**
- Produces: `CapabilityRelationship`, `capabilityRelationships`, `getRelationshipsForCapability()`, `validateRelationshipGraph()`.

- [ ] **Step 1: Write failing graph tests**

```ts
import { describe, expect, it } from "vitest";
import {
  capabilityRelationships,
  getRelationshipsForCapability,
  validateRelationshipGraph,
} from "../src/catalog.js";

describe("capability relationship graph", () => {
  it("contains no dangling or self relationships", () => {
    expect(validateRelationshipGraph()).toEqual([]);
  });

  it("encodes useful dependency relationships", () => {
    expect(getRelationshipsForCapability("entry-strategy")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: "market-attractiveness", to: "entry-strategy" }),
      ]),
    );
    expect(capabilityRelationships.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the graph test and confirm failure**

```bash
npm test -- tests/catalog-relationships.test.ts
```

- [ ] **Step 3: Implement `src/catalog/relationships.ts`**

```ts
import { getCapabilityById } from "./registry.js";

export const relationshipKinds = ["prerequisite", "useful-follow-on", "alternative", "overlap"] as const;
export type CapabilityRelationshipKind = (typeof relationshipKinds)[number];

export interface CapabilityRelationship {
  from: string;
  to: string;
  kind: CapabilityRelationshipKind;
  rationale: string;
}

export const capabilityRelationships: readonly CapabilityRelationship[] = [
  {
    from: "market-sizing",
    to: "market-attractiveness",
    kind: "useful-follow-on",
    rationale: "Demand scale can materially inform market attractiveness.",
  },
  {
    from: "market-attractiveness",
    to: "entry-strategy",
    kind: "useful-follow-on",
    rationale: "Entry strategy should follow evidence that the target market is sufficiently attractive.",
  },
  {
    from: "break-even",
    to: "investment-appraisal",
    kind: "useful-follow-on",
    rationale: "Break-even economics can inform investment feasibility before broader appraisal.",
  },
  {
    from: "data-cleaning",
    to: "descriptive-statistics",
    kind: "prerequisite",
    rationale: "Structured data should be validated and normalized before statistical summaries are treated as reliable.",
  },
];

export function getRelationshipsForCapability(id: string): CapabilityRelationship[] {
  return capabilityRelationships.filter(({ from, to }) => from === id || to === id);
}

export function validateRelationshipGraph(): string[] {
  const problems: string[] = [];
  for (const relationship of capabilityRelationships) {
    if (relationship.from === relationship.to) problems.push(`self:${relationship.from}`);
    if (!getCapabilityById(relationship.from)) problems.push(`missing-from:${relationship.from}`);
    if (!getCapabilityById(relationship.to)) problems.push(`missing-to:${relationship.to}`);
  }
  return problems;
}
```

Export it from `src/catalog/index.ts`.

- [ ] **Step 4: Run graph tests**

```bash
npm test -- tests/catalog-relationships.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/catalog/relationships.ts src/catalog/index.ts tests/catalog-relationships.test.ts
git commit -m "feat: add capability composition graph"
```

---

### Task 5: Add Structured Workflow-Plan Validation

**Files:**
- Create: `src/routing/types.ts`
- Create: `src/routing/build-plan.ts`
- Create: `tests/routing-plan.test.ts`

**Interfaces:**
- Consumes: catalog lookup and relationships.
- Produces: `RoutingIntent`, `WorkflowPlan`, `buildWorkflowPlan()`.

- [ ] **Step 1: Write failing routing tests**

```ts
import { describe, expect, it } from "vitest";
import { buildWorkflowPlan } from "../src/routing/build-plan.js";

describe("workflow-plan validation", () => {
  it("builds a bounded dependency graph from host-selected capability ids", () => {
    const plan = buildWorkflowPlan({
      objective: "Assess a new market and choose an entry approach",
      capabilityIds: ["market-attractiveness", "entry-strategy"],
      requestedOutputs: ["text"],
    });
    expect(plan.nodes.map(({ capabilityId }) => capabilityId)).toEqual([
      "market-attractiveness",
      "entry-strategy",
    ]);
    expect(plan.nodes[1]?.dependsOn).toContain("market-attractiveness");
    expect(plan.executable).toBe(true);
  });

  it("blocks an unavailable capability", () => {
    const plan = buildWorkflowPlan({
      objective: "Use my live Search Console account",
      capabilityIds: ["seo-search-console"],
      requestedOutputs: ["text"],
    });
    expect(plan.executable).toBe(false);
    expect(plan.blockers).toContainEqual({ capabilityId: "seo-search-console", reason: "unavailable" });
  });

  it("rejects unknown capability ids", () => {
    expect(() => buildWorkflowPlan({
      objective: "Unknown capability",
      capabilityIds: ["does-not-exist"],
      requestedOutputs: ["text"],
    })).toThrow("Unknown capability id: does-not-exist");
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npm test -- tests/routing-plan.test.ts
```

- [ ] **Step 3: Create `src/routing/types.ts`**

```ts
import type { OutputModality } from "../catalog/types.js";

export interface RoutingIntent {
  objective: string;
  capabilityIds: readonly string[];
  requestedOutputs: readonly OutputModality[];
}

export interface WorkflowNode {
  capabilityId: string;
  dependsOn: string[];
}

export interface WorkflowBlocker {
  capabilityId: string;
  reason: "unavailable" | "planned" | "partial" | "provider-dependent";
}

export interface WorkflowPlan {
  objective: string;
  nodes: WorkflowNode[];
  requestedOutputs: OutputModality[];
  executable: boolean;
  blockers: WorkflowBlocker[];
}
```

- [ ] **Step 4: Create `src/routing/build-plan.ts`**

```ts
import { capabilityRelationships, getCapabilityById } from "../catalog/index.js";
import type { CapabilityStatus } from "../catalog/types.js";
import type { RoutingIntent, WorkflowBlocker, WorkflowPlan } from "./types.js";

function blockerFor(status: CapabilityStatus): WorkflowBlocker["reason"] | undefined {
  return status === "implemented" ? undefined : status;
}

export function buildWorkflowPlan(intent: RoutingIntent): WorkflowPlan {
  const selected = intent.capabilityIds.map((id) => {
    const capability = getCapabilityById(id);
    if (!capability) throw new Error(`Unknown capability id: ${id}`);
    return capability;
  });

  const selectedIds = new Set(selected.map(({ id }) => id));
  const nodes = selected.map((capability) => ({
    capabilityId: capability.id,
    dependsOn: capabilityRelationships
      .filter(({ kind, from, to }) =>
        (kind === "prerequisite" || kind === "useful-follow-on") &&
        to === capability.id &&
        selectedIds.has(from),
      )
      .map(({ from }) => from),
  }));

  const blockers = selected.flatMap((capability) => {
    const reason = blockerFor(capability.status);
    return reason ? [{ capabilityId: capability.id, reason }] : [];
  });

  return {
    objective: intent.objective,
    nodes,
    requestedOutputs: [...intent.requestedOutputs],
    executable: blockers.length === 0,
    blockers,
  };
}
```

- [ ] **Step 5: Run routing tests**

```bash
npm test -- tests/routing-plan.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/routing tests/routing-plan.test.ts
git commit -m "feat: validate consulting workflow plans"
```

---

### Task 6: Add Epistemic and Common QA Contracts

**Files:**
- Create: `src/epistemics/types.ts`
- Create: `src/epistemics/validate-claim.ts`
- Create: `src/quality/types.ts`
- Create: `src/quality/evaluate.ts`
- Create: `tests/epistemics.test.ts`
- Create: `tests/quality.test.ts`

**Interfaces:**
- Produces: epistemic claim validation and a common machine-readable QA report/promotion gate.

- [ ] **Step 1: Write failing epistemic tests**

```ts
import { describe, expect, it } from "vitest";
import { validateClaimRecord } from "../src/epistemics/validate-claim.js";

describe("epistemic claim contracts", () => {
  it("requires provenance for verified external facts", () => {
    expect(validateClaimRecord({
      id: "fact-1",
      text: "The market grew 12% last year.",
      classification: "verified-external-fact",
      sourceIds: [],
    })).toContainEqual({ code: "verified-fact-missing-source", severity: "error", claimId: "fact-1" });
  });

  it("requires calculation provenance for deterministic calculations", () => {
    expect(validateClaimRecord({
      id: "calc-1",
      text: "Break-even volume is 1,000 units.",
      classification: "deterministic-calculation",
    })).toContainEqual({ code: "calculation-missing-reference", severity: "error", claimId: "calc-1" });
  });

  it("accepts an explicitly bounded assumption", () => {
    expect(validateClaimRecord({
      id: "assumption-1",
      text: "Assume flat demand in the base case.",
      classification: "bounded-assumption",
      assumptionBasis: "The user requested a flat-demand base case.",
    })).toEqual([]);
  });
});
```

- [ ] **Step 2: Write failing QA tests**

```ts
import { describe, expect, it } from "vitest";
import { canPromoteCapability, evaluateQuality } from "../src/quality/evaluate.js";

describe("common QA contracts", () => {
  it("fails when a required gate is missing or an error exists", () => {
    const report = evaluateQuality({
      requiredGateIds: ["epistemic.source-support", "consulting.problem-framing"],
      passedGateIds: ["consulting.problem-framing"],
      findings: [{
        gateId: "epistemic.source-support",
        dimension: "epistemic",
        severity: "error",
        message: "A verified fact has no source.",
      }],
    });
    expect(report.passed).toBe(false);
    expect(report.missingGateIds).toEqual(["epistemic.source-support"]);
    expect(canPromoteCapability(report)).toBe(false);
  });
});
```

- [ ] **Step 3: Run both tests and confirm failure**

```bash
npm test -- tests/epistemics.test.ts tests/quality.test.ts
```

- [ ] **Step 4: Implement epistemic types and validation**

`src/epistemics/types.ts`:

```ts
export const epistemicClasses = [
  "verified-external-fact",
  "user-supplied-fact",
  "deterministic-calculation",
  "bounded-assumption",
  "inference",
  "hypothesis",
  "estimate",
  "scenario",
  "recommendation",
] as const;
export type EpistemicClass = (typeof epistemicClasses)[number];

export interface ClaimRecord {
  id: string;
  text: string;
  classification: EpistemicClass;
  sourceIds?: readonly string[];
  calculationRef?: string;
  assumptionBasis?: string;
}

export interface ClaimValidationFinding {
  code: "verified-fact-missing-source" | "calculation-missing-reference" | "assumption-missing-basis";
  severity: "error";
  claimId: string;
}
```

`src/epistemics/validate-claim.ts`:

```ts
import type { ClaimRecord, ClaimValidationFinding } from "./types.js";

export function validateClaimRecord(claim: ClaimRecord): ClaimValidationFinding[] {
  const findings: ClaimValidationFinding[] = [];
  if (claim.classification === "verified-external-fact" && (claim.sourceIds?.length ?? 0) === 0) {
    findings.push({ code: "verified-fact-missing-source", severity: "error", claimId: claim.id });
  }
  if (claim.classification === "deterministic-calculation" && !claim.calculationRef?.trim()) {
    findings.push({ code: "calculation-missing-reference", severity: "error", claimId: claim.id });
  }
  if (claim.classification === "bounded-assumption" && !claim.assumptionBasis?.trim()) {
    findings.push({ code: "assumption-missing-basis", severity: "error", claimId: claim.id });
  }
  return findings;
}
```

- [ ] **Step 5: Implement QA types and evaluation**

`src/quality/types.ts`:

```ts
import type { QualityGateId } from "../catalog/types.js";

export const qualityDimensions = ["analytical", "epistemic", "consulting", "artifact"] as const;
export type QualityDimension = (typeof qualityDimensions)[number];
export type QualitySeverity = "info" | "warning" | "error";

export interface QualityFinding {
  gateId: QualityGateId;
  dimension: QualityDimension;
  severity: QualitySeverity;
  message: string;
}

export interface QualityEvaluationInput {
  requiredGateIds: readonly QualityGateId[];
  passedGateIds: readonly QualityGateId[];
  findings: readonly QualityFinding[];
}

export interface QualityReport {
  passed: boolean;
  requiredGateIds: QualityGateId[];
  passedGateIds: QualityGateId[];
  missingGateIds: QualityGateId[];
  findings: QualityFinding[];
}
```

`src/quality/evaluate.ts`:

```ts
import type { QualityEvaluationInput, QualityReport } from "./types.js";

export function evaluateQuality(input: QualityEvaluationInput): QualityReport {
  const passed = new Set(input.passedGateIds);
  const missingGateIds = input.requiredGateIds.filter((gateId) => !passed.has(gateId));
  const hasErrors = input.findings.some(({ severity }) => severity === "error");
  return {
    passed: missingGateIds.length === 0 && !hasErrors,
    requiredGateIds: [...input.requiredGateIds],
    passedGateIds: [...input.passedGateIds],
    missingGateIds,
    findings: [...input.findings],
  };
}

export function canPromoteCapability(report: QualityReport): boolean {
  return report.passed;
}
```

- [ ] **Step 6: Run both test files**

```bash
npm test -- tests/epistemics.test.ts tests/quality.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/epistemics src/quality tests/epistemics.test.ts tests/quality.test.ts
git commit -m "feat: add epistemic and quality contracts"
```

---

### Task 7: Expose Focused MCP Validation and Update the Orchestrator Skill

**Files:**
- Create: `src/catalog/register-tools.ts`
- Modify: `src/server.ts`
- Create: `tests/catalog-tools.test.ts`
- Create: `tests/orchestrator-skill.test.ts`
- Modify: `skills/consulting-orchestrator/SKILL.md`

**Interfaces:**
- Produces MCP tools: `search_consulting_capabilities`, `inspect_consulting_capability`, `validate_consulting_workflow`.

- [ ] **Step 1: Write the failing HTTP MCP contract test**

```ts
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http.js";

describe("capability MCP tools", () => {
  it("discovers, inspects, and validates capability plans", async () => {
    const handler = createHttpHandler();
    const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    });
    const client = new Client(
      { name: "capability-tools-test", version: "1.0.0" },
      { versionNegotiation: { mode: "auto" } },
    );

    try {
      await client.connect(transport);
      const tools = await client.listTools();
      const names = tools.tools.map(({ name }) => name);
      expect(names).toEqual(expect.arrayContaining([
        "search_consulting_capabilities",
        "inspect_consulting_capability",
        "validate_consulting_workflow",
      ]));

      for (const name of [
        "search_consulting_capabilities",
        "inspect_consulting_capability",
        "validate_consulting_workflow",
      ]) {
        expect(tools.tools.find((tool) => tool.name === name)?.annotations).toMatchObject({
          readOnlyHint: true,
          openWorldHint: false,
          destructiveHint: false,
        });
      }

      const inspect = await client.callTool({
        name: "inspect_consulting_capability",
        arguments: { id: "swot" },
      });
      expect(inspect.isError).not.toBe(true);
      expect(inspect.structuredContent).toMatchObject({ capability: { id: "swot" } });

      const valid = await client.callTool({
        name: "validate_consulting_workflow",
        arguments: {
          objective: "Assess a new market and choose an entry approach",
          capabilityIds: ["market-attractiveness", "entry-strategy"],
          requestedOutputs: ["text"],
        },
      });
      expect(valid.structuredContent).toMatchObject({ executable: true });

      const blocked = await client.callTool({
        name: "validate_consulting_workflow",
        arguments: {
          objective: "Use my live Search Console account",
          capabilityIds: ["seo-search-console"],
          requestedOutputs: ["text"],
        },
      });
      expect(blocked.structuredContent).toMatchObject({ executable: false });
    } finally {
      await client.close();
      await handler.close();
    }
  });
});
```

- [ ] **Step 2: Write the failing Skill contract test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const skill = readFileSync(new URL("../skills/consulting-orchestrator/SKILL.md", import.meta.url), "utf8");

describe("consulting orchestrator skill", () => {
  it("uses natural-language semantic selection plus deterministic plan validation", () => {
    expect(skill).toContain("natural-language");
    expect(skill).toContain("search_consulting_capabilities");
    expect(skill).toContain("inspect_consulting_capability");
    expect(skill).toContain("validate_consulting_workflow");
    expect(skill).toContain("anti-trigger");
    expect(skill).toContain("epistemic");
    expect(skill).toContain("quality gate");
    expect(skill).not.toContain("native slash command");
  });
});
```

- [ ] **Step 3: Run both tests and confirm failure**

```bash
npm test -- tests/catalog-tools.test.ts tests/orchestrator-skill.test.ts
```

- [ ] **Step 4: Implement `src/catalog/register-tools.ts`**

Use Zod v4 Standard Schema. Register three read-only, closed-world, non-destructive tools. Reuse current bounded search behavior. `inspect_consulting_capability` accepts one `id` string and returns exactly one catalog record or an MCP error. `validate_consulting_workflow` uses this schema:

```ts
z.object({
  objective: z.string().trim().min(1).max(2000),
  capabilityIds: z.array(z.string().trim().min(1).max(120)).min(1).max(30),
  requestedOutputs: z.array(z.enum(outputModalities)).min(1).max(10),
})
```

For all three tools use:

```ts
annotations: {
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
}
```

The workflow-validation tool description must explicitly state: semantic interpretation of raw user language is performed by the host/consulting Skill; this tool validates structured capability IDs, statuses, and encoded dependencies and does not claim standalone language understanding.

- [ ] **Step 5: Simplify `src/server.ts`**

Remove the inline capability schema/tool registration and import:

```ts
import { registerCapabilityTools } from "./catalog/register-tools.js";
```

Inside `createServer()` retain all existing unrelated registrations and use this order:

```ts
registerCapabilityTools(server);
registerArtifactTools(server, artifactStore, artifactOptions);
registerPdfTools(server, artifactStore);
registerFinanceTools(server);
```

Update server instructions to include:

```text
Natural-language semantic interpretation belongs to the consulting orchestration workflow. Select candidate capability IDs from the catalog, validate substantive multi-capability plans before presenting them as executable, treat capability status and open-access limits as hard truth boundaries, and use epistemic labels plus applicable QA gates instead of invented confidence percentages.
```

- [ ] **Step 6: Update `skills/consulting-orchestrator/SKILL.md`**

Require this sequence for substantive consulting work:

```markdown
1. Interpret the user's natural-language objective, decision, audience, stakes, evidence, outputs, and constraints.
2. Search the capability catalog for candidate capabilities; do not require the user to know framework names.
3. Inspect promising capability records and reject anti-trigger or method mismatches.
4. Select the smallest sufficient set of complementary capability IDs.
5. Validate multi-capability plans through `validate_consulting_workflow` before treating them as executable.
6. If a selected capability is planned, partial, provider-dependent, or unavailable, revise the plan or disclose the blocker rather than simulating execution.
7. Classify material claims using the applicable epistemic class and obtain current public evidence when freshness or stakes require it.
8. Prefer deterministic tools for fixed calculations.
9. Select the deliverable modality that best serves the decision.
10. Apply required analytical, epistemic, consulting, and artifact quality gates before final delivery.
```

Also state that the host model/Skill performs semantic interpretation; the deterministic layer validates structured selections. Do not describe a hand-written keyword classifier as SOTA semantic routing.

- [ ] **Step 7: Run capability/Skill/server protocol tests**

```bash
npm test -- tests/catalog-tools.test.ts tests/orchestrator-skill.test.ts tests/server.test.ts tests/http.test.ts
```

Expected: PASS, including existing MCP 2026-07-28 negotiation.

- [ ] **Step 8: Commit**

```bash
git add src/catalog/register-tools.ts src/server.ts skills/consulting-orchestrator/SKILL.md tests/catalog-tools.test.ts tests/orchestrator-skill.test.ts
git commit -m "feat: expose consulting workflow validation"
```

---

### Task 8: Document and Verify the Foundation

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`

**Interfaces:**
- Consumes: Tasks 1–7.
- Produces: truthful documentation and a verified subproject-1 completion record.

- [ ] **Step 1: Update README with only implemented foundation claims**

Include this exact sentence:

```markdown
The foundation validates structured capability plans; it does not claim that a hand-written keyword classifier independently understands arbitrary consulting language. Natural-language semantic selection remains a host-model/Skill responsibility backed by the typed catalog and deterministic validation layer.
```

Also state that the 100+ capability milestone remains the next catalog subproject unless it has separately been completed and verified.

- [ ] **Step 2: Run the focused foundation suite**

```bash
npm test -- tests/governance-architecture.test.ts tests/catalog-metadata.test.ts tests/catalog.test.ts tests/catalog-relationships.test.ts tests/routing-plan.test.ts tests/epistemics.test.ts tests/quality.test.ts tests/catalog-tools.test.ts tests/orchestrator-skill.test.ts tests/server.test.ts tests/http.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run the full repository verification command**

```bash
npm run verify
```

Expected: typecheck PASS, complete Vitest suite PASS, production TypeScript build PASS.

If local dependency/network conditions prevent execution, do not claim success. Use GitHub Actions evidence for the exact HEAD if accessible. If neither local nor runner evidence is available, leave this subproject incomplete and report the verification gap.

- [ ] **Step 4: Confirm branch integrity**

Use GitHub branch enumeration and comparison. Completion requires `main` to be authoritative and not behind any other branch.

- [ ] **Step 5: Record the concrete verified commit in the program roadmap**

After Step 3 passes, obtain the exact commit with:

```bash
git rev-parse HEAD
```

Append a `Subproject 1 verification` section to the program roadmap containing the actual 40-character SHA printed by that command, the fact that `npm run verify` passed on that SHA, and the branch-integrity result. Do not write the record until the concrete SHA and verification evidence exist.

- [ ] **Step 6: Commit the documentation update**

```bash
git add README.md docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md
git commit -m "docs: record capability foundation status"
```

- [ ] **Step 7: Verify the documentation commit too**

```bash
npm run verify
```

Expected: PASS on the final documentation commit HEAD. If it does not pass, the foundation remains incomplete.

---

## Foundation Completion Criteria

This plan is complete only when all of these are proven on `main`:

1. Approved architecture language is reflected in governance.
2. Canonical capability metadata types include the approved open-access, output, evidence, risk, and quality dimensions.
3. The existing catalog is modularized without dropping stable capability IDs.
4. Credential/private-account SEO capabilities are `unavailable` and point to user-supplied exports as the supported data path.
5. Capability relationships contain no dangling or self references.
6. Structured workflow plans reject unknown IDs and expose non-implemented blockers instead of simulating execution.
7. Epistemic validation prevents a verified external fact without source provenance and a deterministic calculation without a calculation reference.
8. Common QA reports fail missing required gates and error findings; promotion requires a passing report.
9. MCP exposes focused search, inspect, and workflow-validation tools without turning every consulting capability into an MCP tool.
10. The consulting Skill performs natural-language semantic selection and invokes deterministic validation before promising a substantive multi-capability plan is executable.
11. Full repository verification passes on the exact completion HEAD.
12. `main` is authoritative and not behind another branch.

## Explicit Non-Goals of This Foundation

These remain assigned to later program subprojects and must not be claimed by this plan:

- the 100+ capability breadth milestone;
- new NPV, DCF, IRR, statistical, forecasting, project, operations, or supply-chain engines;
- broad CSV/XLSX/DOCX/PDF/PPTX CRUD;
- chart rendering or PPTX generation;
- anonymous public-web fetching, fact-check execution, or SEO crawling;
- production remote MCP hosting;
- Plugin Directory submission readiness.
