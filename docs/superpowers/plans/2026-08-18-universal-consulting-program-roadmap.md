# Universal Consulting Capability Engine — Program Roadmap

> **For agentic workers:** This roadmap decomposes the approved architecture into independently testable implementation plans. Each subproject gets its own detailed plan before code execution. `main` remains the sole authoritative branch.

**Goal:** Deliver the approved Universal Consulting Capability Engine without allowing capability breadth to outrun routing, epistemic, security, artifact-preservation, or quality verification.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Global constraints

- Ordinary Consulting Tools use must not require a user API key, OAuth, account linking, or private third-party provider credentials.
- Natural-language use is primary; native plugin slash commands are not assumed.
- Reach at least 100 materially distinct user-visible capabilities, but do not equate capability count with MCP tool count.
- Prefer a compact, composable MCP primitive surface over overlapping tool proliferation.
- Fabrication, false precision, invented citations/metrics/file contents/tool execution, and unsupported certainty are prohibited.
- Distinguish verified fact, user-supplied fact, deterministic calculation, bounded assumption, inference, hypothesis, estimate, scenario, and recommendation when the distinction affects interpretation.
- Use deterministic code for fixed mathematical definitions; expose assumptions and reject invalid domains.
- Promote no capability to `implemented` until its execution path and required quality gates pass.
- Existing validated PDF, DOCX, artifact, finance, MCP v2, runtime-freshness, and security-boundary behavior must be preserved unless a tested replacement is superior.
- Existing-workbook XLSX mutation remains gated by `governance/xlsx-engine-decision.md`; managed-v1 does not authorize arbitrary third-party workbook mutation.
- Production public retrieval must include SSRF protections, request/resource bounds, safe logging, and abuse controls.
- `main` is the sole authoritative branch.
- A subproject is never complete merely because its implementation code exists: its specified full verification gate must pass, and artifact subprojects additionally require their format-specific independent validation and documentation closure gates.

## Ordered subprojects

| # | Subproject | Depends on | Independently testable deliverable |
| --- | --- | --- | --- |
| 1 | Capability Platform Foundation | Existing repo | Typed capability metadata, modular registry, composition contracts, epistemic contracts, QA result contracts, routing-plan validation, MCP discovery/validation primitives, orchestrator rules |
| 2 | 100+ Capability Baseline | 1 | At least 100 non-overlapping user-visible capabilities across the approved domain families with triggers, anti-triggers, evidence/output/QA metadata and uniqueness tests |
| 3 | Corporate Finance & FP&A Engines | 1–2 | Reproducible NPV, payback, financial ratios, working capital, variance, scenario/sensitivity and related finance primitives with formula definitions and tests |
| 4 | Data, Statistics & Forecasting Engines | 1–2 | Profiling, descriptive statistics, statistical tests/intervals, time-series baselines, backtesting and error metrics with reproducible fixtures |
| 5 | Project, Operations & Supply-Chain Engines | 1–2 | Critical-path/schedule, capacity/utilization/throughput, weighted decisions, inventory/procurement and operational diagnostics where definitions are deterministic |
| 6 | CSV & XLSX Artifact Engines | 1–5 | Safe CSV CRUD plus a validated XLSX creation/editing envelope, formula/check/audit conventions, rendering/openability and preservation tests |
| 7 | DOCX & PDF Artifact Expansion | 1–5 | Professional document creation plus bounded existing-file operations with preservation, rendering/openability and regression gates |
| 8 | Presentation & Visualization Engine | 1–5 | Chart/exhibit selection, SVG/Mermaid generation, PPTX creation, analytical exhibit validation, accessibility and rendering gates |
| 9 | Public Research, Fact Check & SEO | 1–2 | Anonymous bounded public retrieval, source provenance, conflict handling, claim validation, public SEO crawl/audit functions and explicit private-metric exclusions |
| 10 | Executive & Project Workflows | 1–9 | Composed workflows producing business cases, diligence packs, board decks, operating plans, trackers, dashboards, forecasts and assessments through applicable QA gates |
| 11 | Production MCP & Plugin Directory Readiness | 1–10 | Public HTTPS MCP, deployment persistence strategy, abuse/security controls, observability, external E2E verification, listing/legal/support assets and submission evaluations |

## Dependency logic

