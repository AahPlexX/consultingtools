# Universal Consulting Capability Engine — Architecture Design

**Date:** 2026-08-18 (America/Chicago)  
**Status:** Approved for implementation planning and execution  
**Repository:** `AahPlexX/consultingtools`  
**Authoritative branch:** `main`

## 1. Purpose

Consulting Tools is an open-access universal consulting capability and quality layer for ChatGPT and Codex. Its purpose is to maximize the measurable correctness, analytical rigor, evidentiary quality, usefulness, clarity, and professional quality of business-consulting work across strategy, finance, FP&A, M&A, operations, supply chain, organization, change, growth, pricing, data, research, project execution, visualization, and executive communication.

The plugin must let a user describe a business problem in ordinary language without needing to know consulting-framework names, internal tool names, or implementation details. The system interprets the objective, identifies the required evidence, selects the smallest sufficient set of consulting capabilities and deterministic operations, generates the most useful deliverable form, validates the result independently, and clearly separates verified facts, calculations, assumptions, inferences, scenarios, estimates, and recommendations.

Breadth is pursued aggressively, but capability count, methodological sophistication, file complexity, or presentation polish may never override correctness, evidentiary integrity, safety, or usability.

## 2. Product principles

### 2.1 Open access

Ordinary Consulting Tools functionality must not require a user-supplied API key, OAuth flow, account link, or private third-party provider credential. The existing `governance/open-access-boundary.md` remains controlling.

The product may rely on:

- user-supplied text, files, exports, and structured data;
- plugin-owned deterministic computation;
- public Internet evidence that is legally and technically retrievable without user credentials;
- plugin-owned server infrastructure required to execute MCP tools;
- host-native capabilities already available through the active ChatGPT or Codex surface, provided Consulting Tools does not add a separate account-linking requirement.

The product is not a connector hub. Private cloud drives, CRMs, authenticated analytics products, Search Console, commercial keyword/backlink providers, project-management SaaS accounts, and private databases remain outside the product boundary unless the user supplies an export as ordinary input.

### 2.2 Natural-language first

Users should not be required to memorize slash commands or select from a fixed taxonomy before they can obtain useful work. Natural-language requests are the primary interaction model.

Internal stable identifiers are required for routing and evaluation, but they are not presented as native ChatGPT slash commands. Human-facing capability discovery may expose readable names and optional textual aliases, but the architecture must never depend on slash-command UI behavior that the host does not guarantee.

### 2.3 Adaptive rather than template-bound

No universal report template or mandatory framework stack exists. The router selects methods according to the actual decision, evidence, audience, stakes, time horizon, scope, available inputs, and required work product.

The system must be capable of determining that a familiar framework is unnecessary. It may also combine several methods when one method's output is a valid input to another and the composition materially improves the decision.

### 2.4 Quality before count

The catalog must reach at least 100 distinct user-visible capabilities as an initial breadth milestone, but 100 is neither a hard maximum nor a target for MCP tool count. A new catalog entry is justified only when it represents a materially different consulting outcome, analytical question, artifact, deterministic operation, or validation method.

Cosmetic aliases, renamed frameworks, and overlapping entries do not count toward breadth.

### 2.5 Epistemic honesty

Fabrication, invented citations, invented metrics, invented file contents, invented tool execution, false precision, and unsupported certainty are prohibited.

Inference itself is not prohibited. Consulting work often requires inference, scenarios, recommendations, hypotheses, and estimates. The governing rule is that each meaningful claim must be distinguishable by epistemic class when the distinction affects interpretation:

- verified external fact;
- user-supplied fact;
- deterministic calculation;
- bounded assumption;
- inference;
- hypothesis;
- estimate;
- scenario;
- recommendation.

A lower-confidence class must never be represented as a higher-confidence class.

### 2.6 Measurable quality rather than decorative scores

The product must not invent universal 95% or 99% confidence values for qualitative work. Where statistical confidence is mathematically defined and applicable, calculate it. Elsewhere, use explicit validation gates and unresolved-uncertainty reporting.

Development conversations may include an engineering confidence judgment when useful, but client-facing artifacts and code must not expose arbitrary internal confidence percentages.

## 3. Core architecture

The architecture deliberately separates five concepts that must not collapse into one another.

### 3.1 Capability

