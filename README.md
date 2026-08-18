# Consulting Tools

Consulting Tools is an in-development public, open-access plugin for ChatGPT and Codex intended to provide a universal consulting capability and quality layer: adaptive consulting workflows, deterministic analysis, evidence controls, professional artifacts, and measurable quality gates without requiring ordinary users to connect private third-party accounts.

## Access model

Consulting Tools is intentionally designed so ordinary use does **not** require a user-supplied API key, OAuth flow, account linking, or private third-party provider credential. The governing boundary is `governance/open-access-boundary.md`.

The plugin may work with user-supplied files/data, plugin-owned computation, public web resources that require no user credential, and host-native capabilities already available through the active ChatGPT/Codex surface. It is not intended to become a connector hub for private cloud drives, CRMs, analytics accounts, Search Console, commercial SEO-data subscriptions, project-management systems, or private databases. A user may still upload an export from such a system as ordinary input.

## Current foundation

The repository uses a hybrid plugin architecture:

- **Skills** perform natural-language consulting interpretation, method selection, sequencing, and deliverable reasoning.
- **Capability catalog** exposes stable user-visible consulting capability identities and truthful implementation status.
- **MCP tools** perform reproducible validation, calculations, file operations, and other controlled executable work.
- **Epistemic contracts** distinguish verified facts, user-supplied facts, deterministic calculations, bounded assumptions, inferences, hypotheses, estimates, scenarios, and recommendations.
- **Quality contracts** provide machine-readable analytical, epistemic, consulting, and artifact gate results instead of decorative confidence scores.
- **Governance** is model-agnostic and lives under `governance/`. `AGENTS.md` is the universal entry point for any LLM or agent modifying this repository.
- **Capability status is explicit.** A capability is never presented as implemented merely because it appears on the roadmap or in the catalog.
- **External-platform facts are dated.** `governance/platform-baseline.md` records the verified OpenAI/MCP/runtime snapshot and the events that require live revalidation.

## Capability platform foundation

The capability layer is modularized behind typed, composable contracts:

- `src/catalog/types.ts` defines canonical domains, modes, statuses, output modalities, artifact formats, access boundaries, risk classes, and QA gate identifiers;
- `src/catalog/legacy.ts` preserves current stable capability IDs while explicitly marking those entries as not yet fully routing-ready;
- `src/catalog/registry.ts` supplies bounded search and stable-ID lookup;
- `src/catalog/relationships.ts` encodes typed prerequisite/follow-on relationships and validates the graph for dangling/self references;
- `src/routing/` validates structured workflow selections, implementation blockers, and encoded dependencies;
- `src/epistemics/` validates provenance requirements for material claim classes;
- `src/quality/` determines whether required quality gates passed before a capability can be promoted;
- MCP capability tools provide catalog search, single-capability inspection, and structured workflow validation.

The foundation validates structured capability plans; it does not claim that a hand-written keyword classifier independently understands arbitrary consulting language. Natural-language semantic selection remains a host-model/Skill responsibility backed by the typed catalog and deterministic validation layer.

The approved architecture requires at least 100 materially distinct user-visible capabilities, but that breadth milestone is a separate catalog subproject and is **not** claimed complete merely because the foundation can represent it.

## Repository map

- `.codex-plugin/plugin.json` — plugin package manifest.
- `.mcp.json` — bundled local MCP server configuration.
- `skills/` — adaptive consulting workflows and semantic orchestration guidance.
- `src/server.ts` — MCP server composition.
- `src/stdio.ts` — local protocol-negotiating stdio entry.
- `src/http.ts` — web-standard Streamable HTTP entry plus explicit Host/Origin guard layer for a future public deployment.
- `src/catalog/` — typed capability metadata, registry, relationships, and capability MCP tools.
- `src/catalog.ts` — compatibility re-export for the modular catalog package.
- `src/routing/` — deterministic structured workflow-plan validation.
- `src/epistemics/` — claim classification/provenance validation contracts.
- `src/quality/` — common quality-gate reports and promotion logic.
- `src/artifacts/` — versioned artifact storage, MCP artifact tools, bounded binary/package inspection, and format-specific adapters whose supported envelope has been proven.
- `src/finance/` — deterministic calculation engines and MCP finance tools for formulas whose definitions are fixed and explicit.
- `scripts/check-runtime-freshness.mjs` — registry-backed check for governed runtime/toolchain pins.
- `governance/` — source-of-truth rules for every model and contributor.
- `tests/` — contract, protocol, security-boundary, artifact, calculation, routing, epistemic, quality, and behavior tests.
- `docs/` — architecture and implementation documentation.
- `.github/workflows/` — CI plus a non-branching scheduled runtime-freshness check.

## Runtime baseline

