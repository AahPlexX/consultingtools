import { defineStandardCapability, type StandardCapabilitySeed } from "../define.js";

const seeds: readonly StandardCapabilitySeed[] = [
  {
    id: "org-design", name: "Organization design analysis", domain: "organization", subdomain: "organization-design", status: "partial",
    summary: "Evaluate structure, roles, spans, layers, interfaces, decision rights, capabilities, governance, and coordination mechanisms against strategy and operating requirements.",
    businessQuestion: "Does the organization design enable the strategy and required work effectively?", trigger: "evaluate or redesign an organization structure", antiTrigger: "when the request is only to format an existing organization chart",
    requiredInputs: ["strategy or operating requirements", "current organization context"], methodology: "Translate strategic and operating requirements into design criteria, assess current structural friction, generate alternatives, and compare coordination and accountability tradeoffs."
  },
  {
    id: "spans-layers", name: "Spans and layers analysis", domain: "organization", subdomain: "structure-efficiency", status: "partial",
    summary: "Assess management layers and spans of control using work complexity, role type, geographic distribution, decision load, capability, and coordination needs rather than arbitrary benchmarks alone.",
    businessQuestion: "Are management layers and spans appropriate for the work and decision environment?", trigger: "analyze organizational spans and layers", antiTrigger: "when the request is only to reduce headcount without considering work design",
    requiredInputs: ["organization hierarchy", "role or work context"], methodology: "Map reporting layers and manager spans, segment by work type, identify compression or overload patterns, and test redesign options against coordination and accountability needs."
  },
  {
    id: "decision-rights", name: "Decision-rights design", domain: "organization", subdomain: "governance", status: "partial",
    summary: "Clarify who proposes, decides, provides input, executes, and escalates material decisions so accountability and speed improve without duplicating authority.",
    businessQuestion: "Who should make which decisions and what inputs or escalation paths are required?", trigger: "clarify organizational decision rights", antiTrigger: "when the request concerns task ownership rather than decision authority",
    requiredInputs: ["material decisions", "roles or governance context"], methodology: "Catalog recurring high-value decisions, define decision owner and required inputs, identify current ambiguity or duplication, and design escalation and exception rules."
  },
  {
    id: "raci", name: "RACI / accountability design", domain: "organization", subdomain: "accountability", status: "partial",
    summary: "Clarify responsible, accountable, consulted, and informed roles for work or decisions while detecting missing accountability, overloaded roles, and excessive consultation.",
    businessQuestion: "Who owns, executes, contributes to, and receives information for each critical activity?", trigger: "build or review a RACI", antiTrigger: "when the question is decision authority rather than activity accountability",
    requiredInputs: ["activities or deliverables", "role set"], methodology: "Assign one clear accountability point where appropriate, distinguish execution from consultation, identify gaps or overload, and validate the matrix against actual work."
  },
  {
    id: "stakeholder-map", name: "Stakeholder analysis", domain: "organization", subdomain: "stakeholders", status: "partial",
    summary: "Map stakeholder influence, impact, incentives, concerns, dependencies, support, resistance, and engagement needs around a decision, project, or change.",
    businessQuestion: "Which stakeholders can affect or are affected by the initiative and how should engagement differ?", trigger: "map stakeholders for a decision or change", antiTrigger: "when there are no distinct stakeholders or engagement choices",
    requiredInputs: ["initiative or decision scope"], methodology: "Identify stakeholders, assess influence and impact separately, document evidence for concerns or incentives, and tailor engagement by decision need and risk."
  },
  {
    id: "capability-assessment", name: "Organizational capability assessment", domain: "organization", subdomain: "capabilities", status: "partial",
    summary: "Assess whether the organization has the people, process, technology, data, governance, knowledge, and management capabilities required for a strategy or operating model.",
    businessQuestion: "Which organizational capabilities are sufficient, weak, missing, or overbuilt relative to the strategy?", trigger: "assess organizational capabilities", antiTrigger: "when the request is to evaluate an individual's personal competence",
    requiredInputs: ["required capabilities or strategic objective", "current capability evidence"], methodology: "Define capability requirements, assess current maturity with evidence, identify gaps and interdependencies, and prioritize gaps by strategic consequence and buildability."
  },
  {
    id: "workforce-planning", name: "Workforce planning", domain: "organization", subdomain: "workforce", status: "partial",
    summary: "Translate workload, strategy, productivity, skills, attrition, hiring lead time, capacity, and location assumptions into workforce demand and supply implications.",
    businessQuestion: "What workforce capacity and skills will be needed, and where are likely gaps or surpluses?", trigger: "develop a workforce plan", antiTrigger: "when the request is an individual hiring decision only",
    requiredInputs: ["workforce objective", "demand or workload assumptions"], methodology: "Model demand drivers and capacity assumptions, compare required with available workforce and skills, identify timing gaps, and test productivity or sourcing scenarios."
  },
  {
    id: "workload-analysis", name: "Workload analysis", domain: "organization", subdomain: "workforce", status: "partial",
    summary: "Quantify and segment workload by activity, frequency, volume, complexity, service level, role, and time to identify overload, imbalance, idle capacity, or redesign opportunities.",
    businessQuestion: "How much work exists, where is it concentrated, and does capacity match the workload?", trigger: "analyze workload and capacity by role or team", antiTrigger: "when no activity volume or time basis can be estimated",
    requiredInputs: ["activities", "volume or frequency evidence", "time or effort basis"], methodology: "Define workload units, calculate demand by activity, compare with effective capacity, segment peaks or complexity, and separate workload from avoidable process burden."
  },
  {
    id: "change-readiness", name: "Change-readiness assessment", domain: "organization", subdomain: "change", status: "partial",
    summary: "Assess sponsorship, case for change, incentives, capability, process, technology, communication, capacity, culture, and local conditions that affect adoption readiness.",
    businessQuestion: "How ready is the organization to adopt the proposed change and where are the highest adoption risks?", trigger: "assess change readiness", antiTrigger: "when no defined change or target state exists",
    requiredInputs: ["proposed change", "organization context"], methodology: "Define readiness dimensions, gather evidence by stakeholder or unit, distinguish willingness from capability, identify blockers, and prioritize actions by adoption risk."
  },
  {
    id: "change-impact", name: "Change-impact assessment", domain: "organization", subdomain: "change", status: "partial",
    summary: "Identify how a proposed change affects roles, tasks, decisions, processes, systems, skills, measures, incentives, policies, locations, and stakeholder experience.",
    businessQuestion: "What changes for whom, how significant is the impact, and what enablement is required?", trigger: "assess impacts of an organizational change", antiTrigger: "when the target-state change has not been defined",
    requiredInputs: ["current state", "target state"], methodology: "Compare current and target state by stakeholder or role, classify impact type and magnitude, identify dependencies, and translate material impacts into enablement actions."
  },
  {
    id: "adoption-risk", name: "Adoption risk analysis", domain: "organization", subdomain: "change", status: "partial",
    summary: "Assess the likelihood and consequence of low adoption across stakeholder groups using incentives, capability, workflow fit, leadership, communication, trust, and competing priorities.",
    businessQuestion: "Where is adoption most likely to fail and what mechanisms create that risk?", trigger: "analyze adoption risks for a change", antiTrigger: "when the change is purely technical and has no human workflow or behavior impact",
    requiredInputs: ["change scope", "stakeholder evidence"], methodology: "Identify required behavior changes, assess barriers and enabling conditions by group, distinguish hypotheses from evidence, and define targeted mitigations and indicators.", riskClass: "elevated"
  },
  {
    id: "training-needs", name: "Training-needs analysis", domain: "organization", subdomain: "learning", status: "partial",
    summary: "Identify knowledge, skill, task, system, behavior, and performance gaps that require training versus process, tool, role, incentive, or management interventions.",
    businessQuestion: "Which capability gaps genuinely require training and what learning outcomes are needed?", trigger: "analyze training needs", antiTrigger: "when the root issue is known to be process design or incentives rather than skill or knowledge",
    requiredInputs: ["target performance or role requirements", "current capability evidence"], methodology: "Compare required and current performance, diagnose whether training can address the cause, define measurable learning outcomes, and segment needs by audience."
  },
  {
    id: "competency-matrix", name: "Competency matrix", domain: "organization", subdomain: "skills", status: "partial",
    summary: "Map required competencies by role or team, define observable proficiency levels, assess evidence, and identify priority capability gaps without substituting labels for performance evidence.",
    businessQuestion: "Which competencies are required at what proficiency and where are the material gaps?", trigger: "build a competency matrix", antiTrigger: "when the request is to make unsupported judgments about named individuals",
    requiredInputs: ["roles or work requirements"], methodology: "Define competencies from actual work, write observable proficiency anchors, map role requirements, assess supplied evidence, and identify development or staffing implications.", outputs: ["text", "structured-model", "spreadsheet"]
  },
  {
    id: "performance-management", name: "Performance-management design", domain: "organization", subdomain: "performance", status: "partial",
    summary: "Design goals, measures, feedback, review cadence, accountability, coaching, recognition, and escalation mechanisms that connect individual or team performance to business outcomes.",
    businessQuestion: "How should performance be defined, measured, reviewed, and improved for this work?", trigger: "design a performance management approach", antiTrigger: "when the request is a legal disciplinary action or individual employment decision",
    requiredInputs: ["role or team objectives", "business outcomes"], methodology: "Translate outcomes into controllable expectations and measures, define review cadence and feedback loops, detect perverse incentives, and align accountability with authority."
  },
  {
    id: "okr-design", name: "OKR design", domain: "organization", subdomain: "objectives", status: "partial",
    summary: "Create outcome-oriented objectives and measurable key results that distinguish outcomes from activities and avoid metric gaming or ambiguous success definitions.",
    businessQuestion: "What objective and measurable outcomes should guide this team or initiative?", trigger: "design OKRs", antiTrigger: "when the request is only to list routine tasks or project milestones",
    requiredInputs: ["strategic or team objective"], methodology: "Define a qualitative objective, derive a small set of measurable outcome key results, test controllability and gaming risk, and separate initiatives from results."
  },
  {
    id: "kpi-tree", name: "KPI tree", domain: "organization", subdomain: "measurement", status: "partial",
    summary: "Connect lagging business outcomes to mathematical or causal driver measures so teams can see which controllable levers influence the result and where definitions must reconcile.",
    businessQuestion: "Which leading drivers explain and influence the target outcome?", trigger: "build a KPI driver tree", antiTrigger: "when the relationship among measures cannot be defined even conceptually",
    requiredInputs: ["target outcome"], methodology: "Define the outcome precisely, decompose it into additive multiplicative or causal drivers, validate definitions and ownership, and distinguish equations from hypotheses.", outputs: ["text", "structured-model", "diagram"]
  },
  {
    id: "balanced-scorecard", name: "Balanced scorecard", domain: "organization", subdomain: "measurement", status: "partial",
    summary: "Balance financial, customer, process, and capability measures where multiple perspectives are needed to monitor strategy execution without creating a bloated dashboard.",
    businessQuestion: "Which balanced set of measures best indicates whether strategy execution is on track?", trigger: "design a balanced scorecard", antiTrigger: "when a single operational metric is sufficient for the decision",
    requiredInputs: ["strategy or strategic objectives"], methodology: "Translate strategy into a limited set of outcomes and drivers across relevant perspectives, define formulas and owners, and remove redundant measures."
  },
  {
    id: "transformation-roadmap", name: "Transformation roadmap", domain: "organization", subdomain: "transformation", status: "partial",
    summary: "Sequence organizational, process, technology, capability, data, governance, and change initiatives into a dependency-aware transformation roadmap tied to measurable outcomes.",
    businessQuestion: "What sequence of changes will move the organization from current to target state with manageable risk?", trigger: "build a transformation roadmap", antiTrigger: "when the request is a single isolated project with no broader transformation dependencies",
    requiredInputs: ["current state", "target state", "material initiatives or gaps"], methodology: "Group initiatives by outcome and dependency, identify critical enablers, sequence waves, define decision gates and measures, and expose resource or adoption constraints.", outputs: ["text", "structured-model", "spreadsheet", "presentation"]
  },
  {
    id: "rice", name: "RICE prioritization", domain: "organization", subdomain: "prioritization", status: "partial",
    summary: "Prioritize candidate initiatives using reach, impact, confidence, and effort only when those inputs can be defined consistently and the scoring assumptions are visible.",
    businessQuestion: "Which initiatives rank highest under the stated reach, impact, confidence, and effort assumptions?", trigger: "prioritize initiatives with RICE", antiTrigger: "when reach or effort cannot be estimated on a comparable basis",
    requiredInputs: ["candidate initiatives", "reach impact confidence and effort inputs"], methodology: "Define comparable scales and time horizon, calculate RICE consistently, inspect sensitivity, and treat the score as decision support rather than automatic truth."
  },
  {
    id: "moscow", name: "MoSCoW prioritization", domain: "organization", subdomain: "scope-prioritization", status: "partial",
    summary: "Classify scope into must, should, could, and won't-now categories while challenging false must-haves and making time or release constraints explicit.",
    businessQuestion: "Which scope is mandatory now, valuable later, optional, or intentionally deferred?", trigger: "prioritize scope with MoSCoW", antiTrigger: "when the decision needs quantitative economic weighting rather than categorical scope negotiation",
    requiredInputs: ["scope items", "decision horizon or release constraint"], methodology: "Define what makes an item genuinely mandatory, classify based on consequence and dependency, limit must-haves, and document deferred scope explicitly."
  },
  {
    id: "project-charter", name: "Project charter", domain: "project", subdomain: "initiation", status: "partial",
    summary: "Define project purpose, outcomes, scope, exclusions, sponsor, stakeholders, assumptions, constraints, high-level risks, milestones, governance, and success measures.",
    businessQuestion: "What must be agreed before this project begins?", trigger: "create a project charter", antiTrigger: "when the project objective and sponsorship are not yet defined enough to charter",
    requiredInputs: ["project objective"], methodology: "Translate the business need into measurable outcomes and boundaries, identify decision authority and constraints, and expose unresolved assumptions before execution begins.", outputs: ["text", "document"]
  },
  {
    id: "work-breakdown-structure", name: "Work breakdown structure", domain: "project", subdomain: "planning", status: "partial",
    summary: "Decompose project scope into outcome-oriented deliverables and work packages that are collectively complete, non-overlapping, assignable, estimable, and traceable to scope.",
    businessQuestion: "What work and deliverables are required to complete the project scope?", trigger: "build a work breakdown structure", antiTrigger: "when the project scope is not sufficiently defined",
    requiredInputs: ["project scope and deliverables"], methodology: "Decompose by deliverable or outcome, ensure full scope coverage without duplication, stop at manageable work packages, and preserve traceability to project objectives.", outputs: ["text", "structured-model", "spreadsheet"]
  },
  {
    id: "milestone-plan", name: "Milestone plan", domain: "project", subdomain: "schedule", status: "partial",
    summary: "Define significant decision, delivery, approval, readiness, or outcome milestones with clear completion criteria, dependencies, owners, and target timing.",
    businessQuestion: "Which major checkpoints determine whether the project is progressing toward completion?", trigger: "create a project milestone plan", antiTrigger: "when detailed task sequencing rather than milestone-level control is required",
    requiredInputs: ["project deliverables or phases"], methodology: "Identify meaningful completion events, define acceptance criteria, link dependencies and owners, and avoid treating routine activity dates as milestones.", outputs: ["text", "structured-model", "spreadsheet"]
  },
  {
    id: "gantt-plan", name: "Gantt schedule plan", domain: "project", subdomain: "schedule", status: "partial",
    summary: "Structure tasks, durations, milestones, dependencies, owners, and calendar relationships into a Gantt-ready schedule while identifying missing sequencing assumptions.",
    businessQuestion: "How should project work be scheduled and visualized over time?", trigger: "create a Gantt project schedule", antiTrigger: "when tasks durations or dependencies are too undefined to schedule",
    requiredInputs: ["tasks or work packages", "durations or timing assumptions"], methodology: "Normalize tasks and milestones, link logical dependencies, assign timing and ownership, identify impossible or circular sequencing, and prepare a schedule-ready model.", outputs: ["structured-model", "spreadsheet", "diagram"]
  },
  {
    id: "dependency-map", name: "Project dependency map", domain: "project", subdomain: "dependencies", status: "partial",
    summary: "Map task, deliverable, decision, resource, vendor, technical, and external dependencies so sequencing constraints and single points of failure are visible.",
    businessQuestion: "Which dependencies constrain project sequence or create delivery risk?", trigger: "map project dependencies", antiTrigger: "when project work items have not been identified",
    requiredInputs: ["project work items or deliverables"], methodology: "Identify dependency type and direction, validate whether each dependency is real, detect cycles and convergence points, and highlight dependencies with high schedule or risk impact.", outputs: ["text", "structured-model", "diagram"]
  },
  {
    id: "critical-path", name: "Critical path analysis", domain: "project", subdomain: "schedule-analytics", status: "planned",
    summary: "Calculate the longest dependency-constrained path through scheduled activities, identify total float, and show which task delays can move project completion.",
    businessQuestion: "Which sequence of dependent tasks determines the earliest possible project completion date?", trigger: "calculate the project critical path", antiTrigger: "when durations or logical dependencies are unavailable",
    requiredInputs: ["activity durations", "dependency network"], methodology: "Perform forward and backward passes over an acyclic dependency network, calculate early and late dates and float, and identify zero-float or governing activities.", mode: "deterministic", surfaceRequirements: ["deterministic-engine"]
  },
  {
    id: "pert-estimate", name: "PERT-style duration estimate", domain: "project", subdomain: "schedule-analytics", status: "planned",
    summary: "Calculate a three-point expected duration and variability measure from optimistic, most-likely, and pessimistic estimates while stating the PERT assumptions and limitations.",
    businessQuestion: "What expected duration is implied by the three-point task estimate?", trigger: "calculate a PERT duration estimate", antiTrigger: "when only one deterministic duration estimate exists",
    requiredInputs: ["optimistic duration", "most likely duration", "pessimistic duration"], methodology: "Validate ordered estimates, apply the chosen PERT weighting formula, calculate expected duration and variance where appropriate, and avoid presenting the result as a guaranteed schedule.", mode: "deterministic", surfaceRequirements: ["deterministic-engine"]
  },
  {
    id: "raid-log", name: "RAID log", domain: "project", subdomain: "project-controls", status: "partial",
    summary: "Track risks, assumptions, issues, and dependencies with owners, dates, status, impact, actions, evidence, and escalation so project uncertainty is controlled rather than buried in narrative.",
    businessQuestion: "Which risks, assumptions, issues, and dependencies require active project control?", trigger: "create or update a RAID log", antiTrigger: "when the request is only a final retrospective with no active project controls",
    requiredInputs: ["project context", "known risks assumptions issues or dependencies"], methodology: "Classify each item correctly, assign owner and next action, record impact and status, and prevent assumptions or unresolved issues from being mislabeled as closed facts.", outputs: ["structured-model", "spreadsheet"]
  },
  {
    id: "issue-register", name: "Project issue register", domain: "project", subdomain: "project-controls", status: "partial",
    summary: "Track realized project problems with impact, owner, containment, root cause where known, resolution action, due date, escalation, and closure evidence.",
    businessQuestion: "Which active project problems require resolution and how are they being controlled?", trigger: "create or update an issue register", antiTrigger: "when the item is a future uncertain event rather than a realized issue",
    requiredInputs: ["known project issues"], methodology: "Record each realized issue distinctly from risk, define impact and ownership, track containment and resolution, and require closure evidence rather than status labels alone.", outputs: ["structured-model", "spreadsheet"]
  },
  {
    id: "decision-log", name: "Project decision log", domain: "project", subdomain: "governance", status: "partial",
    summary: "Record material project decisions, date, decision owner, options considered, evidence, rationale, assumptions, consequences, and follow-up actions for traceability.",
    businessQuestion: "What decisions have been made, by whom, on what evidence, and with what consequences?", trigger: "create or maintain a project decision log", antiTrigger: "when the request is only to brainstorm options before any decision is made",
    requiredInputs: ["decision records or pending decisions"], methodology: "Capture the decision event and accountable owner, preserve alternatives and rationale, identify assumptions and follow-up effects, and distinguish proposed from approved decisions.", outputs: ["structured-model", "spreadsheet"]
  },
  {
    id: "action-tracker", name: "Action tracker", domain: "project", subdomain: "execution-control", status: "partial",
    summary: "Track discrete actions with clear outcome, owner, due date, dependency, status, evidence, and escalation so commitments remain actionable and auditable.",
    businessQuestion: "Who must do what by when, and what evidence shows completion?", trigger: "create or update an action tracker", antiTrigger: "when the request concerns long-duration deliverables better represented as project tasks",
    requiredInputs: ["actions or commitments"], methodology: "Write actions as observable outcomes, assign one accountable owner and due date, link dependencies, define completion evidence, and surface overdue or blocked work.", outputs: ["structured-model", "spreadsheet"]
  },
  {
    id: "resource-plan", name: "Project resource plan", domain: "project", subdomain: "resources", status: "partial",
    summary: "Map project demand for people, skills, equipment, budget, vendors, or environments against availability, timing, constraints, conflicts, and critical work.",
    businessQuestion: "What resources are required when, and where are capacity or skill conflicts likely?", trigger: "build a project resource plan", antiTrigger: "when project work and timing are not defined enough to estimate demand",
    requiredInputs: ["project work", "resource assumptions"], methodology: "Estimate resource demand by work package and period, compare with availability and constraints, identify over-allocation or gaps, and test sequencing or sourcing alternatives.", outputs: ["structured-model", "spreadsheet"]
  },
  {
    id: "project-budget", name: "Project budget", domain: "project", subdomain: "project-finance", status: "partial",
    summary: "Build or assess a project budget across labor, vendors, materials, capital, contingency, timing, commitments, forecast, and actuals with explicit basis and reconciliation.",
    businessQuestion: "What will the project cost, when will cost occur, and how is spend tracking against plan?", trigger: "create or analyze a project budget", antiTrigger: "when the request is an enterprise annual budget rather than a defined project",
    requiredInputs: ["project scope", "cost assumptions"], methodology: "Map costs to work and periods, separate one-time and recurring amounts, state contingency assumptions, reconcile totals, and track forecast-to-complete where actuals exist.", outputs: ["structured-model", "spreadsheet"]
  },
  {
    id: "rag-status", name: "RAG project status assessment", domain: "project", subdomain: "status-reporting", status: "partial",
    summary: "Assign red, amber, or green status using explicit schedule, scope, cost, risk, quality, dependency, or benefit thresholds rather than subjective color labels.",
    businessQuestion: "What is the project's current health and which dimensions justify the status?", trigger: "assess project RAG status", antiTrigger: "when no status thresholds or project evidence exist",
    requiredInputs: ["project status evidence", "status criteria"], methodology: "Define threshold logic by dimension, assess evidence, derive overall status using stated rules, and pair color with causes, actions, and trend."
  },
  {
    id: "change-control", name: "Project change-control analysis", domain: "project", subdomain: "scope-control", status: "partial",
    summary: "Evaluate proposed scope, schedule, cost, benefit, resource, design, or requirement changes for impact, dependencies, risk, approval, and baseline updates.",
    businessQuestion: "Should this project change be approved and what baselines or dependencies would it affect?", trigger: "evaluate a project change request", antiTrigger: "when the change has already been implemented and only retrospective documentation is needed",
    requiredInputs: ["proposed change", "current project baseline"], methodology: "Define the change precisely, assess impacts and alternatives, identify approvals and dependencies, record decision rationale, and update baselines only after authorization."
  },
  {
    id: "scope-tracker", name: "Scope tracker", domain: "project", subdomain: "scope-control", status: "partial",
    summary: "Track included, excluded, deferred, changed, and accepted scope items with source, owner, decision status, dependencies, and acceptance criteria to prevent ambiguity and creep.",
    businessQuestion: "What is currently in scope, out of scope, changed, or awaiting a decision?", trigger: "create or update a project scope tracker", antiTrigger: "when the request is high-level strategy with no bounded project scope",
    requiredInputs: ["scope items or requirements"], methodology: "Give each scope item a unique identity and disposition, link changes to decisions, define acceptance evidence, and keep exclusions and deferred items explicit.", outputs: ["structured-model", "spreadsheet"]
  },
  {
    id: "deliverable-matrix", name: "Deliverable matrix", domain: "project", subdomain: "deliverables", status: "partial",
    summary: "Track project deliverables by owner, due date, dependencies, reviewer, acceptance criteria, status, version, and evidence so completion is defined consistently.",
    businessQuestion: "Which deliverables are required and what proves each is complete and accepted?", trigger: "build a project deliverable matrix", antiTrigger: "when the project has no defined outputs or acceptance process",
    requiredInputs: ["project deliverables"], methodology: "Define each deliverable and acceptance criteria, assign accountable owner and reviewers, link dependencies and dates, and track version and acceptance evidence.", outputs: ["structured-model", "spreadsheet"]
  },
  {
    id: "earned-value", name: "Earned value analysis", domain: "project", subdomain: "schedule-cost-control", status: "planned",
    summary: "Calculate planned value, earned value, actual cost, schedule variance, cost variance, and supported performance indices from a baselined project measurement system.",
    businessQuestion: "How is project cost and schedule performance tracking relative to the value of work actually accomplished?", trigger: "calculate earned value metrics", antiTrigger: "when there is no baselined planned value or objective earned-progress measure",
    requiredInputs: ["planned value", "earned value", "actual cost"], methodology: "Validate common measurement date and baseline, calculate EV metrics using explicit formulas, interpret indices cautiously, and avoid forecasting from unstable early data without qualification.", mode: "deterministic", surfaceRequirements: ["deterministic-engine"]
  },
  {
    id: "release-planning", name: "Release planning", domain: "project", subdomain: "delivery-planning", status: "partial",
    summary: "Group features, capabilities, fixes, dependencies, risks, capacity, milestones, and validation into release increments aligned with value and operational readiness.",
    businessQuestion: "What should ship in which release, in what sequence, and with what readiness criteria?", trigger: "build a release plan", antiTrigger: "when the work has no releasable product or service increments",
    requiredInputs: ["candidate scope", "release objective or constraints"], methodology: "Prioritize value and dependencies, respect capacity and readiness, define release acceptance criteria, and separate committed scope from stretch or deferred scope."
  },
  {
    id: "portfolio-prioritization", name: "Project portfolio prioritization", domain: "project", subdomain: "portfolio", status: "partial",
    summary: "Compare projects or initiatives across strategic alignment, value, urgency, risk, dependencies, resource demand, capacity, confidence, and portfolio balance.",
    businessQuestion: "Which initiatives should receive scarce resources across the portfolio?", trigger: "prioritize a project or initiative portfolio", antiTrigger: "when only one project exists and no allocation tradeoff is required",
    requiredInputs: ["candidate initiatives", "portfolio decision criteria"], methodology: "Normalize criteria and time horizon, identify dependencies and mandatory work, compare value and resource demand, test weighting sensitivity, and preserve portfolio balance constraints."
  }
];

export const organizationProjectCapabilities = seeds.map(defineStandardCapability);