A capability is a user-relevant outcome or analytical ability such as market-entry analysis, DCF valuation, supply-chain diagnostic, project risk assessment, customer segmentation, or board-deck creation.

Capabilities are the primary units in the breadth catalog and autonomous routing ontology.

### 3.2 Skill

A Skill contains repeatable consulting workflow knowledge: how to scope the problem, what evidence is needed, which methods are appropriate, which pitfalls must be avoided, how to sequence work, and how to structure the result.

Skills do not become implemented merely because a prompt recipe exists. A Skill may rely on deterministic MCP tools, public research, user-supplied artifacts, and host-native capabilities.

### 3.3 MCP tool

An MCP tool is a controlled executable action whose behavior benefits from reproducibility, code execution, file mutation, data processing, public retrieval, or state management.

The MCP surface should remain compact relative to the capability catalog. Several capabilities may compose the same safe primitive. Tools must be split where permissions, destructive behavior, open-world behavior, schemas, safety, or confirmation requirements materially differ.

The architecture rejects both extremes:

- one MCP tool for every capability; and
- one opaque `analyze_anything` tool that hides materially different operations.

### 3.4 Artifact engine

An artifact engine compiles, edits, validates, and returns professional work products such as XLSX, PPTX, DOCX, PDF, CSV, SVG, Mermaid, HTML, or supported interactive output.

Artifact engines must prove their preservation and rendering envelopes operation by operation. File storage CRUD is not document-format CRUD.

### 3.5 Workflow

A workflow is a task-specific composition of capabilities, Skills, MCP tools, evidence, calculations, artifacts, and validation gates.

For example, an acquisition recommendation may route through industry research, financial normalization, valuation, synergy analysis, diligence-gap assessment, scenario analysis, risk assessment, recommendation synthesis, and executive presentation generation without exposing each internal step as a mandatory user command.

## 4. Autonomous routing engine

The router is a first-class subsystem rather than a collection of prose instructions.

### 4.1 Input interpretation

For every substantive request, determine the following when material:

- the user's actual decision, objective, or work product;
- intended audience and decision-maker;
- stakes and reversibility;
- industry, geography, organization, product, or market scope;
- time horizon;
- required level of detail;
- supplied facts and artifacts;
- evidence freshness requirements;
- missing information;
- required calculations;
- required visualizations;
- required file or output modality;
- legal, regulatory, financial, medical, tax, or other high-stakes implications;
- whether public research is necessary;
- whether a deterministic engine is available and appropriate;
- which analyses depend on the outputs of earlier analyses;
- what methods would be redundant or misleading.

### 4.2 Task graph

The router produces a bounded execution graph rather than a flat method list. Nodes may include research, normalization, calculation, analysis, comparison, synthesis, artifact creation, and validation. Edges represent actual dependencies.

The graph must prefer the smallest sufficient set of complementary steps. A framework is not selected merely because it is popular.

### 4.3 Routing metadata

Every capability should eventually include structured metadata sufficient for autonomous selection and evaluation:

- canonical capability ID;
- human-readable name;
- domain and subdomain;
- functional definition;
- business question solved;
- positive trigger conditions;
- anti-trigger conditions;
- minimum required inputs;
- optional quality-enhancing inputs;
- methodology or governing analytical logic;
- execution mode: reasoning, research, deterministic, artifact, or hybrid;
- deterministic engines used;
- evidence requirements;
- supported output modalities;
- supported file types;
- quality gates;
- assumption rules;
- failure and fallback behavior;
- capability status;
- surface requirements;
- open-access compliance;
- risk/stakes classification;
- related/composable capabilities;
- overlapping or mutually exclusive capabilities;
- evaluation fixtures and success criteria.

### 4.4 Failure behavior

When the available evidence is insufficient for a defensible conclusion, the router must not fabricate the missing information. It should use one of four outcomes:

1. obtain public evidence when appropriate and permitted;
2. derive the missing value deterministically from valid supplied inputs;
3. proceed with an explicitly bounded assumption or scenario when doing so is useful and honest;
4. state the limitation and adjust the deliverable so unsupported precision is not implied.

## 5. Capability taxonomy

The initial catalog milestone is 100+ distinct capabilities. The target architecture must scale to several hundred without requiring a several-hundred-tool MCP surface.

The following families are required as first-class coverage domains.

### 5.1 Strategy and corporate direction

