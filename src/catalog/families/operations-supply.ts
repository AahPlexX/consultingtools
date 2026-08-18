import { defineStandardCapability, type StandardCapabilitySeed } from "../define.js";

const seeds: readonly StandardCapabilitySeed[] = [
  {
    id: "process-map", name: "Process mapping", domain: "operations", subdomain: "process-design", status: "partial",
    summary: "Represent the actual sequence of work, decisions, handoffs, waits, rework, ownership, inputs, and outputs so operational behavior can be diagnosed before redesign.",
    businessQuestion: "How does the process actually work from trigger to outcome?", trigger: "map an operational process", antiTrigger: "when the request is only to visualize a strategy or organization structure",
    requiredInputs: ["process scope"], methodology: "Define start and end points, capture actual steps and decision paths, distinguish work from delay or rework, and identify ownership and evidence gaps.", outputs: ["text", "structured-model", "diagram"]
  },
  {
    id: "sipoc", name: "SIPOC analysis", domain: "operations", subdomain: "process-scope", status: "partial",
    summary: "Frame suppliers, inputs, process, outputs, and customers to establish a shared high-level process boundary before deeper diagnostic or redesign work.",
    businessQuestion: "What are the boundaries and critical upstream/downstream interfaces of this process?", trigger: "define a process using SIPOC", antiTrigger: "when detailed step-level process behavior is already the primary question",
    requiredInputs: ["process name or objective"], methodology: "Define process boundary, identify material suppliers and inputs, summarize core transformation steps, specify outputs and customers, and validate scope consistency."
  },
  {
    id: "value-stream", name: "Value-stream analysis", domain: "operations", subdomain: "flow-efficiency", status: "partial",
    summary: "Distinguish customer-value-creating activity from wait, queue, rework, inventory, handoff, motion, information delay, and other flow friction across an end-to-end stream.",
    businessQuestion: "Where is lead time consumed without creating customer value?", trigger: "analyze a value stream", antiTrigger: "when the request concerns only one isolated task with no end-to-end flow",
    requiredInputs: ["value-stream scope", "process timing or flow evidence when available"], methodology: "Map material flow and information flow, classify time and inventory, calculate flow metrics where supported, and prioritize constraints affecting lead time or quality."
  },
  {
    id: "bottleneck", name: "Constraint and bottleneck analysis", domain: "operations", subdomain: "constraints", status: "partial",
    summary: "Identify the resource, step, policy, information dependency, or demand pattern that limits system throughput and distinguish true constraints from local inefficiency.",
    businessQuestion: "What currently limits end-to-end throughput or service capacity?", trigger: "identify the process bottleneck", antiTrigger: "when the user is only asking which step has the highest unit cost",
    requiredInputs: ["process flow", "demand or throughput evidence"], methodology: "Compare demand with effective capacity across the flow, inspect queues and starvation, test whether the suspected constraint governs system output, and avoid optimizing non-constraints first."
  },
  {
    id: "capacity", name: "Capacity analysis", domain: "operations", subdomain: "capacity", status: "partial",
    summary: "Assess design, effective, and demonstrated capacity against demand while accounting for uptime, staffing, mix, setup, variability, yield, and practical operating constraints.",
    businessQuestion: "Can the operation meet expected demand and where is capacity insufficient or underused?", trigger: "analyze operational capacity", antiTrigger: "when no demand or resource-capacity concept exists",
    requiredInputs: ["demand", "resource capacity or operating-time inputs"], methodology: "Define capacity unit and period, distinguish theoretical from effective capacity, normalize mix and availability, and compare demand with constrained capacity."
  },
  {
    id: "utilization", name: "Utilization analysis", domain: "operations", subdomain: "capacity", status: "planned",
    summary: "Calculate and interpret resource utilization against an explicit available-capacity denominator while distinguishing productive use, planned downtime, idle time, and overload.",
    businessQuestion: "How fully are constrained resources being used relative to available capacity?", trigger: "calculate or analyze utilization", antiTrigger: "when available capacity cannot be defined consistently",
    requiredInputs: ["used capacity", "available capacity"], methodology: "Define numerator and denominator consistently by resource and period, calculate utilization, segment causes of non-use, and avoid treating maximum utilization as automatically optimal."
  },
  {
    id: "throughput", name: "Throughput analysis", domain: "operations", subdomain: "flow-performance", status: "planned",
    summary: "Measure units, cases, transactions, or value completed per unit time and diagnose how constraints, yield, variability, rework, and demand affect end-to-end output.",
    businessQuestion: "What end-to-end output rate is achieved and what limits it?", trigger: "calculate or analyze throughput", antiTrigger: "when the request concerns work-in-process levels without an output-rate question",
    requiredInputs: ["completed output", "measurement period"], methodology: "Define completion and time window, calculate system output consistently, compare against demand and constraint capacity, and separate local activity from end-to-end throughput."
  },
  {
    id: "cycle-time", name: "Cycle-time analysis", domain: "operations", subdomain: "flow-performance", status: "partial",
    summary: "Measure elapsed and active time for defined process units, decompose waits and rework, compare distribution and segments, and identify sources of delay or variability.",
    businessQuestion: "How long does the work take and which components explain delay or variability?", trigger: "analyze process cycle time", antiTrigger: "when timestamps or a defensible duration basis are unavailable",
    requiredInputs: ["process start/end or duration evidence"], methodology: "Define cycle boundaries, separate touch from elapsed time when possible, analyze distribution not only averages, segment material drivers, and inspect rework or queue effects."
  },
  {
    id: "pareto", name: "Pareto analysis", domain: "operations", subdomain: "prioritization", status: "partial",
    summary: "Rank categories by observed contribution to count, cost, delay, defects, complaints, or another impact measure to focus attention on the dominant sources.",
    businessQuestion: "Which categories account for the largest share of the observed problem or impact?", trigger: "run a Pareto analysis", antiTrigger: "when category frequencies or impacts are not measured",
    requiredInputs: ["categorized observations", "impact measure"], methodology: "Validate category definitions, aggregate impact consistently, sort descending, calculate cumulative share, and avoid assuming the largest category is the root cause."
  },
  {
    id: "five-whys", name: "Five Whys root-cause analysis", domain: "operations", subdomain: "root-cause", status: "partial",
    summary: "Trace plausible causal chains from an observed problem toward underlying mechanisms while clearly distinguishing evidence, hypotheses, and branches that require validation.",
    businessQuestion: "What causal mechanisms may explain this observed problem beyond the immediate symptom?", trigger: "perform a Five Whys analysis", antiTrigger: "when the user already has statistically validated causal evidence and needs solution design instead",
    requiredInputs: ["specific observed problem"], methodology: "Ask evidence-seeking causal questions iteratively, allow branching where multiple mechanisms exist, stop when evidence is insufficient, and label unverified causes as hypotheses."
  },
  {
    id: "fishbone", name: "Cause-and-effect analysis", domain: "operations", subdomain: "root-cause", status: "partial",
    summary: "Organize plausible causes into a structured cause-and-effect tree or fishbone so hypotheses can be prioritized and tested rather than mistaken for proven causes.",
    businessQuestion: "What categories of potential causes should be investigated for this problem?", trigger: "build a fishbone or cause and effect analysis", antiTrigger: "when the request is for a quantified Pareto ranking of already observed causes",
    requiredInputs: ["specific effect or problem"], methodology: "Define the effect precisely, brainstorm plausible causal categories without asserting proof, identify interactions, and rank validation needs by plausibility and impact.", outputs: ["text", "structured-model", "diagram"]
  },
  {
    id: "fmea", name: "Failure mode and effects analysis", domain: "operations", subdomain: "quality-risk", status: "partial",
    summary: "Assess process or design failure modes, effects, causes, existing controls, likelihood, severity, detectability, and treatment priorities with transparent scoring assumptions.",
    businessQuestion: "Which failure modes create the greatest risk and what controls or actions should be prioritized?", trigger: "perform an FMEA", antiTrigger: "when the request concerns strategic portfolio risk rather than process or design failures",
    requiredInputs: ["process or design scope", "failure evidence or subject-matter input"], methodology: "Identify failure modes and effects, connect plausible causes and controls, score only with defined scales, prioritize actions, and avoid treating ordinal risk scores as precise probabilities.", riskClass: "elevated"
  },
  {
    id: "waste-analysis", name: "Operational waste analysis", domain: "operations", subdomain: "lean", status: "partial",
    summary: "Identify overproduction, waiting, transport, overprocessing, inventory, motion, defects, and unused capability where they create measurable customer or operating burden.",
    businessQuestion: "Which non-value activities consume the most time, cost, capacity, or quality?", trigger: "identify operational waste", antiTrigger: "when the request concerns only strategic overhead categories with no process evidence",
    requiredInputs: ["process evidence"], methodology: "Observe or map actual work, classify waste by mechanism, quantify burden where evidence permits, and prioritize waste that affects flow, quality, cost, or customer value."
  },
  {
    id: "control-plan", name: "Control plan design", domain: "operations", subdomain: "quality-control", status: "partial",
    summary: "Define critical process or output characteristics, control methods, measurement frequency, ownership, reaction rules, escalation, and evidence retention for sustained performance.",
    businessQuestion: "What controls and reaction rules are needed to sustain the desired process performance?", trigger: "design a process control plan", antiTrigger: "when the process or critical characteristics have not yet been defined",
    requiredInputs: ["process", "critical characteristics or risks"], methodology: "Link critical characteristics to measurement and control points, assign ownership and frequency, define thresholds and reaction plans, and align controls to known failure modes."
  },
  {
    id: "operational-kpi", name: "Operational KPI design", domain: "operations", subdomain: "performance-management", status: "partial",
    summary: "Define operational measures that connect controllable process drivers to customer, quality, cost, delivery, capacity, and outcome performance with clear formulas and ownership.",
    businessQuestion: "Which operational measures will reveal whether the process is performing and why?", trigger: "design operational KPIs", antiTrigger: "when the request is for enterprise-level strategic objectives rather than process measures",
    requiredInputs: ["process objective", "desired outcomes"], methodology: "Start from outcome definitions, identify controllable drivers, define formula and grain, assign owner and cadence, and avoid redundant or easily gamed measures."
  },
  {
    id: "productivity-analysis", name: "Productivity analysis", domain: "operations", subdomain: "productivity", status: "partial",
    summary: "Compare output to labor, equipment, time, cost, or multi-factor inputs while normalizing mix, quality, utilization, and period effects that can distort simple ratios.",
    businessQuestion: "How efficiently are resources being converted into acceptable output, and what explains changes?", trigger: "analyze productivity", antiTrigger: "when output quality or input quantities cannot be defined",
    requiredInputs: ["output measure", "input resource measure"], methodology: "Define comparable output and input units, calculate productivity by meaningful segments, normalize mix and quality, and decompose drivers of change."
  },
  {
    id: "service-process-redesign", name: "Service process redesign", domain: "operations", subdomain: "service-operations", status: "partial",
    summary: "Redesign service flow, roles, handoffs, decision rules, channels, automation, controls, and customer touchpoints to improve experience and operating performance together.",
    businessQuestion: "How should the service process change to improve customer and operational outcomes?", trigger: "redesign a service process", antiTrigger: "when the current process and failure points have not been understood",
    requiredInputs: ["current service process", "target outcomes"], methodology: "Start from validated current-state friction, define design principles, generate future-state options, test customer/operational tradeoffs, and sequence implementation."
  },
  {
    id: "vendor-evaluation", name: "Vendor evaluation", domain: "operations", subdomain: "vendor-management", status: "partial",
    summary: "Compare vendors using explicit weighted or qualitative criteria, evidence quality, service, risk, switching cost, economics, capability, implementation burden, and strategic fit.",
    businessQuestion: "Which vendor best meets the decision requirements and tradeoffs?", trigger: "evaluate or compare vendors", antiTrigger: "when the user needs only a purchase-price comparison with no vendor-selection decision",
    requiredInputs: ["vendor options", "selection criteria"], methodology: "Normalize vendor claims and commercial terms, score only where evidence supports it, include risk and switching effects, and test sensitivity to material criteria weights."
  },
  {
    id: "demand-supply-diagnostic", name: "Demand-supply diagnostic", domain: "supply-chain", subdomain: "planning", status: "partial",
    summary: "Compare demand patterns with supply, capacity, inventory, lead times, service targets, constraints, and planning assumptions to diagnose imbalance and planning failure modes.",
    businessQuestion: "Where and why are demand and supply out of balance?", trigger: "diagnose demand and supply imbalance", antiTrigger: "when the request is solely a long-term market-demand forecast",
    requiredInputs: ["demand evidence", "supply or capacity evidence"], methodology: "Normalize time buckets and units, compare demand with available and constrained supply, identify timing and mix mismatches, and distinguish forecast error from execution constraints."
  },
  {
    id: "inventory-analysis", name: "Inventory analysis", domain: "supply-chain", subdomain: "inventory", status: "partial",
    summary: "Assess inventory levels, turns, days, aging, availability, excess, obsolescence, stockouts, service impact, segmentation, and working-capital implications.",
    businessQuestion: "Is inventory positioned at the right levels and where is it excessive, obsolete, or insufficient?", trigger: "analyze inventory performance", antiTrigger: "when the operating model has no physical or analogous inventory",
    requiredInputs: ["inventory balances", "demand or usage evidence"], methodology: "Normalize item and time definitions, segment inventory by value and demand behavior, calculate relevant velocity and service measures, and connect excess or shortage to drivers."
  },
  {
    id: "safety-stock-analysis", name: "Safety-stock analysis", domain: "supply-chain", subdomain: "inventory-policy", status: "planned",
    summary: "Estimate or assess safety stock from demand variability, replenishment lead-time variability, service targets, review policy, and distribution assumptions with explicit model limitations.",
    businessQuestion: "How much protective inventory is needed for the stated uncertainty and service target?", trigger: "calculate or assess safety stock", antiTrigger: "when variability, lead time, or service policy cannot be defined",
    requiredInputs: ["demand variability", "lead time", "service target"], methodology: "Select a formula appropriate to demand and lead-time assumptions, calculate protective stock, test sensitivity, and avoid false precision when distributions or independence assumptions are weak."
  },
  {
    id: "supplier-segmentation", name: "Supplier segmentation", domain: "supply-chain", subdomain: "supplier-strategy", status: "partial",
    summary: "Segment suppliers by spend, criticality, substitutability, risk, innovation, switching burden, market power, and strategic importance to tailor management approaches.",
    businessQuestion: "Which suppliers require transactional, leverage, bottleneck, or strategic management approaches?", trigger: "segment suppliers for sourcing strategy", antiTrigger: "when the request is to select among vendors for one purchase only",
    requiredInputs: ["supplier base or supplier evidence"], methodology: "Choose segmentation dimensions tied to sourcing decisions, normalize supplier evidence, identify criticality and alternatives, and assign management implications rather than labels alone."
  },
  {
    id: "sourcing-strategy", name: "Sourcing strategy", domain: "supply-chain", subdomain: "sourcing", status: "partial",
    summary: "Develop sourcing approaches using demand, supply-market structure, supplier power, specifications, total cost, risk, competition, switching, contracting, and capability considerations.",
    businessQuestion: "What sourcing approach best balances value, resilience, competition, and implementation feasibility?", trigger: "develop a sourcing strategy", antiTrigger: "when the request is merely to issue a purchase order or compare one quote",
    requiredInputs: ["category or requirement", "sourcing objective"], methodology: "Define demand and category requirements, analyze supply market and risks, generate sourcing levers, compare total value and feasibility, and sequence supplier engagement."
  },
  {
    id: "procurement-opportunity", name: "Procurement opportunity analysis", domain: "supply-chain", subdomain: "procurement", status: "partial",
    summary: "Identify savings, specification, demand-management, consolidation, competition, payment-term, process, and supplier-performance opportunities across procurement spend.",
    businessQuestion: "Where are the largest defensible procurement value opportunities and what mechanisms create them?", trigger: "identify procurement savings or value opportunities", antiTrigger: "when no spend supplier or category evidence is available",
    requiredInputs: ["spend or category evidence"], methodology: "Segment spend, identify price and non-price levers, distinguish theoretical from addressable opportunity, account for implementation constraints, and prevent double counting."
  },
  {
    id: "lead-time-analysis", name: "Lead-time analysis", domain: "supply-chain", subdomain: "lead-time", status: "partial",
    summary: "Measure end-to-end replenishment or fulfillment lead time, its distribution, stage contributions, variability, queues, supplier effects, and service implications.",
    businessQuestion: "Where is lead time created and what drives its variability?", trigger: "analyze supply or fulfillment lead times", antiTrigger: "when no start/end event or lead-time definition exists",
    requiredInputs: ["lead-time events or durations"], methodology: "Define lead-time boundary, analyze distribution and stages, separate average from tail risk, segment suppliers/items, and identify controllable versus structural components."
  },
  {
    id: "service-level-tradeoff", name: "Service-level tradeoff analysis", domain: "supply-chain", subdomain: "service-policy", status: "partial",
    summary: "Compare customer service targets with inventory, capacity, expedite, lost-sales, working-capital, and operational cost consequences under explicit demand and policy assumptions.",
    businessQuestion: "What service level best balances customer outcomes, cost, inventory, and resilience?", trigger: "analyze supply chain service level tradeoffs", antiTrigger: "when no service metric or cost consequence can be defined",
    requiredInputs: ["service metric", "cost or inventory consequences"], methodology: "Define service measure and target options, quantify supported cost and inventory effects, include downside and customer implications, and identify diminishing returns."
  },
  {
    id: "network-cost-diagnostic", name: "Supply-network cost diagnostic", domain: "supply-chain", subdomain: "network", status: "partial",
    summary: "Diagnose how locations, lanes, modes, shipment profiles, sourcing, inventory positioning, handling, service targets, and constraints drive supply-network cost.",
    businessQuestion: "Which network design or flow characteristics are driving logistics and fulfillment cost?", trigger: "diagnose supply network costs", antiTrigger: "when the request is a full optimization model without network data",
    requiredInputs: ["network nodes or lanes", "cost and flow evidence"], methodology: "Normalize flow and cost units, decompose cost by node lane mode and driver, identify structural versus execution effects, and prioritize high-value redesign hypotheses."
  },
  {
    id: "make-buy", name: "Make-versus-buy analysis", domain: "supply-chain", subdomain: "make-buy", status: "partial",
    summary: "Compare internal production or service delivery with external sourcing across avoidable cost, capacity, quality, control, speed, IP, resilience, switching, investment, and strategic capability.",
    businessQuestion: "Should this capability be performed internally, outsourced, or combined through a hybrid model?", trigger: "analyze make versus buy", antiTrigger: "when only one feasible sourcing mode exists",
    requiredInputs: ["scope to make or buy", "internal and external option evidence"], methodology: "Separate avoidable from allocated internal costs, normalize supplier total cost, evaluate control and capability implications, test volume and risk sensitivity, and compare hybrid options."
  },
  {
    id: "supplier-risk", name: "Supplier risk assessment", domain: "supply-chain", subdomain: "supplier-risk", status: "partial",
    summary: "Assess supplier continuity, financial, geographic, capacity, quality, dependency, cyber, compliance, concentration, substitutability, and recovery risks using supported evidence.",
    businessQuestion: "Which supplier dependencies could materially disrupt the operation and what mitigations are justified?", trigger: "assess supplier risk", antiTrigger: "when the request is general enterprise risk with no supplier dependency",
    requiredInputs: ["supplier or category evidence"], methodology: "Identify dependency mechanisms, assess likelihood indicators and business consequence separately, evaluate substitutability and controls, and prioritize mitigations by exposure.", riskClass: "elevated", evidenceLevel: "current-external-evidence"
  },
  {
    id: "spend-analysis", name: "Procurement spend analysis", domain: "supply-chain", subdomain: "spend", status: "partial",
    summary: "Clean, classify, and analyze procurement spend by supplier, category, business unit, geography, transaction pattern, concentration, fragmentation, and price variance.",
    businessQuestion: "Where is procurement spend concentrated, fragmented, inconsistent, or strategically important?", trigger: "analyze procurement spend", antiTrigger: "when transaction or supplier spend data is unavailable",
    requiredInputs: ["procurement transaction or spend data"], methodology: "Normalize supplier and category identities, reconcile totals, segment spend, calculate concentration and fragmentation, and distinguish data-quality issues from sourcing opportunity."
  },
  {
    id: "supply-chain-scenario", name: "Supply-chain scenario planning", domain: "supply-chain", subdomain: "resilience", status: "partial",
    summary: "Compare supply-chain responses to disruptions, demand changes, capacity loss, lead-time shifts, sourcing alternatives, inventory policies, and service requirements across coherent scenarios.",
    businessQuestion: "How resilient is the supply chain under plausible disruptions and which responses preserve service and value?", trigger: "model supply chain disruption scenarios", antiTrigger: "when only one deterministic operating plan is required and uncertainty is immaterial",
    requiredInputs: ["network or supply-chain scope", "material disruption assumptions"], methodology: "Define coherent disruption scenarios, trace effects through supply capacity inventory and service, compare response options, and identify robust versus contingent actions.", riskClass: "elevated"
  }
];

export const operationsSupplyCapabilities = seeds.map(defineStandardCapability);
