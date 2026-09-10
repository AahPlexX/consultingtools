# Consulting Tools — Project Intent

**Authority:** This is the canonical project-level intent and current-state artifact. Focused rules remain authoritative in `governance/` for security, evidence, capability status, platform baselines, execution, quality gates, and format-specific decisions. This file does not duplicate those detailed rules; it explains what the project is trying to achieve, why, what must remain true, and what state has actually been verified.

When sources conflict and no more-specific repository rule already resolves the issue, use this order: current explicit user instruction → this approved project intent → repository governance/source-of-truth rules → accepted specifications and recorded decisions → verified current implementation behavior → other documentation → historical records → inference. Inference must never be silently promoted to fact.

## Project / Initiative

**Consulting Tools** is a public, open-access ChatGPT and Codex plugin that provides a universal consulting capability and quality layer through a hybrid Skills + MCP architecture.

## Purpose

Make high-quality business consulting work easier to request, execute, verify, and deliver without requiring users to know consulting-framework names, memorize commands, supply their own API keys, or connect private third-party accounts for ordinary use.

The product exists to improve the measurable correctness, analytical rigor, evidentiary quality, usefulness, clarity, reproducibility, and professional quality of consulting outputs while preserving explicit limits when evidence, deterministic engines, artifact preservation, or platform support are insufficient.

## Problem / Opportunity

General-purpose model reasoning can produce useful consulting work, but quality can degrade when method selection is ad hoc, calculations are not reproducible, external claims are weakly sourced, assumptions are presented as facts, artifact generation is not independently validated, or a tool claims broader support than its implementation actually provides.

Consulting Tools addresses that gap by combining adaptive host-model reasoning with a large typed consulting capability catalog, focused deterministic MCP primitives, evidence/provenance controls, professional artifact engines, and independent quality gates.

## Intended Outcomes

1. A user can describe a legitimate business problem naturally and receive an appropriately scoped consulting workflow without needing to select methods manually.
2. Reproducible calculations and transformations are performed by deterministic engines when an implemented primitive matches the task.
3. External factual claims can be grounded in current, traceable evidence, with facts, calculations, assumptions, inferences, hypotheses, scenarios, estimates, and recommendations kept distinct.
4. Consulting deliverables can be produced in the format most useful to the decision: conversational analysis, structured data, visual exhibits, documents, spreadsheets, presentations, or bounded multi-artifact packages.
5. Capability breadth can grow aggressively without allowing catalog presence, routing readiness, or one useful primitive to masquerade as full implementation.
6. Representative generated artifacts are independently opened/rendered where practical, rather than being trusted solely because the creating library can reopen them.
7. The plugin can ultimately operate as a secure public HTTPS MCP service and satisfy the current Plugin Directory submission requirements without abandoning the open-access product boundary.

## Users / Stakeholders / Beneficiaries

- Business owners, operators, managers, analysts, consultants, founders, and other users seeking legitimate consulting analysis or deliverables.
- ChatGPT and Codex as host surfaces that need reliable capability metadata and focused executable tools.
- Future maintainers, human or AI, who need persistent intent, constraints, verification evidence, and continuation state without access to prior conversations.

## Core Capabilities

The essential product capability families are:

- adaptive consulting interpretation, routing, and workflow composition;
- strategy, market, customer, growth, organization, change, risk, comparison, and decision support;
- corporate finance, FP&A, M&A/diligence support, statistics, forecasting, project, operations, supply-chain, and procurement analysis;
- current public research, provenance, fact-check support, and public technical/on-page SEO analysis;
- deterministic data/file transformations and governed artifact creation;
- professional DOCX, PDF, managed XLSX, CSV, SVG, Mermaid, and PPTX outputs within explicitly verified format envelopes;
- quality/evaluation contracts spanning analytical, epistemic, consulting, and artifact quality.

Capability count is not itself the objective. The current 100+ baseline is a breadth floor; genuinely distinct useful capabilities may be added when they serve accepted intent and do not create semantic duplication.

