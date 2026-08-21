# CSV & Managed XLSX Artifact Engines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add safe, deterministic CSV CRUD and a validated managed-XLSX creation/editing envelope without implying arbitrary lossless mutation of third-party workbooks.

**Architecture:** CSV is implemented as a dependency-free text codec plus immutable mutation helpers, then exposed through the existing artifact store with revision preconditions. XLSX is implemented directly as a deliberately small SpreadsheetML/OPC package using the already-pinned `fflate`; Consulting Tools creates a recognizable managed workbook envelope and only mutates packages that pass its marker/structure validation. Formula support is a separate constrained layer so ordinary text can never become executable spreadsheet content accidentally.

**Tech Stack:** TypeScript 7.0.2, Node 24 CI, Vitest 4.1.10, `fflate` 0.8.3, Zod 4.4.3, existing MCP v2/artifact store.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Global Constraints

- Ordinary use requires no user API key, OAuth, account linking, or private third-party credential.
- `main` is the sole authoritative branch.
- Preserve `governance/xlsx-engine-decision.md`: do not add ExcelJS and do not claim arbitrary existing-workbook XLSX CRUD.
- CSV output follows RFC 4180 quoting/escaping rules; parser accepts CRLF and LF for practical interoperability but never coerces field text to numbers, booleans, dates, or formulas.
- Spreadsheet-targeted CSV export must implement formula-injection protection for leading `=`, `+`, `-`, `@`, tab, and null characters. Raw-preservation export remains explicit and separately named.
- Managed XLSX v1 uses only macro-free `.xlsx` SpreadsheetML parts, inline strings, finite numbers, booleans, blanks, and the constrained formula grammar defined in Task 6.
- User-originated text is always literal text unless a caller explicitly uses the formula-cell type and passes formula validation.
- Managed XLSX mutation is rejected unless the package contains the Consulting Tools managed-workbook custom property and the expected v1 structure.
- Every mutation uses the artifact store `expectedRevision` precondition and produces a new revision.
- Bounds exist for file bytes, worksheets, rows, columns, cells, text length, formulas, and mutation count.
- Macro-enabled XLSM and arbitrary third-party XLSX mutation remain outside this subproject.
- No capability becomes `implemented` merely because a lower-level codec or tool exists; catalog promotion follows the verified advertised envelope.

---

## File Structure

- `src/tabular/csv.ts` — CSV parser, serializer, formula-injection escaping, and table validation.
- `src/tabular/csv-mutations.ts` — immutable row/column/cell CRUD on parsed CSV documents.
- `src/tabular/xlsx-types.ts` — managed-workbook data model and bounds.
- `src/tabular/xlsx-managed.ts` — SpreadsheetML package creation, marker inspection, decoding, and managed-workbook serialization.
- `src/tabular/xlsx-mutations.ts` — managed logical-model mutation and deterministic regeneration.
- `src/tabular/xlsx-formula.ts` — constrained formula tokenizer/validator.
- `src/tabular/register-tools.ts` — CSV MCP schemas and artifact-store operations.
- `src/tabular/register-xlsx-tools.ts` — managed-XLSX MCP schemas and artifact-store operations.
- `src/server.ts` — composes tabular tools.
- `tests/csv.test.ts`, `tests/csv-mutations.test.ts`, `tests/csv-tools.test.ts` — CSV codec, CRUD/security, and MCP lifecycle fixtures.
- `tests/xlsx-managed.test.ts`, `tests/xlsx-formula.test.ts`, `tests/xlsx-formula-integration.test.ts`, `tests/xlsx-tools.test.ts` — package/CRUD/formula/MCP fixtures.
- `tests/catalog-status-truth.test.ts` and `tests/catalog.test.ts` — truthful capability bindings and regression truth.
- `skills/analysis-and-reporting/SKILL.md`, `README.md`, program roadmap, `governance/xlsx-engine-decision.md`, and `governance/platform-baseline.md` — supported-scope records.

---

### Task 1: Safe CSV Codec

- [x] Write failing RFC/edge/security tests covering quoting, embedded line breaks, escaped quotes, empty fields, terminal line breaks, UTF-8, malformed quotes, no coercion, and formula-leading characters.
- [x] Confirm RED before the module existed.
- [x] Implement the bounded state-machine parser and RFC-style serializer with explicit preserve policy.
- [x] Run focused and full verification; fix implementation defects without weakening malformed/security fixtures.
- [x] Commit codec + tests.

### Task 2: CSV Validation and CRUD

- [x] Write failing tests for ragged rows, bounds, insertion/deletion, source immutability, and request limits.
- [x] Confirm RED.
- [x] Implement immutable cell/row/column mutations without inferred headers or data types.
- [x] Run focused + full verification.
- [x] Commit.

### Task 3: CSV Artifact MCP Tools

- [x] Write MCP HTTP tests for annotations, resource links, revision conflicts, malformed CSV, and default spreadsheet-formula escaping.
- [x] Confirm RED because tools were absent.
- [x] Register bounded create/inspect/patch tools against `ArtifactStore`.
- [x] Compose tabular tools in `src/server.ts`.
- [x] Run focused MCP tests and full verification; commit.

### Task 4: Managed XLSX Literal-Cell Envelope

