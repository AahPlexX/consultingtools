import { describe, expect, it } from "vitest";
import { getCapabilityById } from "../src/catalog.js";

describe("capability implementation truth", () => {
  it("keeps verified narrow implementations distinct from broader claims", () => {
    expect(getCapabilityById("break-even")?.status).toBe("implemented");
    expect(getCapabilityById("simple-roi")?.status).toBe("implemented");
    expect(getCapabilityById("roi")?.status).toBe("partial");
    expect(getCapabilityById("docx-template-patching")?.status).toBe("implemented");
    expect(getCapabilityById("pdf-metadata-update")?.status).toBe("implemented");
  });

  it("promotes only periodic finance capabilities whose advertised deterministic envelope is fully verified", () => {
    expect(getCapabilityById("npv")).toMatchObject({ status: "implemented", routingReady: true, deterministicEngineIds: ["calculate_npv"] });
    expect(getCapabilityById("payback")).toMatchObject({ status: "implemented", routingReady: true, deterministicEngineIds: ["calculate_payback"] });
    expect(getCapabilityById("irr")).toMatchObject({ status: "partial", routingReady: true, deterministicEngineIds: ["calculate_irr"] });
  });

  it("keeps broader finance outcomes partial or planned despite useful deterministic primitives", () => {
    for (const id of ["financial-ratios", "working-capital", "cash-conversion-cycle", "budget-variance", "sensitivity", "scenario-modeling", "cash-flow-forecast", "irr"]) {
      expect(getCapabilityById(id)?.status).toBe("partial");
    }
    expect(getCapabilityById("dcf")?.status).toBe("planned");
  });

  it("binds verified statistics primitives without overstating their broader consulting scope", () => {
    const expected: Record<string, string> = {
      "data-profiling": "profile_data_column",
      "descriptive-statistics": "calculate_descriptive_statistics",
      "correlation-analysis": "calculate_correlation",
      "confidence-interval": "calculate_mean_confidence_interval",
      "hypothesis-testing": "calculate_welch_t_test",
    };
    for (const [id, engine] of Object.entries(expected)) {
      expect(getCapabilityById(id)).toMatchObject({ status: "partial", routingReady: true, deterministicEngineIds: [engine] });
    }
  });

  it("binds verified forecast baselines and evaluation primitives while keeping broad forecasting partial", () => {
    const expected: Record<string, string> = {
      "time-series-forecasting": "forecast_baseline",
      "forecast-backtest": "backtest_forecast_baseline",
      "forecast-error-metrics": "calculate_forecast_error_metrics",
    };
    for (const [id, engine] of Object.entries(expected)) {
      expect(getCapabilityById(id)).toMatchObject({ status: "partial", routingReady: true, deterministicEngineIds: [engine] });
    }
  });

  it("binds verified project operations and supply-chain primitives without overstating broader diagnostics", () => {
    const expected: Record<string, readonly string[]> = {
      "critical-path": ["calculate_critical_path"],
      "earned-value": ["calculate_earned_value_performance"],
      utilization: ["calculate_capacity_utilization"],
      throughput: ["calculate_flow_performance"],
      "cycle-time": ["calculate_flow_performance"],
      "weighted-selection": ["calculate_weighted_decision"],
      "inventory-analysis": ["calculate_reorder_point", "calculate_eoq"],
      "supplier-segmentation": ["analyze_supplier_spend"],
    };
    for (const [id, engines] of Object.entries(expected)) {
      expect(getCapabilityById(id)).toMatchObject({ status: "partial", routingReady: true, deterministicEngineIds: engines });
    }
  });

  it("binds the verified CSV envelope as partial while preserving the broader delimited-data claim boundary", () => {
    expect(getCapabilityById("csv-crud")).toMatchObject({
      status: "partial",
      routingReady: true,
      deterministicEngineIds: ["create_csv_artifact", "inspect_csv_artifact", "patch_csv_artifact"],
    });
  });

  it("binds only the independently verified DOCX and PDF envelopes as partial", () => {
    expect(getCapabilityById("docx-crud")).toMatchObject({
      status: "partial",
      routingReady: true,
      deterministicEngineIds: ["create_consulting_document", "inspect_docx_template", "patch_docx_template"],
    });
    expect(getCapabilityById("pdf-crud")).toMatchObject({
      status: "partial",
      routingReady: true,
      deterministicEngineIds: ["create_consulting_document", "inspect_pdf", "update_pdf_metadata", "compose_pdf_artifact"],
    });
  });

  it("binds only independently verified exhibit forms while keeping their broader analytical claims partial", () => {
    const exhibitIds = [
      "bar-chart",
      "stacked-bar-chart",
      "line-chart",
      "scatter-plot",
      "waterfall-chart",
      "pareto-chart",
      "heatmap",
      "two-by-two-matrix",
      "risk-heatmap",
      "gantt-visual",
      "funnel-chart",
    ];
    for (const id of exhibitIds) {
      expect(getCapabilityById(id)).toMatchObject({
        status: "partial",
        routingReady: true,
        deterministicEngineIds: ["create_consulting_exhibit"],
      });
    }
    expect(getCapabilityById("data-visualization")).toMatchObject({
      status: "partial",
      routingReady: true,
      deterministicEngineIds: ["recommend_consulting_exhibit", "create_consulting_exhibit"],
    });
  });

  it("binds bounded Mermaid-source generation without claiming an interactive or arbitrary diagram renderer", () => {
    for (const id of ["process-diagram", "dependency-diagram", "decision-tree-visual"]) {
      expect(getCapabilityById(id)).toMatchObject({
        status: "partial",
        routingReady: true,
        deterministicEngineIds: ["create_mermaid_diagram"],
      });
    }
  });

  it("binds governed PPTX creation to board-material while keeping broad presentation CRUD planned", () => {
    expect(getCapabilityById("board-material")).toMatchObject({
      status: "partial",
      routingReady: true,
      deterministicEngineIds: ["create_consulting_presentation"],
    });
    expect(getCapabilityById("pptx-crud")).toMatchObject({
      status: "planned",
      routingReady: true,
      deterministicEngineIds: [],
    });
  });

  it("keeps broad unsupported document semantics unclaimed", () => {
    for (const id of ["docx-crud", "pdf-crud"]) {
      expect(getCapabilityById(id)?.status).not.toBe("implemented");
    }
    for (const id of ["xlsx-crud", "pptx-crud"]) {
      expect(getCapabilityById(id)?.status).toBe("planned");
    }
    expect(getCapabilityById("xlsx-crud")).toMatchObject({ status: "planned", routingReady: true, deterministicEngineIds: [] });
  });

  it("does not promote unrelated deterministic engines that have not been built", () => {
    for (const id of ["regression-analysis", "clustering-analysis", "area-chart", "histogram", "box-plot", "treemap", "timeline"]) {
      expect(getCapabilityById(id)?.status).not.toBe("implemented");
    }
  });

  it("keeps credentialed private SEO retrieval unavailable while export analysis remains open-access", () => {
    for (const id of ["seo-keyword-metrics", "seo-backlink-metrics", "seo-search-console"]) {
      expect(getCapabilityById(id)?.status).toBe("unavailable");
    }
    for (const id of ["keyword-export-analysis", "backlink-export-analysis", "search-console-export-analysis"]) {
      expect(getCapabilityById(id)?.status).toBe("partial");
    }
  });
});
