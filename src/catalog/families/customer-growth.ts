import { defineStandardCapability, type StandardCapabilitySeed } from "../define.js";

const seeds: readonly StandardCapabilitySeed[] = [
  {
    id: "segmentation", name: "Customer segmentation", domain: "customer", subdomain: "segmentation", status: "partial",
    summary: "Group customers using meaningful needs, behaviors, economics, value, or contexts and test whether resulting segments are distinct, measurable, and actionable.",
    businessQuestion: "Which customer groups differ enough to justify different strategies or offers?", trigger: "segment customers into actionable groups", antiTrigger: "when the request is to profile one already-defined customer group",
    requiredInputs: ["customer evidence or segmentation objective"], methodology: "Choose segmentation variables tied to the decision, test segment distinctness and usefulness, and avoid inventing traits unsupported by evidence."
  },
  {
    id: "ideal-customer-profile", name: "Ideal customer profile", domain: "customer", subdomain: "targeting", status: "partial",
    summary: "Define organization or customer characteristics associated with strongest fit, value, economics, retention, and serviceability without inventing unsupported attributes.",
    businessQuestion: "Which customer characteristics define the strongest target fit?", trigger: "define an ideal customer profile", antiTrigger: "when the request is to create a fictional persona without evidence",
    requiredInputs: ["offering", "fit objective"], methodology: "Synthesize evidence on need, value, economics, retention, operational fit, and disqualifiers into a testable target profile."
  },
  {
    id: "evidence-supported-persona", name: "Evidence-supported persona", domain: "customer", subdomain: "persona", status: "partial",
    summary: "Create a human-readable customer archetype only from supplied or researched evidence, explicitly distinguishing observed patterns from assumptions and illustrative details.",
    businessQuestion: "How can a real customer segment be represented in a usable human-centered profile without fictionalizing facts?", trigger: "create a customer persona from evidence", antiTrigger: "when no customer evidence exists and fictional storytelling is not explicitly requested",
    requiredInputs: ["customer evidence or validated segment"], methodology: "Summarize recurring needs, behaviors, contexts, objections, and success criteria; label assumptions and omit unsupported demographic decoration."
  },
  {
    id: "jobs-to-be-done", name: "Jobs-to-be-done analysis", domain: "customer", subdomain: "customer-jobs", status: "partial",
    summary: "Identify the functional, social, and emotional progress customers are trying to make, including circumstances, alternatives, tradeoffs, and success criteria.",
    businessQuestion: "What progress is the customer actually trying to make and what alternatives compete for that job?", trigger: "analyze the customer's job to be done", antiTrigger: "when the request is only to list product features",
    requiredInputs: ["customer context or research evidence"], methodology: "Start from circumstances and desired progress, identify current alternatives and tradeoffs, and separate the underlying job from the proposed solution."
  },
  {
    id: "customer-journey", name: "Customer journey analysis", domain: "customer", subdomain: "journey", status: "partial",
    summary: "Map customer stages, goals, decisions, touchpoints, evidence, friction, emotions where supported, handoffs, and improvement opportunities across an experience.",
    businessQuestion: "Where does the customer experience create friction, uncertainty, or lost value across the journey?", trigger: "map and analyze the customer journey", antiTrigger: "when the request concerns only backstage internal process steps",
    requiredInputs: ["journey scope", "customer evidence"], methodology: "Map stages around customer goals rather than company departments, attach evidence to friction points, and prioritize moments that materially affect outcomes."
  },
  {
    id: "service-blueprint", name: "Service blueprint", domain: "customer", subdomain: "service-design", status: "partial",
    summary: "Connect customer-facing journey steps to frontline actions, backstage processes, systems, evidence, handoffs, and failure points to diagnose service delivery.",
    businessQuestion: "Which backstage processes and systems enable or undermine the customer experience?", trigger: "build a service blueprint", antiTrigger: "when the request is only a customer journey with no operational linkage",
    requiredInputs: ["service journey scope"], methodology: "Align customer actions with visible service, backstage operations, supporting systems, and evidence, then identify cross-layer failure points and ownership gaps.", outputs: ["text", "structured-model", "diagram"]
  },
  {
    id: "voice-of-customer", name: "Voice-of-customer synthesis", domain: "customer", subdomain: "customer-research", status: "partial",
    summary: "Synthesize supplied customer statements and observations into recurring needs, language, objections, pain points, desired outcomes, and evidence-backed themes.",
    businessQuestion: "What are customers consistently communicating, and which themes matter to the decision?", trigger: "synthesize voice of customer evidence", antiTrigger: "when no customer statements observations reviews or research are available",
    requiredInputs: ["customer evidence"], methodology: "Code evidence into themes, preserve representative language without overgeneralizing, quantify prevalence only when sampling supports it, and surface contradictions."
  },
  {
    id: "customer-needs-analysis", name: "Customer needs analysis", domain: "customer", subdomain: "needs", status: "partial",
    summary: "Prioritize customer needs by importance, current satisfaction, context, alternatives, consequences, and evidence strength rather than treating all stated wants equally.",
    businessQuestion: "Which customer needs are most important and insufficiently served?", trigger: "prioritize customer needs", antiTrigger: "when the user only asks for solution brainstorming without customer evidence",
    requiredInputs: ["customer need evidence"], methodology: "Separate needs from requested features, assess importance and current fulfillment, identify tradeoffs, and rank opportunities with evidence strength."
  },
  {
    id: "pricing-strategy", name: "Pricing strategy analysis", domain: "customer", subdomain: "pricing", status: "partial",
    summary: "Evaluate pricing logic through customer value, willingness-to-pay evidence, costs, competitive context, segmentation, packaging, strategic goals, and downside risks.",
    businessQuestion: "What pricing approach best balances customer value, economics, positioning, and strategic objectives?", trigger: "develop or evaluate pricing strategy", antiTrigger: "when the request is only to normalize competitor prices",
    requiredInputs: ["offering", "pricing objective"], methodology: "Triangulate value, customer evidence, economics, competition, and strategic positioning; distinguish pricing architecture from the numerical price point."
  },
  {
    id: "packaging-analysis", name: "Packaging analysis", domain: "customer", subdomain: "packaging", status: "partial",
    summary: "Design or evaluate bundles, tiers, entitlements, fences, usage dimensions, and upgrade paths so packaging aligns customer value with commercial economics.",
    businessQuestion: "How should features or services be grouped into packages or tiers?", trigger: "design or evaluate product packaging", antiTrigger: "when only the base price level is being analyzed",
    requiredInputs: ["offering components", "customer or commercial objective"], methodology: "Map value drivers and segment differences to package boundaries, identify complexity and cannibalization risks, and test upgrade logic."
  },
  {
    id: "willingness-to-pay-evidence", name: "Willingness-to-pay evidence assessment", domain: "customer", subdomain: "pricing-research", status: "partial",
    summary: "Assess the strength and interpretation of direct and indirect willingness-to-pay evidence without inventing price sensitivity or treating weak proxies as measured demand.",
    businessQuestion: "What does the available evidence actually support about willingness to pay?", trigger: "assess willingness to pay evidence", antiTrigger: "when no pricing or customer-choice evidence is available",
    requiredInputs: ["pricing research or observed choice evidence"], methodology: "Classify evidence by method and bias risk, normalize context, distinguish stated from revealed preferences, and bound conclusions to supported ranges."
  },
  {
    id: "positioning", name: "Positioning analysis", domain: "customer", subdomain: "positioning", status: "partial",
    summary: "Clarify target audience, competitive alternatives, differentiated value, reasons to believe, category context, and unsupported positioning claims.",
    businessQuestion: "How should this offering be positioned relative to customer needs and alternatives?", trigger: "develop or assess market positioning", antiTrigger: "when the request is only to draft advertising copy",
    requiredInputs: ["offering", "target customer or market"], methodology: "Connect target need to relevant alternatives, identify defensible differentiation and proof, and test whether the position is clear, credible, and valuable."
  },
  {
    id: "product-market-fit", name: "Product-market fit assessment", domain: "customer", subdomain: "product-market-fit", status: "partial",
    summary: "Evaluate demand, retention, engagement, customer pull, alternatives, satisfaction, willingness to pay, and evidence gaps to assess product-market fit signals.",
    businessQuestion: "How strong is the evidence that this offering solves a valuable problem for a sustainable market?", trigger: "assess product market fit", antiTrigger: "when the offering has not yet been exposed to any customers and the request is purely concept ideation",
    requiredInputs: ["customer and market evidence"], methodology: "Triangulate behavioral, economic, qualitative, and retention signals; distinguish promising evidence from proof and identify the highest-value validation gaps."
  },
  {
    id: "funnel", name: "Funnel analysis", domain: "growth", subdomain: "funnel", status: "partial",
    summary: "Analyze stage volumes, conversion, drop-off, segment differences, timing, measurement quality, and bottlenecks across a defined acquisition or process funnel.",
    businessQuestion: "Where in the funnel is performance being lost and which segments or stages explain it?", trigger: "analyze funnel conversion and drop off", antiTrigger: "when stages are undefined or data cannot be mapped consistently",
    requiredInputs: ["funnel stages", "stage data"], methodology: "Validate stage definitions and denominators, calculate conversion consistently, segment material differences, and distinguish measurement gaps from true performance loss."
  },
  {
    id: "cohort", name: "Cohort and retention analysis", domain: "growth", subdomain: "cohort", status: "partial",
    summary: "Compare customer behavior across acquisition or start cohorts to distinguish retention changes, lifecycle effects, seasonality, and acquisition-quality differences.",
    businessQuestion: "How does behavior differ by cohort over comparable lifecycle periods?", trigger: "compare customer cohorts over time", antiTrigger: "when records lack a defensible cohort anchor or comparable observation window",
    requiredInputs: ["cohort anchor", "time-indexed customer data"], methodology: "Define cohorts and lifecycle windows consistently, calculate comparable metrics, separate calendar from tenure effects, and expose incomplete cohorts."
  },
  {
    id: "retention-analysis", name: "Retention analysis", domain: "growth", subdomain: "retention", status: "partial",
    summary: "Measure and diagnose continued customer, subscriber, employee, or account participation using explicit retention definitions, time windows, segments, and drivers.",
    businessQuestion: "Who is being retained, at what rate, over what period, and what factors are associated with retention?", trigger: "analyze retention performance", antiTrigger: "when the requested outcome is acquisition conversion rather than continued participation",
    requiredInputs: ["retention definition", "entity and time data"], methodology: "Define denominator and observation window, calculate retention by meaningful segments, inspect timing and drivers, and separate correlation from causation."
  },
  {
    id: "churn-analysis", name: "Churn analysis", domain: "growth", subdomain: "churn", status: "partial",
    summary: "Measure and diagnose customer or account loss using explicit churn definitions, timing, reason evidence, segments, tenure, economics, and preventability.",
    businessQuestion: "Where is churn concentrated, when does it occur, and which supported drivers or reasons matter most?", trigger: "analyze customer churn", antiTrigger: "when the business has no meaningful loss or cancellation event definition",
    requiredInputs: ["churn definition", "customer or account history"], methodology: "Validate churn events and exposure, segment rates and timing, combine reason evidence with behavior, and avoid causal claims unsupported by design."
  },
  {
    id: "sales-pipeline-diagnostic", name: "Sales pipeline diagnostic", domain: "growth", subdomain: "sales-pipeline", status: "partial",
    summary: "Assess pipeline coverage, stage conversion, velocity, aging, concentration, slippage, win/loss evidence, and forecast hygiene to identify sales execution constraints.",
    businessQuestion: "What is constraining pipeline conversion, velocity, or forecast reliability?", trigger: "diagnose sales pipeline performance", antiTrigger: "when only top-of-funnel marketing traffic is in scope",
    requiredInputs: ["pipeline stages", "opportunity data"], methodology: "Validate stage definitions and timestamps, calculate coverage and flow metrics, segment performance, identify aging/slippage patterns, and separate data hygiene from execution issues."
  },
  {
    id: "sales-stage-conversion", name: "Sales stage conversion analysis", domain: "growth", subdomain: "sales-conversion", status: "partial",
    summary: "Measure conversion between defined sales stages with consistent opportunity populations, timing, segment cuts, and leakage diagnostics.",
    businessQuestion: "Which sales-stage transitions lose the most qualified opportunities and for whom?", trigger: "analyze conversion between sales stages", antiTrigger: "when stage definitions changed materially and cannot be normalized",
    requiredInputs: ["sales stage history"], methodology: "Normalize stage transitions, define eligible denominators, calculate transition and fallout rates, and segment by relevant deal or customer attributes."
  },
  {
    id: "sales-territory-analysis", name: "Sales territory analysis", domain: "growth", subdomain: "sales-territory", status: "partial",
    summary: "Evaluate territory potential, account load, coverage, travel or service constraints, historical performance, rep capacity, and balance to support territory design.",
    businessQuestion: "Are sales territories balanced and aligned to opportunity and capacity?", trigger: "evaluate or redesign sales territories", antiTrigger: "when no geographic account or coverage dimension exists",
    requiredInputs: ["territory or account data", "coverage objective"], methodology: "Estimate comparable territory opportunity and workload, normalize rep capacity, identify imbalance and constraints, and test feasible reallocation options."
  },
  {
    id: "channel-mix", name: "Channel mix analysis", domain: "growth", subdomain: "channels", status: "partial",
    summary: "Compare acquisition, sales, or distribution channels using reach, economics, customer quality, incrementality evidence, constraints, scalability, and strategic fit.",
    businessQuestion: "How should effort or investment be allocated across channels?", trigger: "compare channel performance and mix", antiTrigger: "when only one channel exists and no allocation decision is possible",
    requiredInputs: ["channel data", "allocation objective"], methodology: "Normalize channel definitions and attribution limits, compare economics and quality, account for capacity and incrementality, and test allocation tradeoffs."
  },
  {
    id: "acquisition-economics", name: "Acquisition economics analysis", domain: "growth", subdomain: "acquisition-economics", status: "partial",
    summary: "Assess customer acquisition cost, payback, contribution economics, quality, retention linkage, and channel differences with explicit attribution and period assumptions.",
    businessQuestion: "Are customer acquisition economics sustainable, and where do they differ materially?", trigger: "analyze acquisition economics", antiTrigger: "when acquisition cost or acquired-customer outcomes cannot be measured",
    requiredInputs: ["acquisition spend or cost", "acquired customer data"], methodology: "Define attributed cost and cohort consistently, calculate unit economics by useful segment, connect acquisition quality to downstream value, and disclose attribution limits."
  },
  {
    id: "cro", name: "Conversion optimization analysis", domain: "growth", subdomain: "conversion-optimization", status: "partial",
    summary: "Prioritize conversion-improvement hypotheses using observed user friction, evidence strength, expected impact, confidence in mechanism, effort, and testability.",
    businessQuestion: "Which conversion improvements should be tested first and why?", trigger: "prioritize conversion optimization opportunities", antiTrigger: "when no conversion event or user path is defined",
    requiredInputs: ["conversion objective", "behavioral or experience evidence"], methodology: "Locate observed friction, formulate causal hypotheses without treating them as facts, prioritize by evidence and value, and specify measurable tests."
  },
  {
    id: "commercial-growth-plan", name: "Commercial growth plan", domain: "growth", subdomain: "growth-planning", status: "partial",
    summary: "Integrate target segments, value proposition, pricing, channels, sales motion, acquisition economics, retention levers, capabilities, measures, and sequencing into a growth plan.",
    businessQuestion: "What coherent commercial actions should drive growth, in what sequence, and with what measures?", trigger: "build a commercial growth plan", antiTrigger: "when the user asks for one isolated marketing tactic only",
    requiredInputs: ["growth objective", "business context"], methodology: "Synthesize demand, customer, offer, channel, sales, economics, capability, and retention evidence into prioritized initiatives with dependencies and measures."
  },
  {
    id: "offer-architecture", name: "Offer architecture analysis", domain: "growth", subdomain: "offer-design", status: "partial",
    summary: "Assess how products, services, bundles, add-ons, tiers, and commercial pathways fit together to reduce complexity and improve customer choice and economics.",
    businessQuestion: "How should the commercial offer portfolio be structured so customers can understand and progress through it?", trigger: "evaluate offer or product architecture", antiTrigger: "when the request is only to set individual feature entitlements",
    requiredInputs: ["current offers or proposed offer set"], methodology: "Map offer roles, target needs, overlap, progression, economics, and complexity; identify duplication, gaps, and clearer migration or upsell paths."
  }
];

export const customerGrowthCapabilities = seeds.map(defineStandardCapability);