Coverage includes SWOT/TOWS, PESTLE, Five Forces, VRIO, value-chain analysis, growth strategy, portfolio analysis, scenario planning, strategic option generation, strategic-option comparison, turnaround analysis, diversification, market entry, strategic roadmaps, business-model assessment, competitive-response planning, operating-model alignment, and strategic risk.

### 5.2 Market and competitive intelligence

Coverage includes TAM/SAM/SOM, top-down sizing, bottom-up sizing, triangulation, market attractiveness, market maturity, competitor benchmarking, feature and price normalization, positioning maps, substitute analysis, barrier analysis, whitespace analysis, public competitor intelligence, market-trend synthesis, and opportunity assessment.

### 5.3 Customer, sales, marketing, and commercial

Coverage includes segmentation, ICP, evidence-supported personas, Jobs-to-be-Done, Voice of Customer, customer journey, service blueprint, pricing, packaging, willingness-to-pay evidence assessment, funnel analysis, cohorts, retention, churn, sales-pipeline diagnostics, sales-territory analysis, channel mix, acquisition economics, positioning, conversion optimization, and commercial growth planning.

### 5.4 Corporate finance, FP&A, and investment

Coverage includes break-even, ROI, NPV, IRR, payback, DCF, unit economics, CAC/LTV, contribution margin, profitability, margin analysis, liquidity, leverage, financial ratios, working capital, cash conversion, budget variance, price/volume/mix, cash-flow forecasting, sensitivity, scenario modeling, investment appraisal, cost-benefit analysis, total-cost-of-ownership analysis, business cases, and forecast review.

### 5.5 M&A and due diligence

Coverage includes target screening, strategic fit, commercial diligence, financial diligence, operational diligence, technology/process diligence where evidence permits, management/organization diligence, synergy identification, synergy sizing, integration complexity, risk registers, diligence-gap tracking, valuation comparison, deal-scenario analysis, integration planning, and executive investment memoranda.

The plugin must not present itself as licensed legal, tax, audit, securities, or investment advice. Specialized regulated conclusions require current authoritative evidence and appropriate human review.

### 5.6 Operations, process improvement, and quality

Coverage includes process mapping, SIPOC, value-stream analysis, bottleneck analysis, capacity, utilization, throughput, cycle-time analysis, Pareto, root-cause analysis, Five Whys, fishbone, FMEA, waste analysis, service-process redesign, control plans, operational KPI design, productivity analysis, and operating-performance diagnostics.

### 5.7 Supply chain, procurement, and vendor strategy

Coverage includes demand/supply diagnostics, inventory analysis, safety-stock reasoning where data supports it, supplier segmentation, vendor comparison, sourcing strategy, procurement opportunity analysis, lead-time analysis, service-level tradeoffs, network/cost diagnostics, make/buy analysis, supplier risk, spend analysis, and supply-chain scenario planning.

### 5.8 Organization, workforce, and change

Coverage includes organization design, spans/layers, roles, decision rights, RACI/RASCI, stakeholder mapping, capability assessment, workforce planning, workload analysis, change readiness, change impact, adoption risk, training-needs analysis, competency matrices, performance-management design, OKRs, KPI trees, balanced scorecards, and transformation roadmaps.

### 5.9 Project, program, and portfolio execution

Coverage includes project charters, work-breakdown structures, milestones, Gantt plans, dependency maps, critical path, PERT-style estimates where appropriate, RAID logs, risk registers, issue registers, decision logs, action trackers, resource plans, project budgets, RAG reporting, change-control logs, scope trackers, deliverable matrices, earned-value calculations when inputs permit, sprint/release planning where appropriate, and portfolio prioritization.

This family must work without Jira, Asana, Monday, Smartsheet, or other account-linked platforms by generating and updating user-owned artifacts.

### 5.10 Data analysis and statistics

Coverage includes profiling, validation, cleaning, deduplication, type normalization, missingness, descriptive statistics, distributions, percentiles, cross-tabs, pivot-style summaries, group comparisons, correlation, regression where justified, hypothesis testing, confidence intervals, effect sizes, outliers, anomalies, time series, trend analysis, seasonal analysis, clustering/segmentation where meaningful, cohort/funnel transformations, reconciliation, and audit checks.

### 5.11 Forecasting and planning

