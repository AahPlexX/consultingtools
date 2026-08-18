import { defineStandardCapability, type StandardCapabilitySeed } from "../define.js";

const seeds: readonly StandardCapabilitySeed[] = [
  {
    id: "unit-economics", name: "Unit economics analysis", domain: "finance", subdomain: "unit-economics", status: "partial",
    summary: "Analyze per-unit or per-customer contribution economics, acquisition cost, lifetime value, payback, gross margin, and key assumptions using consistent definitions.",
    businessQuestion: "Are the economics of each unit, customer, or transaction sustainable and scalable?", trigger: "analyze unit economics", antiTrigger: "when only aggregate company profitability is available with no meaningful unit definition",
    requiredInputs: ["unit definition", "revenue and cost inputs"], methodology: "Define the economic unit, normalize revenue and variable costs, calculate relevant contribution measures, and expose retention or acquisition assumptions."
  },
  {
    id: "break-even", name: "Break-even analysis", domain: "finance", subdomain: "break-even", status: "implemented",
    summary: "Calculate contribution margin, exact and whole-unit break-even volume, and break-even revenue from supplied fixed cost, price, and unit variable cost.",
    businessQuestion: "How much volume or revenue is required to cover the supplied fixed and variable costs?", trigger: "calculate break even volume or revenue", antiTrigger: "when price or variable cost per unit is undefined and cannot be derived",
    requiredInputs: ["fixed costs", "price per unit", "variable cost per unit"], methodology: "Use contribution margin per unit and contribution margin ratio to calculate volume and revenue break-even with domain validation.", mode: "hybrid",
    deterministicEngineIds: ["calculate_break_even"], surfaceRequirements: ["host-reasoning", "deterministic-engine"],
    qualityGates: ["analytical.formula-correctness", "analytical.internal-consistency", "analytical.unit-consistency", "epistemic.claim-classification", "consulting.actionability"]
  },
  {
    id: "simple-roi", name: "Simple ROI calculation", domain: "finance", subdomain: "return-metrics", status: "implemented",
    summary: "Calculate simple undiscounted return on investment from supplied total benefits and total costs while preserving an optional caller-supplied time period.",
    businessQuestion: "What is the simple undiscounted ROI from the supplied benefits and costs?", trigger: "calculate simple undiscounted ROI", antiTrigger: "when time value of money, annualization, IRR, NPV, or detailed cash-flow timing is required",
    requiredInputs: ["total benefits", "total costs"], methodology: "Calculate net benefit and simple ROI as (benefits minus costs) divided by costs; do not relabel the result as a discounted or annualized return.", mode: "hybrid",
    deterministicEngineIds: ["calculate_simple_roi"], surfaceRequirements: ["host-reasoning", "deterministic-engine"],
    qualityGates: ["analytical.formula-correctness", "analytical.internal-consistency", "analytical.unit-consistency", "epistemic.claim-classification"]
  },
  {
    id: "roi", name: "ROI analysis", domain: "finance", subdomain: "return-analysis", status: "partial",
    summary: "Select and interpret an appropriate return-on-investment measure with explicit cash-flow basis, timing, exclusions, comparison period, and decision context.",
    businessQuestion: "What return measure is appropriate for this investment and what does it imply?", trigger: "analyze investment return or ROI", antiTrigger: "when the user explicitly requests only the simple undiscounted ROI formula",
    requiredInputs: ["investment costs", "benefit or cash-flow basis"], methodology: "Define the requested return concept, select the appropriate formula or model, expose timing and exclusions, and distinguish simple ROI from discounted or annualized measures."
  },
  {
    id: "cost-benefit", name: "Cost-benefit analysis", domain: "finance", subdomain: "economic-comparison", status: "partial",
    summary: "Compare monetized and non-monetized costs and benefits across alternatives, timing, stakeholders, uncertainty, risk, and material external effects.",
    businessQuestion: "Do the expected benefits justify the full relevant costs and tradeoffs?", trigger: "perform a cost benefit analysis", antiTrigger: "when the request is only for a single financial return metric",
    requiredInputs: ["alternative or initiative", "known costs and benefits"], methodology: "Define the decision boundary, normalize cost and benefit categories and timing, quantify what is defensible, preserve non-monetized effects, and test sensitivity."
  },
  {
    id: "sensitivity", name: "Sensitivity analysis", domain: "finance", subdomain: "sensitivity", status: "partial",
    summary: "Test how a model or recommendation changes when material assumptions vary individually or in controlled combinations across plausible ranges.",
    businessQuestion: "Which assumptions most affect the conclusion and where are decision thresholds?", trigger: "run sensitivity analysis on assumptions", antiTrigger: "when there is no explicit model output or driver relationship to vary",
    requiredInputs: ["model or outcome relationship", "material assumptions"], methodology: "Identify decision-sensitive drivers, define plausible ranges, vary inputs while preserving model logic, and report thresholds rather than arbitrary scenario labels."
  },
  {
    id: "scenario-modeling", name: "Financial scenario modeling", domain: "finance", subdomain: "scenario-modeling", status: "partial",
    summary: "Build internally coherent base, upside, downside, or custom financial scenarios by varying linked assumptions together rather than changing isolated numbers arbitrarily.",
    businessQuestion: "How do coherent alternative assumptions change financial outcomes and decisions?", trigger: "build financial scenarios", antiTrigger: "when only one input should be varied while all others remain fixed",
    requiredInputs: ["financial model or driver relationships", "scenario assumptions"], methodology: "Define scenario narratives and linked drivers, preserve accounting and operating relationships, calculate outcomes consistently, and compare decision implications."
  },
  {
    id: "npv", name: "Net present value analysis", domain: "finance", subdomain: "investment-appraisal", status: "planned",
    summary: "Discount explicit periodic cash flows at a stated rate to calculate net present value and support investment comparison with transparent timing assumptions.",
    businessQuestion: "What is the present value created or destroyed by the projected cash flows at the selected discount rate?", trigger: "calculate or analyze NPV", antiTrigger: "when cash-flow timing or discount rate is unavailable and cannot be bounded",
    requiredInputs: ["periodic cash flows", "discount rate"], methodology: "Map cash flows to periods, apply the stated discount rate consistently, calculate present values, and expose terminal or timing assumptions."
  },
  {
    id: "irr", name: "Internal rate of return analysis", domain: "finance", subdomain: "investment-appraisal", status: "planned",
    summary: "Estimate the discount rate that makes net present value zero while detecting non-conventional cash-flow patterns and multiple-root or no-root limitations.",
    businessQuestion: "What internal rate of return is implied by the projected cash flows, and is IRR a reliable decision measure here?", trigger: "calculate or analyze IRR", antiTrigger: "when cash flows are not periodic or have patterns that make a single IRR misleading without qualification",
    requiredInputs: ["periodic cash flows"], methodology: "Solve for the zero-NPV rate, inspect cash-flow sign changes and convergence, and report limitations or alternative metrics when IRR is ambiguous."
  },
  {
    id: "payback", name: "Payback period analysis", domain: "finance", subdomain: "investment-appraisal", status: "planned",
    summary: "Calculate how long cumulative project cash inflows take to recover the initial and subsequent investment outflows using an explicit convention.",
    businessQuestion: "How long does it take for cumulative cash benefits to recover the investment?", trigger: "calculate payback period", antiTrigger: "when the user needs only profitability after recovery rather than recovery timing",
    requiredInputs: ["investment and periodic cash flows"], methodology: "Accumulate net cash flows by period, identify the recovery crossing, interpolate only when appropriate, and distinguish simple from discounted payback."
  },
  {
    id: "dcf", name: "Discounted cash flow valuation", domain: "finance", subdomain: "valuation", status: "planned",
    summary: "Value an asset, business, or project from forecast free cash flows, discount rate, terminal assumptions, and explicit bridge items with sensitivity around key drivers.",
    businessQuestion: "What value is supported by the projected cash-generating capacity under explicit assumptions?", trigger: "perform a DCF valuation", antiTrigger: "when no defensible forecast cash-flow basis exists",
    requiredInputs: ["forecast free cash flows", "discount rate", "terminal-value assumptions"], methodology: "Normalize forecast cash flows, discount them by period, calculate terminal value using an explicit method, bridge to the relevant value concept, and test sensitivities.", riskClass: "elevated"
  },
  {
    id: "contribution-margin", name: "Contribution margin analysis", domain: "finance", subdomain: "margin", status: "partial",
    summary: "Analyze revenue less variable costs by unit, product, customer, segment, or channel to identify incremental economics and contribution to fixed-cost coverage.",
    businessQuestion: "Which units or segments generate the strongest contribution after variable costs?", trigger: "analyze contribution margin", antiTrigger: "when costs cannot be separated into a meaningful variable basis",
    requiredInputs: ["revenue", "variable costs", "analysis unit"], methodology: "Define variable-cost scope, calculate contribution consistently, segment comparable units, and distinguish contribution margin from gross or operating margin."
  },
  {
    id: "profitability-analysis", name: "Profitability analysis", domain: "finance", subdomain: "profitability", status: "partial",
    summary: "Decompose profitability by business, product, service, customer, geography, or period using consistent revenue, direct cost, allocated cost, and margin definitions.",
    businessQuestion: "Where is profit being created or destroyed and which drivers explain the difference?", trigger: "analyze profitability by segment or business", antiTrigger: "when only cash generation rather than accounting or contribution profitability is relevant",
    requiredInputs: ["revenue and cost data", "profitability unit or segment"], methodology: "Define margin layers, validate allocation logic, calculate comparable profitability, decompose drivers, and flag conclusions sensitive to arbitrary allocations."
  },
  {
    id: "margin-analysis", name: "Margin analysis", domain: "finance", subdomain: "margin", status: "partial",
    summary: "Compare gross, contribution, operating, or net margins across periods and segments using explicit numerators, denominators, accounting scope, and driver decomposition.",
    businessQuestion: "How are margins changing and what price, cost, mix, or operating drivers explain the movement?", trigger: "analyze margin performance", antiTrigger: "when the requested measure is an absolute cash balance rather than a margin",
    requiredInputs: ["relevant revenue and cost measures"], methodology: "Define the requested margin precisely, normalize accounting scope, calculate comparable periods or segments, and decompose meaningful drivers."
  },
  {
    id: "financial-ratios", name: "Financial ratio analysis", domain: "finance", subdomain: "financial-ratios", status: "partial",
    summary: "Calculate and interpret liquidity, leverage, profitability, efficiency, and return ratios from supplied financial statements using explicit definitions and denominator checks.",
    businessQuestion: "What do normalized financial ratios indicate about performance, risk, liquidity, leverage, and efficiency?", trigger: "analyze financial ratios", antiTrigger: "when the underlying financial statement definitions are incompatible or missing",
    requiredInputs: ["financial statement inputs", "ratio objective"], methodology: "Select decision-relevant ratios, define each formula, normalize periods and accounting scope, validate denominators, and interpret trends and peers cautiously."
  },
  {
    id: "liquidity-analysis", name: "Liquidity analysis", domain: "finance", subdomain: "liquidity", status: "partial",
    summary: "Assess near-term ability to meet obligations using cash, working capital, maturity timing, current and quick ratios, operating cash dynamics, and committed needs.",
    businessQuestion: "Can the organization meet near-term obligations under expected and stressed conditions?", trigger: "assess liquidity", antiTrigger: "when the request concerns only long-term capital structure",
    requiredInputs: ["current assets and liabilities or cash-flow evidence"], methodology: "Normalize liquid resources and near-term obligations, evaluate timing mismatches, calculate relevant ratios, and test material stress assumptions.", riskClass: "elevated"
  },
  {
    id: "leverage-analysis", name: "Leverage analysis", domain: "finance", subdomain: "capital-structure", status: "partial",
    summary: "Assess debt burden, coverage, capital structure, covenant headroom, refinancing exposure, and leverage trends using explicit debt and earnings or cash-flow definitions.",
    businessQuestion: "How much financial leverage is the organization carrying and how resilient is debt service capacity?", trigger: "analyze debt leverage or coverage", antiTrigger: "when no debt or financing obligations are present",
    requiredInputs: ["debt obligations", "earnings or cash-flow basis"], methodology: "Define gross and net debt, calculate relevant leverage and coverage measures, normalize one-offs, and assess maturity and covenant sensitivity.", riskClass: "elevated"
  },
  {
    id: "working-capital", name: "Working-capital analysis", domain: "finance", subdomain: "working-capital", status: "partial",
    summary: "Assess receivables, inventory, payables, current operating assets and liabilities, cash tied in operations, and improvement opportunities with consistent period definitions.",
    businessQuestion: "Where is cash tied up in working capital and which operating levers could release or consume it?", trigger: "analyze working capital", antiTrigger: "when the business has no material receivables inventory or payables operating cycle",
    requiredInputs: ["receivables inventory payables or operating current-account data"], methodology: "Normalize balance and flow measures, calculate relevant days and turnover metrics, identify mix and timing drivers, and connect improvements to operational feasibility."
  },
  {
    id: "cash-conversion-cycle", name: "Cash conversion cycle analysis", domain: "finance", subdomain: "working-capital", status: "partial",
    summary: "Analyze days inventory outstanding, days sales outstanding, and days payables outstanding to estimate the operating cash conversion cycle and its drivers.",
    businessQuestion: "How long is operating cash committed between supplier payment and customer collection?", trigger: "calculate or analyze the cash conversion cycle", antiTrigger: "when inventory receivables or payables concepts do not apply to the operating model",
    requiredInputs: ["inventory and cost basis", "receivables and sales basis", "payables and purchase or cost basis"], methodology: "Use consistent period-average balances and flow denominators, calculate DIO DSO and DPO, and interpret structural versus execution drivers."
  },
  {
    id: "forecast-review", name: "Forecast review", domain: "finance", subdomain: "fpa", status: "partial",
    summary: "Evaluate a supplied forecast for driver logic, assumption traceability, historical calibration, internal consistency, scenario coverage, bias, and decision usefulness.",
    businessQuestion: "Is this forecast internally coherent, evidence-based, and useful for the decision?", trigger: "review or challenge an existing forecast", antiTrigger: "when the user needs a new forecast built from raw time-series data",
    requiredInputs: ["forecast", "supporting assumptions or history"], methodology: "Trace outputs to drivers, reconcile internal relationships, compare assumptions to evidence and history, inspect bias and sensitivity, and identify decision-critical gaps."
  },
  {
    id: "budget-variance", name: "Budget variance analysis", domain: "finance", subdomain: "fpa", status: "partial",
    summary: "Compare actual results with budget or forecast, quantify absolute and percentage variances, and separate controllable drivers from timing, volume, rate, mix, or classification effects.",
    businessQuestion: "Why did actual performance differ from budget or forecast?", trigger: "analyze budget versus actual variance", antiTrigger: "when budget and actual measures use incompatible definitions that cannot be reconciled",
    requiredInputs: ["budget or forecast", "actual results"], methodology: "Normalize account and period definitions, calculate variances consistently, decompose supported drivers, and distinguish recurring performance from timing or one-offs."
  },
  {
    id: "price-volume-mix", name: "Price-volume-mix analysis", domain: "finance", subdomain: "fpa", status: "partial",
    summary: "Decompose revenue or margin change into price, volume, and mix effects using an explicit bridge convention and comparable product or segment definitions.",
    businessQuestion: "How much of the change in performance came from price, volume, and mix?", trigger: "decompose change into price volume and mix", antiTrigger: "when product or segment quantities and comparable prices are unavailable",
    requiredInputs: ["prior and current prices volumes and mix"], methodology: "Choose and state a bridge convention, normalize comparable units, calculate effects without double counting, and reconcile the bridge to total change."
  },
  {
    id: "cash-flow-forecast", name: "Cash-flow forecast", domain: "finance", subdomain: "cash-planning", status: "partial",
    summary: "Forecast cash receipts, disbursements, financing needs, and ending liquidity from explicit operational and financial drivers over a defined planning horizon.",
    businessQuestion: "What cash position and funding need are expected under the stated operating assumptions?", trigger: "build or analyze a cash flow forecast", antiTrigger: "when the request is an accrual earnings forecast with no cash timing requirement",
    requiredInputs: ["cash opening balance", "cash receipt and disbursement drivers"], methodology: "Model cash timing explicitly, reconcile operating and financing flows, identify minimum liquidity points, and test material timing and scenario assumptions."
  },
  {
    id: "total-cost-of-ownership", name: "Total cost of ownership analysis", domain: "finance", subdomain: "cost-comparison", status: "partial",
    summary: "Compare acquisition, implementation, operating, support, maintenance, switching, risk, disposal, and opportunity costs over a consistent decision horizon.",
    businessQuestion: "What is the full economically relevant cost of each option over the decision horizon?", trigger: "compare total cost of ownership", antiTrigger: "when the user needs only purchase price comparison",
    requiredInputs: ["alternatives", "cost horizon"], methodology: "Define cost boundary and horizon, normalize one-time and recurring costs, incorporate material transition and risk costs, and preserve assumptions separately from observed amounts."
  },
  {
    id: "investment-appraisal", name: "Investment appraisal", domain: "finance", subdomain: "investment-appraisal", status: "partial",
    summary: "Compare investments using appropriate cash-flow, return, strategic, risk, option-value, implementation, and capital constraints rather than relying on one financial metric.",
    businessQuestion: "Should this investment proceed relative to alternatives and capital constraints?", trigger: "appraise an investment decision", antiTrigger: "when the request is limited to calculating one already-selected financial metric",
    requiredInputs: ["investment option", "decision criteria"], methodology: "Select appropriate financial and non-financial criteria, normalize assumptions, compare value and risk, test sensitivities, and identify decision gates.", riskClass: "elevated"
  },
  {
    id: "target-screening", name: "M&A target screening", domain: "m-and-a", subdomain: "target-screening", status: "partial",
    summary: "Screen acquisition targets against strategic fit, market, scale, economics, capability, ownership, integration, and risk criteria while documenting evidence gaps.",
    businessQuestion: "Which acquisition targets merit deeper diligence?", trigger: "screen acquisition targets", antiTrigger: "when the request concerns post-close integration of an already acquired business",
    requiredInputs: ["acquisition thesis", "candidate targets or discovery scope"], methodology: "Translate the acquisition thesis into screening criteria, collect comparable evidence, score or categorize transparently, and prioritize diligence needs.", riskClass: "elevated", evidenceLevel: "current-external-evidence"
  },
  {
    id: "ma-strategic-fit", name: "M&A strategic fit assessment", domain: "m-and-a", subdomain: "strategic-fit", status: "partial",
    summary: "Assess whether a target advances the acquirer's strategy through market access, customers, products, capabilities, economics, defensibility, and portfolio logic.",
    businessQuestion: "Does this target materially advance the acquisition thesis and strategy?", trigger: "assess strategic fit of an acquisition target", antiTrigger: "when the request is solely legal or tax diligence",
    requiredInputs: ["acquisition thesis", "target evidence"], methodology: "Map target characteristics to explicit strategic objectives, distinguish standalone quality from strategic fit, and identify thesis dependencies and disconfirming evidence.", riskClass: "elevated"
  },
  {
    id: "due-diligence", name: "Due-diligence framework", domain: "m-and-a", subdomain: "diligence-management", status: "partial",
    summary: "Organize diligence questions, evidence requests, findings, gaps, red flags, owners, materiality, and decision gates across a scoped transaction or investment review.",
    businessQuestion: "What evidence must be validated before the transaction or investment decision can be defended?", trigger: "structure due diligence", antiTrigger: "when the request is for licensed legal tax audit or securities conclusions",
    requiredInputs: ["transaction scope", "decision thesis"], methodology: "Translate the thesis and risk profile into evidence domains, track verified findings separately from open questions, and prioritize gaps by decision materiality.", riskClass: "high-stakes"
  },
  {
    id: "commercial-diligence", name: "Commercial due diligence", domain: "m-and-a", subdomain: "commercial-diligence", status: "partial",
    summary: "Assess market, customer, competition, growth, pricing, retention, channel, and revenue-quality evidence that supports or challenges a transaction's commercial thesis.",
    businessQuestion: "Does commercial evidence support the target's market and growth thesis?", trigger: "perform commercial due diligence", antiTrigger: "when the request is solely an accounting quality-of-earnings review",
    requiredInputs: ["transaction thesis", "target commercial evidence"], methodology: "Test market and customer assumptions, normalize competitive and growth evidence, identify concentration or sustainability risks, and link findings to valuation and deal logic.", riskClass: "high-stakes", evidenceLevel: "current-external-evidence"
  },
  {
    id: "financial-diligence", name: "Financial due diligence", domain: "m-and-a", subdomain: "financial-diligence", status: "partial",
    summary: "Assess historical financial quality, earnings drivers, working capital, cash conversion, debt-like items, forecast credibility, concentration, and normalization issues from supplied evidence.",
    businessQuestion: "What financial quality and normalization issues could change transaction value or risk?", trigger: "perform financial due diligence", antiTrigger: "when the request requires an independent audit opinion or assurance engagement",
    requiredInputs: ["target financial evidence"], methodology: "Reconcile financial periods and definitions, identify recurring versus one-time effects, test earnings and cash quality, and quantify decision-relevant adjustments where supported.", riskClass: "high-stakes"
  },
  {
    id: "operational-diligence", name: "Operational due diligence", domain: "m-and-a", subdomain: "operational-diligence", status: "partial",
    summary: "Assess process, capacity, service, technology dependencies, supply chain, quality, cost structure, scalability, and operational risks that affect transaction value.",
    businessQuestion: "Which operational realities could constrain growth, synergies, integration, or value creation?", trigger: "perform operational due diligence", antiTrigger: "when only market attractiveness is in scope",
    requiredInputs: ["target operating evidence"], methodology: "Map critical operating processes and dependencies, test capacity and scalability claims, identify control and continuity risks, and link findings to value-creation assumptions.", riskClass: "high-stakes"
  },
  {
    id: "management-org-diligence", name: "Management and organization diligence", domain: "m-and-a", subdomain: "organization-diligence", status: "partial",
    summary: "Assess leadership depth, key-person dependence, organization design, capabilities, incentives, decision rights, succession, culture risks, and change capacity for a transaction.",
    businessQuestion: "Can the management team and organization execute the standalone and transaction value-creation plan?", trigger: "assess management and organization in diligence", antiTrigger: "when the request is an individual employment or psychological assessment",
    requiredInputs: ["organization and management evidence"], methodology: "Compare required capabilities with demonstrated leadership and organization evidence, identify dependencies and gaps, and avoid unsupported personal judgments.", riskClass: "high-stakes"
  },
  {
    id: "synergy-identification", name: "Synergy identification", domain: "m-and-a", subdomain: "synergies", status: "partial",
    summary: "Identify plausible revenue, cost, capital, capability, and risk synergies while separating true combination benefits from standalone improvements or double counting.",
    businessQuestion: "Which value sources exist because of the combination rather than standalone execution?", trigger: "identify acquisition synergies", antiTrigger: "when no transaction combination or integration is contemplated",
    requiredInputs: ["buyer and target operating context"], methodology: "Map overlap and complementarity by value driver, distinguish combination-specific from standalone actions, identify prerequisites, and screen for double counting.", riskClass: "elevated"
  },
  {
    id: "synergy-sizing", name: "Synergy sizing", domain: "m-and-a", subdomain: "synergies", status: "partial",
    summary: "Quantify supported synergy opportunities using explicit baselines, timing, one-time costs, ramp, dependencies, dis-synergies, tax treatment where supplied, and probability considerations.",
    businessQuestion: "What value and timing are supportable for the identified transaction synergies?", trigger: "quantify acquisition synergies", antiTrigger: "when synergy ideas have not been defined or baselined",
    requiredInputs: ["identified synergies", "buyer and target baselines"], methodology: "Define each synergy baseline and mechanism, calculate gross value and implementation costs, phase timing, identify dis-synergies and dependencies, and avoid double counting.", riskClass: "high-stakes"
  },
  {
    id: "integration-complexity", name: "Integration complexity assessment", domain: "m-and-a", subdomain: "integration", status: "partial",
    summary: "Assess integration complexity across customers, products, people, processes, systems, data, locations, suppliers, governance, culture, and regulatory dependencies.",
    businessQuestion: "Where will integration be most complex and which dependencies threaten value capture or continuity?", trigger: "assess M&A integration complexity", antiTrigger: "when the businesses will remain fully independent with no integration decisions",
    requiredInputs: ["buyer and target operating models", "integration intent"], methodology: "Compare target-state integration ambition with current-state differences, score dependency and disruption risk, and identify critical sequencing constraints.", riskClass: "elevated"
  },
  {
    id: "diligence-gap-tracking", name: "Diligence gap tracking", domain: "m-and-a", subdomain: "diligence-management", status: "partial",
    summary: "Track unanswered diligence questions, missing evidence, contradictions, materiality, owners, deadlines, and decision impact without treating absence of evidence as a finding.",
    businessQuestion: "Which unresolved diligence gaps could still change the deal decision or terms?", trigger: "track diligence evidence gaps", antiTrigger: "when all relevant evidence has already been resolved and the request is final synthesis",
    requiredInputs: ["diligence questions and evidence status"], methodology: "Register each gap with source request, owner, materiality, status, due date, and decision implication; separate unresolved questions from confirmed red flags.", outputs: ["text", "structured-model", "spreadsheet"], riskClass: "elevated"
  },
  {
    id: "valuation-comparison", name: "Valuation comparison", domain: "m-and-a", subdomain: "valuation", status: "partial",
    summary: "Compare valuation outputs from supported methods and scenarios while reconciling value concepts, dates, capital structure, units, premiums, and assumption differences.",
    businessQuestion: "How do supported valuation approaches compare and which assumptions explain the range?", trigger: "compare transaction valuations", antiTrigger: "when only one valuation method exists and no comparison is requested",
    requiredInputs: ["valuation outputs or inputs", "value concept"], methodology: "Normalize valuation date and enterprise/equity concepts, reconcile method assumptions, compare ranges, and identify which drivers dominate differences.", riskClass: "high-stakes"
  },
  {
    id: "deal-scenario-analysis", name: "Deal scenario analysis", domain: "m-and-a", subdomain: "deal-scenarios", status: "partial",
    summary: "Compare transaction scenarios across price, financing, synergies, timing, retention, integration cost, downside, and strategic outcomes using coherent assumptions.",
    businessQuestion: "How do plausible transaction structures or assumptions change value and risk?", trigger: "compare M&A deal scenarios", antiTrigger: "when no alternative transaction assumptions or structures are defined",
    requiredInputs: ["transaction baseline", "scenario variables"], methodology: "Define coherent deal scenarios, preserve valuation and financing logic, calculate comparable outcomes where supported, and explain decision thresholds.", riskClass: "high-stakes"
  },
  {
    id: "integration-planning", name: "M&A integration planning", domain: "m-and-a", subdomain: "integration", status: "partial",
    summary: "Sequence integration decisions, Day 1 continuity, value-capture initiatives, governance, dependencies, milestones, owners, communication, and risk controls around the deal thesis.",
    businessQuestion: "How should integration be sequenced to protect continuity and capture transaction value?", trigger: "build an M&A integration plan", antiTrigger: "when the transaction will not proceed or no integration scope exists",
    requiredInputs: ["transaction thesis", "integration scope"], methodology: "Separate close-readiness, Day 1, stabilization, and value-capture work; map dependencies and ownership; align milestones to synergy and risk priorities.", outputs: ["text", "structured-model", "spreadsheet", "presentation"], riskClass: "high-stakes"
  },
  {
    id: "investment-memorandum", name: "Investment memorandum", domain: "m-and-a", subdomain: "decision-artifact", status: "partial",
    summary: "Synthesize transaction thesis, market, business quality, financials, valuation, diligence findings, risks, scenarios, synergies, terms, and decision gates into an executive investment memorandum.",
    businessQuestion: "What evidence and tradeoffs should decision-makers consider before approving or rejecting the investment?", trigger: "prepare an investment memorandum", antiTrigger: "when the request is only to calculate a transaction metric",
    requiredInputs: ["investment thesis", "material diligence evidence"], methodology: "Structure the memo around the decision, preserve claim provenance and unresolved gaps, connect evidence to valuation and risks, and state recommendation conditions explicitly.", outputs: ["document", "print-artifact", "presentation"], artifactFormats: ["docx", "pdf", "pptx"], surfaceRequirements: ["host-reasoning", "artifact-output"], riskClass: "high-stakes"
  }
];

export const financeMaCapabilities = seeds.map(defineStandardCapability);
