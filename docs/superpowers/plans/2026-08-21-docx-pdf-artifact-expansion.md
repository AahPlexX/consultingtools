# DOCX & PDF Artifact Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a professional, deterministic consulting-document creation model that can produce validated DOCX and PDF artifacts, add bounded derivative PDF page composition, strengthen the existing DOCX/PDF preservation envelope, and promote only the catalog scope proven by independent rendering/openability gates.

**Architecture:** A format-neutral `ConsultingDocumentV1` model owns content semantics, bounds, and presentation intent. DOCX and PDF renderers consume that same validated model but remain separate engines because WordprocessingML and PDF have materially different layout/preservation behavior. Existing DOCX template patching and PDF metadata mutation remain bounded adapters; PDF page composition always creates a new derivative artifact rather than silently rewriting source documents. Renderability is independently checked in CI using LibreOffice Writer conversion plus Poppler rasterization, not only by reopening output with the library that created it.

**Tech Stack:** TypeScript 7.0.2, Node 24 CI, Vitest 4.1.10, `docx` 9.7.1, `pdf-lib` 1.17.1, `fflate` 0.8.3, Zod 4.4.3, MCP v2 artifact store; LibreOffice Writer and Poppler are CI-only independent validators.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Global Constraints

- Ordinary use requires no user API key, OAuth, account linking, or private third-party credential.
- `main` is the sole authoritative branch.
- Preserve all verified Subprojects 1–6 behavior and status truth.
- Do not equate artifact-storage replacement with document-format CRUD.
- Do not claim arbitrary lossless DOCX editing. Existing-document DOCX mutation remains the verified placeholder-template path unless a separate operation has preservation fixtures.
- Do not claim arbitrary existing-PDF text editing. Page composition creates a derivative PDF; metadata update remains the only in-place logical PDF mutation in this subproject.
- Do not preserve or imply validity of digital signatures, encryption, document JavaScript, AcroForm state, outlines/bookmarks, attachments, or other document-level PDF structures when constructing a derivative page-composition PDF.
- PDF creation v1 uses PDF standard fonts only. Text that `pdf-lib` cannot encode in the selected standard font must be rejected before any artifact is stored; do not replace unsupported characters silently.
- DOCX creation supports Unicode through the `docx` text model, but PDF parity is limited by the standard-font boundary above.
- Managed document v1 supports text-centric consulting reports only: headings, paragraphs, bullet/numbered lists, key metrics, tables, callouts, source notes, and page breaks. Arbitrary HTML/CSS, images/logos, charts, footnotes, fields, comments, tracked changes, embedded files, macros, and custom fonts are outside this subproject.
- PDF v1 is not a tagged PDF/PDF-UA claim. Do not advertise tagged-PDF accessibility until a separate structure-tree/accessibility implementation is verified.
- Every state-changing existing-artifact operation uses `expectedRevision`; creation/composition creates a new artifact and never overwrites its sources.
- Bounds exist for blocks, text, list items, tables, table cells, page count, source PDFs, selected pages, and artifact names.
- A subproject/task is not complete until its focused fixtures and the full repository verification gate pass. Subproject closure additionally requires the independent rendering workflow and final documentation-head CI to pass on exact SHAs.

## Current authoritative engine basis

- `docx` 9.7.1 remains the current npm release and its official API supports declarative `Document` creation, sections, styles, headers/footers, tables, numbering, and `Packer.toBuffer`.
- `pdf-lib` upstream remains 1.17.1. Its official API supports document creation/loading, standard fonts, drawing, page add/insert/remove, and `copyPages` between documents. Its own `PDFDocument.copy()` documentation warns that not all information such as AcroForms and outlines is copied, so this plan makes no full-document preservation claim.
- LibreOffice officially supports headless command-line conversion to PDF; it is used only in CI as an independent DOCX renderer/openability check.

Authoritative references:

- https://www.npmjs.com/package/docx
- https://docx.js.org/api/classes/File.html
- https://docx.js.org/api/classes/Table.html
- https://docx.js.org/api/types/ISectionOptions.html
- https://pdf-lib.js.org/docs/api/classes/pdfdocument
- https://pdf-lib.js.org/docs/api/classes/pdfpage
- https://github.com/Hopding/pdf-lib/releases
- https://help.libreoffice.org/latest/en-GB/text/shared/guide/start_parameters.html

