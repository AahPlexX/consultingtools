# Data, Statistics & Forecasting Engines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. All deterministic work is test-first.

**Goal:** Build reproducible data-profiling, descriptive-statistics, inference, correlation, autocorrelation, baseline forecasting, rolling-origin backtesting, and forecast-error primitives without silently coercing data, hiding statistical assumptions, or treating a library call as sufficient analytical validation.

**Architecture:** Keep pure deterministic engines under `src/statistics/` and `src/forecasting/`. Host reasoning decides when a method is appropriate; deterministic code owns numeric definitions, missingness behavior, quantile conventions, inferential calculations, time-series assumptions, forecast generation, backtest splits, and error metrics. MCP tools remain focused and read-only. Capability status promotion occurs only after full repository verification.

**Tech Stack:** TypeScript 7.0.2, Node 24, Vitest 4.1.10, Zod 4.4.3, `@modelcontextprotocol/server` 2.0.0, MCP 2026-07-28. No new statistical runtime dependency is required for the initial deterministic envelope.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

**Depends on:** Subproject 3 code verified on `e036427c67c114af307aeac189d8e04f498a0e05` through GitHub Actions run `32298548890`; documentation HEAD `c1f9ad6d306d468ff20129759c7449df57881d44` subsequently verified through run `32298800179`.

## Global constraints

- Never silently coerce strings, booleans, dates, nulls, or objects into numeric observations.
- Distinguish missing (`null`/`undefined`) from invalid numeric (`NaN`, infinities) values.
- Numeric statistical engines accept finite numbers only; any missing-data policy must be explicit at the profiling/preparation layer.
- Sample variance and sample standard deviation use the `N-1` denominator; population variance uses `N` and is separately labeled.
- Quantiles use the R/NIST type-7 convention unless a later tool explicitly exposes another method: `h = 1 + (n - 1)p`, with linear interpolation between adjacent ordered values.
- A one-observation sample has a defined mean but no finite unbiased sample variance; return `null` for sample variance/standard deviation rather than zero.
- Inferential methods must return assumptions and degrees of freedom. Failure to reject a null hypothesis must never be phrased as proof the null is true.
- One-sample mean confidence intervals use Student's t when population standard deviation is unknown: `mean ± t * s/sqrt(n)`.
- Two independent-sample mean comparison uses Welch's unequal-variance t-test by default; pooled equal-variance testing is not silently assumed.
- Statistical inference requires independent observations under its model. Autocorrelated time-series observations must not be treated as independent snapshots without justification.
- Autocorrelation uses the NIST equally-spaced series convention and explicitly reports lag.
- Forecast baselines are intentionally simple benchmarks: naive, seasonal-naive, drift, and trailing moving average. They are not mislabeled as optimized forecasting models.
- Forecast error metrics compare caller-supplied actual/predicted pairs. MAE and RMSE are always explicit. MAPE is `null` when any actual is zero rather than silently dropping those observations or substituting epsilon. sMAPE reports undefined pairs where both actual and predicted are zero rather than inventing a denominator.
- Rolling-origin backtesting must preserve temporal order. Random train/test shuffling is prohibited for time-series baseline evaluation.
- Forecast functions require equally spaced observations unless the user first normalizes the time axis externally.
- Broad regression, clustering, anomaly detection, ARIMA/exponential-smoothing optimization, and production forecast orchestration remain separate capability gates unless explicitly implemented here.
- `main` remains the sole authoritative branch.

## Current-date research basis

As of 2026-08-19, the NIST/SEMATECH Engineering Statistics Handbook defines the sample variance with an `N-1` denominator, describes Student-t confidence limits for a mean when standard deviation is estimated, provides the Welch-Satterthwaite unequal-variance two-sample t formulation, and defines autocorrelation for equally spaced observations. NIST's percentile guidance identifies R7/type-7 as the Excel/R-default style interpolation, and current R documentation confirms type 7 remains the default `quantile()` method. Current scikit-learn documentation defines MAE and RMSE as non-negative regression losses over actual/predicted values. These sources set the named conventions; this implementation returns those conventions explicitly instead of treating them as universal unlabeled defaults.

---

### Task 1: Descriptive Statistics and Type-7 Quantiles

**Files:**
- Create: `src/statistics/descriptive.ts`
- Create: `tests/statistics-descriptive.test.ts`

**Interfaces:**
- `calculateDescriptiveStatistics(values)` returns count, sum, mean, median, min, max, sample/population variance and standard deviation, q1/q3/IQR, and convention metadata.
- `quantileType7(values, probability)` is an exported reusable primitive.

