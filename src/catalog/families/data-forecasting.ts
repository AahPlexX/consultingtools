import { defineStandardCapability, type StandardCapabilitySeed } from "../define.js";

const dataEngine = (seed: StandardCapabilitySeed): Readonly<ReturnType<typeof defineStandardCapability>> =>
  defineStandardCapability({
    ...seed,
    mode: seed.mode ?? "deterministic",
    status: seed.status,
    surfaceRequirements: seed.surfaceRequirements ?? ["deterministic-engine"],
    outputs: seed.outputs ?? ["structured-model", "dataset"],
  });

const seeds: readonly StandardCapabilitySeed[] = [
  {
    id: "data-profiling", name: "Data profiling", domain: "data", subdomain: "profiling", status: "planned",
    summary: "Profile structured data for row and column counts, types, distinctness, ranges, missingness, duplicate patterns, suspicious values, and distribution shape before analysis.",
    businessQuestion: "What is in this dataset and which quality characteristics could affect downstream analysis?", trigger: "profile a structured dataset", antiTrigger: "when no structured data has been supplied",
    requiredInputs: ["structured dataset"], methodology: "Inspect schema and record counts, infer types cautiously, summarize distributions and missingness, identify duplicates or anomalies, and report rather than silently fix issues."
  },
  {
    id: "data-validation", name: "Data validation", domain: "data", subdomain: "validation", status: "planned",
    summary: "Validate structured records against explicit type, range, allowed-value, uniqueness, referential, cross-field, temporal, and business-rule constraints without silently correcting failures.",
    businessQuestion: "Which records violate the stated data or business rules?", trigger: "validate data against defined rules", antiTrigger: "when no validation rules or defensible constraints can be specified",
    requiredInputs: ["structured dataset", "validation rules"], methodology: "Apply each rule deterministically, return record-level and aggregate failures, preserve original values, and distinguish invalid data from missing rule coverage."
  },
  {
    id: "data-cleaning", name: "Data cleaning", domain: "data", subdomain: "cleaning", status: "planned",
    summary: "Normalize, correct, filter, standardize, and document structured data only through explicit transformations that preserve original values or lineage and avoid semantic guesswork.",
    businessQuestion: "Which explicit transformations are needed to make this dataset fit for the intended analysis?", trigger: "clean a structured dataset", antiTrigger: "when proposed corrections require guessing unknown real-world values",
    requiredInputs: ["structured dataset", "cleaning objective or rules"], methodology: "Profile first, define each transformation, preserve provenance and rejected records, apply transformations deterministically, and revalidate the result."
  },
  {
    id: "deduplication", name: "Data deduplication", domain: "data", subdomain: "record-linkage", status: "planned",
    summary: "Identify exact and rule-based duplicate records using explicit keys or matching criteria, preserve ambiguity, and produce traceable survivor or cluster decisions.",
    businessQuestion: "Which records represent the same entity or event under the stated matching rules?", trigger: "deduplicate records", antiTrigger: "when entity identity cannot be established with an explicit matching rule",
    requiredInputs: ["structured dataset", "deduplication keys or matching rules"], methodology: "Apply exact keys first, use bounded matching only when defined, retain cluster provenance, and never merge ambiguous records silently."
  },
  {
    id: "type-normalization", name: "Data type normalization", domain: "data", subdomain: "normalization", status: "planned",
    summary: "Convert dates, numbers, booleans, categories, identifiers, units, and text fields into explicit consistent types while reporting values that cannot be safely parsed.",
    businessQuestion: "Which fields need consistent machine-readable types before analysis or export?", trigger: "normalize data types", antiTrigger: "when field meaning is unknown and conversion would change semantics",
    requiredInputs: ["structured dataset", "target type definitions"], methodology: "Define target types and locale or unit rules, parse deterministically, preserve identifiers that should remain text, and quarantine unparseable values."
  },
  {
    id: "missingness-analysis", name: "Missingness analysis", domain: "data", subdomain: "data-quality", status: "planned",
    summary: "Measure missing values by field, row, segment, time, and pattern and assess whether missingness could bias analysis or indicate collection failures.",
    businessQuestion: "Where is data missing and how could the missingness affect interpretation?", trigger: "analyze missing values", antiTrigger: "when missingness has already been deterministically resolved and only final modeling remains",
    requiredInputs: ["structured dataset"], methodology: "Define missing representations, calculate rates and co-occurrence patterns, segment material differences, and distinguish observed missingness from assumptions about its mechanism."
  },
  {
    id: "descriptive-statistics", name: "Descriptive statistics", domain: "data", subdomain: "statistics", status: "planned",
    summary: "Compute reproducible count, central tendency, dispersion, quantiles, extrema, missingness, and other appropriate summaries with explicit treatment of non-numeric fields and invalid values.",
    businessQuestion: "What are the main statistical characteristics of the supplied variables?", trigger: "calculate descriptive statistics", antiTrigger: "when the user is asking for causal or inferential conclusions rather than descriptive summaries",
    requiredInputs: ["structured numeric or categorical data"], methodology: "Validate types and missingness, calculate statistics appropriate to the measurement scale, and report sample size and definitions alongside results."
  },
  {
    id: "distribution-analysis", name: "Distribution analysis", domain: "data", subdomain: "statistics", status: "planned",
    summary: "Analyze distribution shape, center, spread, skew, tails, multimodality, zero inflation, and subgroup differences using numerical summaries and suitable visual diagnostics.",
    businessQuestion: "How is this variable distributed and which features matter to interpretation or modeling?", trigger: "analyze a variable distribution", antiTrigger: "when only a single aggregate total is available",
    requiredInputs: ["variable observations"], methodology: "Validate the measurement scale, summarize robust and conventional statistics, inspect tails and modes, and avoid assuming normality without evidence."
  },
  {
    id: "percentile-analysis", name: "Percentile and quantile analysis", domain: "data", subdomain: "statistics", status: "planned",
    summary: "Calculate percentiles or quantiles with an explicit interpolation convention and use them to characterize thresholds, tails, service levels, or segment positions.",
    businessQuestion: "What values mark meaningful points in the observed distribution?", trigger: "calculate percentiles or quantiles", antiTrigger: "when the sample is too small for the requested percentile precision without qualification",
    requiredInputs: ["ordered numeric observations", "requested quantiles"], methodology: "Sort valid observations, apply a stated quantile convention, return sample size and boundary behavior, and avoid false precision in sparse tails."
  },
  {
    id: "cross-tab", name: "Cross-tabulation", domain: "data", subdomain: "categorical-analysis", status: "planned",
    summary: "Create contingency tables of counts, row shares, column shares, or total shares across categorical dimensions with explicit treatment of missing categories.",
    businessQuestion: "How do observed counts or proportions differ across two or more categorical dimensions?", trigger: "build a cross tabulation", antiTrigger: "when variables are continuous and should not be arbitrarily categorized",
    requiredInputs: ["categorical variables"], methodology: "Normalize category values, construct counts, calculate requested denominators consistently, preserve missing categories explicitly, and flag sparse cells."
  },
  {
    id: "pivot-summary", name: "Pivot-style summary", domain: "data", subdomain: "aggregation", status: "planned",
    summary: "Aggregate measures across one or more grouping dimensions using explicit sum, count, mean, min, max, rate, or custom definitions suitable for decision-ready tabular summaries.",
    businessQuestion: "How should this dataset be summarized across meaningful dimensions and measures?", trigger: "create a pivot or grouped summary", antiTrigger: "when aggregation would hide required row-level detail",
    requiredInputs: ["structured dataset", "group dimensions", "measure definitions"], methodology: "Validate grouping and measure types, apply explicit aggregation functions, reconcile totals where applicable, and keep denominator-sensitive metrics correctly weighted."
  },
  {
    id: "group-comparison", name: "Group comparison analysis", domain: "data", subdomain: "comparative-statistics", status: "planned",
    summary: "Compare defined groups using appropriate descriptive or inferential measures while reporting sample sizes, missingness, effect magnitude, uncertainty, and comparability limits.",
    businessQuestion: "How do the defined groups differ on the measures that matter?", trigger: "compare outcomes across groups", antiTrigger: "when groups are not mutually interpretable or measurement definitions differ irreconcilably",
    requiredInputs: ["group variable", "outcome variable"], methodology: "Validate comparable measurement, summarize each group, choose an appropriate comparison measure, quantify uncertainty when justified, and separate association from causation."
  },
  {
    id: "correlation-analysis", name: "Correlation analysis", domain: "data", subdomain: "association", status: "planned",
    summary: "Calculate appropriate association measures between variables with sample-size, missingness, outlier, nonlinearity, multiple-comparison, and causality caveats.",
    businessQuestion: "Which variables move together and how strong is the observed association?", trigger: "calculate correlations", antiTrigger: "when the user asks whether one variable causally drives another without causal design",
    requiredInputs: ["paired variables"], methodology: "Choose an association measure appropriate to scale and assumptions, handle missing pairs consistently, inspect nonlinear or outlier effects, and never label correlation as causation."
  },
  {
    id: "regression-analysis", name: "Regression analysis", domain: "data", subdomain: "statistical-modeling", status: "planned",
    summary: "Fit and evaluate a regression model appropriate to the outcome and predictors while checking assumptions, uncertainty, multicollinearity, residual behavior, and interpretation limits.",
    businessQuestion: "How are specified predictors statistically associated with the outcome after accounting for the model structure?", trigger: "fit a regression model", antiTrigger: "when the user expects causal attribution without a defensible causal design",
    requiredInputs: ["outcome variable", "predictor variables"], methodology: "Choose model form from outcome type and question, validate data, fit reproducibly, inspect diagnostics and uncertainty, and bound interpretation to the design."
  },
  {
    id: "hypothesis-testing", name: "Hypothesis testing", domain: "data", subdomain: "statistical-inference", status: "planned",
    summary: "Perform an appropriate statistical test only after defining hypotheses, measurement scale, sampling assumptions, significance convention, effect size, and multiple-testing considerations.",
    businessQuestion: "Is the observed difference or association inconsistent with the stated null model under the test assumptions?", trigger: "perform a statistical hypothesis test", antiTrigger: "when sampling or measurement assumptions make formal inference indefensible",
    requiredInputs: ["observations", "explicit hypothesis"], methodology: "Select the test from design and data assumptions, calculate statistic and p-value reproducibly, report effect size and uncertainty, and avoid equating significance with importance."
  },
  {
    id: "confidence-interval", name: "Confidence interval calculation", domain: "data", subdomain: "statistical-inference", status: "planned",
    summary: "Calculate a confidence interval using a method matched to the estimator, sample structure, and assumptions while clearly interpreting repeated-sampling coverage rather than subjective certainty.",
    businessQuestion: "What interval estimate is supported for this parameter under the stated statistical assumptions?", trigger: "calculate a confidence interval", antiTrigger: "when no sampling model or interval method is defensible",
    requiredInputs: ["sample observations or estimator inputs", "confidence level"], methodology: "Choose a valid interval method, calculate the estimate and uncertainty, report sample size and assumptions, and interpret the interval without converting it into a probability that the fixed parameter lies inside."
  },
  {
    id: "effect-size", name: "Effect-size analysis", domain: "data", subdomain: "statistical-inference", status: "planned",
    summary: "Quantify the magnitude of a difference or association using a measure appropriate to the design and scale, with uncertainty and practical context rather than significance alone.",
    businessQuestion: "How large is the observed difference or relationship in decision-relevant terms?", trigger: "calculate or interpret effect size", antiTrigger: "when the outcome scale or comparison design is undefined",
    requiredInputs: ["comparison or association data"], methodology: "Select an effect-size measure appropriate to the design, calculate reproducibly, report uncertainty where possible, and relate magnitude to business context without universal labels."
  },
  {
    id: "outlier-analysis", name: "Outlier analysis", domain: "data", subdomain: "data-quality", status: "planned",
    summary: "Identify unusual observations using transparent statistical or business-rule criteria and determine whether they are errors, rare valid cases, influential points, or signals requiring separate treatment.",
    businessQuestion: "Which observations are unusually extreme and what treatment is justified?", trigger: "identify or analyze outliers", antiTrigger: "when the user asks to delete extreme values automatically without diagnostic review",
    requiredInputs: ["structured observations", "outlier criterion or analysis goal"], methodology: "Use robust and context-appropriate detection methods, inspect provenance and influence, classify rather than automatically remove, and document treatment decisions."
  },
  {
    id: "anomaly-analysis", name: "Anomaly analysis", domain: "data", subdomain: "monitoring", status: "planned",
    summary: "Detect observations or time periods that deviate materially from an expected pattern using explicit baselines, thresholds, seasonality, and false-positive considerations.",
    businessQuestion: "Which observations or periods depart materially from the expected operating pattern?", trigger: "detect anomalies in business data", antiTrigger: "when no baseline or expected-pattern concept can be established",
    requiredInputs: ["observations", "baseline or expected pattern"], methodology: "Define the expected pattern and detection threshold, account for seasonality or segmentation, flag anomalies reproducibly, and separate detection from root-cause explanation."
  },
  {
    id: "trend-analysis", name: "Trend analysis", domain: "data", subdomain: "time-series", status: "planned",
    summary: "Measure direction, magnitude, inflection, persistence, and segment differences in time-indexed data while separating trend from noise, seasonality, and one-time events.",
    businessQuestion: "What sustained direction or change pattern is present over time?", trigger: "analyze a time trend", antiTrigger: "when observations have no reliable time ordering or comparable measurement basis",
    requiredInputs: ["time-indexed observations"], methodology: "Normalize time intervals, visualize and quantify trend, inspect breaks and seasonality, test sensitivity to start/end points, and avoid extrapolating beyond evidence without a forecast model."
  },
  {
    id: "seasonality-analysis", name: "Seasonality analysis", domain: "data", subdomain: "time-series", status: "planned",
    summary: "Identify recurring calendar or cycle-related patterns in time series while distinguishing seasonality from trend, events, changing exposure, and insufficient historical coverage.",
    businessQuestion: "Which recurring temporal patterns are present and how stable are they?", trigger: "analyze seasonality in time series data", antiTrigger: "when the history does not cover enough repeated cycles to assess recurrence",
    requiredInputs: ["time-indexed observations", "candidate seasonal frequency"], methodology: "Normalize calendar intervals, compare repeated periods, decompose or index recurring effects, and report instability or sparse-cycle limitations."
  },
  {
    id: "clustering-analysis", name: "Clustering analysis", domain: "data", subdomain: "unsupervised-learning", status: "planned",
    summary: "Group observations by multivariate similarity using scaled features and explicit algorithm choices, then assess stability, separation, interpretability, and business usefulness.",
    businessQuestion: "Do meaningful groups emerge from the measured features without predefined labels?", trigger: "cluster observations into data-driven groups", antiTrigger: "when the user already has a validated target label and needs supervised prediction",
    requiredInputs: ["feature matrix"], methodology: "Select and scale relevant features, choose clustering method and candidate group count, evaluate stability and separation, and translate clusters into business meaning cautiously."
  },
  {
    id: "reconciliation", name: "Data reconciliation", domain: "data", subdomain: "controls", status: "planned",
    summary: "Compare totals, records, balances, keys, or transactions across two sources and classify matched, missing, duplicated, timing, transformation, and unexplained differences.",
    businessQuestion: "Do these datasets or systems reconcile and what explains any differences?", trigger: "reconcile two datasets or reports", antiTrigger: "when the two sources measure fundamentally different populations or definitions",
    requiredInputs: ["source A", "source B", "reconciliation key or rule"], methodology: "Normalize scope and keys, match records deterministically, quantify differences, classify explainable timing or transformation effects, and leave unexplained differences open."
  },
  {
    id: "audit-check", name: "Analytical audit checks", domain: "data", subdomain: "controls", status: "planned",
    summary: "Run explicit integrity checks such as totals, duplicates, impossible values, broken sequences, cross-field rules, balance relationships, and unexplained changes before relying on analysis outputs.",
    businessQuestion: "Which deterministic integrity checks fail in this analytical dataset or model?", trigger: "run analytical data audit checks", antiTrigger: "when the request is for a statutory or independent financial audit opinion",
    requiredInputs: ["dataset or analytical model", "applicable integrity rules"], methodology: "Apply documented checks reproducibly, return failures with location and severity, preserve evidence, and distinguish control exceptions from professional audit assurance."
  },
  {
    id: "time-series-forecasting", name: "Time-series forecasting", domain: "forecasting", subdomain: "general-forecasting", status: "planned",
    summary: "Produce reproducible baseline forecasts from time-indexed history using appropriately simple models, holdout evaluation, uncertainty, and explicit seasonality and stationarity considerations.",
    businessQuestion: "What future values are supported by the historical time-series pattern and forecast assumptions?", trigger: "forecast a time series", antiTrigger: "when future values are primarily driven by known causal plans not represented in the history",
    requiredInputs: ["time-indexed history", "forecast horizon"], methodology: "Establish naive baselines, inspect trend and seasonality, fit candidate simple models, evaluate on holdout data, choose based on out-of-sample performance, and report uncertainty."
  },
  {
    id: "revenue-forecast", name: "Revenue forecast", domain: "forecasting", subdomain: "business-forecasting", status: "planned",
    summary: "Forecast revenue from explicit volume, price, customer, pipeline, retention, seasonality, or time-series drivers while reconciling assumptions to the selected business model.",
    businessQuestion: "What revenue is expected under the stated commercial drivers and uncertainty?", trigger: "build a revenue forecast", antiTrigger: "when the user only needs a historical revenue trend summary",
    requiredInputs: ["revenue history or revenue drivers", "forecast horizon"], methodology: "Choose driver-based or time-series structure from available evidence, reconcile component forecasts to total revenue, backtest where possible, and test material scenarios.", mode: "hybrid", surfaceRequirements: ["host-reasoning", "deterministic-engine"]
  },
  {
    id: "demand-forecast", name: "Demand forecast", domain: "forecasting", subdomain: "demand", status: "planned",
    summary: "Forecast product, service, case, or transaction demand from historical patterns and known drivers with segment, seasonality, event, and uncertainty handling appropriate to the decision.",
    businessQuestion: "What demand should be planned for over the forecast horizon?", trigger: "forecast customer or operational demand", antiTrigger: "when the request is a market-size estimate rather than an operational demand forecast",
    requiredInputs: ["demand history or demand drivers", "forecast horizon"], methodology: "Define forecast grain, establish baselines, account for known events and seasonality, evaluate holdout performance, and provide uncertainty suitable for capacity or inventory decisions.", mode: "hybrid", surfaceRequirements: ["host-reasoning", "deterministic-engine"]
  },
  {
    id: "staffing-forecast", name: "Staffing forecast", domain: "forecasting", subdomain: "workforce", status: "planned",
    summary: "Forecast staffing needs from workload, service levels, productivity, shrinkage, schedules, skill mix, attrition, hiring lead time, and scenario assumptions.",
    businessQuestion: "How much staffing capacity and which skills will be required over the planning horizon?", trigger: "forecast staffing requirements", antiTrigger: "when workload or productivity cannot be estimated",
    requiredInputs: ["workload forecast", "productivity or staffing-capacity assumptions"], methodology: "Translate workload into required productive hours or capacity, incorporate shrinkage and timing, compare with workforce supply, and test demand or productivity scenarios.", mode: "hybrid", surfaceRequirements: ["host-reasoning", "deterministic-engine"]
  },
  {
    id: "capacity-forecast", name: "Capacity forecast", domain: "forecasting", subdomain: "operations", status: "planned",
    summary: "Forecast required and available capacity over time from demand, resource additions, productivity, uptime, yield, mix, maintenance, and constraint assumptions.",
    businessQuestion: "When will available capacity become insufficient or excessive under the forecast demand?", trigger: "forecast capacity requirements", antiTrigger: "when only current-state utilization is needed",
    requiredInputs: ["demand forecast", "capacity drivers"], methodology: "Project demand and effective capacity on a common unit and time basis, identify constraint crossings, test timing of additions or productivity changes, and report headroom."
  },
  {
    id: "pipeline-forecast", name: "Sales pipeline forecast", domain: "forecasting", subdomain: "sales", status: "planned",
    summary: "Forecast bookings or revenue from opportunity amount, stage, timing, probability, historical conversion, slippage, concentration, and explicit judgment adjustments without hiding uncertainty.",
    businessQuestion: "What sales outcome is supported by the current pipeline and historical conversion evidence?", trigger: "forecast sales from pipeline", antiTrigger: "when no opportunity pipeline or conversion basis exists",
    requiredInputs: ["opportunity pipeline", "forecast horizon"], methodology: "Normalize stages and close dates, compare stage probabilities with historical behavior, account for slippage and concentration, calculate scenario ranges, and separate model from judgment overrides."
  },
  {
    id: "forecast-backtest", name: "Forecast backtesting", domain: "forecasting", subdomain: "evaluation", status: "planned",
    summary: "Evaluate forecast methods on held-out historical periods using rolling or fixed-origin procedures that approximate real forecasting and avoid leakage from future observations.",
    businessQuestion: "How would this forecast method have performed on data it had not seen?", trigger: "backtest a forecast model", antiTrigger: "when there is insufficient historical depth to create a meaningful holdout",
    requiredInputs: ["historical time series", "forecast method", "evaluation horizon"], methodology: "Define training and holdout windows, refit only on available history, calculate out-of-sample errors, compare against naive baselines, and preserve repeated-origin results."
  },
  {
    id: "forecast-error-metrics", name: "Forecast error metrics", domain: "forecasting", subdomain: "evaluation", status: "planned",
    summary: "Calculate and interpret forecast errors such as MAE, RMSE, MAPE, sMAPE, bias, or scale-free alternatives using metrics appropriate to zeros, scale, outliers, and decision costs.",
    businessQuestion: "How accurate and biased is the forecast under appropriate error measures?", trigger: "calculate forecast accuracy metrics", antiTrigger: "when actual outcomes are not yet available",
    requiredInputs: ["forecast values", "actual values"], methodology: "Align forecast and actual periods, validate missingness and scale, choose metrics suited to the data, calculate reproducibly, and compare against a baseline rather than one metric in isolation."
  },
  {
    id: "forecast-uncertainty", name: "Forecast uncertainty analysis", domain: "forecasting", subdomain: "uncertainty", status: "planned",
    summary: "Quantify or communicate forecast uncertainty using prediction intervals, scenarios, empirical error distributions, or sensitivity methods matched to the forecast model and data evidence.",
    businessQuestion: "What range of future outcomes is plausible given forecast error and assumption uncertainty?", trigger: "quantify forecast uncertainty", antiTrigger: "when the underlying forecast has not been defined or evaluated",
    requiredInputs: ["forecast", "error history or uncertainty assumptions"], methodology: "Separate model error from scenario assumptions where possible, use calibrated intervals or empirical errors when supported, and avoid arbitrary confidence labels."
  }
];

export const dataForecastingCapabilities = seeds.map(dataEngine);
