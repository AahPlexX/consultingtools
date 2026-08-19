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
- `.mcp.json` — bundled local MCP server configuration.
- `skills/` — adaptive consulting workflows and semantic orchestration guidance.
- `src/server.ts` — MCP server composition.
- `src/stdio.ts` — local protocol-negotiating stdio entry.
- `src/http.ts` — web-standard Streamable HTTP entry plus Host/Origin guards for a future public deployment.
- `src/catalog/` — typed capability metadata, registry, verified promotions, relationships, and catalog MCP tools.
- `src/routing/`, `src/epistemics/`, `src/quality/` — workflow and truth/QA contracts.
- `src/artifacts/` — versioned artifact storage and bounded format-specific adapters.
- `src/finance/` — deterministic corporate-finance/FP&A engines and MCP tools.
- `src/statistics/` — profiling, descriptive statistics, correlation, Student-t inference, and autocorrelation engines/MCP tools.
- `src/forecasting/` — baseline forecast, forecast-error, and rolling-origin backtest engines/MCP tools.
- `scripts/`, `governance/`, `tests/`, `docs/`, `.github/workflows/` — freshness, SSOT governance, verification, design/plan docs, and CI.

## Runtime baseline

The MCP foundation targets the stable split TypeScript v2 packages and MCP 2026-07-28 protocol line. Exact dated dependency pins and revalidation rules live in `governance/platform-baseline.md`; versions in prose are not permanent claims.

## Artifact workspace

The repository has a format-neutral plugin-owned artifact substrate with bounded inline import, `artifact://` binary resources, SHA-256/MIME/size/revision metadata, optimistic revision preconditions, destructive deletion semantics, and read-only binary format detection for PDF, ordinary/macro-enabled Office Open XML packages, generic ZIP, and unknown binaries.

Artifact-storage CRUD is **not** document-format CRUD. Current Word support is bounded placeholder inspection/patching for macro-free DOCX templates. Current PDF support is bounded inspection/document-metadata mutation. Broad PDF/DOCX/XLSX/CSV/PPTX CRUD remains separately gated.

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

The statistics surface now exposes:

- `profile_data_column` — explicit non-coercive missing/type profiling;
- `calculate_descriptive_statistics` — finite-number summaries with N-1 sample variance, N population variance, and type-7 quartile/median convention;
- `calculate_correlation` — Pearson or tie-aware Spearman correlation with zero-variance rejection;
- `calculate_mean_confidence_interval` — two-sided Student-t mean interval with explicit assumptions and degrees of freedom;
- `calculate_welch_t_test` — two-sided unequal-variance Welch comparison with Welch-Satterthwaite degrees of freedom, p-value, interval, and non-overstated interpretation;
- `calculate_autocorrelation` — lag autocorrelation for ordered, equally spaced observations.

The forecasting surface exposes:

- `forecast_baseline` — naive, caller-specified seasonal-naive, drift, or trailing moving-average benchmark;
- `calculate_forecast_error_metrics` — signed mean error, MAE, MSE, RMSE, MAPE, and sMAPE using one common pair set;
- `backtest_forecast_baseline` — expanding-window rolling-origin out-of-sample evaluation with no random time-series split.

Important conventions are explicit rather than hidden. Numeric-looking strings are not coerced. Missing/non-finite values are distinguished before numeric analysis. Sample variance uses `n-1`; type-7 quantiles use linear interpolation. Formal inference exposes independence/model assumptions and does not treat failure to reject as proof of equality. Forecast observations are assumed equally spaced and ordered. MAPE is null when any actual is zero; sMAPE is null when any pair has a zero joint denominator, so rows are never silently dropped and epsilon is never substituted.

Baseline forecasts remain benchmarks rather than a comprehensive forecasting claim. The active catalog binds the verified profiling/statistics/inference/baseline/backtest/error tools to relevant capabilities as `partial`; none of these broad data/forecasting capabilities was promoted to fully implemented merely because one deterministic primitive now exists.

Subproject 4's full code gate passed on `35606810a45dc4dc057451096e859053ebbd9d51` through Actions run `32300232978`.

## Remote MCP status

The repository contains source-level remote Streamable HTTP MCP support with fresh server creation, MCP client protocol tests, explicit allowed-host/origin guards, and credential-shaped Host/Origin rejection. This is **not** yet a production deployment: public HTTPS hosting, persistent multi-instance storage, abuse controls, observability, external E2E verification, domain verification, and directory submission remain future gates.

## Development status

**Subproject 1 — Capability Platform Foundation:** verified complete on `16e5d2938c0645df996c25982213952ed53916cb`, run `32175704377`.

**Subproject 2 — 100+ Capability Baseline:** verified complete on `e755062819629ae1eddf0abaece21dec47810748`, run `32295888556`.

**Subproject 3 — Corporate Finance & FP&A Engines:** verified complete for its specified deterministic envelope on `e036427c67c114af307aeac189d8e04f498a0e05`, run `32298548890`.

**Subproject 4 — Data, Statistics & Forecasting Engines:** verified complete for its specified deterministic envelope on `35606810a45dc4dc057451096e859053ebbd9d51`, run `32300232978`. Verification covers direct numerical fixtures, Student-t/Welch inference fixtures, profiling/correlation/autocorrelation, forecast baselines/error metrics/rolling-origin backtesting, MCP HTTP execution and annotations, catalog truth bindings, and all preserved regression tests.

The next milestone is **Subproject 5 — Project, Operations & Supply-Chain Engines**. CSV/XLSX/DOCX/PDF/PPTX artifact expansion, visualization, anonymous public research/fact checking/SEO, executive workflows, production remote MCP, and marketplace submission remain later milestones.

## Branch policy

`main` is the sole authoritative branch. Repository-changing work must finish on `main`, and `main` must never be behind another branch.