Coverage includes financial, revenue, demand, staffing, capacity, cash-flow, pipeline, and operational forecasts; trend baselines; exponential-smoothing approaches where appropriate; seasonal models; regression-based forecasts; scenario forecasts; backtesting; holdout evaluation; MAE/RMSE/MAPE or other appropriate error metrics; uncertainty intervals; and assumption sensitivity.

The router must select the simplest model that performs adequately and must not imply causal certainty from predictive fit.

### 5.12 Visualization and analytical exhibits

Coverage includes bar/column, grouped/stacked bar, line, area, scatter, bubble, histogram, box plot, waterfall, funnel, Pareto, heatmap, matrix, treemap, Gantt, timelines, control/run charts, cohort heatmaps, correlation matrices, tornado sensitivity charts, decision trees, process diagrams, network/dependency diagrams, strategy maps, positioning maps, KPI dashboards, risk heatmaps, 2x2 matrices, 9-cell grids, Marimekko-style exhibits where supported, radar charts where justified, and geographic visualization where appropriate.

Chart selection is part of the analytical method. Every visualization must use honest scales, labels, units, provenance, accessible presentation, and a chart form appropriate to the underlying question.

### 5.13 Research and fact checking

Coverage includes public-source discovery, source ranking, freshness validation, claim/source mapping, corroboration, contradiction detection, date normalization, quote verification, benchmark normalization, evidence-quality evaluation, unsupported-claim detection, fact/inference separation, citation generation, research-gap identification, and evidence synthesis.

Primary and authoritative sources are preferred. High-quality secondary sources may be used when primary sources do not answer the question and their use is made proportionate to the claim. Informal sources may be analyzed as the subject of sentiment or Voice-of-Customer research but must not silently become authoritative support for unrelated factual claims.

### 5.14 SEO and digital assessment

Coverage includes technical SEO, on-page SEO, metadata, headings, canonicalization, robots, sitemaps, structured data, internal links, indexability, content architecture, search intent, content gaps, competitive public content, local SEO, public performance evidence where observable, and public search-result evidence.

Private Search Console metrics, authenticated analytics, proprietary backlink indexes, and proprietary keyword-demand/difficulty metrics remain unavailable unless the user supplies exported data.

### 5.15 Risk, assessment, audit, and decision support

Coverage includes risk registers, likelihood/impact matrices, FMEA, control assessments, gap assessments, maturity assessments, readiness assessments, due diligence, vendor assessments, scorecards, weighted decision matrices, MCDA, scenario risk, dependency risk, implementation risk, and evidence-backed finding prioritization.

### 5.16 Brainstorming, innovation, and problem framing

Coverage includes divergent ideation, convergent filtering, constraint-driven ideation, morphological analysis, alternative generation, assumption reversal, opportunity mapping, value-proposition generation, solution decomposition, pre-mortems, red-team critique, devil's-advocate analysis, hypothesis generation, experiment design, and prioritization.

Generated ideas must be labeled as ideas or hypotheses rather than evidence.

### 5.17 Comparison and selection

Coverage includes vendor selection, product/service comparison, build-vs-buy, location comparison, option matrices, weighted scoring, sensitivity to weights, total-cost comparison, risk-adjusted comparison, feature normalization, evidence-strength comparison, and recommendation tradeoffs.

### 5.18 Executive communication and deliverable architecture

Coverage includes executive briefs, decision memos, strategy documents, operating plans, investment memoranda, diligence reports, feasibility studies, proposals, assessments, board materials, implementation plans, status reports, and adaptive report architecture.

The system chooses the deliverable based on the decision and audience rather than defaulting to long prose or a fixed report template.

## 6. Output and artifact architecture

Output type is not binary. The system supports the following modalities when implemented and appropriate:

- conversational analysis;
- structured analytical model;
- tabular dataset;
- static visualization;
- diagram or process map;
- editable document;
- spreadsheet or financial model;
- presentation;
- print-ready static artifact;
- interactive UI or calculator where the active surface supports it;
- multi-artifact package.

### 6.1 XLSX

The target spreadsheet engine must support professional multi-sheet models, explicit assumptions, formulas, schedules, checks, source/provenance notes, scenario/sensitivity controls, dashboards, and auditable calculations.

Existing-workbook mutation requires a proven preservation envelope. The current XLSX engine decision remains in force until a safe engine or bounded OOXML strategy is validated.

### 6.2 PPTX