---

## File Structure

- `src/documents/types.ts` — canonical `ConsultingDocumentV1`, block types, theme options, metrics, and limits.
- `src/documents/validate.ts` — closed-world validation and normalized document metrics; no rendering.
- `src/documents/docx-create.ts` — DOCX renderer for the validated document model.
- `src/documents/pdf-layout.ts` — pure PDF text measurement, wrapping, row-height, and page-break calculations.
- `src/documents/pdf-create.ts` — PDF renderer using only validated layout primitives and standard fonts.
- `src/documents/pdf-compose.ts` — derivative page composition from one or more source PDFs using `copyPages`.
- `src/documents/register-tools.ts` — MCP schemas/tools for document creation and PDF composition.
- `src/artifacts/docx-template.ts` — retain existing placeholder workflow; add only preservation checks required by fixtures.
- `src/artifacts/pdf.ts` — retain metadata workflow; add shared PDF load/safety helpers needed by composition/validation without broadening text-edit claims.
- `src/server.ts` — compose document tools.
- `tests/document-model.test.ts` — model/bounds/normalization fixtures.
- `tests/docx-create.test.ts` — generated DOCX package, semantic structure, and regression fixtures.
- `tests/pdf-layout.test.ts` — pure pagination/wrapping/table layout fixtures.
- `tests/pdf-create.test.ts` — native PDF creation/openability/encoding fixtures.
- `tests/pdf-compose.test.ts` — derivative merge/extract/reorder/page-boundary fixtures.
- `tests/document-tools.test.ts` — Streamable HTTP MCP creation/composition lifecycle and annotations.
- `tests/docx-template-preservation.test.ts` — stronger existing-template unaffected-part fixtures.
- `tests/catalog-status-truth.test.ts` — truthful DOCX/PDF partial promotion bindings.
- `scripts/generate-document-render-fixtures.mjs` — writes deterministic DOCX/PDF render fixtures from built engines.
- `scripts/verify-document-rendering.sh` — LibreOffice conversion + Poppler PDF/raster validation.
- `.github/workflows/ci.yml` — add CI-only LibreOffice/Poppler renderability gate after build.
- `skills/analysis-and-reporting/SKILL.md`, `skills/artifact-operations/SKILL.md`, `governance/platform-baseline.md`, `README.md`, and program roadmap — closure truth after validation only.

---

### Task 1: Canonical Consulting Document V1 Model

**Files:**
- Create: `src/documents/types.ts`
- Create: `src/documents/validate.ts`
- Create: `tests/document-model.test.ts`

**Interfaces:**

```ts
export type ConsultingDocumentBlock =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string; emphasis?: "normal" | "lead" }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered-list"; items: string[] }
  | { kind: "key-metrics"; items: { label: string; value: string; detail?: string }[] }
  | { kind: "table"; caption?: string; columns: string[]; rows: string[][]; align?: ("left" | "center" | "right")[] }
  | { kind: "callout"; tone: "finding" | "recommendation" | "risk" | "note"; title?: string; text: string }
  | { kind: "source-note"; text: string }
  | { kind: "page-break" };

export interface ConsultingDocumentV1 {
  version: 1;
  title: string;
  subtitle?: string;
  preparedFor?: string;
  preparedBy?: string;
  dateLabel?: string;
  confidentiality?: "none" | "confidential";
  headerLabel?: string;
  footerLabel?: string;
  pageSize?: "letter" | "a4";
  accentColorHex?: string;
  blocks: ConsultingDocumentBlock[];
}

export interface ConsultingDocumentMetrics {
  blockCount: number;
  characterCount: number;
  tableCount: number;
  tableCellCount: number;
}

export function validateConsultingDocument(document: ConsultingDocumentV1): ConsultingDocumentMetrics;
```

Use constants: maximum 500 blocks, 1,000,000 total characters, 200 list items per list, 4 key-metric items per block, 12 table columns, 500 rows per table, 20,000 total table cells, 100,000 characters per individual text value, and accent color matching exactly six hexadecimal digits.