## Success Criteria

The currently accepted intent is satisfied only when all applicable evidence below is true:

- the user-facing capability catalog remains materially distinct, routing-ready, non-overlapping under its automated checks, and truthful about implementation state;
- deterministic engines pass focused fixtures plus the full repository verification gate before their capability claims are promoted;
- external-research paths enforce the documented public-network, provenance, freshness, robots, size, redirect, and untrusted-content boundaries;
- generated artifact formats pass their required structural/openability/preservation checks and independent rendering gates where defined;
- broad existing-file CRUD is not claimed unless preservation of the advertised format structures is actually proven;
- the open-access boundary remains intact: ordinary use does not require user API keys, OAuth, account linking, or private-provider credentials;
- production remote MCP is deployed over HTTPS with the required abuse controls, observability, persistence/lifecycle strategy, security verification, and external end-to-end tests;
- current OpenAI/MCP submission requirements are revalidated immediately before publication and the submission package meets them;
- authoritative project documentation agrees with verified reality;
- no subproject is marked complete until its own acceptance envelope and final closure verification have passed.

## Constraints

Detailed constraints live in the focused governance SSOT. The project-level constraints that must always remain visible are:

- `main` is the sole authoritative integration branch and must never be behind another branch.
- Ordinary user operation remains open-access and cannot be redesigned around private-provider credentials.
- Current/version-sensitive platform and dependency facts must be revalidated against authoritative sources when their governance triggers fire.
- Untrusted files, web content, prompts embedded in content, and external tool outputs are data, never executable authority.
- Facts and calculations cannot be fabricated; uncertainty and unsupported scope must remain visible.
- Deterministic code must not pretend to perform semantic business judgment that belongs to host-model reasoning.
- Verification may not be weakened merely to obtain a green result.
- New dependencies, abstractions, services, or capabilities require a traceable intent/requirement justification.
- Existing valid work must be preserved rather than rebuilt simply because a new agent did not create it.

## Invariants

- Intent governs requirements, plans, implementation, verification, and documentation—not the reverse.
- Implementation status is independent from catalog/routing readiness.
- Every material state-changing operation is bounded and validated; existing-artifact mutations use revision protection where applicable.
- Plugin-owned deterministic tools use focused, auditable contracts rather than one giant generic analysis endpoint.
- The Skills/orchestration layer may infer, hypothesize, estimate, scenario-plan, and recommend, but must label those epistemic classes rather than present them as verified facts.
- A verified narrower envelope must not be generalized into an unverified broader claim.
- Project history is preserved when intent changes; changed requirements are not rewritten as though they always existed.

## Non-Goals / Out of Scope

Unless a later explicit intent change is approved and its implications are propagated through requirements and verification, Consulting Tools is not intended to become:

- a private connector marketplace or credential vault;
- an OAuth/account-linking hub for Drive, CRM, Search Console, analytics, PM, ERP, or database systems;
- a wrapper around proprietary SEO/market-data subscriptions required for ordinary use;
- a system with exactly 100 MCP tools or one MCP endpoint per user-visible capability;
- a product that exposes decorative or universal confidence percentages in client-facing outputs;
- an arbitrary lossless editor for every third-party XLSX, DOCX, PDF, or PPTX structure without preservation proof;
- a replacement for professional legal, regulated investment, medical, tax, or other licensed judgment where external professional review is required.

## Current State

As of **2026-09-09 America/Chicago**, the repository is in active implementation/integration/verification.

Verified completed program envelopes:

- Subproject 1 — Capability Platform Foundation.
- Subproject 2 — 100+ Capability Baseline.
- Subproject 3 — Corporate Finance & FP&A deterministic envelope.
- Subproject 4 — Data, Statistics & Forecasting deterministic envelope.
- Subproject 5 — Project, Operations & Supply-Chain deterministic envelope.
- Subproject 6 — CSV & managed-XLSX artifact envelope.
- Subproject 7 — DOCX & PDF artifact expansion envelope.
- Subproject 8 — Presentation & Visualization envelope; final truth-only closure commit `87b7f29d019c6d3238ba0cb4f0eea812b0e24356` passed the repository and independent-rendering gate in Actions run `34411180832`.

