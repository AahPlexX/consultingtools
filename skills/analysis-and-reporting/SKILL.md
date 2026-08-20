---
name: analysis-and-reporting
description: Perform evidence-grounded business analysis and turn it into an editable consulting deliverable. Use when the user asks for an audit, assessment, analysis, report, business case, recommendation, roadmap, executive brief, comparison, prioritization, or decision support across strategy, market, customer, finance, operations, risk, organization, growth, data, statistics, forecasting, projects, or supply chain.
---

# Analysis and Reporting

Use methods because they improve a decision, not because they are customary consulting sections.

## Analysis contract

1. Define the question each method must answer.
2. State the input evidence it requires.
3. Perform the method at a depth justified by the evidence.
4. Preserve calculations and assumptions needed to reproduce quantitative conclusions.
5. Convert observations into implications only when the evidence supports the connection.
6. Separate findings from recommendations.
7. If evidence is missing, mark the gap and describe what would resolve it.

## Method families

Choose only applicable families.

### Strategy and market

Use tools such as PESTLE, Five Forces, VRIO, value chain, growth-option analysis, market sizing, competitive benchmarking, market attractiveness, market entry, positioning, and scenario planning when their distinct outputs matter.

### Customer and growth

Use segmentation, ideal-customer-profile analysis, jobs-to-be-done, customer journey, voice-of-customer synthesis, pricing, funnel, retention/cohort, channel mix, and conversion analysis when adequate customer or performance evidence exists.

### Finance and decisions

Use unit economics, break-even, ROI, cost-benefit, investment appraisal, working capital, ratios, budget variance, sensitivity, scenarios, weighted decision matrices, or multi-criteria analysis. Show formulas, units, time periods, and material assumptions.

When the installed MCP surface exposes a deterministic calculator whose definition matches the requested measure, use it instead of hand arithmetic. Current focused finance tools include:

- `calculate_break_even` for fixed-cost/unit-contribution break-even;
- `calculate_simple_roi` for undiscounted `(totalBenefits - totalCosts) / totalCosts` only;
- `calculate_npv` for equal-period cash flows with `cashFlows[0]` explicitly at `t=0` and a caller-supplied per-period discount rate;
- `calculate_payback` for simple or discounted periodic payback, including a null result when recovery does not occur in the supplied horizon;
- `calculate_irr` for a bounded periodic IRR root search that reports `unique`, `multiple`, or `none` rather than silently choosing one root;
- `calculate_working_capital` for `currentAssets - currentLiabilities`;
- `calculate_cash_conversion_cycle` for DIO/DSO/DPO/CCC from explicitly supplied balance, flow, and day-count bases;
- `calculate_financial_ratios` for the named liquidity, leverage, margin, efficiency, or return formula family selected by the caller;
- `calculate_budget_variance` for actual-minus-budget variance using an explicit higher-is-favorable or lower-is-favorable direction;
- `compare_financial_scenarios` for deltas among already supplied comparable scenarios; it does not generate scenario assumptions;
- `calculate_npv_sensitivity` for recalculating the same verified periodic NPV convention over caller-supplied discount rates.

Do not relabel simple ROI as NPV, IRR, annualized return, or payback. Do not treat periodic NPV/IRR as irregular-date XNPV/XIRR. Do not infer a discount rate, accounting basis, day-count basis, scenario value, or missing statement amount merely to complete a calculation.

The current IRR tool is a bounded numerical root search. Treat its returned roots and ambiguity warning as calculation evidence, but keep broader IRR analysis qualified: the active catalog intentionally remains `partial` rather than claiming an exhaustive mathematical guarantee for every possible root configuration.

### Data and statistics

Use deterministic data/statistics tools only when the supplied values match their explicit input assumptions:

- `profile_data_column` classifies missingness and observed value types without coercing strings, booleans, arrays, objects, NaN, or infinities into valid numeric observations;
- `calculate_descriptive_statistics` accepts finite numeric values only and returns N-1 sample variance, N population variance, standard deviations, extrema, quartiles, median, and type-7 quantile conventions;
- `calculate_correlation` calculates Pearson or tie-aware Spearman association for paired finite numeric observations and rejects zero-variance inputs;
- `calculate_mean_confidence_interval` calculates a two-sided Student-t interval for a mean when population standard deviation is unknown and returns assumptions, degrees of freedom, critical value, and standard error;
- `calculate_welch_t_test` performs the two-sided unequal-variance Welch comparison for two independent samples, including Welch-Satterthwaite degrees of freedom, p-value, confidence interval, and an interpretation that does not equate non-significance with equality;
- `calculate_autocorrelation` calculates one lag autocorrelation for an ordered, equally spaced series and does not infer or repair timestamps.

Do not silently drop missing/invalid observations to make a statistical function run. Do not coerce numeric-looking strings. Do not treat correlation as causation. Choose an inferential method from the study/sample design before calling a test; one implemented Welch test does not make the product a universal hypothesis-test engine. A confidence interval is tied to its repeated-sampling assumptions and must not be restated as a subjective probability that a fixed parameter lies inside the realized interval.

### Forecasting

Current forecasting primitives are deliberately reproducible baselines and evaluation tools rather than an opaque model-selection service:

- `forecast_baseline` supports naive, caller-specified seasonal-naive, drift, and trailing moving-average forecasts on equally spaced ordered observations;
- `calculate_forecast_error_metrics` returns signed mean error/bias, MAE, MSE, RMSE, MAPE, and sMAPE from one common pair set; MAPE/sMAPE return `null` rather than dropping rows or inserting epsilon when their denominators are undefined;
- `backtest_forecast_baseline` uses expanding-window rolling-origin evaluation so every forecast is trained only on observations available before its origin.