Presentation generation must support executive storylines, action titles, consulting-style information hierarchy, analytical exhibits, card layouts where appropriate, source notes, appendix material, consistent typography/spacing, and rendering validation.

### 6.3 DOCX and PDF

Document generation must support executive memoranda, reports, assessments, proposals, business cases, diligence reports, implementation plans, and other professional work products.

DOCX should remain editable; PDF should provide stable presentation and print delivery. Existing-document edits must preserve unaffected content and pass format-specific validation.

### 6.4 CSV and tabular exchange

CSV and related delimited outputs must be validated for encoding, row/column integrity, missingness, type expectations, delimiter behavior, and spreadsheet formula-injection risks. Where useful, delivery should include a schema or data dictionary suitable for BI ingestion.

### 6.5 SVG, Mermaid, and diagrams

The system should generate portable vector or text-defined diagrams for process flows, dependency maps, Gantt-style views, root-cause trees, matrices, strategy maps, risk heatmaps, and related consulting visuals when these forms communicate the result better than prose.

### 6.6 Interactive output

Interactive HTML/JavaScript or host-native widgets may be used for scenario controls, sensitivities, calculators, filtering, and other interactions when the active host supports the capability safely. Interactive output is an enhancement, not a universal dependency; a noninteractive fallback must remain possible for core analytical results.

## 7. Deterministic analytical engines

The plugin should preferentially execute calculations through deterministic code whenever a mathematical definition is sufficiently fixed. Model reasoning should select and interpret the calculation, not replace arithmetic that can be reproduced.

Planned engine families include:

- corporate-finance calculations;
- FP&A and variance calculations;
- working-capital and operational-finance calculations;
- investment-appraisal calculations;
- descriptive statistics;
- statistical tests and intervals;
- forecasting baselines and evaluation;
- sensitivity and scenario engines;
- project critical-path and schedule calculations;
- weighted decision and MCDA calculations;
- operational capacity, throughput, and utilization calculations;
- data-quality and reconciliation checks;
- chart-specification and exhibit data validation.

Every deterministic engine must expose formula/definition assumptions, validate denominators and units, reject invalid domains, and carry reproducible tests.

## 8. Evidence and research architecture

Research is triggered by uncertainty, freshness, stakes, and decision value rather than by a blanket rule that every task must browse.

Research is required when a material answer depends on current external facts, market conditions, regulations, standards, current organizations/people, public competitor behavior, prices, current product capabilities, or other information likely to be stale or absent from supplied evidence.

Research is unnecessary when the task can be answered completely and correctly from user-supplied data plus deterministic logic.

### 8.1 Evidence hierarchy

Prefer, in order of relevance and availability:

1. authoritative primary sources;
2. official datasets, filings, standards, and first-party documentation;
3. reputable institutional/academic/industry sources with transparent methodology;
4. high-quality secondary reporting when primary evidence is unavailable or incomplete;
5. informal/user-generated evidence only when it is itself the subject of analysis or no stronger source exists and the limitation is explicit.

### 8.2 Conflicting sources

Conflicts must be investigated rather than averaged away. The system should determine whether disagreement is caused by definition, scope, date, methodology, geography, population, or genuine uncertainty.

If strong sources remain irreconcilable, the final work product must state the disagreement and decision implications instead of manufacturing one "provably correct" answer.

## 9. Quality Assurance and Evaluation Engine

Quality assurance is a first-class subsystem, not a final proofreading step.

### 9.1 Analytical correctness gates

Applicable checks include:

- formula correctness;
- internal consistency;
- unit consistency;
- reconciliation of totals/subtotals;
- balance checks;
- denominator validity;
- method-definition fidelity;
- sensitivity to material assumptions;
- statistical assumptions;
- forecast backtest quality;
- reproducibility from supplied inputs.

### 9.2 Epistemic-quality gates

Applicable checks include:

- claim/source support;
- source authority;
- freshness;
- provenance;
- citation coverage;
- contradictory evidence;
- unsupported factual claims;
- fact/inference/assumption/scenario separation;
- false precision;
- invented metrics.

### 9.3 Consulting-quality gates

Applicable checks include:

- correct problem framing;
- method appropriateness;
- evidence sufficiency;
- meaningful alternatives;
- logical connection from evidence to findings;
- logical connection from findings to recommendations;
- tradeoffs;
- risks;
- dependencies;
- implementation feasibility;
- ownership/actionability;
- decision usefulness;
- executive readability.