- [x] **Step 1: Write failing closed-world validation tests.** Test a representative valid report and reject unknown block kinds, blank required text, 13-column tables, row-width mismatch, alignment-width mismatch, >4 metrics, invalid color, non-finite/negative limits where applicable, and aggregate block/character/cell overflow.
- [x] **Step 2: Run `npm test -- tests/document-model.test.ts` and confirm RED because the document model does not exist.**
- [x] **Step 3: Implement the type model and validator with no rendering dependencies.** Count all title/metadata/block/table/list strings in the aggregate character bound. Reject extra table row cells instead of truncating or padding them.
- [x] **Step 4: Run focused tests and full `npm run verify`; fix only implementation defects.**
- [x] **Step 5: Commit model + validation.**

**Evidence:** independently green on `26133b9c3e404c39b64c2c375aebbac6cdd330fd`, Actions run `32519572800`.

### Task 2: Professional DOCX Creation Engine

**Files:**
- Create: `src/documents/docx-create.ts`
- Create: `tests/docx-create.test.ts`

**Interfaces:**

```ts
export interface CreatedDocxReport {
  bytes: Buffer;
  metrics: ConsultingDocumentMetrics;
}

export async function createConsultingDocx(document: ConsultingDocumentV1): Promise<CreatedDocxReport>;
```

Render one portrait Letter/A4 section using explicit paragraph styles, heading outline levels, page margins, default header/footer, current page number, a first-page title area, fixed-layout tables with a shaded header row, semantic bullet/decimal numbering, compact key-metric tables, and tone-specific callout tables. Use a brand-neutral professional default accent when `accentColorHex` is absent. Do not create hyperlinks, fields other than the page-number field, macros, images, charts, comments, or embedded files.

- [x] **Step 1: Write failing DOCX package/semantic tests.** Require detected macro-free DOCX, `word/document.xml`, styles, numbering, header/footer relationships, Heading1/2/3 usage, page-number field, title/metadata text, table headers, bullets/numbering, callout text, page break, and exact Unicode text round-trip in XML.
- [x] **Step 2: Confirm RED.**
- [x] **Step 3: Implement DOCX rendering with `Document`, paragraph styles, `Header`, `Footer`, `PageNumber.CURRENT`, `Table`, fixed table layout, and `Packer.toBuffer`.** All content comes from the validated document model; no raw OOXML or arbitrary HTML is accepted.
- [x] **Step 4: Re-open/classify the generated buffer, inspect required package parts, and reject generation if output is not macro-free DOCX.**
- [x] **Step 5: Run focused + full verification and commit.**

**Evidence:** independently green on `db0fa9fb25f3846cc4d2fae429a1a166208441d5`, Actions run `32520282663`.

### Task 3: Deterministic PDF Layout and Professional PDF Creation

**Files:**
- Create: `src/documents/pdf-layout.ts`
- Create: `src/documents/pdf-create.ts`
- Create: `tests/pdf-layout.test.ts`
- Create: `tests/pdf-create.test.ts`

**Interfaces:**

```ts
export interface WrappedPdfLine { text: string; width: number }
export function wrapPdfText(text: string, maxWidth: number, measure: (text: string) => number): WrappedPdfLine[];
export function calculateTableRowHeight(cells: readonly string[], columnWidths: readonly number[], measure: (text: string) => number, lineHeight: number): number;

export interface CreatedPdfReport {
  bytes: Buffer;
  pageCount: number;
  metrics: ConsultingDocumentMetrics;
}

export async function createConsultingPdf(document: ConsultingDocumentV1): Promise<CreatedPdfReport>;
```

Use `StandardFonts.Helvetica` and `StandardFonts.HelveticaBold` only. Preflight every rendered string by attempting standard-font encoding before creating/storing output. Use deterministic page geometry, margins, typographic sizes, spacing, accent rules, footer page numbers, and page-break logic. Tables repeat their header row after a page break and split only between rows. A single row/callout that cannot fit on an empty content page is rejected rather than clipped. Paragraphs can split across pages but must not intentionally leave one orphaned line at the top/bottom when at least two lines can be kept together.

