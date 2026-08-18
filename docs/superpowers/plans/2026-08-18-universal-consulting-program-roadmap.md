# Universal Consulting Capability Engine — Program Roadmap

> **For agentic workers:** This roadmap decomposes the approved architecture into independently testable implementation plans. Each subproject gets its own detailed plan before code execution. `main` remains the sole authoritative branch.

**Goal:** Deliver the approved Universal Consulting Capability Engine without allowing capability breadth to outrun routing, epistemic, security, artifact-preservation, or quality verification.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Global constraints

- Ordinary Consulting Tools use must not require a user API key, OAuth, account linking, or private third-party provider credentials.
- Natural-language use is primary; native plugin slash commands are not assumed.
- Reach at least 100 materially distinct user-visible capabilities, but do not equate capability count with MCP tool count.
- Prefer a compact, composable MCP primitive surface over overlapping tool proliferation.
- Fabrication, false precision, invented citations/metrics/file contents/tool execution, and unsupported certainty are prohibited.
- Distinguish verified fact, user-supplied fact, deterministic calculation, bounded assumption, inference, hypothesis, estimate, scenario, and recommendation when the distinction affects interpretation.
- Use deterministic code for fixed mathematical definitions; expose assumptions and reject invalid domains.
- Promote no capability to `implemented` until its execution path and required quality gates pass.
- Existing validated PDF, DOCX, artifact, finance, MCP v2, runtime-freshness, and security-boundary behavior must be preserved unless a tested replacement is superior.
- Existing-workbook XLSX mutation remains gated by `governance/xlsx-engine-decision.md` until preservation/security evidence supports a change.
- Production public retrieval must include SSRF protections, request/resource bounds, safe logging, and abuse controls.
- `main` is the sole authoritative branch.

## Ordered subprojects

| # | Subproject | Depends on | Independently testable deliverable |
| --- | --- | --- | --- |
| 1 | Capability Platform Foundation | Existing repo | Typed capability metadata, modular registry, composition contracts, epistemic contracts, QA result contracts, routing-plan validation, MCP discovery/validation primitives, orchestrator rules |
| 2 | 100+ Capability Baseline | 1 | At least 100 non-overlapping user-visible capabilities across the approved domain families with triggers, anti-triggers, evidence/output/QA metadata and uniqueness tests |
| 3 | Corporate Finance & FP&A Engines | 1–2 | Reproducible NPV, payback, financial ratios, working capital, variance, scenario/sensitivity and related finance primitives with formula definitions and tests |
| 4 | Data, Statistics & Forecasting Engines | 1–2 | Profiling, descriptive statistics, statistical tests/intervals, time-series baselines, backtesting and error metrics with reproducible fixtures |
| 5 | Project, Operations & Supply-Chain Engines | 1–2 | Critical-path/schedule, capacity/utilization/throughput, weighted decisions, inventory/procurement and operational diagnostics where definitions are deterministic |
| 6 | CSV & XLSX Artifact Engines | 1–5 | Safe CSV CRUD plus a validated XLSX creation/editing envelope, formula/check/audit conventions, rendering/openability and preservation tests |
| 7 | DOCX & PDF Artifact Expansion | 1–5 | Professional document creation plus bounded existing-file operations with preservation, rendering/openability and regression gates |
| 8 | Presentation & Visualization Engine | 1–5 | Chart/exhibit selection, SVG/Mermaid generation, PPTX creation, analytical exhibit validation, accessibility and rendering gates |
| 9 | Public Research, Fact Check & SEO | 1–2 | Anonymous bounded public retrieval, source provenance, conflict handling, claim validation, public SEO crawl/audit functions and explicit private-metric exclusions |
| 10 | Executive & Project Workflows | 1–9 | Composed workflows producing business cases, diligence packs, board decks, operating plans, trackers, dashboards, forecasts and assessments through applicable QA gates |
| 11 | Production MCP & Plugin Directory Readiness | 1–10 | Public HTTPS MCP, deployment persistence strategy, abuse/security controls, observability, external E2E verification, listing/legal/support assets and submission evaluations |

## Dependency logic

1. Subproject 1 is mandatory first because every later implementation relies on capability identity, access status, epistemic classes, composition relationships, routing-plan validation, and common QA contracts.
2. Subproject 2 establishes breadth before domain-specific engines so new deterministic primitives map to stable capability IDs instead of inventing parallel taxonomies.
3. Subprojects 3–5 may proceed independently after 1–2, but each must use the common QA/result contracts.
4. Artifact subprojects 6–8 depend on analytical contracts because generated workbooks, reports, charts, and decks must validate the underlying calculations and provenance, not only file syntax.
5. Public research in subproject 9 depends on the epistemic and source-quality contracts established in subproject 1.
6. Workflow composition in subproject 10 waits until the underlying engines/artifacts/research have real capability states; it may not simulate missing implementations.
7. Production/marketplace work in subproject 11 is final because public claims, schemas, annotations, abuse controls, and evaluation cases must describe the actually implemented product.

## Program completion gates

The program is not complete until all of the following are true:

- natural-language consulting requests can be mapped to a bounded validated workflow using the catalog and composition contracts;
- the catalog contains at least 100 materially distinct user-visible capabilities and can scale further without an equivalent MCP-tool explosion;
- every implemented deterministic calculation is reproducible and independently tested;
- every generated artifact family has an explicit creation/editing/preservation envelope and rendering/openability validation appropriate to the format;
- research outputs preserve source provenance, freshness, conflict handling, and epistemic labels;
- QA can produce machine-readable analytical, epistemic, consulting, and artifact findings without inventing a universal confidence score;
- private-provider/OAuth capabilities remain outside ordinary product operation unless the user supplies data as an input artifact;
- end-to-end representative consulting workflows pass positive, negative, malformed-input, edge, and regression evaluations;
- the production MCP endpoint is externally verified and public-listing metadata accurately matches its behavior;
- `main` is the only authoritative integration branch and is not behind another branch.

## Verification record

### Subproject 1 verification

Capability Platform Foundation verified on `16e5d2938c0645df996c25982213952ed53916cb` with `npm run verify` passing through GitHub Actions run `32175704377`; the `ci/verify` commit status and the workflow verify job both concluded `success`. Subproject 2 may begin.

The foundation verification covers the modular capability registry, open-access status correction, capability relationship graph, structured workflow-plan validation, epistemic contracts, common QA contracts, MCP capability search/inspection/workflow validation, orchestrator Skill contract, and all preserved pre-existing regression tests.

## Next detailed plan

Write and approve the detailed implementation plan for Subproject 2 — **100+ Capability Baseline** — before changing the capability breadth catalog. Subproject 2 must use the verified Subproject 1 contracts rather than introducing a parallel taxonomy.
