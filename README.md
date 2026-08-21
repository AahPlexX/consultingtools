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
- **Capability status is explicit.** A capability is never presented as implemented merely because it is routing-ready, has a useful primitive, or appears in the roadmap.
- **External-platform facts are dated.** `governance/platform-baseline.md` records the verified OpenAI/MCP/runtime snapshot and the events that require live revalidation.

## Verified 100+ capability baseline

The active registry contains well over the required 100 materially distinct, routing-ready consulting capabilities across strategy, market, customer, growth, finance, M&A, operations, supply chain, organization, project execution, data, forecasting, research, risk, SEO, innovation, delivery, artifacts, and visualization.

Every active capability is represented through the canonical routing contract and includes the fields needed to decide whether it belongs in a workflow: business questions, positive triggers, anti-triggers, required and optional inputs, methodology, deterministic-engine dependencies, evidence requirements, supported outputs, artifact formats, surface requirements, QA gates, assumption policy, failure behavior, access boundary, risk class, composition references, and evaluation-fixture IDs.

**Routing-ready does not mean implemented.** Status is an independent truth boundary. Narrow operations are promoted only after their executable path and required tests pass; broader reasoning or analytical outcomes remain `partial` when a verified primitive covers only part of the advertised workflow; unavailable credentialed/private-account retrieval remains unavailable; and broad document-format CRUD remains planned until preservation gates pass.

The 100+ baseline was verified by GitHub Actions on commit `e755062819629ae1eddf0abaece21dec47810748` through run `32295888556`.

## Capability platform architecture

- `src/catalog/types.ts` defines canonical domains, modes, statuses, output modalities, artifact formats, access boundaries, risk classes, surface requirements, and QA gate identifiers.
- `src/catalog/define.ts` enforces routing-metadata and open-access invariants at definition time.
- `src/catalog/families/` contains the active domain-family capability definitions.
- `src/catalog/verified-promotions.ts` applies runtime-verified status and deterministic-engine bindings without conflating a useful primitive with a broader capability claim.
- `src/catalog/registry.ts` composes the active routing-ready catalog and provides stable-ID lookup/ranked discovery.
- `src/catalog/relationships.ts` encodes and validates typed composition relationships.
- `src/routing/`, `src/epistemics/`, and `src/quality/` provide deterministic workflow, claim-classification, and quality contracts.
- MCP capability tools provide bounded search, full single-capability inspection, and structured workflow validation without creating one MCP tool per consulting capability.

Natural-language semantic selection remains a host-model/Skill responsibility backed by the typed catalog and deterministic validation layer; the repository does not claim that a hand-written keyword classifier independently understands arbitrary consulting language.

## Repository map

- `.codex-plugin/plugin.json` — plugin package manifest.
- `.mcp.json` — bundled local MCP server launcher configuration.
- `skills/` — adaptive consulting workflows and semantic orchestration guidance.
- `src/server.ts` — MCP server composition.
- `src/stdio.ts` — local protocol-negotiating stdio entry.
- `src/http.ts` — web-standard Streamable HTTP entry plus Host/Origin guards for a future public deployment.
- `src/catalog/` — typed capability metadata, registry, verified promotions, relationships, and catalog MCP tools.
- `src/routing/`, `src/epistemics/`, `src/quality/` — workflow and truth/QA contracts.
- `src/artifacts/` — versioned artifact storage and bounded format-specific adapters.
- `src/tabular/` — safe CSV plus managed-XLSX codecs, mutations, formula validation, and MCP registration.
- `src/finance/` — deterministic corporate-finance/FP&A engines and MCP tools.
- `src/statistics/` — profiling, descriptive statistics, correlation, Student-t inference, and autocorrelation engines/MCP tools.
- `src/forecasting/` — baseline forecast, forecast-error, and rolling-origin backtest engines/MCP tools.
- `src/project/` — critical-path, three-point estimate, earned-value engines, and MCP registrations.
- `src/operations/` — capacity/utilization, aggregate flow, weighted-decision engines, and MCP registrations.
- `src/supply-chain/` — reorder-point, classical EOQ, supplier-spend concentration engines, and MCP registrations.
- `scripts/`, `governance/`, `tests/`, `docs/`, `.github/workflows/` — freshness, SSOT governance, verification, design/plan docs, and CI.

