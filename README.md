# Consulting Tools

Consulting Tools is an in-development public plugin for ChatGPT and Codex that is intended to combine adaptive consulting workflows with controlled executable tools for research, analysis, and business artifacts.

## Current foundation

The repository uses a hybrid plugin architecture:

- **Skills** decide which consulting methods are appropriate for a user's actual objective and adapt the deliverable structure to the work rather than forcing a fixed report template.
- **MCP tools** perform reproducible operations that require code, files, live data, or external state.
- **Governance** is model-agnostic and lives under `governance/`. `AGENTS.md` is the universal entry point for any LLM or agent modifying this repository.
- **Capability status is explicit.** A capability is never presented as implemented merely because it appears on the roadmap or in the catalog.
- **External-platform facts are dated.** `governance/platform-baseline.md` records the verified OpenAI/MCP/runtime snapshot and the events that require live revalidation.

## Repository map

- `.codex-plugin/plugin.json` — plugin package manifest.
- `.mcp.json` — bundled local MCP server configuration.
- `skills/` — adaptive consulting workflows.
- `src/server.ts` — MCP server composition and consulting capability discovery.
- `src/stdio.ts` — local protocol-negotiating stdio entry.
- `src/http.ts` — web-standard Streamable HTTP entry plus explicit Host/Origin guard layer for a future public deployment.
- `src/artifacts/` — versioned artifact storage, MCP artifact tools, bounded binary/package inspection, and format-specific adapters whose supported envelope has been proven.
- `src/finance/` — deterministic calculation engines and MCP finance tools for formulas whose definitions are fixed and explicit.
- `src/catalog.ts` — capability registry and search implementation.
- `scripts/check-runtime-freshness.mjs` — registry-backed check for governed runtime/toolchain pins.
- `governance/` — source-of-truth rules for every model and contributor.
- `tests/` — contract, protocol, security-boundary, artifact, calculation, and behavior tests.
- `docs/` — architecture and implementation documentation.
- `.github/workflows/` — CI plus a non-branching scheduled runtime-freshness check.

## Runtime baseline

The MCP foundation targets the stable split TypeScript v2 packages and the MCP 2026-07-28 protocol line. Stdio startup uses the v2 protocol-negotiating helper rather than the legacy monolithic SDK transport path. Remote-source support uses the v2 web-standard MCP handler and is exercised through the matching MCP client test harness. Exact dated dependency pins and their revalidation rules live in `governance/platform-baseline.md`; do not treat versions written in prose as permanently current.

## Artifact workspace

The repository now has a format-neutral plugin-owned artifact substrate:

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

The plugin now exposes reproducible calculators for finance definitions that are narrow enough to make deterministic:

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

This is intentionally **not** described as a production deployment. A public HTTPS endpoint, production hostname, authentication configuration, persistent multi-instance artifact store, hosting provider, runtime observability, external end-to-end verification, and OpenAI domain verification still require their own implementation and evidence.

## Development status

This repository is being built incrementally. The current foundation establishes governance, plugin packaging, adaptive routing, a broad capability registry, capability discovery, guarded remote-MCP source transport, versioned plugin-owned artifact storage, a safe pre-mutation format-inspection gate, bounded DOCX template inspection/patching, bounded PDF inspection/metadata mutation, and deterministic break-even/simple-ROI calculations. Broad PDF/DOCX/XLSX/PPTX/CSV format CRUD, live SEO acquisition, advanced data processing, persistent production storage, production remote-MCP hosting, authentication, provider integrations, end-to-end marketplace tests, and public-directory submission remain separate milestones and must not be claimed as complete until their own verification gates pass.

## Branch policy

`main` is the sole authoritative branch. Repository-changing work must finish on `main`, and `main` must never be behind another branch.
