# Capability Platform Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the typed capability, composition, routing-validation, epistemic, and QA contracts that every later consulting capability, deterministic engine, artifact engine, research workflow, and production claim will depend on.

**Architecture:** Preserve the existing MCP v2 runtime and current working artifact/finance behavior. Introduce a modular `src/catalog/` package behind the existing `src/catalog.ts` compatibility export, keep semantic interpretation in the consulting Skill/host model, and make the server deterministically validate capability identity, access state, dependencies, output compatibility, and quality contracts. The first foundation does not pretend to solve open-ended semantic NLP in TypeScript; it provides the structured ontology and executable validation layer that makes autonomous host-model routing inspectable and testable.

**Tech Stack:** TypeScript 7.0.2, Node 24 CI types, Vitest 4.1.10, Zod 4.4.3, `@modelcontextprotocol/server` 2.0.0, existing MCP 2026-07-28 runtime.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Global Constraints

- Ordinary Consulting Tools functionality must not require a user-supplied API key, OAuth flow, account link, or private third-party provider credential.
- Natural-language requests are primary; do not claim native plugin slash-command support.
- At least 100 materially distinct user-visible capabilities is a later breadth milestone; this foundation must scale there without equating capability count with MCP tool count.
- Capability, Skill, MCP tool, artifact engine, and workflow are separate concepts.
- Fabrication, invented citations, invented metrics, invented file contents, invented tool execution, false precision, and unsupported certainty are prohibited.
- Meaningful claims must be distinguishable as verified external fact, user-supplied fact, deterministic calculation, bounded assumption, inference, hypothesis, estimate, scenario, or recommendation when the distinction affects interpretation.
- Do not invent universal 95%/99% confidence values for qualitative work.
- A credential/private-account-dependent capability is `unavailable` under the current product boundary, not merely `provider-dependent`.
- Existing validated MCP, artifact, DOCX, PDF, finance, runtime-freshness, and security behavior must be preserved.
- `main` is the sole authoritative branch.

---

## File Structure

### New files

- `src/catalog/types.ts` — canonical capability metadata enums and interfaces.
- `src/catalog/legacy.ts` — compatibility adapter for current catalog entries during the 100+ catalog migration.
- `src/catalog/registry.ts` — registry construction, lookup, search, and invariants.
- `src/catalog/relationships.ts` — capability prerequisite/follow-on/alternative/overlap relations.
- `src/catalog/index.ts` — public catalog package exports.
- `src/routing/types.ts` — structured routing intent and workflow-plan contracts.
- `src/routing/build-plan.ts` — deterministic workflow-plan construction and validation.
- `src/epistemics/types.ts` — epistemic classes and claim records.
- `src/epistemics/validate-claim.ts` — deterministic claim-contract validation.
- `src/quality/types.ts` — QA dimensions, gates, findings, and reports.
- `src/quality/evaluate.ts` — common gate evaluation and capability-promotion decision.
- `src/catalog/register-tools.ts` — MCP capability discovery/inspection/workflow-validation tools.
- `tests/catalog-metadata.test.ts` — metadata and access-boundary invariants.
- `tests/catalog-relationships.test.ts` — graph integrity tests.
- `tests/routing-plan.test.ts` — deterministic workflow-plan tests.
- `tests/epistemics.test.ts` — claim classification contract tests.
- `tests/quality.test.ts` — QA report/promotion tests.
- `tests/catalog-tools.test.ts` — MCP discovery/validation tool behavior.
- `tests/governance-architecture.test.ts` — approved architecture/governance text invariants.

### Modified files

- `src/catalog.ts` — becomes a compatibility re-export of `src/catalog/index.ts`.
- `src/server.ts` — delegates capability tool registration to `src/catalog/register-tools.ts`; keeps artifact/PDF/finance registration unchanged.
- `tests/catalog.test.ts` — updates breadth/access expectations without losing current unique-ID/search/file-CRUD assertions.
- `tests/server.test.ts` — verifies server still constructs with the modular capability tooling.
- `skills/consulting-orchestrator/SKILL.md` — formalizes host semantic interpretation + deterministic workflow validation sequence.
- `governance/north-star.md` — promotes the approved universal consulting capability/quality mission.
- `governance/capability-policy.md` — references routable metadata, epistemic classes, composition validation, and QA promotion gates.
- `README.md` — documents the foundation without overstating semantic automation or later 100+ breadth completion.
- `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md` — changes status line to `Approved for implementation planning and execution`.

---

### Task 1: Lock the Approved Architecture Into Governance

**Files:**
- Modify: `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`
- Modify: `governance/north-star.md`
- Modify: `governance/capability-policy.md`
- Create: `tests/governance-architecture.test.ts`