1. Subproject 1 is mandatory first because every later implementation relies on capability identity, access status, epistemic classes, composition relationships, routing-plan validation, and common QA contracts.
2. Subproject 2 establishes breadth before domain-specific engines so new deterministic primitives map to stable capability IDs instead of inventing parallel taxonomies.
3. Subprojects 3–5 may proceed independently after 1–2, but each must use the common QA/result contracts.
4. Artifact subprojects 6–8 depend on analytical contracts because generated workbooks, reports, charts, and decks must validate the underlying calculations and provenance, not only file syntax.
5. Public research in subproject 9 depends on the epistemic and source-quality contracts established in subproject 1.
6. Workflow composition in subproject 10 waits until the underlying engines/artifacts/research have real capability states; it may not simulate missing implementations.
7. Production/marketplace work in subproject 11 is final because public claims, schemas, annotations, abuse controls, and evaluation cases must describe the actually implemented product.

## Program completion gates

The program is not complete until all of the following are true:

- natural-language consulting requests can be mapped to a bounded validated workflow using the catalog and composition contracts;
- the catalog contains at least 100 materially distinct user-visible capabilities and can scale further without an equivalent MCP-tool explosion;
- every implemented deterministic calculation is reproducible and independently tested;
- every generated artifact family has an explicit creation/editing/preservation envelope and rendering/openability validation appropriate to the format;
- research outputs preserve source provenance, freshness, conflict handling, and epistemic labels;
- QA can produce machine-readable analytical, epistemic, consulting, and artifact findings without inventing a universal confidence score;
- private-provider/OAuth capabilities remain outside ordinary product operation unless the user supplies data as an input artifact;
- end-to-end representative consulting workflows pass positive, negative, malformed-input, edge, and regression evaluations;
- the production MCP endpoint is externally verified and public-listing metadata accurately matches its behavior;
- `main` is the only authoritative integration branch and is not behind another branch.

## Verification record

### Subproject 1 verification

Capability Platform Foundation verified on `16e5d2938c0645df996c25982213952ed53916cb` with `npm run verify` passing through GitHub Actions run `32175704377`.

### Subproject 2 verification

100+ Capability Baseline verified on `e755062819629ae1eddf0abaece21dec47810748` with `npm run verify` passing through GitHub Actions run `32295888556`. The active registry uses the routing-ready family catalog instead of the legacy catalog, while routing readiness remains separate from implementation status.

### Subproject 3 verification

Corporate Finance & FP&A Engines verified on code commit `e036427c67c114af307aeac189d8e04f498a0e05` through GitHub Actions run `32298548890`.

The verified deterministic envelope includes periodic NPV with explicit t=0 treatment; simple and discounted payback; bounded ambiguity-aware periodic IRR root search; working capital and cash-conversion calculations; explicit ratio families; budget variance; comparison of already supplied financial scenarios; and NPV sensitivity. Periodic `npv` and `payback` are implemented; broader finance workflows retain partial/planned status where their advertised scope exceeds the primitive.

### Subproject 4 verification

Data, Statistics & Forecasting Engines verified on code commit `35606810a45dc4dc057451096e859053ebbd9d51` with `npm run verify` passing through GitHub Actions run `32300232978`; `ci/verify` concluded `success`.

The verified statistics envelope includes non-coercive column profiling; finite-number descriptive statistics with N-1 sample variance and explicit type-7 quartiles; Pearson and tie-aware Spearman correlation; Student-t mean confidence intervals; two-sided Welch unequal-variance t-tests using Welch-Satterthwaite degrees of freedom; and ordered equally spaced lag autocorrelation. The verified forecasting envelope includes naive, caller-specified seasonal-naive, drift, and trailing moving-average baselines; signed bias/MAE/MSE/RMSE/MAPE/sMAPE with explicit zero-denominator handling; and expanding-window rolling-origin out-of-sample backtesting without random time-series shuffling or future leakage.

MCP verification executes the statistics and forecasting tools through the HTTP transport and checks read-only/closed-world/non-destructive annotations and invalid-domain failures. Catalog bindings deliberately remain `partial` because broader user-visible profiling, statistical interpretation, hypothesis-testing, forecasting, and evaluation capabilities exceed the verified narrow primitives; no Subproject 4 capability was promoted to fully implemented merely because a calculator exists.

### Subproject 5 verification

Project, Operations & Supply-Chain Engines verified on code/catalog commit `1fea7d383537956631bd132a39f175646d5f02ac` with `npm run verify` passing through GitHub Actions run `32408792540`; `ci/verify` concluded `success`.

The verified project envelope includes activity-on-node finish-to-start zero-lag critical-path scheduling with early/late timing, total float, bounded multiple critical paths, cycle/unknown-dependency validation, and zero-duration milestones; three-point weighted estimation with standard deviation/variance; and earned-value SV/CV/SPI/CPI arithmetic with null zero-denominator ratios. The verified operations envelope includes capacity utilization, aggregate throughput/average cycle time, and weighted scoring for already-comparable option scores. The verified supply-chain envelope includes caller-supplied-safety-stock reorder point, classical EOQ, and supplier-spend concentration.

