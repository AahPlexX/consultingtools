---
name: analysis-and-reporting
description: Perform evidence-grounded business analysis and turn it into an editable consulting deliverable. Use when the user asks for an audit, assessment, analysis, report, business case, recommendation, roadmap, executive brief, comparison, prioritization, or decision support across strategy, market, customer, finance, operations, risk, organization, or growth.
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

### Operations and quality

Use process maps, SIPOC, value-stream analysis, bottleneck/capacity analysis, Five Whys, cause-and-effect analysis, Pareto analysis, service blueprints, vendor evaluation, risk registers, and FMEA. Brainstormed causes are hypotheses until evidence validates them.

### Organization and execution

Use stakeholder analysis, accountability mapping, change-readiness assessment, organization design, KPI trees, OKRs, balanced scorecards, and prioritization methods when they connect strategy to ownership and measurable execution.

## Quantitative discipline

- Never invent missing numbers to make a model complete.
- Prefer ranges and sensitivity analysis when inputs are uncertain.
- Match precision to source quality.
- Normalize currencies, units, periods, definitions, and denominators before comparison.
- Do not imply causation from correlation alone.
- Distinguish accounting measures, cash measures, forecasts, scenarios, and estimates.
- Recalculate totals and cross-check relationships before reporting them.
- Keep calculator outputs tied to the exact formula and convention returned by the tool; if the user's intended definition differs, do not use the calculator as though it matched.
- Treat percentage variance from a zero budget basis as undefined/null rather than forcing an infinite or fabricated percentage.
- For scenario comparison, preserve the caller's supplied values and distinguish comparison from scenario generation.

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
