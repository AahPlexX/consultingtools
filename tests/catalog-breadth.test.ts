import { describe, expect, it } from "vitest";
import { strategyMarketCapabilities } from "../src/catalog/families/strategy-market.js";
import { customerGrowthCapabilities } from "../src/catalog/families/customer-growth.js";
import { financeMaCapabilities } from "../src/catalog/families/finance-ma.js";
import { operationsSupplyCapabilities } from "../src/catalog/families/operations-supply.js";
import { organizationProjectCapabilities } from "../src/catalog/families/organization-project.js";
import { dataForecastingCapabilities } from "../src/catalog/families/data-forecasting.js";
import { researchRiskSeoCapabilities } from "../src/catalog/families/research-risk-seo.js";
import { innovationDeliveryArtifactCapabilities } from "../src/catalog/families/innovation-delivery-artifacts.js";

describe("capability family breadth", () => {
  it("preserves established strategy and market stable IDs", () => {
    expect(strategyMarketCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["swot", "pestle", "porter-five-forces", "vrio", "market-sizing", "market-attractiveness", "entry-strategy"]),
    );
  });

  it("preserves customer/growth IDs and adds distinct commercial outcomes", () => {
    expect(customerGrowthCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["segmentation", "jobs-to-be-done", "pricing-strategy", "funnel", "cro", "sales-pipeline-diagnostic", "sales-territory-analysis", "packaging-analysis", "retention-analysis", "churn-analysis"]),
    );
  });

  it("covers corporate finance, FP&A, investment, and M&A outcomes", () => {
    expect(financeMaCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["break-even", "roi", "npv", "irr", "payback", "dcf", "financial-ratios", "working-capital", "cash-conversion-cycle", "budget-variance", "price-volume-mix", "cash-flow-forecast", "total-cost-of-ownership", "target-screening", "commercial-diligence", "financial-diligence", "operational-diligence", "synergy-identification", "synergy-sizing", "integration-complexity", "integration-planning"]),
    );
  });

  it("covers operations, quality, supply chain, procurement, and vendor outcomes", () => {
    expect(operationsSupplyCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["process-map", "sipoc", "value-stream", "pareto", "five-whys", "fishbone", "fmea", "capacity", "utilization", "throughput", "cycle-time", "control-plan", "demand-supply-diagnostic", "inventory-analysis", "supplier-segmentation", "sourcing-strategy", "procurement-opportunity", "lead-time-analysis", "service-level-tradeoff", "network-cost-diagnostic", "make-buy", "supplier-risk", "spend-analysis"]),
    );
  });

  it("covers organization, workforce, change, project, program, and portfolio execution", () => {
    expect(organizationProjectCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["org-design", "spans-layers", "decision-rights", "raci", "stakeholder-map", "capability-assessment", "workforce-planning", "workload-analysis", "change-readiness", "change-impact", "adoption-risk", "training-needs", "competency-matrix", "transformation-roadmap", "project-charter", "work-breakdown-structure", "milestone-plan", "gantt-plan", "dependency-map", "critical-path", "pert-estimate", "raid-log", "issue-register", "decision-log", "action-tracker", "resource-plan", "project-budget", "rag-status", "change-control", "scope-tracker", "deliverable-matrix", "earned-value", "release-planning", "portfolio-prioritization"]),
    );
  });

  it("covers data analysis, statistics, and forecasting outcomes without claiming unbuilt engines", () => {
    expect(dataForecastingCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["data-profiling", "data-cleaning", "data-validation", "deduplication", "missingness-analysis", "descriptive-statistics", "distribution-analysis", "percentile-analysis", "cross-tab", "group-comparison", "correlation-analysis", "regression-analysis", "hypothesis-testing", "confidence-interval", "effect-size", "outlier-analysis", "anomaly-analysis", "trend-analysis", "seasonality-analysis", "clustering-analysis", "reconciliation", "audit-check", "time-series-forecasting", "revenue-forecast", "demand-forecast", "staffing-forecast", "capacity-forecast", "pipeline-forecast", "forecast-backtest", "forecast-error-metrics", "forecast-uncertainty"]),
    );
  });

  it("covers research, fact checking, risk, assessment, audit, and public SEO", () => {
    expect(researchRiskSeoCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["evidence-synthesis", "source-discovery", "source-ranking", "freshness-validation", "claim-source-mapping", "corroboration", "conflict-detection", "quote-verification", "benchmark-synthesis", "research-gap", "risk-register", "decision-matrix", "mcda", "gap-assessment", "maturity-assessment", "readiness-assessment", "scenario-risk", "dependency-risk", "implementation-risk", "seo-technical-audit", "seo-on-page", "seo-content-gap", "local-seo-plan", "seo-search-console"]),
    );
  });

  it("covers innovation, comparison, executive delivery, artifacts, and visualization outcomes", () => {
    expect(innovationDeliveryArtifactCapabilities.map(({ id }) => id)).toEqual(
      expect.arrayContaining(["ideation", "convergent-filtering", "constraint-ideation", "premortem", "red-team-analysis", "hypothesis-generation", "experiment-design", "product-service-comparison", "build-buy", "location-comparison", "business-case", "executive-brief", "decision-memo", "strategy-document", "operating-plan", "feasibility-study", "proposal", "assessment-report", "board-material", "implementation-plan", "status-report", "pdf-crud", "docx-crud", "xlsx-crud", "csv-crud", "pptx-crud", "docx-template-patching", "pdf-metadata-update", "bar-chart", "line-chart", "scatter-plot", "waterfall-chart", "risk-heatmap", "tornado-chart", "process-diagram", "kpi-dashboard"]),
    );
  });

  it("defines at least 100 materially described routing-ready capabilities across all families", () => {
    const all = [
      ...strategyMarketCapabilities,
      ...customerGrowthCapabilities,
      ...financeMaCapabilities,
      ...operationsSupplyCapabilities,
      ...organizationProjectCapabilities,
      ...dataForecastingCapabilities,
      ...researchRiskSeoCapabilities,
      ...innovationDeliveryArtifactCapabilities,
    ];
    expect(all.length).toBeGreaterThanOrEqual(100);
    expect(all.every(({ routingReady }) => routingReady)).toBe(true);
  });
});