- [x] **Step 1: Write failing pure-layout tests.** Cover long-word rejection, ordinary wrapping, blank lines, exact-boundary lines, paragraph pagination, table row height, repeated table headers, a too-tall row, page break, key metrics, and callout keep-together behavior.
- [x] **Step 2: Write failing PDF creation tests.** Require `%PDF-`, metadata title/author where supplied, expected page count for a multi-page fixture, all standard-font-compatible report text to encode, unsupported non-WinAnsi input such as `Δ` to fail before output, and reopened output to preserve page count.
- [x] **Step 3: Confirm RED.**
- [x] **Step 4: Implement pure layout helpers first, then the `pdf-lib` renderer using `PDFDocument.create`, standard-font measurement, `drawText`, `drawLine`, and `drawRectangle`.** Never call `addJavaScript`, attach embedded files, or synthesize hidden content.
- [x] **Step 5: Save, classify, reopen with `PDFDocument.load({ updateMetadata: false })`, verify page count and metadata, then return bytes.**
- [x] **Step 6: Run focused + full verification and commit.**

**Evidence:** independently green on `b04b71ffd3b80b4a684b6ed3393cd31609b40f54`, Actions run `32520569918`.

### Task 4: Derivative PDF Page Composition

**Files:**
- Create: `src/documents/pdf-compose.ts`
- Create: `tests/pdf-compose.test.ts`

**Interfaces:**

```ts
export interface PdfPageSelection {
  bytes: Buffer;
  pageIndices: readonly number[];
}

export interface PdfCompositionResult {
  bytes: Buffer;
  pageCount: number;
  sourcePageCounts: number[];
}

export async function composePdfPages(selections: readonly PdfPageSelection[]): Promise<PdfCompositionResult>;
```

Limits: 20 source selections, 500 output pages, each page index zero-based and explicit; duplicate indices are allowed because duplication is a valid composition request. Every source must be detected PDF and load successfully. The operation always creates a new PDF and never mutates inputs. It copies selected pages in the exact supplied order with `copyPages`; it does not claim preservation of document-level metadata, AcroForms, outlines/bookmarks, attachments, JavaScript, signatures, or cross-document navigation.

- [x] **Step 1: Write failing composition tests.** Create source PDFs with distinct page dimensions, rotations, and visible labels; test merge, extraction, reordering, duplication, source-buffer immutability, zero selections, unknown page index, >500 output pages, malformed PDF, and encrypted/unsupported input failure where the parser reports it.
- [x] **Step 2: Confirm RED.**
- [x] **Step 3: Implement load → validate page indices → `PDFDocument.create()` → `copyPages()` → ordered add → save → reopen.** Set derivative metadata to identify Consulting Tools as creator/producer only; do not copy source document metadata and present it as preserved.
- [x] **Step 4: Verify copied page sizes/rotations in tests and verify all source buffers are byte-identical after composition.**
- [x] **Step 5: Run focused + full verification and commit.**

**Evidence:** independently green on `ca8848011fb886ed765ff0f125a004511eeb9f3a`, Actions run `32520726004`.

### Task 5: Existing DOCX/PDF Preservation Hardening

**Files:**
- Modify: `src/artifacts/docx-template.ts`
- Modify: `src/artifacts/pdf.ts`
- Create: `tests/docx-template-preservation.test.ts`
- Modify: `tests/pdf-metadata.test.ts`

**Interfaces:** Preserve existing public function names and tool behavior. This task may add internal helpers only; no new broad existing-document mutation API is introduced.

- [x] **Step 1: Write DOCX preservation fixtures before changing code.** Generate a macro-free template containing a body placeholder plus unrelated header, footer, styles, numbering, table, section properties, and a tiny in-memory PNG relationship. Patch only the body placeholder and assert the unrelated semantic parts/content remain present and unchanged where byte-stable. Assert macro-enabled/non-DOCX rejection still holds.
- [x] **Step 2: Write PDF metadata preservation fixtures.** Require metadata update to preserve page count, page sizes, rotations, and representative drawn page content streams/resources as observable through `pdf-lib`; source bytes remain unchanged; malformed/non-PDF input remains rejected.
- [x] **Step 3: Run focused tests and confirm any new assertions that expose a real preservation gap are RED.** If all new assertions already pass, retain the tests as expanded evidence and do not manufacture a code change.
- [x] **Step 4: Make only the minimum adapter changes required by the fixtures.** Do not add arbitrary DOCX search/replace or PDF existing-page text mutation.
- [x] **Step 5: Run focused + full verification and commit the tests plus any required hardening.**

