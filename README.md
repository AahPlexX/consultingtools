# Consulting Tools

Consulting Tools is an in-development public plugin for ChatGPT and Codex that is intended to combine adaptive consulting workflows with controlled executable tools for research, analysis, and business artifacts.

## Current foundation

The repository uses a hybrid plugin architecture:

- **Skills** decide which consulting methods are appropriate for a user's actual objective and adapt the deliverable structure to the work rather than forcing a fixed report template.
- **MCP tools** perform reproducible operations that require code, files, live data, or external state.
- **Governance** is model-agnostic and lives under `governance/`. `AGENTS.md` is the universal entry point for any LLM or agent modifying this repository.
- **Capability status is explicit.** A capability is never presented as implemented merely because it appears on the roadmap or in the catalog.

## Repository map

- `.codex-plugin/plugin.json` — plugin package manifest.
- `.mcp.json` — bundled MCP server configuration.
- `skills/` — adaptive consulting workflows.
- `src/` — MCP server and capability catalog implementation.
- `governance/` — source-of-truth rules for every model and contributor.
- `tests/` — contract and behavior tests.
- `docs/` — architecture and implementation documentation.

## Development status

This repository is being built incrementally. The initial milestone establishes governance, plugin packaging, adaptive routing, a capability registry, and a tested MCP foundation. File-format CRUD, live SEO acquisition, advanced data processing, production hosting, authentication, and public-directory submission are separate implementation milestones and must not be claimed as complete until their tests and verification gates pass.

## Branch policy

`main` is the sole authoritative branch. Repository-changing work must finish on `main`, and `main` must never be behind another branch.