## Runtime baseline

The MCP foundation targets the stable split TypeScript v2 packages and the MCP 2026-07-28 protocol line. The bundled `.mcp.json` currently uses OpenAI's supported direct server-map shape; the alternative wrapped `mcp_servers` shape is also accepted, and the two configuration shapes are **not** MCP protocol V1 versus V2. Protocol/runtime V2 is established by the pinned `@modelcontextprotocol/server@2.0.0` package and `serveStdio(() => createServer())` entry, which can negotiate the modern 2026-07-28 stdio era while retaining legacy compatibility unless explicitly rejected. Do not rewrite the valid direct-map `.mcp.json` merely to make it look newer.

Exact dated dependency pins and revalidation rules live in `governance/platform-baseline.md`; versions in prose are not permanent claims.

## Artifact workspace

The repository has a format-neutral plugin-owned artifact substrate with bounded inline import, `artifact://` binary resources, SHA-256/MIME/size/revision metadata, optimistic revision preconditions, destructive deletion semantics, and read-only binary format detection for PDF, ordinary/macro-enabled Office Open XML packages, generic ZIP, and unknown binaries.

Artifact-storage CRUD is **not** document-format CRUD. Current Word support is bounded placeholder inspection/patching for macro-free DOCX templates. Current PDF support is bounded inspection/document-metadata mutation.

CSV now has a verified bounded implementation for comma-delimited parsing/serialization, explicit row/column/cell CRUD, revision-guarded MCP artifact operations, and spreadsheet-formula-injection escaping by default. The broader `csv-crud` capability is therefore `partial`, because its advertised scope also includes delimiter/schema/filter behavior not yet implemented.

XLSX now has a verified managed-v1 implementation for Consulting Tools-owned macro-free workbooks: literal cells, worksheet/cell/row/column mutations, bounded explicit formulas, managed marker/package validation, and revision-guarded create/inspect/patch MCP operations. Arbitrary third-party workbook mutation remains unsupported; broad `xlsx-crud` stays `planned` and unbound because styles, charts, drawings, pivots, named items, comments, external links/data connections, VBA/macros, unknown parts, and full Excel formula compatibility are outside managed-v1.

The CSV/managed-XLSX executable and catalog gate passed on commit `485ec1a10f241bed3212abc3a8b8ffd9f3563e62` through Actions run `32491018071`.

## Deterministic corporate-finance and FP&A support

Focused finance MCP tools include:

- `calculate_break_even` and `calculate_simple_roi`;
- `calculate_npv` with explicit t=0 periodic cash-flow convention;
- `calculate_payback` for simple/discounted periodic payback;
- `calculate_irr` as a bounded periodic root search that returns `unique`, `multiple`, or `none`;
- `calculate_working_capital` and `calculate_cash_conversion_cycle`;
- `calculate_financial_ratios` for explicit named ratio families;
- `calculate_budget_variance`;
- `compare_financial_scenarios` for already supplied scenarios;
- `calculate_npv_sensitivity` across caller-supplied discount rates.

These tools never choose discount rates, infer missing accounting values/bases, generate scenario assumptions, or relabel periodic NPV/IRR as irregular-date XNPV/XIRR. Periodic `npv` and `payback` are implemented; broader finance outcomes and bounded IRR analysis retain narrower/partial status where appropriate.

Subproject 3's full code gate passed on `e036427c67c114af307aeac189d8e04f498a0e05` through Actions run `32298548890`.

## Deterministic data, statistics, and forecasting support

The statistics surface exposes non-coercive column profiling, finite-number descriptive statistics with N-1 sample variance and type-7 quantiles, Pearson/tie-aware Spearman correlation, Student-t mean confidence intervals, Welch unequal-variance t-tests, and lag autocorrelation for ordered equally spaced observations.

The forecasting surface exposes naive, caller-specified seasonal-naive, drift, and trailing moving-average baselines; signed bias/MAE/MSE/RMSE/MAPE/sMAPE; and expanding-window rolling-origin backtesting without random time-series splits or future leakage.

Important conventions are explicit rather than hidden. Numeric-looking strings are not coerced. Missing/non-finite values are distinguished before numeric analysis. MAPE/sMAPE return null when mathematically undefined instead of silently dropping rows. Baseline forecasts remain benchmarks rather than a comprehensive forecasting claim, and active catalog bindings remain `partial` where broader outcomes exceed the primitive.

