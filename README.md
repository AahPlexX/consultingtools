# Consulting Tools

Consulting Tools is an in-development public, open-access plugin for ChatGPT and Codex intended to provide a universal consulting capability and quality layer: adaptive consulting workflows, deterministic analysis, evidence controls, professional artifacts, and measurable quality gates without requiring ordinary users to connect private third-party accounts.

## Access model

Consulting Tools is intentionally designed so ordinary use does **not** require a user-supplied API key, OAuth flow, account linking, or private third-party provider credential. The governing boundary is `governance/open-access-boundary.md`.

The plugin may work with user-supplied files/data, plugin-owned computation, public web resources that require no user credential, and host-native capabilities already available through the active ChatGPT/Codex surface. It is not intended to become a connector hub for private cloud drives, CRMs, analytics accounts, Search Console, commercial SEO-data subscriptions, project-management systems, or private databases. A user may still upload an export from such a system as ordinary input.

## Current foundation

The repository uses a hybrid plugin architecture:

- **Skills** perform natural-language consulting interpretation, method selection, sequencing, and deliverable reasoning.
- **Capability catalog** exposes stable user-visible consulting capability identities, complete routing metadata, and truthful implementation status.
- **MCP tools** perform reproducible validation, calculations, file operations, and other controlled executable work.
- **Epistemic contracts** distinguish verified facts, user-supplied facts, deterministic calculations, bounded assumptions, inferences, hypotheses, estimates, scenarios, and recommendations.
- **Quality contracts** provide machine-readable analytical, epistemic, consulting, and artifact gate results instead of decorative confidence scores.
- **Governance** is model-agnostic and lives under `governance/`. `AGENTS.md` is the universal entry point for any LLM or agent modifying this repository.
- **Capability status is explicit.** A capability is never presented as implemented merely because it is routing-ready or appears in the roadmap.
- **External-platform facts are dated.** `governance/platform-baseline.md` records the verified OpenAI/MCP/runtime snapshot and the events that require live revalidation.

## Verified 100+ capability baseline

The active registry now contains well over the required 100 materially distinct, routing-ready consulting capabilities across strategy, market, customer, growth, finance, M&A, operations, supply chain, organization, project execution, data, forecasting, research, risk, SEO, innovation, delivery, artifacts, and visualization.

Every active capability is represented through the canonical routing contract and includes the fields needed to decide whether it belongs in a workflow: business questions, positive triggers, anti-triggers, required and optional inputs, methodology, deterministic-engine dependencies, evidence requirements, supported outputs, artifact formats, surface requirements, QA gates, assumption policy, failure behavior, access boundary, risk class, composition references, and evaluation-fixture IDs.

**Routing-ready does not mean implemented.** Status is an independent truth boundary:

- verified narrow operations such as break-even calculation, simple undiscounted ROI calculation, DOCX template patching, and PDF metadata update may be `implemented`;
- broader reasoning or analytical outcomes may remain `partial` while they are useful but not yet fully covered by method-specific execution and evaluation gates;
- deterministic engines that are cataloged but not yet built remain `planned`;
- private-account or credentialed retrieval that violates the open-access boundary remains `unavailable`;
- broad PDF/DOCX/XLSX/CSV/PPTX CRUD remains `planned` until each format's preservation and quality gates pass.

Private SEO/account retrieval is deliberately separated from user-supplied export analysis. Live Search Console, proprietary keyword-provider, and proprietary backlink-index access remain unavailable under the ordinary open-access product boundary; analysis of user-supplied exports is a separate capability that does not require connecting to the source account.

The 100+ baseline was verified by GitHub Actions on commit `e755062819629ae1eddf0abaece21dec47810748` through run `32295888556`, where `npm run verify` completed successfully.

## Capability platform architecture

The capability layer is modularized behind typed, composable contracts:

- `src/catalog/types.ts` defines canonical domains, modes, statuses, output modalities, artifact formats, access boundaries, risk classes, surface requirements, and QA gate identifiers;
- `src/catalog/define.ts` enforces routing-metadata and open-access invariants at definition time;
- `src/catalog/families/` contains the active domain-family capability definitions;
- `src/catalog/legacy.ts` is retained only as migration/reference material and no longer feeds the active registry;
- `src/catalog/registry.ts` composes the routing-ready family baseline, provides stable-ID lookup, and ranks direct search matches ahead of weaker metadata matches;
- `src/catalog/relationships.ts` encodes typed prerequisite/follow-on/alternative/overlap relationships and validates graph references against an explicit catalog snapshot;
- `src/routing/` validates structured workflow selections, implementation blockers, and encoded dependencies;
- `src/epistemics/` validates provenance requirements for material claim classes;
- `src/quality/` determines whether required quality gates passed before a capability can be promoted;
- MCP capability tools provide bounded search, full single-capability inspection, and structured workflow validation without creating one MCP tool per consulting capability.