- [x] Write failing package fixtures for required parts, managed marker, literal-cell round-trip, XML escaping, bounds, and generic/macro/non-managed rejection.
- [x] Confirm RED.
- [x] Implement SpreadsheetML/OPC packaging with inline strings and exact managed-v1 marker/parts.
- [x] Implement bounded parser/inspector rejecting traversal, duplicate entries, oversized XML, macro content, duplicate identifiers/names, malformed references, unsupported cells, and unexpected parts.
- [x] Run focused + full verification and commit.

### Task 5: Managed XLSX Literal-Cell CRUD

- [x] Add failing tests for every mutation, source immutability, worksheet collisions/names/bounds, and unaffected-cell preservation.
- [x] Confirm RED.
- [x] Implement logical-model mutation plus deterministic reserialization in the focused `xlsx-mutations.ts` module; never mutate arbitrary unknown XML.
- [x] Run focused + full verification and commit.

### Task 6: Constrained Formula Cells

- [x] Write failing allowlist tests for literals, operators, parentheses, A1/ranges, same-workbook worksheet references, and the approved pure functions.
- [x] Write failing rejection tests for external workbooks, URLs/protocols, DDE/external data, disallowed functions/add-ins, controls, unknown sheets, malformed tokens, and overlength formulas.
- [x] Confirm RED and implement a tokenizer/precedence parser rather than substring-only filtering.
- [x] Independently validate the parser after fixing the `Sheet2!B2` lexical ambiguity; parser gate passed on `2ce251c82231a593906796ecaf642291b0b13dc3`, run `32489403657`.
- [x] Serialize explicit formulas through `<f>` without cached `<v>`, request recalculation on open, preserve formula-looking ordinary strings as inline text, and revalidate formulas on package read.
- [x] Formula integration/full repository gate passed on `29da3fb5b02c20bc6c39f295cf9a72ddfdcbb8e2`, run `32489789069`.

### Task 7: XLSX Artifact MCP Tools

- [x] Write MCP HTTP tests for create/inspect/patch/resource links, formulas, revision conflicts, macro rejection, arbitrary-XLSX rejection, malformed packages, and annotations.
- [x] Confirm RED.
- [x] Register bounded create/inspect/patch tools with Zod schemas and artifact-store operations.
- [x] Correct the strict optional-property type mismatch without changing the accepted runtime contract.
- [x] Full MCP/repository gate passed on `5205b1e41a82704daaee0e6bd3fa2dbd52728767`, run `32490111042`.

### Task 8: Truthful Capability Promotion and Closure

- [x] Write catalog truth tests first for exact statuses and engine IDs.
- [x] Confirm RED and add only the CSV partial promotion/bindings justified by the verified envelope; keep broad `xlsx-crud` planned and unbound.
- [x] Repair stale catalog regression expectations without weakening the broad-file-CRUD boundary.
- [x] Require a fresh full code/catalog gate: `485ec1a10f241bed3212abc3a8b8ffd9f3563e62` passed `ci/verify` through Actions run `32491018071`.
- [x] Update governance, Skill, README, roadmap, runtime baseline, and this execution record with the exact supported CSV/managed-XLSX envelope and arbitrary-XLSX prohibition.
- [x] Final documentation-head/branch closure gate passed on `bddf096f5a748fc3f8de43871518c6462d3da153` through Actions run `32491513181`; exhaustive branch enumeration returned only `main`.

## Execution Notes

- The implementation intentionally split XLSX logical mutation into `xlsx-mutations.ts` and XLSX MCP registration into `register-xlsx-tools.ts` instead of increasing the complexity of the security-sensitive package parser/CSV registration module. This is a maintainability-only decomposition; the approved behavioral envelope did not expand.
- The managed-XLSX implementation is not a fallback editor for ordinary `.xlsx` files. It rejects any workbook outside the exact managed-v1 envelope rather than normalizing unknown OOXML and silently discarding unsupported structures.
- The broad catalog identity `xlsx-crud` remains `planned`; `csv-crud` is only `partial` because the active user-facing definition exceeds the verified comma-CSV subset.
- The repository's `.mcp.json` direct server map remains valid under current OpenAI plugin packaging guidance. MCP protocol/runtime V2 is determined by the split v2 SDK and `serveStdio`, not by wrapping the launcher map in `mcp_servers`.
- Documentation-head closure passed on `bddf096f5a748fc3f8de43871518c6462d3da153` through Actions run `32491513181`; branch enumeration exhausted all result pages and found only `main`.

## Self-Review

- Spec coverage: CSV CRUD, XLSX creation/editing, formulas, preservation, security, artifact revisions, MCP surface, truthful catalog state, and documentation closure each have an execution record.
- Placeholder scan: no implementation TODO/TBD or open checklist item remains; closure evidence is recorded above.
- Type consistency: CSV codec feeds CSV mutations/tools; managed workbook types feed XLSX package/mutation/formula/tools; all artifact writes use existing `ArtifactStore` and revision semantics.
- Scope boundary: arbitrary third-party XLSX mutation, macros, charts, pivots, drawings, conditional formatting, data validation, external links/data connections, VBA, and full Excel formula compatibility remain intentionally excluded from managed v1 rather than silently lost.