- [ ] Write failing tests for mean/median, N-1 sample variance, population variance, singleton sample-variance `null`, type-7 q1/median/q3, and finite-input rejection.
- [ ] Confirm RED in GitHub Actions.
- [ ] Implement numerically stable two-pass variance and type-7 interpolation.
- [ ] Confirm focused and full-suite GREEN.

---

### Task 2: Explicit Column Profiling and Missingness

**Files:**
- Create: `src/statistics/profile.ts`
- Create: `tests/statistics-profile.test.ts`

**Interfaces:**
- `profileColumn(values: readonly unknown[])` classifies missing, finite number, non-finite number, string, blank string, boolean, array, object, and other without coercion.
- Result reports counts, observed type set, unique count for primitive non-missing values, and whether the column is numeric-clean.

- [ ] Write RED tests distinguishing `null`/`undefined` from `NaN`/Infinity and rejecting no values by coercion.
- [ ] Implement deterministic classification with bounded uniqueness tracking.
- [ ] Verify GREEN.

---

### Task 3: Pearson and Spearman Correlation

**Files:**
- Create: `src/statistics/correlation.ts`
- Create: `tests/statistics-correlation.test.ts`

**Interfaces:**
- `calculatePearsonCorrelation(x, y)`.
- `calculateSpearmanCorrelation(x, y)` using average ranks for ties, then Pearson correlation on ranks.

- [ ] Write RED tests for +1/-1/known non-perfect Pearson results, Spearman tie handling, unequal lengths, n<2, zero-variance rejection, and finite values.
- [ ] Implement centered-sum Pearson and deterministic average ranks.
- [ ] Verify GREEN.

---

### Task 4: Student-t Distribution Primitives and Mean Inference

**Files:**
- Create: `src/statistics/student-t.ts`
- Create: `src/statistics/inference.ts`
- Create: `tests/statistics-student-t.test.ts`
- Create: `tests/statistics-inference.test.ts`

**Interfaces:**
- Internal/publicly testable `studentTCdf(t, degreesOfFreedom)` and `studentTQuantile(probability, degreesOfFreedom)` implemented through a tested regularized incomplete-beta calculation and bounded bisection.
- `calculateMeanConfidenceInterval({ values, confidenceLevel })`.
- `calculateWelchTTest({ sampleA, sampleB, confidenceLevel })` returning means, difference, standard error, Welch-Satterthwaite degrees of freedom, t statistic, two-sided p-value, and confidence interval for the mean difference.

- [ ] Write RED distribution tests including `t(0)=0.5` and critical value `t_0.975,9 ≈ 2.262157`.
- [ ] Write RED inference tests against NIST/R fixtures, including the NIST 10-observation confidence-interval example and unequal-variance Welch formulas.
- [ ] Implement Lanczos log-gamma, stable continued-fraction incomplete beta, t CDF, and bisection quantile with explicit numerical tolerances.
- [ ] Reject effectively constant samples when the requested test statistic is undefined.
- [ ] Verify GREEN and preserve formula/assumption metadata.

---

### Task 5: Autocorrelation and Basic Time-Series Diagnostics

**Files:**
- Create: `src/statistics/autocorrelation.ts`
- Create: `tests/statistics-autocorrelation.test.ts`

**Interfaces:**
- `calculateAutocorrelation(values, lag)` using the NIST denominator over all centered observations and numerator over valid lag pairs.
- `calculateAutocorrelationSeries(values, maxLag)` composes the single-lag primitive.

- [ ] Write RED tests for known lag-1 series, bounds `[-1,1]` within numerical tolerance, lag validation, constant-series rejection, and equal-spacing convention metadata.
- [ ] Implement without inferring time stamps.
- [ ] Verify GREEN.

---

### Task 6: Forecast Baseline Engines

**Files:**
- Create: `src/forecasting/baselines.ts`
- Create: `tests/forecasting-baselines.test.ts`

**Interfaces:**
- `forecastNaive(values, horizon)`.
- `forecastSeasonalNaive(values, horizon, seasonLength)`.
- `forecastDrift(values, horizon)`.
- `forecastMovingAverage(values, horizon, window)` where the trailing average is held constant across the requested horizon.

- [ ] Write RED tests for exact forecasts, minimum-history requirements, season/horizon bounds, and finite values.
- [ ] Implement explicit equally-spaced conventions and no auto-season detection.
- [ ] Verify GREEN.

---

### Task 7: Forecast Error Metrics

