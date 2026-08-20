# CSV & Managed XLSX Artifact Engines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe, deterministic CSV CRUD and a validated managed-XLSX creation/editing envelope without implying arbitrary lossless mutation of third-party workbooks.

**Architecture:** CSV is implemented as a dependency-free text codec plus immutable mutation helpers, then exposed through the existing artifact store with revision preconditions. XLSX is implemented directly as a deliberately small SpreadsheetML/OPC package using the already-pinned `fflate`; Consulting Tools creates a recognizable managed workbook envelope and only mutates packages that pass its marker/structure validation. Formula support is a separate constrained layer so ordinary text can never become executable spreadsheet content accidentally.

**Tech Stack:** TypeScript 7.0.2, Node 24 CI, Vitest 4.1.10, `fflate` 0.8.3, Zod 4.4.3, existing MCP v2/artifact store.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Global Constraints

- Ordinary use requires no user API key, OAuth, account linking, or private third-party credential.
- `main` is the sole authoritative branch.
- Preserve `governance/xlsx-engine-decision.md`: do not add ExcelJS and do not claim arbitrary existing-workbook XLSX CRUD.
- CSV output follows RFC 4180 quoting/escaping rules; parser accepts CRLF and LF for practical interoperability but never coerces field text to numbers, booleans, dates, or formulas.
- Spreadsheet-targeted CSV export must implement OWASP ASVS formula-injection protection for leading `=`, `+`, `-`, `@`, tab, and null characters. Raw-preservation export must remain explicit and separately named.
- Managed XLSX v1 uses only macro-free `.xlsx` SpreadsheetML parts, inline strings, finite numbers, booleans, blanks, and later the constrained formula grammar defined in Task 6.
- User-originated text is always literal text unless a caller explicitly uses the formula-cell type and passes formula validation.
- Managed XLSX mutation is rejected unless the package contains the Consulting Tools managed-workbook custom property and the expected v1 structure.
- Every mutation uses the artifact store `expectedRevision` precondition and produces a new revision.
- Bounds must exist for file bytes, worksheets, rows, columns, cells, text length, formulas, and mutation count.
- Macro-enabled XLSM and arbitrary third-party XLSX mutation remain outside this subproject.
- No capability becomes `implemented` merely because a lower-level codec or tool exists; catalog promotion follows the verified advertised envelope.

---

## File Structure

- `src/tabular/csv.ts` — CSV parser, serializer, formula-injection escaping, and table validation.
- `src/tabular/csv-mutations.ts` — immutable row/column/cell CRUD on parsed CSV documents.
- `src/tabular/xlsx-types.ts` — managed-workbook data model and bounds.
- `src/tabular/xlsx-managed.ts` — SpreadsheetML package creation, marker inspection, decoding, and managed-workbook mutation.
- `src/tabular/xlsx-formula.ts` — constrained formula tokenizer/validator; no workbook I/O.
- `src/tabular/register-tools.ts` — CSV/XLSX MCP schemas and artifact-store operations.
- `src/server.ts` — compose tabular tools.
- `tests/csv.test.ts` — codec/security fixtures.
- `tests/csv-mutations.test.ts` — CRUD/validation fixtures.
- `tests/csv-tools.test.ts` — MCP artifact lifecycle fixtures.
- `tests/xlsx-managed.test.ts` — package/openability/round-trip/managed-boundary fixtures.
- `tests/xlsx-formula.test.ts` — allowed/rejected formula grammar fixtures.
- `tests/xlsx-tools.test.ts` — MCP create/inspect/patch/revision-boundary fixtures.
- `tests/catalog-status-truth.test.ts` — truthful capability bindings.
- `skills/analysis-and-reporting/SKILL.md`, `README.md`, program roadmap, and `governance/xlsx-engine-decision.md` — verified scope record only after full CI passes.

---

### Task 1: Safe CSV Codec

**Files:**
- Create: `src/tabular/csv.ts`
- Create: `tests/csv.test.ts`

**Interfaces:**
- Produces `CsvDocument = { rows: string[][]; lineEnding: "crlf" | "lf"; terminalLineBreak: boolean }`.
- Produces `parseCsv(text: string): CsvDocument`.
- Produces `serializeCsv(document: CsvDocument, options?: { lineEnding?: "crlf" | "lf"; terminalLineBreak?: boolean; spreadsheetFormulaPolicy?: "escape" | "preserve" }): string`.
- Produces `escapeSpreadsheetFormulaField(value: string): string`.

- [ ] **Step 1: Write failing RFC/edge/security tests.** Cover commas, quotes, embedded CRLF/LF inside quoted fields, escaped quotes, empty fields, optional terminal line break, UTF-8 text, empty document, malformed unterminated quote, illegal quote in unquoted field, no type coercion, and formula-leading characters.

```ts
expect(parseCsv('a,"b,b",c\r\n1,"x""y",3').rows).toEqual([
  ["a", "b,b", "c"],
  ["1", 'x"y', "3"],
]);
expect(serializeCsv({ rows: [["=1+1", "+2", "safe"]], lineEnding: "crlf", terminalLineBreak: false }))
  .toBe("'=1+1,'+2,safe");
```

