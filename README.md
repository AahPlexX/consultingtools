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
- `.mcp.json` — bundled MCP server configuration.
- `skills/` — adaptive consulting workflows.
- `src/` — MCP server and capability catalog implementation.
- `scripts/check-runtime-freshness.mjs` — registry-backed check for governed runtime/toolchain pins.
- `governance/` — source-of-truth rules for every model and contributor.
- `tests/` — contract and behavior tests.
- `docs/` — architecture and implementation documentation.
- `.github/workflows/` — CI plus a non-branching scheduled runtime-freshness check.

## Runtime baseline

The bundled local MCP foundation targets the stable MCP TypeScript v2 server package and the MCP 2026-07-28 protocol line. Stdio startup uses the v2 protocol-negotiating helper rather than the legacy monolithic SDK transport path. Exact dated dependency pins and their revalidation rules live in `governance/platform-baseline.md`; do not treat versions written in prose as permanently current.

## Development status

This repository is being built incrementally. The current foundation establishes governance, plugin packaging, adaptive routing, a broad capability registry, a read-only MCP capability-discovery tool, and current-runtime/freshness contracts. File-format CRUD, live SEO acquisition, advanced data processing, production remote-MCP hosting, authentication, provider integrations, end-to-end marketplace tests, and public-directory submission are separate implementation milestones and must not be claimed as complete until their own verification gates pass.

## Branch policy

`main` is the sole authoritative branch. Repository-changing work must finish on `main`, and `main` must never be behind another branch.