### 9.4 Artifact-quality gates

Applicable checks include:

- file opens successfully;
- expected structure exists;
- formulas remain intact;
- cross-references resolve;
- charts match underlying values;
- no clipped or overlapping text;
- no broken layouts;
- appropriate typography and hierarchy;
- accessibility requirements;
- print/render quality;
- source notes/provenance;
- preservation of unaffected existing content;
- user-requested edits were applied without unrelated regressions.

### 9.5 Evaluation fixtures

Each implemented capability or deterministic primitive needs representative positive, negative, edge, malformed-input, and regression fixtures appropriate to its risk.

The marketplace submission minimum is not the project quality target. Internal evaluation coverage should be materially larger and tied to actual consulting outcomes.

## 10. Capability composition

A capability graph should encode valid relationships such as prerequisites, useful follow-ons, alternatives, and overlaps.

Examples:

- market sizing may feed market attractiveness;
- market attractiveness may feed market-entry strategy;
- financial normalization may feed DCF and ratio analysis;
- valuation plus synergy analysis plus diligence findings may feed an acquisition recommendation;
- data profiling precedes statistical modeling;
- a project WBS precedes critical-path calculation;
- sensitivity analysis follows a deterministic model whose drivers are explicit.

The composition graph must also encode common anti-patterns, such as running multiple frameworks that answer the same question without adding triangulation value.

## 11. Security, privacy, and persistence

Open access does not mean unbounded or anonymous abuse is acceptable. Production must include request/resource bounds, rate/abuse controls, safe logging, least privilege, bounded public fetch behavior, SSRF protections where public URL retrieval exists, content-type validation, and destructive-action semantics.

Because the product intentionally avoids account-linked customer workspaces, the preferred design is stateless or short-lived execution with artifact handles and explicit user-controlled outputs. Persistent storage may exist when technically required, but it must not evolve into a private SaaS workspace that silently requires user identity or third-party account linkage.

## 12. Implementation topology

The preferred repository topology is modular and capability-family oriented.

Expected logical areas include:

- `src/catalog/` or equivalent typed capability registry;
- routing and composition logic;
- deterministic engine modules by analytical family;
- `src/artifacts/` format-neutral substrate plus format adapters;
- visualization/exhibit selection and generation;
- public research/fetch boundary;
- quality/evaluation modules;
- Skills organized by coherent consulting domain/workflow;
- fixtures and tests organized by capability/engine rather than by arbitrary file count.

The implementation should avoid a single massive catalog file as the capability count expands. The catalog may be generated or composed from typed domain modules so capability metadata remains understandable, testable, and independently reviewable.

## 13. Phased implementation strategy

### Phase A — Architecture/governance alignment

- promote this approved design into governing North Star and capability policy;
- replace any remaining provider-ecosystem language with Universal Inputs & Open Evidence;
- separate capability metadata from MCP tool metadata;
- modularize the catalog design before major expansion;
- preserve `main` as sole authoritative branch.

### Phase B — Routing ontology and 100+ capability baseline

- define the canonical metadata type;
- split capability families into modular registries;
- reach at least 100 non-overlapping user-visible capabilities;
- encode trigger, anti-trigger, evidence, execution, output, and QA metadata;
- build search/discovery and composition relationships;
- add uniqueness/overlap tests.

### Phase C — Quality Assurance/Evaluation Engine foundation

- define common validation-result contracts;
- implement epistemic and deterministic checks that can be machine-tested;
- establish fixture conventions;
- create cross-output quality gates;
- prevent capability promotion without required evidence.

### Phase D — Deterministic finance/data/forecasting expansion

- expand finance beyond break-even/simple ROI;
- add statistical/data engines;
- add forecast baselines and backtesting;
- add project/schedule and decision-analysis calculations;
- expose focused MCP primitives only where deterministic execution is useful.

### Phase E — Artifact and visualization engines

- continue operation-specific PDF/DOCX expansion;
- implement CSV safely;
- resolve XLSX engine/preservation strategy before broad workbook CRUD;
- select and validate PPTX engine;
- build chart/exhibit selection and generation;
- add rendering/preservation gates.

### Phase F — Public research, fact checking, and SEO