Subproject 4's full code gate passed on `35606810a45dc4dc057451096e859053ebbd9d51` through Actions run `32300232978`.

## Deterministic project, operations, and supply-chain support

The verified project MCP surface includes:

- `calculate_critical_path` — finish-to-start, zero-lag activity-on-node DAG scheduling in one duration unit, including early/late timing, total float, bounded multiple critical paths, milestones, cycle detection, and unknown-dependency rejection;
- `calculate_three_point_estimate` — PERT-style weighted expected value, standard deviation, variance, and triangular mean from explicit optimistic/most-likely/pessimistic values;
- `calculate_earned_value_performance` — SV, CV, SPI, and CPI from supplied PV/EV/AC with null ratio outputs when denominators are zero.

The verified operations MCP surface includes:

- `calculate_capacity_utilization` — used capacity divided by available capacity on one explicit unit/period basis;
- `calculate_flow_performance` — aggregate throughput and average cycle time from completed units and elapsed time;
- `calculate_weighted_decision` — normalized non-negative weights and ranking of already-comparable option scores.

The verified supply-chain MCP surface includes:

- `calculate_reorder_point` — lead-time demand plus caller-supplied safety stock;
- `calculate_eoq` — classical EOQ benchmark;
- `analyze_supplier_spend` — supplier spend rank/share/cumulative share/top-N concentration.

These primitives do not claim calendar/resource-aware scheduling, arbitrary dependency types, probabilistic schedule guarantees, EAC forecasting, queue/bottleneck diagnosis, automatic scale normalization, stochastic safety-stock design, quantity-discount optimization, or supplier-risk inference. The active catalog binds them to relevant broader project/operations/supply-chain capabilities as `partial`; no broad consulting outcome was promoted to implemented merely because one primitive exists.

Subproject 5's executable and catalog-binding gate passed on `1fea7d383537956631bd132a39f175646d5f02ac` through Actions run `32408792540`. The immediately preceding integration repair `448c22ae49f046925af0324cbab5bc3ebc67fcab` also passed full verification through run `32408368386` after correcting server composition and two convention-string contract defects.

## Remote MCP status

The repository contains source-level remote Streamable HTTP MCP support with fresh server creation, MCP client protocol tests, explicit allowed-host/origin guards, and credential-shaped Host/Origin rejection. This is **not** yet a production deployment: public HTTPS hosting, persistent multi-instance storage, abuse controls, observability, external E2E verification, domain verification, and directory submission remain future gates.

## Development status

**Subproject 1 — Capability Platform Foundation:** verified complete on `16e5d2938c0645df996c25982213952ed53916cb`, run `32175704377`.

**Subproject 2 — 100+ Capability Baseline:** verified complete on `e755062819629ae1eddf0abaece21dec47810748`, run `32295888556`.

**Subproject 3 — Corporate Finance & FP&A Engines:** verified complete for its specified deterministic envelope on `e036427c67c114af307aeac189d8e04f498a0e05`, run `32298548890`.

**Subproject 4 — Data, Statistics & Forecasting Engines:** verified complete for its specified deterministic envelope on `35606810a45dc4dc057451096e859053ebbd9d51`, run `32300232978`.

**Subproject 5 — Project, Operations & Supply-Chain Engines:** verified complete for its specified deterministic envelope on `1fea7d383537956631bd132a39f175646d5f02ac`, run `32408792540`. Verification covers pure engine fixtures, malformed/edge conditions, MCP HTTP discovery/execution and safe annotations, truthful partial catalog bindings, and all preserved regressions.

**Subproject 6 — CSV & XLSX Artifact Engines:** the specified executable/catalog envelope passed on `485ec1a10f241bed3212abc3a8b8ffd9f3563e62`, run `32491018071`. Closure requires a fresh successful `ci/verify` on the documentation HEAD containing this record; until that gate passes, the subproject is not signed off.

The next planned milestone after Subproject 6 closure is **Subproject 7 — DOCX & PDF Artifact Expansion**.

## Branch policy

`main` is the sole authoritative branch. Repository-changing work must finish on `main`, and `main` must never be behind another branch.