Do not auto-detect a seasonal period and present it as fact. Do not random-shuffle time-series train/test samples. Do not promote a baseline benchmark to a comprehensive forecast merely because it produces future values. Compare forecast methods out-of-sample when historical depth permits, and preserve the method, horizon, origin, error definition, and known limitations.

### Project execution

Use the deterministic project tools only inside their verified envelope:

- `calculate_critical_path` supports activity-on-node finish-to-start zero-lag DAG schedules in one duration unit and returns early/late timing, total float, critical activities, bounded critical paths, and project duration;
- `calculate_three_point_estimate` calculates the weighted `(O + 4M + P) / 6` estimate, standard deviation `(P - O) / 6`, variance, and simple triangular mean from ordered non-negative caller inputs;
- `calculate_earned_value_performance` calculates `SV = EV - PV`, `CV = EV - AC`, `SPI = EV / PV`, and `CPI = EV / AC`, returning null when a ratio denominator is zero.

Do not treat the critical-path primitive as a calendar-aware scheduler, resource-leveling engine, or lag/lead/dependency-type solver. Do not convert the three-point estimate into a probability guarantee. Earned-value metrics require the caller to establish a valid common status date and baseline; the tool does not manufacture one or infer EAC/ETC forecasting assumptions.

### Operations and quality

Use process maps, SIPOC, value-stream analysis, bottleneck/capacity analysis, Five Whys, cause-and-effect analysis, Pareto analysis, service blueprints, vendor evaluation, risk registers, and FMEA. Brainstormed causes are hypotheses until evidence validates them.

Current deterministic operations primitives include:

- `calculate_capacity_utilization` for supplied used/available capacity on the same unit and period basis;
- `calculate_flow_performance` for aggregate throughput and average cycle time from supplied completed units and elapsed time;
- `calculate_weighted_decision` for normalized non-negative weights and already-comparable option scores.

Utilization above 100% is retained as a supplied-capacity signal rather than automatically rejected. Aggregate flow arithmetic is not a bottleneck, queue, variability, or station-level diagnosis. Weighted scoring does not normalize unlike raw units, infer desirability direction, apply mandatory thresholds, or perform sensitivity automatically.

### Supply chain

Current deterministic supply-chain primitives include:

- `calculate_reorder_point` for demand during lead time plus caller-supplied safety stock on a common time basis;
- `calculate_eoq` for the classical EOQ benchmark from annual demand, ordering cost, carrying-rate fraction, and unit cost;
- `analyze_supplier_spend` for supplier spend rank, share, cumulative share, and top-N concentration.

Do not infer safety stock, service level, stochastic demand distributions, quantity discounts, capacity constraints, perishability, minimum-order rules, supplier risk, quality, substitutability, or strategic importance from these arithmetic primitives. Use them as evidence inputs to broader inventory/supplier analysis, not replacements for it.

### Organization and execution

Use stakeholder analysis, accountability mapping, change-readiness assessment, organization design, KPI trees, OKRs, balanced scorecards, and prioritization methods when they connect strategy to ownership and measurable execution.

## Quantitative discipline

- Never invent missing numbers to make a model complete.
- Prefer ranges and sensitivity analysis when inputs are uncertain.
- Match precision to source quality.
- Normalize currencies, units, periods, definitions, and denominators before comparison.
- Do not imply causation from correlation alone.
- Distinguish accounting measures, cash measures, forecasts, scenarios, estimates, descriptive summaries, and formal inference.
- Recalculate totals and cross-check relationships before reporting them.
- Keep calculator outputs tied to the exact formula and convention returned by the tool; if the user's intended definition differs, do not use the calculator as though it matched.
- Treat percentage variance from a zero budget basis as undefined/null rather than forcing an infinite or fabricated percentage.
- For scenario comparison, preserve the caller's supplied values and distinguish comparison from scenario generation.
- For statistical inference, report sample sizes, assumptions, effect/interval information when available, and the exact test definition. Statistical significance is not practical significance.
- For time series, preserve ordering and equal-spacing assumptions; use rolling-origin or otherwise temporally valid evaluation rather than future leakage.
- For project/operations/supply calculations, preserve units, measurement periods, dependency conventions, baseline dates, and denominator definitions explicitly.

## Recommendation discipline

A recommendation must identify the evidence it depends on, material tradeoffs, risk, prerequisites, expected outcome, owner or decision-maker when known, and a way to validate whether it worked. If several choices remain defensible, present decision criteria rather than fabricating certainty.

## Report architecture

Do not start from a fixed table of contents. Assemble the smallest useful structure from components such as:

- purpose and scope;
- current-state evidence;
- findings grouped by decision relevance;
- analysis/method-specific evidence;
- material risks, assumptions, and limitations;
- options and tradeoffs;
- recommendation or decision gates;
- implementation sequence;
- measures and validation;
- sources/provenance;
- appendices only when they improve traceability.

Executive readers should be able to understand the decision and why it follows without reading every appendix. Operational readers should receive enough detail to act.

## Finding quality

For each material issue, make clear:

- **What it is:** plain-language definition.
- **What was observed:** evidence, measurement, or source.
- **Why it matters:** business or user consequence.
- **Priority basis:** impact, urgency, confidence, effort, dependency, or risk as appropriate.
- **What improvement means:** outcome or acceptance condition, not unexplained developer shorthand.

## Revision

When editing an existing deliverable, identify what the requested change actually affects. Preserve unaffected evidence, calculations, citations, valid conclusions, and formatting intent. Re-run downstream conclusions only when their inputs changed.