- implement safe anonymous public retrieval;
- add evidence provenance and conflict handling;
- add public SEO crawl/audit operations;
- add fact-check and benchmark workflows;
- explicitly preserve unavailable status for private-provider metrics.

### Phase G — Executive/project deliverable workflows

- compose capabilities into board decks, business cases, diligence packs, operating plans, project trackers, dashboards, forecasts, assessments, and other professional outputs;
- ensure every workflow routes through applicable QA gates.

### Phase H — Production remote MCP and marketplace readiness

- production hosting and public HTTPS endpoint;
- persistent/short-lived artifact strategy appropriate to deployment;
- request bounds, abuse controls, observability, and security hardening;
- external end-to-end verification;
- domain/listing/privacy/terms/support readiness;
- marketplace positive/negative test package;
- current platform revalidation immediately before submission.

## 14. Rejected architecture choices

### 14.1 Exactly 100 MCP tools

Rejected because a capability count is not a safe tool-surface design principle. It creates overlapping descriptions, selection ambiguity, duplicated schemas, and maintenance burden. The project instead targets 100+ capabilities with a smaller composable executable surface.

### 14.2 One giant generic analysis tool

Rejected because it obscures materially different risk boundaries, validation requirements, schemas, and deterministic behavior.

### 14.3 Mandatory slash-command UX

Rejected because the host does not guarantee plugin-defined native slash commands. Natural-language routing and host-supported plugin invocation are primary.

### 14.4 Generic provider ecosystem

Rejected because it conflicts with the open-access/no-auth product boundary and adds complexity that does not improve universal baseline consulting quality.

### 14.5 Universal numerical confidence threshold

Rejected because many consulting judgments do not have a mathematically defined probability of correctness. Measurable validation gates, uncertainty disclosure, and statistical confidence only where applicable are superior.

### 14.6 Absolute prohibition on inference

Rejected because strategy, forecasting, due diligence, scenario planning, and recommendations inherently involve bounded reasoning beyond directly observed facts. The system instead enforces epistemic classification and prohibits passing inference off as verified fact.

## 15. Success criteria

The architecture is successful when all of the following are true:

- a user can describe a consulting problem naturally and receive a correctly routed workflow without knowing framework names;
- the catalog contains at least 100 materially distinct user-visible capabilities and can scale significantly beyond that without an equivalent explosion in MCP tool count;
- each implemented capability has explicit evidence/input/output/quality contracts;
- deterministic calculations are reproducible and tested;
- public research distinguishes authoritative evidence, conflicts, and uncertainty;
- the plugin can generate professional consulting artifacts in the most appropriate supported format;
- outputs pass independent analytical, epistemic, consulting, and artifact quality gates;
- users are not required to provide API keys, complete OAuth, or connect private third-party accounts for ordinary operation;
- no capability is described as implemented unless its execution and quality gates actually pass;
- branch and governance discipline remain intact.

## 16. Migration from the current repository

The existing work is preserved rather than replaced.

Keep and extend:

- model-agnostic governance;
- the open-access boundary;
- MCP v2 runtime foundation;
- capability discovery;
- versioned plugin-owned artifact substrate;
- bounded DOCX template support;
- bounded PDF metadata support;
- deterministic break-even and simple-ROI engines;
- runtime freshness governance;
- CI and security-boundary tests;
- XLSX preservation/security caution.

Change or expand:

- strengthen the North Star to the universal consulting capability/quality definition;
- modularize the monolithic capability catalog as breadth increases;
- expand from the current catalog to 100+ non-overlapping capabilities;
- replace provider-oriented future planning with Universal Inputs & Open Evidence;
- formalize routing metadata and capability composition;
- add QA/evaluation as a first-class subsystem;
- expand deterministic analytical engines;
- add artifact/visualization capability families;
- add public research/fact-check/SEO execution;
- add project/program, supply-chain, M&A, FP&A, and other missing domain families.

No existing validated implementation should be discarded merely to match this architecture. Migration must preserve working behavior while replacing weaker abstractions incrementally.

## 17. Design decision

Adopt a **large capability catalog + specialized Skills + compact deterministic MCP primitives + artifact engines + autonomous routing + independent QA/evaluation** architecture.

This design integrates the useful portions of the proposed SOTA consulting-plugin concept without allowing arbitrary catalog counts, slash-command assumptions, fake confidence percentages, credentialed provider ecosystems, or overlapping tool proliferation to override measurable quality.