**Evidence:** stronger fixtures passed without a production adapter rewrite on `47275da7c6cf74aafb31fbee0f2c83fbfd778e02`, Actions run `32520908752`.

### Task 6: MCP Document Creation and PDF Composition Tools

**Files:**
- Create: `src/documents/register-tools.ts`
- Create: `tests/document-tools.test.ts`
- Modify: `src/server.ts`

**Interfaces:**

- `create_consulting_document`
  - input: `{ nameBase, formats: ("docx" | "pdf")[], document: ConsultingDocumentV1 }`
  - creates one or both requested artifacts atomically after all requested-format preflight validation succeeds.
  - output: `{ artifacts: ArtifactMetadata[], metrics: ConsultingDocumentMetrics }` plus resource links.
- `compose_pdf_artifact`
  - input: `{ name, sources: { artifactUri, pageIndices: number[] }[] }`
  - creates a new PDF artifact; source revisions are read-only inputs and are never replaced.
  - output: `{ artifact, pageCount, sourcePageCounts }` plus a resource link.

Bounds mirror engine limits. `formats` must contain one or two unique values. If PDF preflight fails, a combined DOCX+PDF request creates neither artifact. `create_consulting_document` is a closed-world non-destructive write; `compose_pdf_artifact` is also a closed-world non-destructive write because it creates a derivative and does not alter sources.

- [x] **Step 1: Write Streamable HTTP MCP tests first.** Require both tools to be discoverable with `readOnlyHint:false`, `openWorldHint:false`, `destructiveHint:false`; create DOCX only, PDF only, both formats, atomic failure for unsupported PDF text, resource links, artifact MIME/name/revision, page composition across two sources, source revision immutability, malformed URI/page index errors, and output bounds.
- [x] **Step 2: Confirm RED because the tools are absent.**
- [x] **Step 3: Register bounded Zod schemas and compose `registerDocumentTools(server, artifactStore)` in `src/server.ts`.** Use the shared engine validators rather than duplicating business rules in Zod.
- [x] **Step 4: Run focused MCP tests and full verification.**
- [x] **Step 5: Commit.**

**Evidence:** initial candidate correctly exposed missing server composition; integrated document-tool behavior is green on `c19c45db29c3e5934d64615f7d95f537daa6f88a`, Actions run `32535859959`.

### Task 7: Independent DOCX/PDF Rendering and Openability Gate

**Files:**
- Create: `scripts/generate-document-render-fixtures.mjs`
- Create: `scripts/verify-document-rendering.sh`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**

`node scripts/generate-document-render-fixtures.mjs <output-dir>` imports built document engines and writes exactly:

- `<output-dir>/consulting-report.docx`
- `<output-dir>/consulting-report.pdf`

The shell validator receives that directory and must:

1. convert the DOCX with `soffice --headless --convert-to pdf:writer_pdf_Export --outdir <render-dir>`;
2. require a non-empty converted PDF;
3. run `pdfinfo` successfully on both the converted DOCX PDF and native PDF;
4. rasterize the first and last page of each with `pdftoppm -png -f N -singlefile` and require non-empty PNG output;
5. fail on any conversion/rasterization error.

- [x] **Step 1: Add the deterministic fixture generator and shell validator, then run unit tests locally/CI without installing new runtime npm dependencies.**
- [x] **Step 2: Add a CI step after the normal build that installs `libreoffice-writer` and `poppler-utils` with `apt-get`, generates fixtures, and runs the render validator.** This is CI-only; production runtime must not depend on LibreOffice/Poppler.
- [x] **Step 3: Confirm RED if the newly generated DOCX/PDF cannot independently convert/rasterize.** Fix the document engines, not the renderer, for legitimate output defects.
- [x] **Step 4: Require the entire existing `ci/verify` status to remain green with the independent render step included.** Record the exact SHA/run before catalog promotion.
- [x] **Step 5: Commit.**

**Evidence:** initial render integration exposed the incorrect emitted-module path and failed as intended; corrected integrated renderer is green on `c19c45db29c3e5934d64615f7d95f537daa6f88a`, Actions run `32535859959`.

### Task 8: Truthful Catalog Promotion, Documentation, and Subproject Closure