The MCP foundation targets the stable split TypeScript v2 packages and the MCP 2026-07-28 protocol line. Stdio startup uses the v2 protocol-negotiating helper rather than the legacy monolithic SDK transport path. Remote-source support uses the v2 web-standard MCP handler and is exercised through the matching MCP client test harness. Exact dated dependency pins and their revalidation rules live in `governance/platform-baseline.md`; do not treat versions written in prose as permanently current.

## Artifact workspace

The repository has a format-neutral plugin-owned artifact substrate:

- bounded inline import for callers that already possess artifact bytes;
- `artifact://` MCP resources for binary retrieval;
- SHA-256, MIME metadata, byte size, and monotonically increasing revisions;
- metadata inspection without embedding the binary payload;
- replacement guarded by an `expectedRevision` precondition so stale writers cannot silently overwrite newer work;
- explicit destructive deletion semantics;
- read-only binary format inspection that distinguishes PDF, ordinary DOCX/XLSX/PPTX packages, macro-enabled DOCM/XLSM/PPTM packages, generic ZIP, and unknown binary content.

Artifact storage CRUD is **not** equivalent to PDF/DOCX/XLSX/PPTX document editing. Format-specific CRUD remains gated by preservation, malformed-input, round-trip, and representative-fixture validation. Macro detection never executes macros or embedded active content.

## DOCX template support

The first bounded Word adapter is intentionally narrower than general DOCX CRUD:

- `inspect_docx_template` lists placeholder keys in byte-detected macro-free DOCX templates without modification;
- `patch_docx_template` replaces only explicitly supplied existing placeholders, rejects unknown keys, uses artifact revision preconditions, validates the resulting package, and stores the result as a new revision;
- macro-enabled DOCM input is rejected instead of being executed, silently stripped, or treated as ordinary DOCX;
- request size and placeholder-count bounds prevent the template tool from becoming an unbounded document-ingestion path.

This does **not** claim arbitrary existing Word-document text/layout CRUD. The broader `docx-crud` capability remains a separate milestone.

## PDF metadata support

The first bounded PDF adapter is also intentionally operation-specific:

- `inspect_pdf` loads a byte-detected PDF and reports page count plus document-level metadata without modifying the artifact;
- `update_pdf_metadata` changes only explicitly supplied title, author, subject, keywords, creator, or producer metadata, uses an artifact revision precondition, reopens the saved PDF, verifies page count preservation, and stores the result as a new revision;
- the tool descriptions explicitly exclude arbitrary existing page-text extraction/editing and page-layout mutation.

This does **not** claim broad PDF CRUD. Page manipulation, forms, annotations, overlays, merging/splitting, creation, and any visual-content mutation remain separate operation-level gates that require preservation and rendering validation.

## Deterministic finance support

The plugin exposes reproducible calculators for finance definitions that are narrow enough to make deterministic:

- `calculate_break_even` computes unit contribution margin, contribution-margin ratio, exact and whole-unit break-even volume, and break-even revenue from supplied fixed costs, unit price, and unit variable cost;
- `calculate_simple_roi` computes undiscounted simple ROI as `(totalBenefits - totalCosts) / totalCosts` and preserves an optional caller-supplied period in months;
- both are read-only, closed-world tools and return their formula definitions rather than relying on opaque model arithmetic.

These tools do not infer missing financial inputs, evaluate time-value-of-money cash flows, or relabel simple ROI as NPV, IRR, annualized return, or payback.

## Remote MCP status

The repository contains the **source boundary** required for remote Streamable HTTP MCP operation:

- a fresh MCP server instance is created through the current v2 HTTP handler factory;
- the protocol contract is tested with the matching MCP client package and requires 2026-07-28 negotiation;
- a guarded wrapper requires an explicit allowed-host list and can enforce an allowed-origin list before MCP dispatch;
- credential-shaped Host/Origin values are rejected before the SDK validators are invoked.

This is intentionally **not** described as a production deployment. A public HTTPS endpoint, production hostname, persistent multi-instance artifact store, hosting provider, runtime observability, abuse controls, external end-to-end verification, and OpenAI domain verification still require their own implementation and evidence. User authentication/OAuth is not a planned production requirement under the current open-access boundary.

## Development status

The repository is being built incrementally toward the approved Universal Consulting Capability Engine architecture. **Subproject 1 — Capability Platform Foundation is verified complete**: GitHub Actions `npm run verify` passed on commit `16e5d2938c0645df996c25982213952ed53916cb`, covering the modular capability/routing/epistemic/quality foundation alongside all preserved regression tests.

The next milestone is Subproject 2 — the 100+ materially distinct capability baseline with full routing metadata. Expanded finance/FP&A, statistics/forecasting, project/operations/supply-chain engines, CSV/XLSX/DOCX/PDF/PPTX artifact expansion, visualization, anonymous public research/fact checking/SEO, executive workflows, production remote MCP, and marketplace submission remain separate later milestones.

## Branch policy

`main` is the sole authoritative branch. Repository-changing work must finish on `main`, and `main` must never be behind another branch.