The foundation validates structured capability plans; it does not claim that a hand-written keyword classifier independently understands arbitrary consulting language. Natural-language semantic selection remains a host-model/Skill responsibility backed by the typed catalog and deterministic validation layer.

## Repository map

- `.codex-plugin/plugin.json` — plugin package manifest.
- `.mcp.json` — bundled local MCP server configuration.
- `skills/` — adaptive consulting workflows and semantic orchestration guidance.
- `src/server.ts` — MCP server composition.
- `src/stdio.ts` — local protocol-negotiating stdio entry.
- `src/http.ts` — web-standard Streamable HTTP entry plus explicit Host/Origin guard layer for a future public deployment.
- `src/catalog/` — typed capability metadata, family registry, relationships, and capability MCP tools.
- `src/catalog.ts` — compatibility re-export for the modular catalog package.
- `src/routing/` — deterministic structured workflow-plan validation.
- `src/epistemics/` — claim classification/provenance validation contracts.
- `src/quality/` — common quality-gate reports and promotion logic.
- `src/artifacts/` — versioned artifact storage, MCP artifact tools, bounded binary/package inspection, and format-specific adapters whose supported envelope has been proven.
- `src/finance/` — deterministic calculation engines and MCP finance tools for formulas whose definitions are fixed and explicit.
- `scripts/check-runtime-freshness.mjs` — registry-backed check for governed runtime/toolchain pins.
- `governance/` — source-of-truth rules for every model and contributor.
- `tests/` — contract, protocol, security-boundary, artifact, calculation, routing, epistemic, quality, breadth, overlap, and behavior tests.
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

The plugin currently exposes reproducible calculators for finance definitions that are narrow enough to make deterministic:

- `calculate_break_even` computes unit contribution margin, contribution-margin ratio, exact and whole-unit break-even volume, and break-even revenue from supplied fixed costs, unit price, and unit variable cost;
- `calculate_simple_roi` computes undiscounted simple ROI as `(totalBenefits - totalCosts) / totalCosts` and preserves an optional caller-supplied period in months;
- both are read-only, closed-world tools and return their formula definitions rather than relying on opaque model arithmetic.

These tools do not infer missing financial inputs, evaluate time-value-of-money cash flows, or relabel simple ROI as NPV, IRR, annualized return, or payback. Expanded corporate-finance and FP&A deterministic engines are the next implementation subproject.

## Remote MCP status

The repository contains the **source boundary** required for remote Streamable HTTP MCP operation:

- a fresh MCP server instance is created through the current v2 HTTP handler factory;
- the protocol contract is tested with the matching MCP client package and requires 2026-07-28 negotiation;
- a guarded wrapper requires an explicit allowed-host list and can enforce an allowed-origin list before MCP dispatch;
- credential-shaped Host/Origin values are rejected before the SDK validators are invoked.

This is intentionally **not** described as a production deployment. A public HTTPS endpoint, production hostname, persistent multi-instance artifact store, hosting provider, runtime observability, abuse controls, external end-to-end verification, and OpenAI domain verification still require their own implementation and evidence. User authentication/OAuth is not a planned production requirement under the current open-access boundary.

## Development status

**Subproject 1 — Capability Platform Foundation is verified complete.** GitHub Actions `npm run verify` passed on commit `16e5d2938c0645df996c25982213952ed53916cb` through run `32175704377`.

**Subproject 2 — 100+ Capability Baseline is verified complete.** GitHub Actions `npm run verify` passed on commit `e755062819629ae1eddf0abaece21dec47810748` through run `32295888556`. The active registry is now the routing-ready family catalog rather than the legacy catalog, and the verification suite covers breadth, metadata invariants, status truth, duplicate/overlap controls, relationship integrity, MCP inspection/search schema compatibility, workflow blockers, and all preserved regression tests.

The next milestone is **Subproject 3 — Corporate Finance & FP&A Engines**. Statistics/forecasting, project/operations/supply-chain engines, CSV/XLSX/DOCX/PDF/PPTX artifact expansion, visualization, anonymous public research/fact checking/SEO, executive workflows, production remote MCP, and marketplace submission remain later milestones.

## Branch policy

`main` is the sole authoritative branch. Repository-changing work must finish on `main`, and `main` must never be behind another branch.