**Files:**
- Create: `src/forecasting/metrics.ts`
- Create: `tests/forecasting-metrics.test.ts`

**Interfaces:**
- `calculateForecastErrorMetrics(actual, predicted)` returns count, mean error/bias, MAE, MSE, RMSE, MAPE or null, sMAPE or null, zero-actual count, zero-joint-denominator count, and formula metadata.

- [ ] Write RED tests matching documented MAE/RMSE fixtures, signed bias, zero-actual MAPE null behavior, all-zero sMAPE null behavior, unequal lengths, and finite inputs.
- [ ] Implement all metrics from the same residual rows to avoid divergent pair handling.
- [ ] Verify GREEN.

---

### Task 8: Rolling-Origin Baseline Backtesting

**Files:**
- Create: `src/forecasting/backtest.ts`
- Create: `tests/forecasting-backtest.test.ts`

**Interfaces:**
- `backtestForecastBaseline({ values, method, minimumTrainingSize, horizon, seasonLength?, movingAverageWindow? })`.
- Each origin trains only on observations preceding the forecast target; result returns forecast rows and aggregate error metrics.

- [ ] Write RED tests proving no future leakage, chronological origin order, seasonal history validation, multiple horizons, and aggregate metrics.
- [ ] Implement by composing Task 6 forecast functions and Task 7 metrics.
- [ ] Verify GREEN.

---

### Task 9: Expose Focused Statistics and Forecast MCP Tools

**Files:**
- Create: `src/statistics/register-tools.ts`
- Create: `src/forecasting/register-tools.ts`
- Modify: `src/server.ts`
- Create/Modify: `tests/statistics-tools.test.ts`, `tests/forecasting-tools.test.ts`

**Interfaces:**
- Statistics MCP: `profile_data_column`, `calculate_descriptive_statistics`, `calculate_correlation`, `calculate_mean_confidence_interval`, `calculate_welch_t_test`, `calculate_autocorrelation`.
- Forecast MCP: `forecast_baseline`, `calculate_forecast_error_metrics`, `backtest_forecast_baseline`.

- [ ] Write failing MCP HTTP contract tests for discovery, annotations, valid fixtures, and invalid-domain errors.
- [ ] Register all tools as read-only, closed-world, non-destructive.
- [ ] Return structured formula/convention/assumption metadata.
- [ ] Verify MCP 2026-07-28 protocol and full suite.

---

### Task 10: Promote Only Fully Covered Catalog Capabilities

**Files:**
- Modify: `src/catalog/verified-promotions.ts`
- Modify: `tests/catalog-status-truth.test.ts`

**Promotion candidates after verification:**
- `descriptive-statistics` -> implemented only if its advertised summary scope matches Task 1.
- `correlation-analysis` remains partial if its catalog claim includes causal/diagnostic interpretation beyond Pearson/Spearman calculation.
- `confidence-interval` may be implemented only for the explicit mean-t interval scope if its catalog definition is equally narrow; otherwise partial with engine binding.
- `hypothesis-testing` remains partial because one Welch test is not a general hypothesis-testing engine.
- `time-series-forecasting` remains partial because baseline models are benchmarks, not a comprehensive forecasting engine.
- `forecast-backtest` and `forecast-error-metrics` may be promoted only if their catalog definitions exactly match the implemented envelope.

- [ ] Write status/engine binding tests before promotion changes.
- [ ] Apply only justified promotions through `verified-promotions.ts`.
- [ ] Verify breadth, overlap, routing, status-truth, and full regression suites.

---

### Task 11: Documentation and Full Verification

**Files:**
- Modify: `README.md`
- Modify: `skills/analysis-and-reporting/SKILL.md`
- Modify: `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`

- [ ] Document exact quantile, missingness, inference, autocorrelation, forecast, and error-metric conventions.
- [ ] Run/observe `npm run verify` on code HEAD and require `ci/verify: success`.
- [ ] Record exact verified SHA and Actions run ID.
- [ ] Verify documentation HEAD again.
- [ ] Confirm only `main` exists.

## Self-review

- The plan satisfies the Subproject 4 roadmap minimum: profiling, descriptive statistics, statistical tests/intervals, time-series baselines, backtesting, and error metrics.
- Inference assumptions are explicit and separate from descriptive calculations.
- Time-series evaluation preserves order and blocks random leakage.
- Quantile and missingness conventions are named rather than implicit.
- No broad regression, clustering, anomaly detection, optimized ARIMA, or production forecast claim is promoted merely because baseline primitives exist.