- [ ] **Step 2: Run `npm test -- tests/csv.test.ts` and confirm RED because the module does not exist.**
- [ ] **Step 3: Implement a bounded state-machine parser and RFC-style serializer.** Quoted fields preserve embedded line breaks; doubled quotes decode to one quote; raw values remain strings. Default serializer policy is `escape`; `preserve` is explicit.
- [ ] **Step 4: Run the focused test and full `npm run verify`; fix implementation defects, never weaken malformed/security fixtures.**
- [ ] **Step 5: Commit codec + tests.**

### Task 2: CSV Validation and CRUD

**Files:**
- Create: `src/tabular/csv-mutations.ts`
- Create: `tests/csv-mutations.test.ts`

**Interfaces:**
- Consumes `CsvDocument`.
- Produces `validateCsvShape(document): { rowCount; maxColumnCount; uniformWidth; widthByRow }`.
- Produces immutable `setCsvCell`, `insertCsvRow`, `deleteCsvRow`, `insertCsvColumn`, `deleteCsvColumn`.

- [ ] **Step 1: Write failing tests** for sparse/ragged rows, zero-based API bounds, inserted empty cells, deletion at edges, source immutability, and request bounds.
- [ ] **Step 2: Run focused tests and confirm RED.**
- [ ] **Step 3: Implement immutable mutations.** Missing cells introduced by insertion are empty strings; mutation never infers headers or data types.
- [ ] **Step 4: Run focused + full verification.**
- [ ] **Step 5: Commit.**

### Task 3: CSV Artifact MCP Tools

**Files:**
- Create: `src/tabular/register-tools.ts`
- Create: `tests/csv-tools.test.ts`
- Modify: `src/server.ts`

**Interfaces:**
- Tools: `create_csv_artifact`, `inspect_csv_artifact`, `patch_csv_artifact`.
- `patch_csv_artifact` accepts an ordered array of explicit mutations plus `expectedRevision` and serialization policy.

- [ ] **Step 1: Write MCP HTTP tests** requiring safe annotations, artifact resource links, revision conflicts, malformed CSV errors, and default formula-injection escaping.
- [ ] **Step 2: Confirm RED because tools are absent.**
- [ ] **Step 3: Register bounded tools against `ArtifactStore`; create/patch operations are closed-world writes and inspection is read-only.**
- [ ] **Step 4: Compose `registerTabularTools(server, artifactStore)` in `src/server.ts`.**
- [ ] **Step 5: Run focused MCP tests and full verification, then commit.**

### Task 4: Managed XLSX Literal-Cell Envelope

**Files:**
- Create: `src/tabular/xlsx-types.ts`
- Create: `src/tabular/xlsx-managed.ts`
- Create: `tests/xlsx-managed.test.ts`

**Interfaces:**
- `ManagedCellValue = string | number | boolean | null` initially.
- `ManagedWorksheet = { name: string; rows: ManagedCellValue[][] }`.
- `ManagedWorkbook = { version: 1; worksheets: ManagedWorksheet[] }`.
- `createManagedXlsx(workbook): Buffer`.
- `inspectManagedXlsx(bytes): { managed: boolean; version: number | null; sheetNames: string[]; cellCount: number }`.
- `readManagedXlsx(bytes): ManagedWorkbook` rejects non-managed packages.

- [ ] **Step 1: Write failing package fixtures.** Require ZIP signature; `[Content_Types].xml`; root relationships; workbook part; workbook relationships; one worksheet part per sheet; standard custom-file-properties marker `ConsultingToolsManagedWorkbook=1`; unique valid sheet names; literal string/number/boolean/blank round-trip; XML escaping; bounds; and rejection of generic/macro-enabled/non-managed packages.
- [ ] **Step 2: Confirm RED.**
- [ ] **Step 3: Implement SpreadsheetML with `fflate`.** Use inline strings (`t="inlineStr"`) to avoid shared-string-table complexity in v1. Numbers are finite decimal text; booleans use `t="b"` with `1/0`; null cells are omitted. Package the standard custom property as the managed marker.
- [ ] **Step 4: Implement parser/inspector only for the exact managed v1 parts.** Reject duplicate ZIP entries, path traversal names, oversized expanded XML, unexpected macro content types, duplicate sheet IDs/names, malformed cell references, and unsupported cell types.
- [ ] **Step 5: Run focused + full verification and commit.**

### Task 5: Managed XLSX Literal-Cell CRUD

**Files:**
- Modify: `src/tabular/xlsx-managed.ts`
- Modify: `src/tabular/xlsx-types.ts`
- Modify: `tests/xlsx-managed.test.ts`

**Interfaces:**
- `ManagedXlsxMutation` union: set cell, insert/delete row, insert/delete column, add/delete/rename worksheet.
- `patchManagedXlsx(bytes, mutations): Buffer` reads only managed v1, applies immutable logical mutations, and regenerates a normalized managed v1 package.

