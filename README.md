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
- `src/server.ts` — MCP server and tool registration.
- `src/stdio.ts` — local protocol-negotiating stdio entry.
- `src/http.ts` — web-standard Streamable HTTP entry plus explicit Host/Origin guard layer for a future public deployment.
- `src/artifacts/` — versioned artifact storage contracts, in-memory development store, and bounded binary/package inspection.
- `src/catalog.ts` — capability registry and search implementation.
- `scripts/check-runtime-freshness.mjs` — registry-backed check for governed runtime/toolchain pins.
- `governance/` — source-of-truth rules for every model and contributor.
- `tests/` — contract, protocol, security-boundary, artifact, and behavior tests.
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

This substrate is **not** equivalent to PDF/DOCX/XLSX/PPTX document editing. Format-specific CRUD remains planned until each adapter passes its preservation, malformed-input, round-trip, and representative-fixture gates. Macro detection never executes macros or embedded active content.

## Remote MCP status

The repository contains the **source boundary** required for remote Streamable HTTP MCP operation:

- a fresh MCP server instance is created through the current v2 HTTP handler factory;
- the protocol contract is tested with the matching MCP client package and requires 2026-07-28 negotiation;
- a guarded wrapper requires an explicit allowed-host list and can enforce an allowed-origin list before MCP dispatch;
- credential-shaped Host/Origin values are rejected before the SDK validators are invoked.

This is intentionally **not** described as a production deployment. A public HTTPS endpoint, production hostname, authentication configuration, persistent multi-instance artifact store, hosting provider, runtime observability, external end-to-end verification, and OpenAI domain verification still require their own implementation and evidence.

## Development status

This repository is being built incrementally. The current foundation establishes governance, plugin packaging, adaptive routing, a broad capability registry, capability discovery, guarded remote-MCP source transport, versioned plugin-owned artifact storage, and a safe pre-mutation format-inspection gate. PDF/DOCX/XLSX/PPTX/CSV format CRUD, live SEO acquisition, advanced data processing, persistent production storage, production remote-MCP hosting, authentication, provider integrations, end-to-end marketplace tests, and public-directory submission remain separate milestones and must not be claimed as complete until their own verification gates pass.

## Branch policy

`main` is the sole authoritative branch. Repository-changing work must finish on `main`, and `main` must never be behind another branch.
