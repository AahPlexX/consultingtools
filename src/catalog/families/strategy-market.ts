import { defineStandardCapability, type StandardCapabilitySeed } from "../define.js";

const seeds: readonly StandardCapabilitySeed[] = [
  {
    id: "swot", name: "SWOT analysis", domain: "strategy", subdomain: "situational-analysis", status: "partial",
    summary: "Separate internal strengths and weaknesses from external opportunities and threats, then convert the evidence into decision-relevant implications.",
    businessQuestion: "What internal and external factors materially affect this decision?", trigger: "assess strengths weaknesses opportunities and threats", antiTrigger: "when the request is solely for a numeric valuation",
    requiredInputs: ["decision or business scope"], methodology: "Classify evidence as internal or external, distinguish observations from assumptions, and synthesize implications rather than stopping at a four-box list."
  },
  {
    id: "pestle", name: "PESTLE analysis", domain: "strategy", subdomain: "external-environment", status: "partial",
    summary: "Assess political, economic, social, technological, legal, and environmental forces only where they materially change the business decision.",
    businessQuestion: "Which external macro forces could materially alter the plan or decision?", trigger: "assess macro environmental forces", antiTrigger: "when only internal process causes are in scope",
    requiredInputs: ["decision scope", "geography or market scope when relevant"], methodology: "Identify decision-relevant external forces, verify current facts when freshness matters, and connect each material force to a business implication.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "porter-five-forces", name: "Porter's Five Forces", domain: "strategy", subdomain: "industry-structure", status: "partial",
    summary: "Evaluate rivalry, entry threats, substitutes, supplier power, and buyer power to understand structural pressures on industry economics.",
    businessQuestion: "How attractive is the industry's competitive structure and where is economic pressure concentrated?", trigger: "analyze industry competitive forces", antiTrigger: "when the request concerns only one firm's internal capabilities",
    requiredInputs: ["industry definition"], methodology: "Assess each force using current evidence, explain its mechanism, and synthesize structural implications without treating the framework as a scorecard.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "vrio", name: "VRIO analysis", domain: "strategy", subdomain: "resource-advantage", status: "partial",
    summary: "Test resources and capabilities for value, rarity, imitability, and organizational support to distinguish temporary strengths from durable advantage.",
    businessQuestion: "Which resources or capabilities can plausibly support a sustained competitive advantage?", trigger: "evaluate strategic resources or capabilities", antiTrigger: "when there is no organization-specific resource evidence",
    requiredInputs: ["resource or capability evidence"], methodology: "Evaluate each resource against VRIO criteria, identify missing evidence, and state the competitive implication supported by the pattern."
  },
  {
    id: "value-chain", name: "Value chain analysis", domain: "strategy", subdomain: "value-creation", status: "partial",
    summary: "Trace activities that create customer value, cost, differentiation, information advantage, or avoidable friction across the operating chain.",
    businessQuestion: "Where in the activity system is value created, lost, or differentiated?", trigger: "analyze value creation across business activities", antiTrigger: "when the request is a single-step root-cause investigation",
    requiredInputs: ["business model or activity scope"], methodology: "Map primary and supporting activities, connect each to cost or differentiation drivers, and identify decision-relevant linkages."
  },
  {
    id: "bcg-matrix", name: "Portfolio position analysis", domain: "strategy", subdomain: "portfolio", status: "partial",
    summary: "Compare portfolio positions using market growth, relative strength, economics, strategic fit, and investment needs without letting a simple matrix dictate the decision.",
    businessQuestion: "How should resources be allocated across a portfolio of businesses or offerings?", trigger: "compare portfolio positions for resource allocation", antiTrigger: "when only one product or business unit is being assessed",
    requiredInputs: ["portfolio items", "decision criteria"], methodology: "Normalize portfolio evidence, use growth and relative strength as one lens, then incorporate economics, fit, risk, and capital needs before recommending allocation."
  },
  {
    id: "ansoff", name: "Growth option analysis", domain: "strategy", subdomain: "growth-strategy", status: "partial",
    summary: "Structure growth options across existing and new markets and offerings, then test feasibility, economics, capabilities, sequencing, and risk.",
    businessQuestion: "Which growth path is most appropriate given current markets, offerings, capabilities, and risk?", trigger: "evaluate growth paths across markets and offerings", antiTrigger: "when the user has already selected a single implementation tactic",
    requiredInputs: ["current markets", "current offerings"], methodology: "Classify candidate growth paths, then compare them on demand evidence, capability fit, economics, dependencies, and risk rather than treating the matrix as the answer."
  },
  {
    id: "strategy-map", name: "Strategy map", domain: "strategy", subdomain: "strategy-execution", status: "partial",
    summary: "Connect strategic objectives through explicit cause-and-effect hypotheses so leading capabilities and processes link to customer and financial outcomes.",
    businessQuestion: "How should strategic objectives connect from enabling capabilities to measurable outcomes?", trigger: "map causal links among strategic objectives", antiTrigger: "when the request is only for a decorative process diagram",
    requiredInputs: ["strategic objectives"], methodology: "Arrange objectives by causal logic, challenge unsupported links, and connect each material objective to measurable outcomes or drivers.", outputs: ["text", "structured-model", "diagram"]
  },
  {
    id: "business-model", name: "Business model analysis", domain: "strategy", subdomain: "business-model", status: "partial",
    summary: "Assess value proposition, customers, channels, resources, activities, partners, costs, and revenue logic as one coherent system rather than isolated boxes.",
    businessQuestion: "Does the business model coherently create, deliver, and capture value?", trigger: "evaluate the business model", antiTrigger: "when the request concerns only one isolated financial ratio",
    requiredInputs: ["business or offering description"], methodology: "Map value creation, delivery, and capture components, identify contradictions or fragile dependencies, and connect findings to strategic choices."
  },
  {
    id: "scenario-planning", name: "Scenario planning", domain: "strategy", subdomain: "uncertainty", status: "partial",
    summary: "Construct materially different plausible futures around uncertain external drivers and identify actions that are robust, contingent, or reversible across them.",
    businessQuestion: "Which actions remain sensible across materially different plausible futures?", trigger: "plan under strategic uncertainty", antiTrigger: "when the request asks for a single deterministic forecast with sufficient data",
    requiredInputs: ["decision horizon", "material uncertainties"], methodology: "Identify critical uncertainties, create internally coherent scenarios, test strategic options in each, and separate robust actions from scenario-contingent bets."
  },
  {
    id: "strategic-option-generation", name: "Strategic option generation", domain: "strategy", subdomain: "option-design", status: "partial",
    summary: "Generate materially different strategic alternatives from the objective, constraints, evidence, and capabilities instead of merely varying wording around one idea.",
    businessQuestion: "What genuinely different strategic options are available before a choice is made?", trigger: "generate strategic alternatives", antiTrigger: "when the user has explicitly requested execution of one already-selected option only",
    requiredInputs: ["decision objective", "material constraints"], methodology: "Generate options through distinct strategic mechanisms, screen obvious infeasibilities, and preserve differences in economics, capabilities, timing, and risk."
  },
  {
    id: "strategic-option-comparison", name: "Strategic option comparison", domain: "strategy", subdomain: "option-selection", status: "partial",
    summary: "Compare strategic alternatives against explicit evidence-backed criteria, tradeoffs, uncertainty, dependencies, and sensitivity rather than relying on narrative preference.",
    businessQuestion: "Which strategic option best meets the decision criteria and why?", trigger: "compare strategic alternatives", antiTrigger: "when viable alternatives have not yet been defined",
    requiredInputs: ["strategic alternatives", "decision criteria"], methodology: "Normalize alternatives, compare evidence against explicit criteria, test material tradeoffs and assumptions, and explain the decision logic."
  },
  {
    id: "turnaround-strategy", name: "Turnaround strategy assessment", domain: "strategy", subdomain: "turnaround", status: "partial",
    summary: "Diagnose performance deterioration and structure stabilization, liquidity, operating, portfolio, and growth actions in an evidence-based turnaround sequence.",
    businessQuestion: "What combination and sequence of actions can restore viability or performance?", trigger: "develop a business turnaround strategy", antiTrigger: "when performance is healthy and the request is ordinary growth planning",
    requiredInputs: ["performance problem", "constraints and available evidence"], methodology: "Separate immediate stabilization from structural causes, prioritize cash and operational levers, test strategic options, and sequence actions by urgency and dependency.", riskClass: "elevated"
  },
  {
    id: "diversification-analysis", name: "Diversification analysis", domain: "strategy", subdomain: "portfolio-growth", status: "partial",
    summary: "Evaluate expansion into new businesses or categories through adjacency, capability reuse, economics, integration burden, cannibalization, and portfolio risk.",
    businessQuestion: "Should the organization diversify into this new business or category?", trigger: "evaluate diversification into a new business", antiTrigger: "when the proposed growth remains within the existing market and offering",
    requiredInputs: ["diversification option", "current business capabilities"], methodology: "Assess strategic adjacency, transferable capabilities, market economics, capital needs, integration complexity, and downside risk."
  },
  {
    id: "competitive-response", name: "Competitive response planning", domain: "strategy", subdomain: "competitive-strategy", status: "partial",
    summary: "Design proportional strategic responses to competitor moves by testing threat mechanism, likely reactions, customer impact, economics, timing, and escalation risk.",
    businessQuestion: "How should the organization respond to a material competitor action?", trigger: "plan a response to a competitor move", antiTrigger: "when no competitor action or threat has been identified",
    requiredInputs: ["competitor action", "organization objective"], methodology: "Verify the competitor move, identify the threat pathway, generate response options, anticipate reactions, and compare value, timing, reversibility, and risk.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "operating-model-alignment", name: "Operating model alignment", domain: "strategy", subdomain: "operating-model", status: "partial",
    summary: "Assess whether structure, processes, decision rights, capabilities, technology, measures, and governance can actually execute the chosen strategy.",
    businessQuestion: "What operating-model changes are required to execute the strategy?", trigger: "align operating model to strategy", antiTrigger: "when the request concerns only organization chart cosmetics",
    requiredInputs: ["strategy or strategic priorities", "current operating model evidence"], methodology: "Translate strategic requirements into operating capabilities, compare them with the current model, and identify prioritized design gaps and dependencies."
  },
  {
    id: "strategic-risk", name: "Strategic risk assessment", domain: "strategy", subdomain: "strategic-risk", status: "partial",
    summary: "Identify strategic assumptions, external exposures, execution dependencies, option-specific downside, and leading indicators that could invalidate the plan.",
    businessQuestion: "What could cause this strategy to fail or destroy value, and how would we know early?", trigger: "assess strategic risks to a plan", antiTrigger: "when the request is limited to operational incident hazards",
    requiredInputs: ["strategy or strategic option"], methodology: "Trace strategic objectives to critical assumptions and dependencies, assess consequence and detectability, and define monitoring or treatment actions.", riskClass: "elevated"
  },
  {
    id: "tam-sam-som", name: "TAM / SAM / SOM framing", domain: "market", subdomain: "market-definition", status: "partial",
    summary: "Define total, serviceable, and realistically obtainable market boundaries with explicit customer, geography, offering, channel, and time assumptions.",
    businessQuestion: "What market is theoretically available, serviceable, and realistically obtainable?", trigger: "frame TAM SAM and SOM", antiTrigger: "when the user only needs current revenue from an existing customer list",
    requiredInputs: ["offering", "target customer definition"], methodology: "Define non-overlapping market boundaries first, then quantify only where adequate evidence exists and expose every material assumption.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "market-sizing", name: "Market sizing", domain: "market", subdomain: "market-size", status: "partial",
    summary: "Estimate market scale using top-down, bottom-up, or triangulated methods with normalized definitions, explicit assumptions, and source-backed inputs.",
    businessQuestion: "How large is the defined market under defensible assumptions?", trigger: "estimate the size of a market", antiTrigger: "when the market boundary is still undefined",
    requiredInputs: ["market definition"], methodology: "Choose the strongest available sizing method, normalize units and periods, show assumptions and formulas, and triangulate when independent evidence improves reliability.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "competitive-benchmark", name: "Competitive benchmarking", domain: "market", subdomain: "competitive-benchmarking", status: "partial",
    summary: "Compare competitors on normalized decision-relevant dimensions such as positioning, capabilities, economics, customer value, execution, and evidence strength.",
    businessQuestion: "How do relevant competitors compare on the dimensions that matter to this decision?", trigger: "benchmark competitors", antiTrigger: "when the request is only to summarize one competitor",
    requiredInputs: ["comparison objective", "competitor set or discovery scope"], methodology: "Define comparable dimensions, normalize evidence and definitions, compare like with like, and distinguish missing evidence from poor performance.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "three-c", name: "3C analysis", domain: "market", subdomain: "market-fit", status: "partial",
    summary: "Integrate company capabilities, customer needs, and competitor alternatives to identify where an offering has credible market fit and differentiation.",
    businessQuestion: "Where do company strengths, customer value, and competitive whitespace intersect?", trigger: "analyze company customer and competitor fit", antiTrigger: "when evidence exists for only one of the three perspectives",
    requiredInputs: ["company context", "customer context", "competitor context"], methodology: "Evaluate company, customer, and competitor evidence separately, then synthesize only intersections that are supported across the three perspectives."
  },
  {
    id: "market-attractiveness", name: "Market attractiveness", domain: "market", subdomain: "market-selection", status: "partial",
    summary: "Assess demand, growth, economics, competition, barriers, regulation, risk, and strategic fit to determine whether a market merits investment.",
    businessQuestion: "Is this market attractive enough to justify investment relative to alternatives?", trigger: "evaluate market attractiveness", antiTrigger: "when the request only asks how large the market is",
    requiredInputs: ["defined market", "decision objective"], methodology: "Evaluate demand, economics, structure, barriers, risk, and fit using normalized evidence, then explain the tradeoffs driving the conclusion.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "entry-strategy", name: "Market entry analysis", domain: "market", subdomain: "market-entry", status: "partial",
    summary: "Compare entry modes, sequencing, capabilities, economics, channels, barriers, partnerships, risks, and validation gates for a target market.",
    businessQuestion: "How should the organization enter the selected market?", trigger: "choose a market entry approach", antiTrigger: "when market attractiveness has not been established and the request is whether to enter at all",
    requiredInputs: ["target market", "entry objective"], methodology: "Generate feasible entry modes, compare control, speed, investment, capability, economics, barriers, and risk, then sequence validation and commitment."
  },
  {
    id: "market-maturity", name: "Market maturity assessment", domain: "market", subdomain: "market-lifecycle", status: "partial",
    summary: "Assess demand growth, penetration, consolidation, innovation cadence, pricing pressure, channel stability, and customer behavior to characterize market maturity.",
    businessQuestion: "What stage of maturity is this market in and what does that imply strategically?", trigger: "assess market maturity", antiTrigger: "when the request is solely for a product lifecycle inside one company",
    requiredInputs: ["market definition"], methodology: "Triangulate lifecycle signals rather than assigning a stage from one metric, then connect maturity characteristics to strategic implications.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "market-barrier-analysis", name: "Market barrier analysis", domain: "market", subdomain: "entry-barriers", status: "partial",
    summary: "Identify regulatory, capital, scale, channel, switching, technology, data, brand, capability, and relationship barriers that constrain market entry or expansion.",
    businessQuestion: "Which barriers could prevent or materially delay successful entry or expansion?", trigger: "identify market entry barriers", antiTrigger: "when the request concerns internal implementation blockers after entry",
    requiredInputs: ["target market", "proposed entry scope"], methodology: "Identify barrier mechanisms, verify materiality, assess controllability and timing, and distinguish structural barriers from solvable execution constraints.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "substitute-analysis", name: "Substitute analysis", domain: "market", subdomain: "substitutes", status: "partial",
    summary: "Identify alternative ways customers solve the same job and assess switching logic, relative value, price-performance, convenience, and disruption risk.",
    businessQuestion: "Which substitutes compete for the customer's underlying job, even outside the obvious category?", trigger: "analyze product or service substitutes", antiTrigger: "when the request is limited to direct named competitors",
    requiredInputs: ["customer job or use case"], methodology: "Start from the customer job, identify alternative solution mechanisms, compare switching drivers and economics, and prioritize material substitution threats.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "whitespace-analysis", name: "Market whitespace analysis", domain: "market", subdomain: "opportunity-space", status: "partial",
    summary: "Find underserved combinations of customer need, segment, geography, use case, channel, price point, or capability where evidence suggests an opportunity gap.",
    businessQuestion: "Where are meaningful unmet or underserved spaces in the market?", trigger: "identify market whitespace opportunities", antiTrigger: "when no customer or competitor evidence is available",
    requiredInputs: ["market scope", "customer or competitor evidence"], methodology: "Map served and underserved demand dimensions, separate absence of evidence from true whitespace, and test opportunity fit against economics and capabilities.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "competitor-feature-normalization", name: "Competitor feature normalization", domain: "market", subdomain: "competitive-normalization", status: "partial",
    summary: "Normalize competitor feature claims into comparable customer-relevant capabilities, scope, availability, limitations, and evidence rather than counting marketing labels.",
    businessQuestion: "Which competitor capabilities are truly comparable on a like-for-like basis?", trigger: "normalize competitor features", antiTrigger: "when the request needs pricing normalization rather than functional comparison",
    requiredInputs: ["competitor offerings", "comparison scope"], methodology: "Translate claims into normalized capability definitions, record scope and caveats, and mark missing or incomparable evidence explicitly.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "competitor-price-normalization", name: "Competitor price normalization", domain: "market", subdomain: "competitive-pricing", status: "partial",
    summary: "Normalize competitor prices across units, bundles, contract periods, tiers, usage bases, discounts, and included value so comparisons are economically meaningful.",
    businessQuestion: "How do competitor prices compare after normalizing commercial terms and included value?", trigger: "normalize competitor pricing", antiTrigger: "when the request is to set our own price without competitor comparison",
    requiredInputs: ["competitor price evidence", "normalization basis"], methodology: "Convert prices to comparable units and periods, account for bundles and constraints, and separate observed list price from inferred effective economics.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "market-trend-synthesis", name: "Market trend synthesis", domain: "market", subdomain: "market-trends", status: "partial",
    summary: "Synthesize corroborated changes in demand, technology, regulation, competition, channels, costs, and customer behavior into decision-relevant market trends.",
    businessQuestion: "Which current market trends are material to the decision and what direction do they imply?", trigger: "synthesize current market trends", antiTrigger: "when the user requests historical facts with no decision implication",
    requiredInputs: ["market scope", "decision horizon"], methodology: "Collect current evidence, separate enduring shifts from noise, reconcile conflicting indicators, and connect only supported trends to implications.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "public-competitive-intelligence", name: "Public competitive intelligence", domain: "market", subdomain: "competitive-intelligence", status: "partial",
    summary: "Build a sourced competitor fact base from openly accessible evidence while separating verified facts, company claims, inference, and unresolved gaps.",
    businessQuestion: "What can be defensibly established about competitors from public evidence?", trigger: "research competitors using public evidence", antiTrigger: "when the request requires private or nonpublic competitor information",
    requiredInputs: ["competitive question or target set"], methodology: "Use current public sources, rank evidence quality, reconcile contradictions, classify claims epistemically, and avoid pretending public gaps are known facts.", evidenceLevel: "authoritative-primary-preferred", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "opportunity-assessment", name: "Market opportunity assessment", domain: "market", subdomain: "opportunity-assessment", status: "partial",
    summary: "Integrate demand, customer need, market economics, competition, strategic fit, capability requirements, risks, and timing into an investment-oriented opportunity assessment.",
    businessQuestion: "Is this opportunity sufficiently attractive and feasible to pursue?", trigger: "assess a market opportunity", antiTrigger: "when the user needs only one underlying component such as market size",
    requiredInputs: ["opportunity definition", "decision objective"], methodology: "Combine distinct demand, economics, competition, fit, capability, timing, and risk evidence into a decision-oriented assessment without double-counting overlapping frameworks.", evidenceLevel: "current-external-evidence"
  }
];

export const strategyMarketCapabilities = seeds.map(defineStandardCapability);