- [ ] **Step 1: Add failing round-trip/mutation tests** covering every mutation, source-buffer immutability, sheet-name collisions, Excel 31-character sheet-name limit, forbidden sheet-name characters, bounds, and preservation of unaffected literal cells.
- [ ] **Step 2: Confirm RED.**
- [ ] **Step 3: Implement logical-model mutation then deterministic reserialization; do not edit arbitrary unknown XML parts.**
- [ ] **Step 4: Run focused + full verification and commit.**

### Task 6: Constrained Formula Cells

**Files:**
- Create: `src/tabular/xlsx-formula.ts`
- Create: `tests/xlsx-formula.test.ts`
- Modify: `src/tabular/xlsx-types.ts`
- Modify: `src/tabular/xlsx-managed.ts`

**Interfaces:**
- Add `ManagedFormulaCell = { kind: "formula"; formula: string }`.
- Caller-facing formulas must begin with `=`; OOXML serialization strips that leading marker when writing `<f>`.
- `validateManagedFormula(formula): { normalized: string; references: string[] }`.

- [ ] **Step 1: Write failing allowlist tests.** Support numeric/string/boolean literals, arithmetic/comparison operators, parentheses, A1/range references within the same workbook, and pure functions `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `IF`, `AND`, `OR`, `ROUND`.
- [ ] **Step 2: Write failing rejection tests.** Reject external-workbook references (`[`/`]`), URLs/protocols, DDE/external-data constructs, `WEBSERVICE`, `FILTERXML`, `HYPERLINK`, `RTD`, `_xll.`, control characters, sheet names/references not present in the managed workbook, malformed tokens, and overlength formulas.
- [ ] **Step 3: Confirm RED, then implement a tokenizer/parser for this grammar rather than substring-only filtering.**
- [ ] **Step 4: Serialize formulas through `<f>` with no cached `<v>` and write workbook calculation properties requesting recalculation on open. Ordinary strings beginning `=` remain inline strings and never become formulas.**
- [ ] **Step 5: Run formula, managed-XLSX, and full verification; commit.**

### Task 7: XLSX Artifact MCP Tools

**Files:**
- Modify: `src/tabular/register-tools.ts`
- Create: `tests/xlsx-tools.test.ts`

**Interfaces:**
- Tools: `create_managed_xlsx`, `inspect_managed_xlsx`, `patch_managed_xlsx`.
- All XLSX mutation requests carry `expectedRevision`; patch rejects non-managed XLSX even when format detection says ordinary `.xlsx`.

- [ ] **Step 1: Write MCP HTTP tests** for create/read/patch/resource link, formulas, revision conflict, macro rejection, arbitrary-XLSX rejection, malformed ZIP/XML, and all annotations.
- [ ] **Step 2: Confirm RED.**
- [ ] **Step 3: Register the three tools with bounded Zod schemas and artifact-store operations.**
- [ ] **Step 4: Run focused + full verification and commit.**

### Task 8: Truthful Capability Promotion and Closure

**Files:**
- Modify: `tests/catalog-status-truth.test.ts`
- Modify: `src/catalog/verified-promotions.ts`
- Modify: `governance/xlsx-engine-decision.md`
- Modify: `skills/analysis-and-reporting/SKILL.md`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`

**Interfaces:**
- CSV and managed-XLSX operation IDs bind only to catalog capabilities whose advertised envelope they actually satisfy.
- Broad `xlsx-crud` remains `planned` unless its definition is explicitly narrowed elsewhere; arbitrary third-party workbook editing must remain unclaimed.

- [ ] **Step 1: Write catalog truth tests first** for the exact verified statuses and engine IDs.
- [ ] **Step 2: Confirm RED and then add only the required promotion bindings.**
- [ ] **Step 3: Run `npm run verify` and require a fresh successful GitHub Actions `ci/verify` result for the exact code/catalog SHA.**
- [ ] **Step 4: Update governance/Skill/README/roadmap with the exact supported CSV/managed-XLSX envelope and verified SHA/run; explicitly retain the arbitrary-XLSX prohibition.**
- [ ] **Step 5: Require a second fresh successful CI result for documentation HEAD and confirm branch enumeration contains only `main`.**

## Self-Review

- Spec coverage: CSV CRUD, XLSX creation/editing, formulas, preservation, security, artifact revisions, MCP surface, truthful catalog state, and documentation closure are each assigned to a task.
- Placeholder scan: no TBD/TODO/"similar to" steps; all interfaces and rejection boundaries are specified.
- Type consistency: CSV codec feeds CSV mutations/tools; managed workbook types feed XLSX package/mutation/formula/tools; all artifact writes use existing `ArtifactStore` and revision semantics.
- Scope boundary: arbitrary third-party XLSX mutation, macros, charts, pivots, drawings, conditional formatting, data validation, external links/data connections, VBA, resource-leveling-style spreadsheet modeling, and full Excel formula compatibility are intentionally excluded from managed v1 rather than silently lost.