**Files:**
- Modify: `tests/catalog-status-truth.test.ts`
- Modify: `src/catalog/verified-promotions.ts`
- Modify: `skills/analysis-and-reporting/SKILL.md`
- Modify: `skills/artifact-operations/SKILL.md`
- Modify: `governance/platform-baseline.md`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`
- Modify: this plan with executed checkboxes/evidence.

**Truth boundary:**

- `docx-crud` may move from `planned` to **`partial`** only after DOCX creation, existing placeholder preservation fixtures, MCP creation, and independent LibreOffice rendering all pass. Its engine bindings may include `create_consulting_document`, `inspect_docx_template`, and `patch_docx_template`; it must not become `implemented` because arbitrary existing Word content/styles/fields/drawings remain outside the envelope.
- `pdf-crud` may move from `planned` to **`partial`** only after PDF creation, metadata preservation fixtures, derivative page composition, MCP operations, and independent Poppler rasterization pass. Its engine bindings may include `create_consulting_document`, `inspect_pdf`, `update_pdf_metadata`, and `compose_pdf_artifact`; it must not become `implemented` because forms, annotations, arbitrary existing text/content editing, signatures, outlines, attachments, JavaScript, and full preservation remain outside the envelope.

- [x] **Step 1: Write catalog truth tests first for the exact partial statuses/bindings above and assert broad unsupported semantics remain unclaimed.**
- [x] **Step 2: Confirm RED, then add only those verified promotions.**
- [x] **Step 3: Require fresh full `ci/verify` including the independent rendering gate on the exact code/catalog SHA.**
- [x] **Step 4: Update Skill/governance/README/roadmap with exact supported blocks, PDF standard-font limitation, page-composition derivative semantics, excluded structures, and verified SHA/run.**
- [ ] **Step 5: Require a second fresh successful full CI result for documentation HEAD and exhaust branch enumeration to confirm only `main`.**
- [ ] **Step 6: Mark Subproject 7 complete only after all prior steps are evidenced; then advance the roadmap to Subproject 8 — Presentation & Visualization Engine.**

**Task 8 execution evidence to date:** catalog truth RED was established on `a556912e0b6a8cc18211adb32959c031d2e26501`, Actions run `32535958844`. The first promotion candidate `be9c1666ec4289b4d2e63dd576e99e5abca92b8b` correctly failed stale broad-CRUD regressions in run `32536009129`; the next regression candidate `e7671f502c5bf558763763cda64081eaa2162b2a` exposed only an invented PDF display-name assertion in run `32536125813`. The corrected code/catalog/rendering gate is green on `1c789291e9488f1a325ddc27a0ca29966338b791`, Actions run `32536219577`. Documentation closure is intentionally still pending.

## Self-Review

- **Spec coverage:** Professional editable document output is covered by shared-model DOCX creation; static print-artifact output by PDF creation; bounded existing-file behavior by retained DOCX templates/PDF metadata plus derivative PDF page composition; artifact quality by structural, preservation, openability, and independent rendering gates; truthful catalog state by Task 8.
- **Placeholder scan:** No TBD/TODO/"similar to" instructions appear. Each task names exact files, interfaces, bounds, failure behavior, focused tests, full verification, and commit boundary.
- **Type consistency:** `ConsultingDocumentV1` and `ConsultingDocumentMetrics` are defined once in Task 1 and consumed unchanged by both renderers and MCP. PDF composition is intentionally byte/page based and does not depend on the report model. Creation tools return new artifacts; existing mutation tools preserve `expectedRevision` semantics.
- **Scope boundary:** Arbitrary existing DOCX text/layout CRUD, arbitrary existing PDF text removal/replacement, PDF forms/annotations/signatures, document JavaScript, attachments, outlines/bookmarks, tagged PDF/PDF-UA, custom fonts, arbitrary HTML/CSS, images/logos, charts, and full Word/PDF fidelity are intentionally excluded rather than silently approximated.
- **Independent validation:** DOCX is independently opened/rendered through LibreOffice Writer; both LibreOffice-rendered DOCX output and native PDF are independently parsed/rasterized through Poppler in CI. This validates renderability, not pixel parity with Microsoft Word/Adobe Acrobat, and documentation states that distinction.