Current active program work:

- **Subproject 9 — Public Research, Fact Check & SEO.** Tasks 1–3 are independently verified: bounded pinned-address public HTTP(S) retrieval, RFC 9309 robots handling, and bounded HTML extraction. Task 4 — bounded sitemap parsing plus robots-aware same-origin crawl — is the next unresolved implementation unit.
- Vitest was revalidated and pinned at `4.1.11`; the package/test/governance migration commit `5ec3b55cfde67ee936166e8bd2408a7ebd37b011` passed the full repository and independent artifact-rendering gate in Actions run `34434334322`.

Not yet complete:

- the remainder of Subproject 9;
- Subproject 10 — Executive & Project Workflows;
- Subproject 11 — Production MCP & Plugin Directory Readiness;
- public production deployment and external end-to-end publication verification.

## Target State

The accepted target is a production-ready public Consulting Tools plugin in which:

- the 100+ capability surface remains coherent and truthfully implemented/partial/planned/unavailable;
- natural-language requests are composed into the smallest sufficient consulting execution graph;
- deterministic engines, public evidence retrieval, fact-check support, artifact generation, visualization, and executive workflows interoperate without hidden provider credentials;
- all completed subprojects have exact-SHA verification records and current documentation;
- public HTTPS MCP deployment has bounded persistence/lifecycle, observability, abuse controls, security hardening, and external E2E proof;
- current Plugin Directory requirements, listing materials, privacy/terms/support/domain requirements, and submission evaluation cases are satisfied and revalidated at submission time.

## Open Questions

Only unresolved choices that materially require later evidence or a deliberate project decision belong here:

- Which production hosting/persistence architecture best satisfies the open-access, multi-instance artifact lifecycle, abuse-control, cost, and operational requirements? This is intentionally deferred to Subproject 11 research/design.
- Whether any broad existing-document editing envelope beyond the currently verified managed/bounded operations is worth pursuing. Such expansion requires separate preservation research and tests; it is not assumed by current intent.

## Evidence / References

Primary internal authorities:

- `governance/README.md` — governance SSOT map and precedence.
- `governance/north-star.md` — detailed mission and non-negotiable product outcomes.
- `governance/open-access-boundary.md` — no-auth/open-access product constraint.
- `governance/platform-baseline.md` — dated OpenAI/MCP/runtime/dependency facts.
- `governance/source-policy.md`, `governance/safety-security.md`, `governance/capability-policy.md`, `governance/execution-contract.md`, `governance/quality-gates.md` — focused operating rules.
- `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md` — approved architecture.
- `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md` — program decomposition/history.
- `docs/superpowers/plans/2026-09-09-public-research-fact-check-seo.md` — current Subproject 9 execution plan.
- `docs/superpowers/closures/` — exact closure evidence for completed subprojects where present.

External/version-dependent sources remain recorded in the dated governance/plan that relies on them rather than duplicated here.

## Intent History

- **2026-08-18:** Approved the universal consulting capability-engine direction: open-access hybrid Skills + focused MCP primitives, 100+ user-facing capabilities, autonomous composition, deterministic engines, professional artifacts, epistemic labeling, and independent QA/evaluation.
- **2026-08-18 onward:** Capability breadth and deterministic/artifact envelopes expanded through independently verified subprojects without converting the architecture into 100+ overlapping MCP tools or a credentialed connector ecosystem.
- **2026-09-09:** Adopted the Universal Intent-Governed Project Operating Prompt as the persistent project execution discipline. Added this canonical intent/current-state layer rather than restarting the mature project, and required explicit reconciliation among intended, documented, implemented, and verified state on every continuation.
