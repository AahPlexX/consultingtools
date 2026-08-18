import type { LegacyCapabilityDefinition } from "./types.js";

interface RawLegacyCapability {
  id: string;
  name: string;
  domain: LegacyCapabilityDefinition["domain"];
  mode: "reasoning" | "research" | "artifact" | "data" | "external";
  status: LegacyCapabilityDefinition["status"];
  summary: string;
  requires?: string;
}

const reasoning = (
  id: string,
  name: string,
  domain: RawLegacyCapability["domain"],
  summary: string,
): RawLegacyCapability => ({ id, name, domain, mode: "reasoning", status: "implemented", summary });

const rawLegacyCapabilities: readonly RawLegacyCapability[] = [
  reasoning("swot", "SWOT analysis", "strategy", "Separate internal strengths and weaknesses from external opportunities and threats, then convert them into decision-relevant implications."),
  reasoning("pestle", "PESTLE analysis", "strategy", "Assess political, economic, social, technological, legal, and environmental forces when they materially affect a decision."),
  reasoning("porter-five-forces", "Porter's Five Forces", "strategy", "Assess industry structure through rivalry, entrants, substitutes, supplier power, and buyer power."),
  reasoning("vrio", "VRIO analysis", "strategy", "Test resources and capabilities for value, rarity, imitability, and organizational support."),
  reasoning("value-chain", "Value chain analysis", "strategy", "Trace where activities create value, cost, differentiation, or avoidable friction."),
  reasoning("bcg-matrix", "Portfolio analysis", "strategy", "Compare portfolio positions using growth, relative strength, economics, and strategic fit without treating a matrix as a decision by itself."),
  reasoning("ansoff", "Growth option analysis", "strategy", "Structure growth choices across existing/new markets and existing/new offerings, then test feasibility and risk."),
  reasoning("strategy-map", "Strategy map", "strategy", "Connect strategic objectives through cause-and-effect relationships and measurable outcomes."),
  reasoning("business-model", "Business model analysis", "strategy", "Assess value proposition, customers, channels, resources, activities, partners, costs, and revenue logic."),
  reasoning("scenario-planning", "Scenario planning", "strategy", "Build materially different futures around uncertain drivers and identify robust actions across them."),

  reasoning("tam-sam-som", "TAM / SAM / SOM framing", "market", "Define total, serviceable, and realistically obtainable markets with explicit boundaries and assumptions."),
  reasoning("market-sizing", "Market sizing", "market", "Estimate a market using top-down, bottom-up, or triangulated methods when sufficient evidence is available."),
  reasoning("competitive-benchmark", "Competitive benchmarking", "market", "Compare competitors on decision-relevant dimensions rather than generic feature counts."),
  reasoning("three-c", "3C analysis", "market", "Assess company, customer, and competitor fit as one connected market decision."),
  reasoning("market-attractiveness", "Market attractiveness", "market", "Evaluate demand, economics, competition, barriers, regulation, and strategic fit."),
  reasoning("entry-strategy", "Market entry analysis", "market", "Compare entry paths, barriers, economics, capabilities, sequencing, and risk."),

  reasoning("segmentation", "Customer segmentation", "customer", "Group customers using meaningful needs, behaviors, economics, or contexts and test whether segments are actionable."),
  reasoning("ideal-customer-profile", "Ideal customer profile", "customer", "Define the customer characteristics associated with strongest fit and economics without inventing unsupported traits."),
  reasoning("jobs-to-be-done", "Jobs-to-be-done analysis", "customer", "Identify the progress customers are trying to make, circumstances, alternatives, and success criteria."),
  reasoning("customer-journey", "Customer journey analysis", "customer", "Map stages, goals, evidence, friction, handoffs, and opportunities across the customer experience."),
  reasoning("voice-of-customer", "Voice-of-customer synthesis", "customer", "Synthesize supplied customer evidence into needs, pain points, language, objections, and themes."),
  reasoning("pricing-strategy", "Pricing analysis", "customer", "Compare pricing logic using value, willingness-to-pay evidence, costs, competition, packaging, and risk."),
  reasoning("positioning", "Positioning analysis", "customer", "Clarify target audience, alternatives, differentiated value, proof, and positioning gaps."),
  reasoning("product-market-fit", "Product-market fit assessment", "customer", "Evaluate fit signals, retention, demand, alternatives, satisfaction, and evidence gaps."),

  reasoning("unit-economics", "Unit economics", "finance", "Calculate and interpret contribution economics such as CAC, LTV, margin, payback, and per-unit profitability from supplied data."),
  reasoning("break-even", "Break-even analysis", "finance", "Calculate volume or revenue needed to cover fixed and variable costs with explicit assumptions."),
  reasoning("cost-benefit", "Cost-benefit analysis", "finance", "Compare monetized and non-monetized costs, benefits, timing, risk, and alternatives."),
  reasoning("roi", "ROI analysis", "finance", "Calculate return measures from supplied inputs and make formula, time basis, and exclusions explicit."),
  reasoning("sensitivity", "Sensitivity analysis", "finance", "Test how conclusions change when material assumptions move across plausible ranges."),
  reasoning("financial-ratios", "Financial ratio analysis", "finance", "Interpret liquidity, leverage, profitability, efficiency, and related ratios from supplied financial data."),
  reasoning("working-capital", "Working-capital analysis", "finance", "Assess receivables, payables, inventory, cash conversion, and operational cash constraints."),
  reasoning("forecast-review", "Forecast review", "finance", "Evaluate supplied forecasts for drivers, assumptions, internal consistency, scenarios, and decision usefulness."),
  reasoning("budget-variance", "Budget variance analysis", "finance", "Separate price, volume, mix, timing, and execution effects when source data supports them."),
  reasoning("investment-appraisal", "Investment appraisal", "finance", "Compare investment alternatives using appropriate cash-flow, return, risk, and strategic criteria."),

  reasoning("process-map", "Process mapping", "operations", "Represent the actual sequence of work, decisions, handoffs, waits, rework, and ownership."),
  reasoning("sipoc", "SIPOC analysis", "operations", "Frame suppliers, inputs, process, outputs, and customers to establish process scope."),
  reasoning("value-stream", "Value-stream analysis", "operations", "Distinguish value-creating time from delay, queue, rework, and avoidable motion/information friction."),
  reasoning("five-whys", "Five Whys root-cause analysis", "operations", "Trace plausible causal chains while distinguishing evidence from hypotheses."),
  reasoning("fishbone", "Cause-and-effect analysis", "operations", "Organize potential causes into testable categories rather than treating brainstormed causes as proven."),
  reasoning("pareto", "Pareto analysis", "operations", "Prioritize categories by observed contribution when adequate frequency or impact data is supplied."),
  reasoning("bottleneck", "Constraint and bottleneck analysis", "operations", "Identify limiting steps and evaluate throughput effects before optimizing non-constraints."),
  reasoning("capacity", "Capacity analysis", "operations", "Assess demand, effective capacity, utilization, queues, variability, and practical constraints."),
  reasoning("service-blueprint", "Service blueprint", "operations", "Connect customer-facing steps to backstage processes, systems, evidence, and failure points."),
  reasoning("vendor-evaluation", "Vendor evaluation", "operations", "Compare vendors with weighted criteria, evidence quality, switching cost, risk, and total value."),

  reasoning("risk-register", "Risk register", "risk", "Define risks, causes, consequences, likelihood, impact, controls, owners, and treatment actions."),
  reasoning("fmea", "Failure mode and effects analysis", "risk", "Analyze failure modes, effects, causes, controls, and priorities while keeping scoring assumptions visible."),
  reasoning("decision-matrix", "Weighted decision matrix", "risk", "Compare alternatives using explicit criteria, weights, evidence, and sensitivity checks."),
  reasoning("mcda", "Multi-criteria decision analysis", "risk", "Structure complex choices with multiple competing criteria and test how weighting affects results."),
  reasoning("due-diligence", "Due-diligence framework", "risk", "Organize evidence gaps, red flags, validation questions, and decision gates across a scoped diligence review."),

  reasoning("stakeholder-map", "Stakeholder analysis", "organization", "Map influence, impact, incentives, concerns, dependencies, and engagement needs."),
  reasoning("raci", "RACI / accountability design", "organization", "Clarify responsible, accountable, consulted, and informed roles while detecting ownership gaps and overload."),
  reasoning("change-readiness", "Change-readiness assessment", "organization", "Assess sponsorship, incentives, capability, communication, process, systems, and adoption risks."),
  reasoning("org-design", "Organization design analysis", "organization", "Evaluate roles, spans, interfaces, decision rights, capabilities, and structure against strategy."),
  reasoning("okr-design", "OKR design", "organization", "Create outcome-oriented objectives and measurable key results that avoid activity-only metrics."),
  reasoning("kpi-tree", "KPI tree", "organization", "Connect lagging outcomes to controllable leading drivers with definitions and ownership."),
  reasoning("balanced-scorecard", "Balanced scorecard", "organization", "Balance financial, customer, process, and capability measures when that view improves strategy execution."),
  reasoning("rice", "RICE prioritization", "organization", "Prioritize using reach, impact, confidence, and effort when the inputs are decision-useful."),
  reasoning("moscow", "MoSCoW prioritization", "organization", "Separate must, should, could, and won't-now scope while testing whether 'must' items are truly mandatory."),

  reasoning("funnel", "Funnel analysis", "growth", "Analyze stage conversion, drop-off, volume, segment differences, and measurement gaps from supplied data."),
  reasoning("cohort", "Cohort and retention analysis", "growth", "Compare behavior across cohorts and distinguish acquisition effects from retention changes when supplied data supports it."),
  reasoning("channel-mix", "Channel mix analysis", "growth", "Compare channels using reach, economics, quality, incrementality evidence, constraints, and strategic fit."),
  reasoning("cro", "Conversion optimization analysis", "growth", "Prioritize conversion hypotheses using observed friction, evidence strength, expected impact, and testability."),

  {
    id: "seo-technical-audit",
    name: "Technical SEO audit",
    domain: "seo",
    mode: "research",
    status: "partial",
    summary: "Assess crawlability, indexability, canonicalization, metadata, structured data, internal discovery, performance signals, and other technical search issues when adequate site evidence is available.",
    requires: "Live crawl/fetch and first-party search data are not yet bundled into this plugin.",
  },
  {
    id: "seo-on-page",
    name: "On-page SEO analysis",
    domain: "seo",
    mode: "research",
    status: "partial",
    summary: "Assess page intent, titles, descriptions, headings, content clarity, internal links, structured data eligibility, and evidence quality.",
    requires: "Page content or live retrieval access.",
  },
  {
    id: "seo-content-gap",
    name: "SEO content-gap analysis",
    domain: "seo",
    mode: "research",
    status: "partial",
    summary: "Identify coverage gaps against user intent and verified competitor/search evidence without fabricating demand metrics.",
    requires: "Current search/competitor evidence.",
  },
  {
    id: "seo-keyword-metrics",
    name: "Keyword opportunity metrics",
    domain: "seo",
    mode: "research",
    status: "unavailable",
    summary: "Analyze user-supplied keyword metrics when provided; Consulting Tools does not obtain proprietary keyword-demand or difficulty metrics through credentialed providers.",
    requires: "User-supplied exported metrics when proprietary demand or difficulty data is required.",
  },
  {
    id: "seo-backlink-metrics",
    name: "Backlink and authority metrics",
    domain: "seo",
    mode: "research",
    status: "unavailable",
    summary: "Analyze user-supplied backlink exports or openly verifiable link evidence without requiring a commercial backlink account.",
    requires: "User-supplied export when proprietary backlink-index metrics are required.",
  },
  {
    id: "seo-search-console",
    name: "Search performance analysis",
    domain: "seo",
    mode: "research",
    status: "unavailable",
    summary: "Analyze Search Console exports supplied by the user; Consulting Tools does not request Search Console OAuth or account access.",
    requires: "User-supplied Search Console export.",
  },
  reasoning("local-seo-plan", "Local SEO assessment plan", "seo", "Structure local visibility review around verified business data, location relevance, site signals, platform profiles, reviews, and evidence gaps."),

  reasoning("evidence-synthesis", "Evidence synthesis", "research", "Reconcile source facts, contradictions, assumptions, calculations, uncertainty, and implications into a decision-ready evidence base."),
  reasoning("benchmark-synthesis", "Benchmark synthesis", "research", "Compare benchmarks only after normalizing definitions, time periods, populations, units, and methodology."),
  reasoning("survey-design", "Survey design review", "research", "Design or critique survey objectives, sampling logic, question wording, response scales, bias risks, and analysis plan."),
  reasoning("interview-guide", "Interview guide design", "research", "Create decision-focused stakeholder or customer interview questions with sequencing and bias controls."),

  reasoning("business-case", "Business case", "delivery", "Synthesize problem, alternatives, evidence, economics, risks, dependencies, recommendation, and decision gates into an audience-appropriate case."),
  reasoning("executive-brief", "Executive brief", "delivery", "Condense the decision, evidence, implications, risks, and next actions without hiding material uncertainty."),
  reasoning("recommendation-roadmap", "Recommendation roadmap", "delivery", "Sequence recommendations by dependency, value, effort, risk, ownership, validation, and decision checkpoints."),
  reasoning("report-architecture", "Adaptive report architecture", "delivery", "Choose and edit a report structure around the user's actual decision and audience instead of forcing a fixed template."),

  {
    id: "pdf-crud",
    name: "PDF CRUD",
    domain: "artifacts",
    mode: "artifact",
    status: "planned",
    summary: "Create, inspect, update, reorganize, and remove supported PDF content while preserving unaffected content and validating the resulting file.",
  },
  {
    id: "docx-crud",
    name: "DOCX CRUD",
    domain: "artifacts",
    mode: "artifact",
    status: "planned",
    summary: "Create, inspect, update, and remove supported Word content with style, relationship, and layout-preservation checks.",
  },
  {
    id: "xlsx-crud",
    name: "Excel workbook CRUD",
    domain: "artifacts",
    mode: "artifact",
    status: "planned",
    summary: "Create, inspect, update, and remove workbook content while preserving formulas, formats, worksheets, and relevant metadata.",
  },
  {
    id: "csv-crud",
    name: "CSV / tabular file CRUD",
    domain: "artifacts",
    mode: "artifact",
    status: "planned",
    summary: "Safely read, write, update, filter, and export delimited tabular data with encoding and formula-injection protections.",
  },
  {
    id: "pptx-crud",
    name: "Presentation CRUD",
    domain: "artifacts",
    mode: "artifact",
    status: "planned",
    summary: "Create, inspect, update, reorder, and remove supported presentation content while validating slide structure and rendering.",
  },

  {
    id: "data-cleaning",
    name: "Data cleaning",
    domain: "data",
    mode: "data",
    status: "planned",
    summary: "Profile, normalize, validate, deduplicate, and document structured business data without silently changing semantic meaning.",
  },
  {
    id: "descriptive-statistics",
    name: "Descriptive statistics",
    domain: "data",
    mode: "data",
    status: "planned",
    summary: "Compute reproducible summaries, distributions, missingness, and outlier diagnostics from structured input data.",
  },
  {
    id: "correlation-analysis",
    name: "Correlation analysis",
    domain: "data",
    mode: "data",
    status: "planned",
    summary: "Compute association measures with sample-size, missingness, multiple-comparison, and causality caveats.",
  },
  {
    id: "time-series-forecasting",
    name: "Time-series forecasting",
    domain: "data",
    mode: "data",
    status: "planned",
    summary: "Produce reproducible baseline forecasts with holdout evaluation, uncertainty intervals, and assumption checks.",
  },
  {
    id: "data-visualization",
    name: "Data visualization",
    domain: "data",
    mode: "data",
    status: "planned",
    summary: "Generate accessible, decision-focused charts with honest scales, labels, uncertainty, and source provenance.",
  },
] as const;

const normalizeMode = (mode: RawLegacyCapability["mode"]): LegacyCapabilityDefinition["mode"] => {
  if (mode === "data") return "deterministic";
  if (mode === "external") return "research";
  return mode;
};

export const legacyCapabilities: readonly LegacyCapabilityDefinition[] = rawLegacyCapabilities.map(
  (capability) => ({
    ...capability,
    mode: normalizeMode(capability.mode),
    routingReady: false,
  }),
);