**Interfaces:**
- Consumes: approved architecture spec and existing open-access boundary.
- Produces: repository-text invariants that later code/tasks must obey.

- [ ] **Step 1: Write the failing governance invariant test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("approved consulting architecture governance", () => {
  it("locks the universal quality mission and open-access architecture", () => {
    const northStar = read("governance/north-star.md");
    const capabilityPolicy = read("governance/capability-policy.md");
    const spec = read(
      "docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md",
    );

    expect(spec).toContain("Approved for implementation planning and execution");
    expect(northStar).toContain("universal consulting capability and quality layer");
    expect(northStar).toContain("open-access");
    expect(capabilityPolicy).toContain("verified external fact");
    expect(capabilityPolicy).toContain("deterministic calculation");
    expect(capabilityPolicy).toContain("bounded assumption");
    expect(capabilityPolicy).toContain("recommendation");
    expect(capabilityPolicy).toContain("QA");
    expect(capabilityPolicy).not.toContain("generic provider ecosystem");
  });
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
npm test -- tests/governance-architecture.test.ts
```

Expected: FAIL because the approved status phrase and strengthened governance text do not all exist yet.

- [ ] **Step 3: Update governance with the approved wording**

Set the spec status exactly to:

```markdown
**Status:** Approved for implementation planning and execution
```

Ensure `governance/north-star.md` defines Consulting Tools as an **open-access universal consulting capability and quality layer for ChatGPT and Codex**, preserves natural-language-first routing, measurable quality, and the no-auth boundary.

Add this governing paragraph to `governance/capability-policy.md`:

```markdown
## Epistemic and quality contracts

Routing and delivery must preserve the distinction among verified external fact, user-supplied fact, deterministic calculation, bounded assumption, inference, hypothesis, estimate, scenario, and recommendation whenever the distinction affects interpretation. A lower-evidence class may not be represented as a higher-evidence class.

A capability may be promoted to `implemented` only when its execution path and required QA gates are executable and verified. QA means machine-testable analytical, epistemic, consulting, and artifact checks appropriate to the capability; it does not mean an invented universal confidence percentage.
```

- [ ] **Step 4: Re-run the focused governance test**

Run:

```bash
npm test -- tests/governance-architecture.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the governance alignment**

```bash
git add docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md governance/north-star.md governance/capability-policy.md tests/governance-architecture.test.ts
git commit -m "docs: govern universal consulting architecture"
```

---

### Task 2: Define Canonical Capability Metadata

**Files:**
- Create: `src/catalog/types.ts`
- Create: `tests/catalog-metadata.test.ts`

**Interfaces:**
- Consumes: no new runtime dependency.
- Produces: `CapabilityDefinition`, `RoutableCapabilityDefinition`, `CapabilityStatus`, `CapabilityDomain`, `ExecutionMode`, `OutputModality`, `ArtifactFormat`, `RiskClass`, `EvidenceRequirement`, `AccessContract`, `QualityGateId`, `isRoutingReadyCapability()`.

- [ ] **Step 1: Write the failing metadata contract test**

```ts
import { describe, expect, it } from "vitest";
import {
  artifactFormats,
  capabilityDomains,
  capabilityStatuses,
  epistemicRequirementLevels,
  executionModes,
  outputModalities,
  riskClasses,
  type RoutableCapabilityDefinition,
  isRoutingReadyCapability,
} from "../src/catalog/types.js";

describe("capability metadata contract", () => {
  it("defines stable governed enum surfaces", () => {
    expect(capabilityStatuses).toEqual([
      "implemented",
      "partial",
      "provider-dependent",
      "planned",
      "unavailable",
    ]);
    expect(capabilityDomains).toContain("finance");
    expect(capabilityDomains).toContain("m-and-a");
    expect(capabilityDomains).toContain("supply-chain");
    expect(capabilityDomains).toContain("project");
    expect(executionModes).toContain("hybrid");
    expect(outputModalities).toContain("spreadsheet");
    expect(artifactFormats).toContain("xlsx");
    expect(riskClasses).toContain("high-stakes");
    expect(epistemicRequirementLevels).toContain("current-external-evidence");
  });

  it("recognizes a fully routable capability", () => {
    const capability: RoutableCapabilityDefinition = {
      id: "example-capability",
      name: "Example capability",
      domain: "strategy",
      subdomain: "example",
      mode: "reasoning",
      status: "implemented",
      summary: "A concrete example used to prove the routing metadata contract.",
      businessQuestions: ["Should the organization pursue this option?"],
      triggers: ["compare strategic options"],
      antiTriggers: ["calculate tax liability"],
      requiredInputs: ["decision objective"],
      optionalInputs: ["current market evidence"],
      methodology: "Compare options against explicit criteria and evidence.",
      evidence: { level: "user-input-sufficient", publicResearchAllowed: true },
      outputs: ["text", "structured-model"],
      artifactFormats: [],
      qualityGates: ["consulting.problem-framing", "epistemic.claim-classification"],
      assumptionPolicy: "State bounded assumptions and test material ones.",
      failureBehavior: "Return the missing evidence or limitation without fabricating it.",
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

- [ ] **Step 2: Run the focused test and verify failure**

```bash
npm test -- tests/catalog-metadata.test.ts
```

Expected: FAIL because `src/catalog/types.ts` does not exist.

- [ ] **Step 3: Implement the canonical types**

Create `src/catalog/types.ts` with these exported constants and types:

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

export const executionModes = [
  "reasoning",
  "research",
  "deterministic",
  "artifact",
  "hybrid",
] as const;
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

export const artifactFormats = [
  "md",
  "html",
  "csv",
  "xlsx",
  "docx",
  "pdf",
  "pptx",
  "svg",
  "mermaid",
] as const;
export type ArtifactFormat = (typeof artifactFormats)[number];

export const riskClasses = ["standard", "elevated", "high-stakes"] as const;
export type RiskClass = (typeof riskClasses)[number];

export const epistemicRequirementLevels = [
  "user-input-sufficient",
  "current-external-evidence",
  "authoritative-primary-preferred",
] as const;
export type EpistemicRequirementLevel = (typeof epistemicRequirementLevels)[number];

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

export interface AccessContract {
  userCredentialRequired: boolean;
  privateAccountRequired: boolean;
}

export interface EvidenceRequirement {
  level: EpistemicRequirementLevel;
  publicResearchAllowed: boolean;
}

export interface CapabilityDefinition {
  id: string;
  name: string;
  domain: CapabilityDomain;
  mode: ExecutionMode;
  status: CapabilityStatus;
  summary: string;
  requires?: string;
  routing?: Omit<
    RoutableCapabilityDefinition,
    "id" | "name" | "domain" | "mode" | "status" | "summary" | "requires"
  >;
}

export interface RoutableCapabilityDefinition extends Omit<CapabilityDefinition, "routing"> {
  subdomain: string;
  businessQuestions: readonly string[];
  triggers: readonly string[];
  antiTriggers: readonly string[];
  requiredInputs: readonly string[];
  optionalInputs: readonly string[];
  methodology: string;
  evidence: EvidenceRequirement;
  outputs: readonly OutputModality[];
  artifactFormats: readonly ArtifactFormat[];
  qualityGates: readonly QualityGateId[];
  assumptionPolicy: string;
  failureBehavior: string;
  access: AccessContract;
  riskClass: RiskClass;
  relatedCapabilityIds: readonly string[];
  conflictingCapabilityIds: readonly string[];
  evaluationFixtureIds: readonly string[];
}

export function isRoutingReadyCapability(
  capability: CapabilityDefinition | RoutableCapabilityDefinition,
): capability is RoutableCapabilityDefinition {
  return "subdomain" in capability && "businessQuestions" in capability && "qualityGates" in capability;
}
```

- [ ] **Step 4: Run metadata tests**

```bash
npm test -- tests/catalog-metadata.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit canonical metadata**

```bash
git add src/catalog/types.ts tests/catalog-metadata.test.ts
git commit -m "feat: define capability metadata contracts"
```

---

### Task 3: Modularize the Existing Catalog Without Losing Behavior

**Files:**
- Create: `src/catalog/legacy.ts`
- Create: `src/catalog/registry.ts`
- Create: `src/catalog/index.ts`
- Modify: `src/catalog.ts`
- Modify: `tests/catalog.test.ts`

**Interfaces:**
- Consumes: current catalog IDs/names/statuses/summaries.
- Produces: `capabilities`, `getCapabilityById(id)`, `searchCapabilities(filters)`, existing compatibility exports.

- [ ] **Step 1: Extend the existing catalog test to assert stable compatibility**

Add assertions:

```ts
import { getCapabilityById } from "../src/catalog.js";

it("preserves stable current capability ids during modularization", () => {
  expect(getCapabilityById("swot")?.name).toBe("SWOT analysis");
  expect(getCapabilityById("break-even")?.domain).toBe("finance");
  expect(getCapabilityById("pdf-crud")?.status).toBe("planned");
});
```

- [ ] **Step 2: Run the focused test and verify failure**

```bash
npm test -- tests/catalog.test.ts
```

Expected: FAIL because `getCapabilityById` is not exported yet.

- [ ] **Step 3: Move current entries into `src/catalog/legacy.ts`**

Move the existing `capabilities` array unchanged in identity and broad meaning. Import its types from `./types.js`. Rename only the local exported array:

```ts
import type { CapabilityDefinition } from "./types.js";

export const legacyCapabilities: readonly CapabilityDefinition[] = [
  // Move every current catalog entry here without dropping any current id.
];
```

During this move, convert the three credential-dependent SEO entries to the approved boundary:

```ts
{
  id: "seo-keyword-metrics",
  name: "Keyword opportunity metrics",
  domain: "seo",
  mode: "research",
  status: "unavailable",
  summary: "Analyze user-supplied keyword metrics when provided; the plugin does not obtain proprietary keyword-demand or difficulty metrics through credentialed providers.",
  requires: "User-supplied exported metrics if proprietary demand/difficulty data is needed.",
},
{
  id: "seo-backlink-metrics",
  name: "Backlink and authority metrics",
  domain: "seo",
  mode: "research",
  status: "unavailable",
  summary: "Analyze user-supplied backlink exports or openly verifiable link evidence without requiring a commercial backlink account.",
  requires: "User-supplied export for proprietary backlink-index metrics.",
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

- [ ] **Step 4: Implement `src/catalog/registry.ts`**

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

const capabilityById = new Map(capabilities.map((capability) => [capability.id, capability]));

export function getCapabilityById(id: string): CapabilityDefinition | undefined {
  return capabilityById.get(id);
}

export function searchCapabilities({
  query,
  status,
  domain,
  limit = 20,
}: CapabilitySearch = {}): CapabilityDefinition[] {
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

- [ ] **Step 5: Add package exports and compatibility shim**

`src/catalog/index.ts`:

```ts
export * from "./types.js";
export * from "./registry.js";
```

Replace `src/catalog.ts` with:

```ts
export * from "./catalog/index.js";
```

- [ ] **Step 6: Update access-boundary assertions in `tests/catalog.test.ts`**

Replace the old provider-dependent SEO test with:

```ts
it("keeps credential-dependent SEO metrics unavailable under open access", () => {
  for (const id of ["seo-keyword-metrics", "seo-backlink-metrics", "seo-search-console"]) {
    expect(getCapabilityById(id)?.status).toBe("unavailable");
  }
});
```

- [ ] **Step 7: Run catalog tests**

```bash
npm test -- tests/catalog.test.ts tests/catalog-metadata.test.ts
```

Expected: PASS with all existing stable IDs preserved and credentialed SEO status corrected.

- [ ] **Step 8: Commit modular catalog**

```bash
git add src/catalog.ts src/catalog tests/catalog.test.ts
git commit -m "refactor: modularize capability registry"
```

---

### Task 4: Add Capability Composition Relationships

**Files:**
- Create: `src/catalog/relationships.ts`
- Create: `tests/catalog-relationships.test.ts`
- Modify: `src/catalog/index.ts`

**Interfaces:**
- Consumes: stable capability IDs from `getCapabilityById()`.
- Produces: `CapabilityRelationship`, `capabilityRelationships`, `getRelationshipsForCapability(id)`, `validateRelationshipGraph()`.

- [ ] **Step 1: Write failing graph-integrity tests**

```ts
import { describe, expect, it } from "vitest";
import {
  capabilityRelationships,
  getRelationshipsForCapability,
  validateRelationshipGraph,
} from "../src/catalog.js";

describe("capability relationship graph", () => {
  it("contains only resolvable non-self relationships", () => {
    expect(validateRelationshipGraph()).toEqual([]);
  });

  it("expresses useful finance and strategy composition", () => {
    expect(getRelationshipsForCapability("investment-appraisal")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: "break-even", to: "investment-appraisal" }),
      ]),
    );
    expect(getRelationshipsForCapability("entry-strategy")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: "market-attractiveness", to: "entry-strategy" }),
      ]),
    );
    expect(capabilityRelationships.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the focused test and verify failure**

```bash
npm test -- tests/catalog-relationships.test.ts
```

Expected: FAIL because relationship exports do not exist.

- [ ] **Step 3: Implement relationship contracts and graph validation**

Create `src/catalog/relationships.ts`:

```ts
import { getCapabilityById } from "./registry.js";

export const capabilityRelationshipKinds = [
  "prerequisite",
  "useful-follow-on",
  "alternative",
  "overlap",
] as const;
export type CapabilityRelationshipKind = (typeof capabilityRelationshipKinds)[number];

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
    rationale: "Market size can materially inform attractiveness when demand scale matters.",
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
    if (relationship.from === relationship.to) {
      problems.push(`self:${relationship.from}`);
    }
    if (!getCapabilityById(relationship.from)) {
      problems.push(`missing-from:${relationship.from}`);
    }
    if (!getCapabilityById(relationship.to)) {
      problems.push(`missing-to:${relationship.to}`);
    }
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

- [ ] **Step 5: Commit composition graph**

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
- Consumes: `getCapabilityById(id)`, `capabilityRelationships`.
- Produces: `RoutingIntent`, `WorkflowPlan`, `WorkflowNode`, `buildWorkflowPlan(intent)`.

- [ ] **Step 1: Write failing routing tests**

```ts
import { describe, expect, it } from "vitest";
import { buildWorkflowPlan } from "../src/routing/build-plan.js";

describe("workflow plan validation", () => {
  it("builds a bounded graph from host-selected capability ids", () => {
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
  });

  it("does not pretend an unavailable capability is executable", () => {
    const plan = buildWorkflowPlan({
      objective: "Use my live Search Console account",
      capabilityIds: ["seo-search-console"],
      requestedOutputs: ["text"],
    });

    expect(plan.executable).toBe(false);
    expect(plan.blockers).toContainEqual(
      expect.objectContaining({ capabilityId: "seo-search-console", reason: "unavailable" }),
    );
  });

  it("rejects unknown capability ids", () => {
    expect(() =>
      buildWorkflowPlan({
        objective: "Unknown request",
        capabilityIds: ["does-not-exist"],
        requestedOutputs: ["text"],
      }),
    ).toThrow("Unknown capability id: does-not-exist");
  });
});
```

- [ ] **Step 2: Run routing tests and verify failure**

```bash
npm test -- tests/routing-plan.test.ts
```

Expected: FAIL because routing modules do not exist.

- [ ] **Step 3: Implement routing contracts**

`src/routing/types.ts`:

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

- [ ] **Step 4: Implement deterministic plan construction**

`src/routing/build-plan.ts`:

```ts
import { capabilityRelationships, getCapabilityById } from "../catalog/index.js";
import type { RoutingIntent, WorkflowBlocker, WorkflowPlan } from "./types.js";

const blockerReason = (
  status: string,
): WorkflowBlocker["reason"] | undefined => {
  if (status === "implemented") return undefined;
  if (
    status === "unavailable" ||
    status === "planned" ||
    status === "partial" ||
    status === "provider-dependent"
  ) {
    return status;
  }
  return "unavailable";
};

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
      .filter(
        ({ kind, from, to }) =>
          kind === "prerequisite" || kind === "useful-follow-on"
            ? to === capability.id && selectedIds.has(from)
            : false,
      )
      .map(({ from }) => from),
  }));

  const blockers = selected.flatMap((capability) => {
    const reason = blockerReason(capability.status);
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

- [ ] **Step 6: Commit workflow-plan validation**

```bash
git add src/routing tests/routing-plan.test.ts
git commit -m "feat: validate consulting workflow plans"
```

---

### Task 6: Add Epistemic Claim Contracts

**Files:**
- Create: `src/epistemics/types.ts`
- Create: `src/epistemics/validate-claim.ts`
- Create: `tests/epistemics.test.ts`

**Interfaces:**
- Consumes: no external service.
- Produces: `EpistemicClass`, `ClaimRecord`, `ClaimValidationFinding`, `validateClaimRecord(claim)`.

- [ ] **Step 1: Write failing epistemic validation tests**

```ts
import { describe, expect, it } from "vitest";
import { validateClaimRecord } from "../src/epistemics/validate-claim.js";

describe("epistemic claim contracts", () => {
  it("requires provenance for verified external facts", () => {
    const findings = validateClaimRecord({
      id: "claim-1",
      text: "The market grew 12% last year.",
      classification: "verified-external-fact",
      sourceIds: [],
    });
    expect(findings).toContainEqual(
      expect.objectContaining({ code: "verified-fact-missing-source", severity: "error" }),
    );
  });

  it("requires a calculation reference for deterministic calculations", () => {
    const findings = validateClaimRecord({
      id: "claim-2",
      text: "Break-even volume is 1,000 units.",
      classification: "deterministic-calculation",
    });
    expect(findings).toContainEqual(
      expect.objectContaining({ code: "calculation-missing-reference", severity: "error" }),
    );
  });

  it("accepts an explicitly bounded assumption", () => {
    expect(
      validateClaimRecord({
        id: "claim-3",
        text: "Assume demand remains flat for the base case.",
        classification: "bounded-assumption",
        assumptionBasis: "User requested a flat-demand base case.",
      }),
    ).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the focused test and verify failure**

```bash
npm test -- tests/epistemics.test.ts
```

Expected: FAIL because the epistemic modules do not exist.

- [ ] **Step 3: Define epistemic classes and claim record**

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
  code:
    | "verified-fact-missing-source"
    | "calculation-missing-reference"
    | "assumption-missing-basis";
  severity: "error";
  claimId: string;
}
```

- [ ] **Step 4: Implement deterministic claim validation**

`src/epistemics/validate-claim.ts`:

```ts
import type { ClaimRecord, ClaimValidationFinding } from "./types.js";

export function validateClaimRecord(claim: ClaimRecord): ClaimValidationFinding[] {
  const findings: ClaimValidationFinding[] = [];

  if (
    claim.classification === "verified-external-fact" &&
    (claim.sourceIds?.length ?? 0) === 0
  ) {
    findings.push({
      code: "verified-fact-missing-source",
      severity: "error",
      claimId: claim.id,
    });
  }

  if (claim.classification === "deterministic-calculation" && !claim.calculationRef?.trim()) {
    findings.push({
      code: "calculation-missing-reference",
      severity: "error",
      claimId: claim.id,
    });
  }

  if (claim.classification === "bounded-assumption" && !claim.assumptionBasis?.trim()) {
    findings.push({
      code: "assumption-missing-basis",
      severity: "error",
      claimId: claim.id,
    });
  }

  return findings;
}
```

- [ ] **Step 5: Run epistemic tests**

```bash
npm test -- tests/epistemics.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit epistemic contracts**

```bash
git add src/epistemics tests/epistemics.test.ts
git commit -m "feat: add epistemic claim contracts"
```

---

### Task 7: Add Common Quality/Evaluation Contracts

**Files:**
- Create: `src/quality/types.ts`
- Create: `src/quality/evaluate.ts`
- Create: `tests/quality.test.ts`

**Interfaces:**
- Consumes: `QualityGateId` from catalog types.
- Produces: `QualityDimension`, `QualityFinding`, `QualityReport`, `evaluateQuality()`, `canPromoteCapability()`.

- [ ] **Step 1: Write failing QA tests**

```ts
import { describe, expect, it } from "vitest";
import { canPromoteCapability, evaluateQuality } from "../src/quality/evaluate.js";

describe("quality evaluation contracts", () => {
  it("fails required gates with error findings", () => {
    const report = evaluateQuality({
      requiredGateIds: ["epistemic.source-support", "consulting.problem-framing"],
      passedGateIds: ["consulting.problem-framing"],
      findings: [
        {
          gateId: "epistemic.source-support",
          dimension: "epistemic",
          severity: "error",
          message: "A verified fact has no supporting source.",
        },
      ],
    });

    expect(report.passed).toBe(false);
    expect(report.missingGateIds).toEqual(["epistemic.source-support"]);
    expect(canPromoteCapability(report)).toBe(false);
  });

  it("permits promotion only when all required gates pass without errors", () => {
    const report = evaluateQuality({
      requiredGateIds: ["consulting.problem-framing"],
      passedGateIds: ["consulting.problem-framing"],
      findings: [],
    });
    expect(report.passed).toBe(true);
    expect(canPromoteCapability(report)).toBe(true);
  });
});
```

- [ ] **Step 2: Run focused QA tests and verify failure**

```bash
npm test -- tests/quality.test.ts
```

Expected: FAIL because quality modules do not exist.

- [ ] **Step 3: Define QA contracts**

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

- [ ] **Step 4: Implement QA evaluation**

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

- [ ] **Step 5: Run QA tests**

```bash
npm test -- tests/quality.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit QA foundation**

```bash
git add src/quality tests/quality.test.ts
git commit -m "feat: add consulting quality contracts"
```

---

### Task 8: Expose Focused Capability Discovery and Workflow Validation MCP Tools

**Files:**
- Create: `src/catalog/register-tools.ts`
- Modify: `src/server.ts`
- Create: `tests/catalog-tools.test.ts`
- Modify: `tests/server.test.ts`

**Interfaces:**
- Consumes: `searchCapabilities()`, `getCapabilityById()`, `buildWorkflowPlan()`.
- Produces MCP tools: `search_consulting_capabilities`, `inspect_consulting_capability`, `validate_consulting_workflow`.

- [ ] **Step 1: Write failing MCP tool contract test**

Use the existing MCP client test pattern in the repository. Assert the tool list contains exactly these capability-layer tools in addition to existing artifact/PDF/finance tools:

```ts
expect(toolNames).toEqual(
  expect.arrayContaining([
    "search_consulting_capabilities",
    "inspect_consulting_capability",
    "validate_consulting_workflow",
  ]),
);
```

Then call `validate_consulting_workflow` with:

```ts
{
  objective: "Assess a market and choose an entry approach",
  capabilityIds: ["market-attractiveness", "entry-strategy"],
  requestedOutputs: ["text"]
}
```

and assert structured content contains `executable: true` plus two workflow nodes.

Call it again with `capabilityIds: ["seo-search-console"]` and assert `executable: false` with an unavailable blocker.

- [ ] **Step 2: Run the MCP tool test and verify failure**

```bash
npm test -- tests/catalog-tools.test.ts
```

Expected: FAIL because the new inspection/workflow-validation tools do not exist.

- [ ] **Step 3: Implement `src/catalog/register-tools.ts`**

Use Zod v4 Standard Schema and mark all three tools read-only, closed-world, and non-destructive:

```ts
annotations: {
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
}
```

The search tool retains the current bounded query/domain/status/limit behavior.

The inspection tool input is:

```ts
z.object({ id: z.string().trim().min(1).max(120) })
```

It returns one catalog record or an MCP tool error without fabricating a match.

The workflow-validation tool input is:

```ts
z.object({
  objective: z.string().trim().min(1).max(2000),
  capabilityIds: z.array(z.string().trim().min(1).max(120)).min(1).max(30),
  requestedOutputs: z.array(z.enum(outputModalities)).min(1).max(10),
})
```

Its description must state that the host/Skill performs semantic interpretation and chooses candidate capability IDs; this tool validates the structured plan and does not claim to understand raw consulting language by itself.

- [ ] **Step 4: Simplify `src/server.ts` without changing unrelated registrations**

Replace the inline capability-tool schema/registration block with:

```ts
import { registerCapabilityTools } from "./catalog/register-tools.js";
```

and inside `createServer()`:

```ts
registerCapabilityTools(server);
registerArtifactTools(server, artifactStore, artifactOptions);
registerPdfTools(server, artifactStore);
registerFinanceTools(server);
```

Update server instructions to include:

```text
Natural-language semantic interpretation belongs to the consulting orchestration workflow. Use the capability catalog to select candidate capability IDs, then validate multi-capability plans before presenting them as executable. Capability status and open-access limits are hard truth boundaries. Use epistemic labels and applicable QA gates rather than invented confidence percentages.
```

- [ ] **Step 5: Run server/tool tests**

```bash
npm test -- tests/catalog-tools.test.ts tests/server.test.ts
```

Expected: PASS, and existing artifact/PDF/finance registrations remain present.

- [ ] **Step 6: Commit MCP capability tools**

```bash
git add src/catalog/register-tools.ts src/server.ts tests/catalog-tools.test.ts tests/server.test.ts
git commit -m "feat: expose capability workflow validation"
```

---

### Task 9: Make the Orchestrator Use Semantic Selection Plus Deterministic Validation

**Files:**
- Modify: `skills/consulting-orchestrator/SKILL.md`
- Create: `tests/orchestrator-skill.test.ts`

**Interfaces:**
- Consumes: capability search/inspection/workflow validation tools.
- Produces: host-model orchestration sequence for raw natural-language requests.

- [ ] **Step 1: Write a failing Skill contract test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const skill = readFileSync(
  new URL("../skills/consulting-orchestrator/SKILL.md", import.meta.url),
  "utf8",
);

describe("consulting orchestrator skill", () => {
  it("uses semantic routing without pretending slash commands or opaque TypeScript NLP", () => {
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

- [ ] **Step 2: Run focused Skill test and verify failure**

```bash
npm test -- tests/orchestrator-skill.test.ts
```

Expected: FAIL because the current Skill does not yet describe the complete approved sequence.

- [ ] **Step 3: Update the Skill routing sequence**

The Skill must require this sequence for substantive consulting work:

```markdown
1. Interpret the user's natural-language objective, decision, audience, stakes, evidence, outputs, and constraints.
2. Search the capability catalog for candidate capabilities; do not require the user to know framework names.
3. Inspect promising capability records and reject anti-trigger/method mismatches.
4. Select the smallest sufficient set of complementary capability IDs.
5. Validate multi-capability plans through `validate_consulting_workflow` before treating them as executable.
6. If a selected capability is planned, partial, provider-dependent, or unavailable, revise the plan or disclose the blocker rather than simulating execution.
7. Classify material claims using the applicable epistemic class and obtain current public evidence when freshness/stakes require it.
8. Prefer deterministic tools for fixed calculations.
9. Select the deliverable modality that best serves the decision.
10. Apply the required analytical, epistemic, consulting, and artifact quality gates before final delivery.
```

Also state that semantic interpretation is performed by the host model/Skill and that the deterministic validator enforces IDs/status/dependencies; do not claim a lexical keyword router is SOTA semantic understanding.

- [ ] **Step 4: Run Skill tests**

```bash
npm test -- tests/orchestrator-skill.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit orchestrator routing contract**

```bash
git add skills/consulting-orchestrator/SKILL.md tests/orchestrator-skill.test.ts
git commit -m "docs: formalize autonomous consulting routing"
```

---

### Task 10: Document the Foundation and Run the Full Verification Gate

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`

**Interfaces:**
- Consumes: all Task 1–9 deliverables.
- Produces: truthful repository documentation and verified completion of subproject 1.

- [ ] **Step 1: Update README with only implemented foundation claims**

Document that:

- capability metadata contracts and modular registry exist;
- semantic interpretation remains a host/Skill responsibility;
- deterministic workflow validation enforces known IDs, capability status, and encoded relationships;
- epistemic and common QA result contracts exist;
- the catalog has **not** yet reached the 100+ breadth milestone unless Task 2 of the program has separately completed;
- no new credentialed provider integrations were added.

Use this exact sentence to prevent overclaiming:

```markdown
The foundation validates structured capability plans; it does not claim that a hand-written keyword classifier independently understands arbitrary consulting language. Natural-language semantic selection remains a host-model/Skill responsibility backed by the typed catalog and deterministic validation layer.
```

- [ ] **Step 2: Run focused foundation tests**

```bash
npm test -- tests/governance-architecture.test.ts tests/catalog-metadata.test.ts tests/catalog.test.ts tests/catalog-relationships.test.ts tests/routing-plan.test.ts tests/epistemics.test.ts tests/quality.test.ts tests/catalog-tools.test.ts tests/orchestrator-skill.test.ts tests/server.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run the repository verification command**

```bash
npm run verify
```

Expected: typecheck PASS, complete Vitest suite PASS, production TypeScript build PASS.

If local dependency/network conditions prevent execution, do not claim success; use current GitHub Actions evidence for the exact HEAD if accessible. If neither local nor runner evidence is available, leave the subproject verification gate explicitly open.

- [ ] **Step 4: Re-check branch integrity**

Confirm GitHub branch enumeration contains `main` as the only authoritative branch. If another branch exists, compare it to `main` before any completion claim; `main` must not be behind.

- [ ] **Step 5: Mark subproject 1 complete only after evidence exists**

In `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`, append this completion record only after Step 3 and Step 4 are proven:

```markdown
### Subproject 1 verification

Capability Platform Foundation verified on `<exact commit SHA>` with `npm run verify` passing and `main` confirmed authoritative. Subproject 2 may begin.
```

Replace `<exact commit SHA>` with the actual verified commit SHA at execution time; do not write the record before that value exists.

- [ ] **Step 6: Commit documentation only after verification**

```bash
git add README.md docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md
git commit -m "docs: record capability foundation status"
```

- [ ] **Step 7: Verify the documentation commit too**

```bash
npm run verify
```

Expected: PASS on the documentation commit HEAD. If it does not pass, the subproject remains incomplete.

---

## Foundation Completion Criteria

This plan is complete only when all of these are proven on `main`:

1. Approved architecture language is reflected in governance.
2. Canonical capability metadata types exist and include the approved open-access, output, evidence, risk, and quality dimensions.
3. The existing catalog is modularized without dropping stable capability IDs.
4. Credential/private-account SEO capabilities are `unavailable` and describe user-supplied exports as the supported path.
5. Capability relationships contain no dangling/self references.
6. Structured workflow plans reject unknown IDs and expose non-implemented blockers instead of simulating execution.
7. Epistemic claim validation prevents a verified external fact without source provenance and a deterministic calculation without a calculation reference.
8. Common QA reports fail missing required gates and error findings; promotion requires a passing report.
9. MCP exposes focused search, inspect, and workflow-validation capability tools without turning every consulting capability into an MCP tool.
10. The consulting Skill performs natural-language semantic interpretation and uses deterministic validation before promising a multi-capability plan is executable.
11. Full repository verification passes on the exact completion HEAD.
12. `main` is authoritative and not behind another branch.

## Explicit Non-Goals of This Foundation

These are intentionally deferred to later program subprojects and must not be claimed by this plan:

- reaching the 100+ capability breadth milestone;
- new NPV/DCF/IRR/statistical/forecasting engines;
- broad CSV/XLSX/DOCX/PDF/PPTX CRUD;
- chart rendering or PPTX generation;
- anonymous public-web fetching;
- SEO crawling;
- production remote MCP hosting;
- marketplace submission readiness.