The MCP transport verifies all nine tools as read-only, closed-world, and non-destructive. Catalog bindings deliberately remain `partial` for `critical-path`, `earned-value`, `utilization`, `throughput`, `cycle-time`, `weighted-selection`, `inventory-analysis`, and `supplier-segmentation` because their broader user-visible outcomes exceed the deterministic primitive. The three-point estimator is directly executable but is not forced into an unrelated catalog identity. Calendar/resource-leveling scheduling, stochastic safety-stock optimization, supplier-risk inference, queue/bottleneck diagnosis, automatic criterion-scale normalization, and other unimplemented semantics remain outside the verified claim.

### Subproject 6 verification

CSV & XLSX Artifact Engines are verified complete for the specified bounded envelope. The executable/catalog gate passed on `485ec1a10f241bed3212abc3a8b8ffd9f3563e62` with `npm run verify` through GitHub Actions run `32491018071`. The documentation-head closure gate passed on `bddf096f5a748fc3f8de43871518c6462d3da153` through Actions run `32491513181`, and branch enumeration confirmed that `main` is the sole branch.

The verified CSV envelope includes bounded RFC-style comma-delimited parsing/serialization, no type coercion, explicit spreadsheet-formula-injection escaping by default, immutable cell/row/column mutations, artifact resources, revision preconditions, and create/inspect/patch MCP tools. `csv-crud` is promoted only to `partial` because arbitrary delimiters, schema/filter semantics, and other broader transformations remain outside the verified primitive.

The verified managed-XLSX v1 envelope includes macro-free SpreadsheetML package creation, exact managed marker/part validation, literal strings/numbers/booleans/blanks, worksheet/cell/row/column mutations, a constrained formula tokenizer/parser, no fabricated cached formula values, recalculation metadata, revision-guarded create/inspect/patch MCP tools, and rejection of malformed, macro-enabled, arbitrary non-managed, traversal, oversized, external-reference, URL/DDE/add-in, and other unsupported inputs. Broad `xlsx-crud` remains `planned` and unbound because arbitrary third-party workbook styles, charts, drawings, pivots, conditional formatting, data validation, named items, comments, external links/data connections, VBA/macros, unknown parts/relationships, and full Excel formula compatibility are not preserved by managed-v1.

### Subproject 7 verification

DOCX & PDF Artifact Expansion is verified complete for its explicitly bounded envelope. The executable/catalog gate passed on `1c789291e9488f1a325ddc27a0ca29966338b791` through GitHub Actions run `32536219577`. The documentation-head closure gate passed on `5a3b44806d3303854b803ef3e2e8a23abf7863d4` through Actions run `32536569796`, including the independent rendering step. Exhaustive branch enumeration returned only `main` and the continuation cursor returned no additional branches.

The verified shared `ConsultingDocumentV1` model supports bounded headings, paragraphs, bullet/numbered lists, key metrics, tables, callouts, source notes, page breaks, and report metadata. Professional DOCX creation uses explicit styles, Heading 1–3 structure, numbering, fixed tables, headers/footers, and page numbering. Existing DOCX mutation remains limited to the preservation-tested macro-free placeholder-template path, so `docx-crud` is only `partial` with `create_consulting_document`, `inspect_docx_template`, and `patch_docx_template` bindings.

Professional PDF creation uses deterministic layout and PDF standard Helvetica/HelveticaBold fonts with explicit encoding preflight. Existing PDF mutation remains metadata-only, while `compose_pdf_artifact` creates a new derivative from explicit page selections without revising sources or claiming preservation of forms, annotations, signatures, outlines, attachments, JavaScript, or other document-level structures. `pdf-crud` is only `partial` with `create_consulting_document`, `inspect_pdf`, `update_pdf_metadata`, and `compose_pdf_artifact` bindings.

Independent rendering generates representative DOCX/PDF fixtures, converts the DOCX with headless LibreOffice Writer, parses both converted/native PDFs with Poppler `pdfinfo`, and rasterizes first/last pages with `pdftoppm`. This is representative openability/renderability evidence, not pixel parity with Microsoft Word or Adobe Acrobat.

The closure-record commit containing this section must itself remain green before external signoff; that final truth-only validation is intentionally performed after this update.

## Next detailed plan

Write and execute the detailed implementation plan for Subproject 8 — **Presentation & Visualization Engine**. Preserve the verified document and tabular artifact envelopes while adding independently validated chart/exhibit selection, SVG/Mermaid generation, PPTX creation, accessibility checks, and rendering gates before any presentation/visualization capability promotion.
