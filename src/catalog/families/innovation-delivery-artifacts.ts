import { defineStandardCapability, type StandardCapabilitySeed } from "../define.js";

const seeds: readonly StandardCapabilitySeed[] = [
  {
    id: "ideation", name: "Divergent ideation", domain: "innovation", subdomain: "ideation", status: "partial",
    summary: "Generate materially different ideas across mechanisms, audiences, channels, business models, constraints, and implementation approaches without presenting generated ideas as evidence.",
    businessQuestion: "What genuinely different solution ideas are worth considering before narrowing the field?", trigger: "generate a broad set of business ideas", antiTrigger: "when the user has already selected one solution and only execution planning remains",
    requiredInputs: ["problem or opportunity"], methodology: "Reframe the problem from multiple lenses, generate alternatives that differ in mechanism rather than wording, defer judgment during divergence, and label all generated concepts as ideas."
  },
  {
    id: "convergent-filtering", name: "Convergent idea filtering", domain: "innovation", subdomain: "idea-selection", status: "partial",
    summary: "Reduce a broad idea set using explicit feasibility, value, evidence, differentiation, risk, effort, reversibility, and strategic-fit criteria without prematurely collapsing uncertainty.",
    businessQuestion: "Which generated ideas deserve deeper validation or execution?", trigger: "filter or narrow a set of ideas", antiTrigger: "when too few materially different options have been generated",
    requiredInputs: ["idea set", "selection objective"], methodology: "Define screening criteria, remove dominated or infeasible ideas, preserve promising uncertainty, and identify which ideas need evidence rather than assigning false certainty."
  },
  {
    id: "constraint-ideation", name: "Constraint-driven ideation", domain: "innovation", subdomain: "ideation", status: "partial",
    summary: "Generate solution alternatives that explicitly honor hard constraints such as budget, staffing, time, regulation, technology, channel, geography, or operating model.",
    businessQuestion: "What viable solutions exist if the stated constraints cannot change?", trigger: "brainstorm within hard business constraints", antiTrigger: "when the user explicitly wants unconstrained blue-sky ideation",
    requiredInputs: ["problem", "hard constraints"], methodology: "Separate hard constraints from preferences, use each constraint as a design boundary, generate mechanisms that remain feasible, and flag ideas that depend on relaxing a constraint."
  },
  {
    id: "morphological-analysis", name: "Morphological analysis", domain: "innovation", subdomain: "structured-ideation", status: "partial",
    summary: "Decompose a solution space into independent dimensions and systematically combine alternatives to expose novel configurations that ordinary brainstorming may miss.",
    businessQuestion: "Which combinations of solution dimensions create distinct viable concepts?", trigger: "use morphological analysis to generate concepts", antiTrigger: "when the problem cannot be decomposed into meaningful independent dimensions",
    requiredInputs: ["solution problem", "design dimensions"], methodology: "Define relevant dimensions and alternatives, combine them systematically, remove impossible combinations, and evaluate remaining concepts as hypotheses rather than facts."
  },
  {
    id: "assumption-reversal", name: "Assumption reversal", domain: "innovation", subdomain: "problem-framing", status: "partial",
    summary: "Surface implicit business assumptions, reverse or remove them, and explore what alternative strategies or operating models become possible without asserting that the reversed assumption is true.",
    businessQuestion: "Which hidden assumptions constrain current thinking and what options emerge if they are challenged?", trigger: "challenge assumptions by reversing them", antiTrigger: "when the request depends on fixed legal or physical facts that cannot be meaningfully reversed",
    requiredInputs: ["current approach or assumed constraints"], methodology: "Extract implicit assumptions, distinguish facts from conventions, reverse or relax non-factual assumptions, generate implications, and identify what evidence would validate the alternatives."
  },
  {
    id: "opportunity-mapping", name: "Opportunity mapping", domain: "innovation", subdomain: "opportunity", status: "partial",
    summary: "Map customer needs, market gaps, operational pain, technology changes, assets, capabilities, and strategic priorities into a structured set of opportunity spaces.",
    businessQuestion: "Where are the most promising spaces for innovation or improvement?", trigger: "map business opportunities", antiTrigger: "when the user needs a final investment decision rather than exploration",
    requiredInputs: ["opportunity scope", "available evidence"], methodology: "Separate opportunity signals by source, cluster related needs and capabilities, distinguish evidence from hypotheses, and prioritize spaces for validation rather than prematurely selecting solutions."
  },
  {
    id: "value-proposition-generation", name: "Value proposition generation", domain: "innovation", subdomain: "offer-design", status: "partial",
    summary: "Generate candidate value propositions by connecting a specific target need or job to differentiated outcomes, tradeoffs, proof, and a plausible delivery mechanism.",
    businessQuestion: "What credible value propositions could solve the target customer's important problem better than alternatives?", trigger: "generate value proposition options", antiTrigger: "when target customer need or problem is not defined",
    requiredInputs: ["target customer", "need or job"], methodology: "Start from supported customer progress, generate distinct value mechanisms, specify outcome and tradeoff, identify proof requirements, and avoid unsupported superiority claims."
  },
  {
    id: "solution-decomposition", name: "Solution decomposition", domain: "innovation", subdomain: "solution-design", status: "partial",
    summary: "Break a complex solution into independently understandable components, capabilities, decisions, interfaces, dependencies, and validation questions so implementation can be sequenced safely.",
    businessQuestion: "What distinct components must work together for this solution to succeed?", trigger: "decompose a complex solution", antiTrigger: "when the requested solution is already a single bounded component",
    requiredInputs: ["solution concept"], methodology: "Identify outcome-bearing components and interfaces, separate concerns, map dependencies and failure points, and define what must be validated before each component is built."
  },
  {
    id: "premortem", name: "Pre-mortem analysis", domain: "innovation", subdomain: "risk-ideation", status: "partial",
    summary: "Assume a future initiative failed and generate plausible failure mechanisms to expose blind spots, weak assumptions, dependencies, and leading indicators before commitment.",
    businessQuestion: "If this initiative failed, what plausible mechanisms would most likely explain the failure?", trigger: "run a pre mortem", antiTrigger: "when the request is a retrospective on a failure that already occurred",
    requiredInputs: ["planned initiative"], methodology: "Assume failure as a thought experiment, generate independent mechanisms across domains, distinguish hypotheses from known risks, and convert material mechanisms into validation or mitigation actions."
  },
  {
    id: "red-team-analysis", name: "Red-team critique", domain: "innovation", subdomain: "challenge", status: "partial",
    summary: "Challenge a strategy, analysis, recommendation, or plan by seeking disconfirming evidence, weak assumptions, alternative explanations, failure modes, incentives, and overlooked constraints.",
    businessQuestion: "What strongest evidence or reasoning could invalidate this conclusion or plan?", trigger: "red team or challenge an analysis", antiTrigger: "when the user only wants stylistic proofreading",
    requiredInputs: ["analysis strategy or recommendation"], methodology: "Restate the claim fairly, identify critical assumptions, search for disconfirming evidence and alternative mechanisms, test edge cases, and report material weaknesses without contrarian theater."
  },
  {
    id: "hypothesis-generation", name: "Hypothesis generation", domain: "innovation", subdomain: "hypotheses", status: "partial",
    summary: "Generate explicit, testable explanations or business hypotheses from observed evidence while separating them from verified causes and defining what evidence could disconfirm each.",
    businessQuestion: "Which testable explanations could account for the observed pattern or opportunity?", trigger: "generate testable business hypotheses", antiTrigger: "when the cause is already directly established by strong evidence",
    requiredInputs: ["observation or problem"], methodology: "Generate multiple mechanisms, write each as a falsifiable statement, identify expected observations and disconfirming evidence, and avoid selecting a cause before testing."
  },
  {
    id: "experiment-design", name: "Business experiment design", domain: "innovation", subdomain: "experimentation", status: "partial",
    summary: "Design a practical test of a business hypothesis with treatment, comparison, outcome measures, sample or exposure logic, duration, guardrails, stopping rules, and interpretation limits.",
    businessQuestion: "What experiment can efficiently reduce uncertainty about this business hypothesis?", trigger: "design a business experiment or test", antiTrigger: "when experimental manipulation would be unethical unsafe or impossible",
    requiredInputs: ["hypothesis", "decision to inform"], methodology: "Define hypothesis and outcome, select an appropriate comparison design, prevent obvious confounding where possible, predefine success and guardrails, and specify how results will change the decision."
  },
  {
    id: "prioritization-analysis", name: "General prioritization analysis", domain: "innovation", subdomain: "prioritization", status: "partial",
    summary: "Prioritize opportunities or actions using decision-specific criteria, mandatory constraints, value, effort, evidence, urgency, dependencies, risk, and sensitivity rather than a default scoring framework.",
    businessQuestion: "Which opportunities or actions should be addressed first under the actual decision constraints?", trigger: "prioritize a mixed list of opportunities or actions", antiTrigger: "when a specific governed method such as RICE or MoSCoW has already been requested",
    requiredInputs: ["items to prioritize", "decision objective"], methodology: "Define criteria from the decision, apply hard constraints before scoring, normalize comparable evidence, test sensitivity, and explain why the ranking matters."
  },
  {
    id: "product-service-comparison", name: "Product or service comparison", domain: "delivery", subdomain: "comparison", status: "partial",
    summary: "Compare products or services on normalized decision-relevant features, outcomes, price, total cost, evidence, limitations, implementation, support, risk, and fit.",
    businessQuestion: "Which product or service best fits the stated requirements and tradeoffs?", trigger: "compare products or services for a business decision", antiTrigger: "when the request is only to list specifications without a choice or assessment",
    requiredInputs: ["options", "comparison objective"], methodology: "Normalize option definitions and commercial terms, compare only decision-relevant dimensions, mark missing evidence, and state tradeoffs rather than forcing a winner."
  },
  {
    id: "build-buy", name: "Build-versus-buy analysis", domain: "delivery", subdomain: "comparison", status: "partial",
    summary: "Compare building internally with buying or partnering across requirements, time, total cost, control, customization, capability, security, maintenance, switching, scale, and strategic importance.",
    businessQuestion: "Should this capability be built internally, purchased, partnered, or approached through a hybrid model?", trigger: "perform a build versus buy analysis", antiTrigger: "when only one option is feasible by policy or physical constraint",
    requiredInputs: ["capability requirement", "build and buy option evidence"], methodology: "Define requirements and decision horizon, normalize total cost and capability tradeoffs, assess strategic control and execution risk, and test hybrid alternatives."
  },
  {
    id: "location-comparison", name: "Location comparison", domain: "delivery", subdomain: "comparison", status: "partial",
    summary: "Compare locations using decision-relevant demand, labor, cost, logistics, access, regulation, risk, infrastructure, customer, supplier, incentive, and strategic-fit evidence.",
    businessQuestion: "Which location best supports the defined business objective and constraints?", trigger: "compare locations for a business decision", antiTrigger: "when the request is personal travel or residential advice rather than business location strategy",
    requiredInputs: ["candidate locations or search scope", "location decision criteria"], methodology: "Normalize geography and units, distinguish hard constraints from preferences, use current evidence, compare total business implications, and test sensitivity to material criteria.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "weighted-selection", name: "Weighted option selection", domain: "delivery", subdomain: "comparison", status: "partial",
    summary: "Rank alternatives using explicit weighted criteria and evidence-backed scores with scale normalization, threshold constraints, uncertainty, and sensitivity to weights.",
    businessQuestion: "Which option ranks highest under the stated weighted criteria and how robust is the ranking?", trigger: "rank options using weighted criteria", antiTrigger: "when criteria are not compensatory and a weighted sum would hide mandatory thresholds",
    requiredInputs: ["alternatives", "criteria and weights"], methodology: "Apply mandatory constraints first, normalize criteria scales, calculate weighted scores transparently, and test reasonable weight changes and evidence uncertainty."
  },
  {
    id: "total-cost-comparison", name: "Total-cost comparison", domain: "delivery", subdomain: "comparison", status: "partial",
    summary: "Compare options across purchase, implementation, operating, labor, support, maintenance, transition, risk, financing, and exit costs over a consistent horizon.",
    businessQuestion: "Which option has the lowest or best-justified total cost over the relevant horizon?", trigger: "compare full costs across options", antiTrigger: "when only one-time purchase prices are requested without lifecycle context",
    requiredInputs: ["options", "cost horizon", "known cost drivers"], methodology: "Define a common cost boundary and horizon, normalize timing and units, separate observed amounts from assumptions, and test high-uncertainty cost drivers."
  },
  {
    id: "risk-adjusted-comparison", name: "Risk-adjusted option comparison", domain: "delivery", subdomain: "comparison", status: "partial",
    summary: "Compare alternatives after explicitly incorporating material downside, uncertainty, resilience, reversibility, dependencies, control effectiveness, and decision-maker risk tolerance.",
    businessQuestion: "Which option provides the best value after accounting for material risk and uncertainty?", trigger: "compare options on a risk adjusted basis", antiTrigger: "when risk is immaterial or already embedded consistently in all option values",
    requiredInputs: ["alternatives", "value evidence", "risk evidence"], methodology: "Separate expected value from risk exposure, use a transparent risk treatment suited to the decision, avoid arbitrary risk premiums, and show how risk changes the ranking."
  },
  {
    id: "business-case", name: "Business case", domain: "delivery", subdomain: "executive-artifact", status: "partial",
    summary: "Synthesize problem, objectives, alternatives, evidence, economics, risks, dependencies, implementation, benefits, measures, recommendation, and decision gates into a decision-ready case.",
    businessQuestion: "What evidence and tradeoffs justify proceeding, changing, or rejecting this initiative?", trigger: "prepare a business case", antiTrigger: "when the request is only to calculate one underlying metric",
    requiredInputs: ["initiative or decision", "material supporting evidence"], methodology: "Structure around the decision, compare meaningful alternatives, connect evidence to economics and risks, distinguish assumptions, and define implementation and benefit-realization conditions.", outputs: ["text", "document", "presentation"], surfaceRequirements: ["host-reasoning", "artifact-output"]
  },
  {
    id: "executive-brief", name: "Executive brief", domain: "delivery", subdomain: "executive-communication", status: "partial",
    summary: "Condense a complex issue into the decision, essential evidence, implications, alternatives, risks, recommendation, and immediate actions without hiding material uncertainty.",
    businessQuestion: "What does an executive need to know and decide without reading the full analysis?", trigger: "prepare an executive brief", antiTrigger: "when the audience explicitly needs full technical methods and appendices rather than synthesis",
    requiredInputs: ["analysis or issue", "executive audience or decision"], methodology: "Lead with the decision or issue, select only material evidence and implications, preserve critical risks and uncertainty, and make requested actions explicit.", outputs: ["text", "document"]
  },
  {
    id: "decision-memo", name: "Decision memorandum", domain: "delivery", subdomain: "executive-communication", status: "partial",
    summary: "Present a defined decision, context, alternatives, criteria, evidence, analysis, risks, recommendation, dissenting considerations, and approval conditions in a concise formal memorandum.",
    businessQuestion: "What decision should be made and what evidence supports it?", trigger: "prepare a decision memo", antiTrigger: "when no actual decision or alternative exists",
    requiredInputs: ["decision", "material evidence"], methodology: "State the decision and criteria, compare alternatives, cite decisive evidence, surface tradeoffs and uncertainty, and specify recommendation conditions and next actions.", outputs: ["text", "document"]
  },
  {
    id: "strategy-document", name: "Strategy document", domain: "delivery", subdomain: "strategy-artifact", status: "partial",
    summary: "Turn validated strategic choices into a coherent document covering ambition, diagnosis, choices, where-to-play, how-to-win, capabilities, initiatives, measures, risks, and governance.",
    businessQuestion: "How should the chosen strategy be documented so it can guide coordinated execution?", trigger: "prepare a strategy document", antiTrigger: "when strategic choices have not yet been made and the request is exploratory analysis",
    requiredInputs: ["approved or proposed strategy", "supporting evidence"], methodology: "Document choices rather than aspirations alone, connect each choice to evidence and required capabilities, define execution priorities and measures, and preserve unresolved assumptions.", outputs: ["document", "presentation"]
  },
  {
    id: "operating-plan", name: "Operating plan", domain: "delivery", subdomain: "execution-artifact", status: "partial",
    summary: "Translate strategic priorities into initiatives, owners, milestones, resources, budgets, capacity, measures, dependencies, risks, and review cadence for a defined operating period.",
    businessQuestion: "What must the organization execute during the planning period to deliver the strategy?", trigger: "prepare an operating plan", antiTrigger: "when the request is a strategy exploration with no chosen priorities",
    requiredInputs: ["strategic priorities", "planning period"], methodology: "Convert priorities into measurable initiatives and operating commitments, align resources and dependencies, define owners and review cadence, and reconcile plan ambition with capacity.", outputs: ["document", "spreadsheet", "presentation"]
  },
  {
    id: "feasibility-study", name: "Feasibility study", domain: "delivery", subdomain: "assessment-artifact", status: "partial",
    summary: "Assess market, technical, operational, organizational, financial, schedule, legal or regulatory dependencies, risks, alternatives, and implementation conditions for a proposed initiative.",
    businessQuestion: "Is the proposed initiative feasible under the relevant constraints and what conditions determine feasibility?", trigger: "prepare a feasibility study", antiTrigger: "when the initiative is already approved and only implementation planning is needed",
    requiredInputs: ["initiative", "feasibility criteria"], methodology: "Define feasibility dimensions and thresholds, gather evidence, assess constraints and alternatives, quantify supported economics, and state conditional conclusions where evidence is incomplete.", outputs: ["text", "document", "presentation"]
  },
  {
    id: "proposal", name: "Professional proposal", domain: "delivery", subdomain: "proposal", status: "partial",
    summary: "Structure a professional proposal around client objective, scope, approach, deliverables, assumptions, responsibilities, timeline, risks, acceptance, and commercial terms when supplied.",
    businessQuestion: "How should the proposed work be presented clearly enough for a client or sponsor to evaluate and authorize it?", trigger: "prepare a consulting or business proposal", antiTrigger: "when commercial terms must be invented rather than supplied or explicitly requested as illustrative",
    requiredInputs: ["client objective", "proposed scope"], methodology: "Lead with client need and outcomes, define bounded scope and deliverables, explain method and responsibilities, preserve assumptions and exclusions, and never invent contractual facts.", outputs: ["text", "document"]
  },
  {
    id: "assessment-report", name: "Assessment report", domain: "delivery", subdomain: "assessment-artifact", status: "partial",
    summary: "Present assessment scope, criteria, evidence, findings, severity or maturity where defined, implications, recommendations, priorities, limitations, and sources in a professional report.",
    businessQuestion: "What did the assessment find, why does it matter, and what should happen next?", trigger: "prepare a professional assessment report", antiTrigger: "when no assessment criteria or evidence have been established",
    requiredInputs: ["assessment scope", "findings and evidence"], methodology: "Organize findings around criteria and decision significance, trace each material finding to evidence, explain specialized concepts, and prioritize recommendations with dependencies.", outputs: ["text", "document", "print-artifact"]
  },
  {
    id: "board-material", name: "Board material", domain: "delivery", subdomain: "board-communication", status: "partial",
    summary: "Synthesize a board-level decision or oversight topic into concise context, performance, strategic choices, risks, capital implications, recommendations, and explicit board asks.",
    businessQuestion: "What does the board need to understand, oversee, challenge, or approve?", trigger: "prepare board materials", antiTrigger: "when the audience needs operational detail rather than governance-level synthesis",
    requiredInputs: ["board topic or decision", "material evidence"], methodology: "Frame the governance question, prioritize strategic and financial implications, surface material risks and alternatives, define explicit asks, and move technical detail to appendices.", outputs: ["presentation", "document"], surfaceRequirements: ["host-reasoning", "artifact-output"]
  },
  {
    id: "implementation-plan", name: "Implementation plan", domain: "delivery", subdomain: "execution-artifact", status: "partial",
    summary: "Translate a recommendation into workstreams, tasks, owners, dependencies, milestones, resources, risks, measures, decision gates, and sequencing appropriate to the implementation context.",
    businessQuestion: "How should the approved recommendation be implemented from current state to target outcome?", trigger: "build an implementation plan", antiTrigger: "when the recommendation or target state has not been defined",
    requiredInputs: ["approved recommendation or target state"], methodology: "Decompose the target into outcome-bearing workstreams, map dependencies and ownership, sequence by constraints and risk, define milestones and measures, and include validation gates.", outputs: ["text", "structured-model", "spreadsheet", "document"]
  },
  {
    id: "status-report", name: "Project or initiative status report", domain: "delivery", subdomain: "status-reporting", status: "partial",
    summary: "Summarize progress, outcomes, milestones, schedule, budget, scope, risks, issues, dependencies, decisions, actions, forecast, and required escalation using evidence rather than narrative optimism.",
    businessQuestion: "What is the current state of the initiative, what changed, and what requires attention or decision?", trigger: "prepare a project status report", antiTrigger: "when the initiative has not begun and the request is initial planning",
    requiredInputs: ["current status evidence"], methodology: "Compare current evidence to baseline and prior status, distinguish completed outcomes from activity, surface variances and blockers, and make decisions or actions explicit.", outputs: ["text", "document", "presentation"]
  },
  {
    id: "recommendation-roadmap", name: "Recommendation roadmap", domain: "delivery", subdomain: "recommendations", status: "partial",
    summary: "Sequence recommendations by value, dependency, effort, risk, ownership, evidence maturity, timing, validation, and organizational capacity rather than presenting an unprioritized action list.",
    businessQuestion: "In what sequence should the recommendations be implemented and validated?", trigger: "turn recommendations into a roadmap", antiTrigger: "when recommendations have not yet been developed or validated",
    requiredInputs: ["recommendations"], methodology: "Identify dependencies and prerequisites, distinguish no-regret from contingent actions, estimate effort and value qualitatively or quantitatively as supported, and define sequencing and decision gates.", outputs: ["text", "structured-model", "spreadsheet"]
  },
  {
    id: "report-architecture", name: "Adaptive report architecture", domain: "delivery", subdomain: "report-design", status: "partial",
    summary: "Choose a consulting report structure based on the actual decision, audience, evidence, findings, required depth, and artifact format instead of forcing a fixed universal template.",
    businessQuestion: "What report structure will communicate this analysis most effectively to the intended audience?", trigger: "design the structure of a consulting report", antiTrigger: "when the user has supplied an exact required structure that should be preserved",
    requiredInputs: ["analysis objective", "audience"], methodology: "Identify the decision and narrative hierarchy, place evidence where it supports conclusions, tailor depth and appendices, and preserve user-required structure when specified."
  },
  {
    id: "pdf-crud", name: "PDF CRUD", domain: "artifacts", subdomain: "pdf", status: "planned",
    summary: "Create, inspect, update, reorganize, and remove supported PDF content while preserving unaffected content and independently validating the resulting file and rendering.",
    businessQuestion: "How can this PDF be created or edited while preserving unrelated content and layout?", trigger: "perform broad PDF creation or editing", antiTrigger: "when the request is limited to currently supported document metadata inspection or update",
    requiredInputs: ["PDF or creation content"], methodology: "Broad capability remains planned until operation-specific page, form, annotation, merge, split, creation, rendering, and preservation gates are implemented.", mode: "artifact", outputs: ["print-artifact"], artifactFormats: ["pdf"], surfaceRequirements: ["artifact-input", "artifact-output"]
  },
  {
    id: "docx-crud", name: "DOCX CRUD", domain: "artifacts", subdomain: "docx", status: "planned",
    summary: "Create, inspect, update, and remove supported Word content while preserving styles, sections, relationships, drawings, fields, layout, and unaffected document structures.",
    businessQuestion: "How can this Word document be created or edited with validated fidelity?", trigger: "perform broad DOCX creation or editing", antiTrigger: "when the request is limited to supported placeholder-based template patching",
    requiredInputs: ["DOCX or creation content"], methodology: "Broad capability remains planned until representative creation and existing-document preservation gates prove the supported editing envelope.", mode: "artifact", outputs: ["document"], artifactFormats: ["docx"], surfaceRequirements: ["artifact-input", "artifact-output"]
  },
  {
    id: "xlsx-crud", name: "Excel workbook CRUD", domain: "artifacts", subdomain: "xlsx", status: "planned",
    summary: "Create, inspect, update, and remove workbook content while preserving formulas, styles, worksheets, relationships, named items, charts, comments, external links, and relevant metadata where supported.",
    businessQuestion: "How can this workbook be created or edited without silently damaging unsupported structures?", trigger: "perform broad XLSX workbook creation or editing", antiTrigger: "when a simpler CSV or new-workbook-only output safely satisfies the request",
    requiredInputs: ["workbook or model specification"], methodology: "Remain planned until the XLSX engine decision and preservation fixtures support a bounded editing envelope; never equate package read/write with lossless workbook CRUD.", mode: "artifact", outputs: ["spreadsheet"], artifactFormats: ["xlsx"], surfaceRequirements: ["artifact-input", "artifact-output"]
  },
  {
    id: "csv-crud", name: "CSV and delimited-data CRUD", domain: "artifacts", subdomain: "csv", status: "planned",
    summary: "Safely read, validate, create, update, filter, and export delimited tabular data with explicit encoding, delimiter, quoting, schema, row-integrity, and spreadsheet-formula-injection controls.",
    businessQuestion: "How can this delimited dataset be transformed and exported safely and reproducibly?", trigger: "read create or edit CSV data", antiTrigger: "when workbook formulas formatting or multiple sheets require XLSX instead",
    requiredInputs: ["CSV data or tabular specification"], methodology: "Remain planned until a parser/writer and formula-injection protections are verified; transformations must preserve schema and provenance.", mode: "artifact", outputs: ["dataset"], artifactFormats: ["csv"], surfaceRequirements: ["artifact-input", "artifact-output"]
  },
  {
    id: "pptx-crud", name: "Presentation CRUD", domain: "artifacts", subdomain: "pptx", status: "planned",
    summary: "Create, inspect, update, reorder, and remove supported presentation content while validating slide structure, theme consistency, object placement, relationships, and final rendering.",
    businessQuestion: "How can this presentation be created or edited with professional layout and validated fidelity?", trigger: "create or edit a PowerPoint presentation", antiTrigger: "when the request is only to outline slide content in text",
    requiredInputs: ["presentation or slide specification"], methodology: "Remain planned until a PPTX engine and rendering fixtures prove the supported creation and editing envelope.", mode: "artifact", outputs: ["presentation"], artifactFormats: ["pptx"], surfaceRequirements: ["artifact-input", "artifact-output"]
  },
  {
    id: "docx-template-patching", name: "DOCX template placeholder patching", domain: "artifacts", subdomain: "docx-template", status: "implemented",
    summary: "Inspect placeholder keys in a macro-free DOCX template and replace explicitly supplied existing placeholders while retaining original styles where supported and creating a new artifact revision.",
    businessQuestion: "Which placeholders exist in this supported DOCX template and how can supplied values replace them safely?", trigger: "inspect or patch placeholders in a DOCX template", antiTrigger: "when arbitrary existing Word text layout fields comments drawings or tracked changes must be edited",
    requiredInputs: ["macro-free DOCX template", "replacement values for existing keys"], methodology: "Byte-detect DOCX, inspect placeholders, reject unknown keys and macro-enabled packages, patch explicit keys, revalidate the package and remaining placeholders, and preserve artifact revisions.", mode: "artifact", deterministicEngineIds: ["inspect_docx_template", "patch_docx_template"], outputs: ["document"], artifactFormats: ["docx"], surfaceRequirements: ["artifact-input", "artifact-output", "deterministic-engine"], qualityGates: ["artifact.openability", "artifact.preservation", "epistemic.claim-classification"]
  },
  {
    id: "pdf-metadata-update", name: "PDF metadata inspection and update", domain: "artifacts", subdomain: "pdf-metadata", status: "implemented",
    summary: "Inspect PDF page count and document metadata and update only explicitly supplied title, author, subject, keywords, creator, or producer fields while preserving page count and artifact revision history.",
    businessQuestion: "What document metadata does this PDF contain and how can supported metadata fields be updated safely?", trigger: "inspect or update PDF document metadata", antiTrigger: "when existing PDF page text layout forms annotations or page order must be changed",
    requiredInputs: ["PDF artifact"], methodology: "Byte-detect and load the PDF, inspect metadata without mutation, apply only supported explicit fields with revision preconditions, save, reopen, verify page-count preservation, and create a new artifact revision.", mode: "artifact", deterministicEngineIds: ["inspect_pdf", "update_pdf_metadata"], outputs: ["print-artifact"], artifactFormats: ["pdf"], surfaceRequirements: ["artifact-input", "artifact-output", "deterministic-engine"], qualityGates: ["artifact.openability", "artifact.preservation", "epistemic.claim-classification"]
  },
  {
    id: "data-visualization", name: "Data visualization design", domain: "visualization", subdomain: "visualization-strategy", status: "partial",
    summary: "Select and design a chart or analytical exhibit based on the data structure, comparison task, uncertainty, audience, accessibility, and decision rather than aesthetic preference.",
    businessQuestion: "Which visualization form most accurately communicates the analytical question and evidence?", trigger: "choose or design a data visualization", antiTrigger: "when the user explicitly specifies a valid chart form and only rendering remains",
    requiredInputs: ["data or analytical result", "communication objective"], methodology: "Identify the comparison task and data types, choose the simplest honest visual encoding, protect scale and uncertainty integrity, and define labels sources and accessibility requirements.", outputs: ["text", "structured-model", "visualization"]
  },
  {
    id: "bar-chart", name: "Bar or column chart", domain: "visualization", subdomain: "categorical-comparison", status: "planned",
    summary: "Generate a bar or column chart for comparing magnitudes across discrete categories with a defensible zero baseline, ordering, labels, units, and source provenance.",
    businessQuestion: "How do magnitudes compare across discrete categories?", trigger: "create a bar or column chart", antiTrigger: "when the primary task is showing a continuous time trend",
    requiredInputs: ["categorical labels", "numeric values"], methodology: "Validate categories and units, choose horizontal or vertical orientation for readability, preserve a zero baseline unless explicitly justified otherwise, and label material values.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "stacked-bar-chart", name: "Stacked bar chart", domain: "visualization", subdomain: "composition", status: "planned",
    summary: "Generate a stacked bar chart when both total magnitude and category composition matter, using consistent segment ordering and avoiding stacks that defeat comparison.",
    businessQuestion: "How do total values and their component composition differ across categories?", trigger: "create a stacked bar chart", antiTrigger: "when precise comparison of many internal segments matters more than total composition",
    requiredInputs: ["category", "segment", "numeric values"], methodology: "Validate additive components, preserve consistent stack order, use totals and labels where useful, and switch to grouped or small multiples when segment comparison becomes unreadable.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "line-chart", name: "Line chart", domain: "visualization", subdomain: "time-series", status: "planned",
    summary: "Generate a line chart for ordered time or sequence data with consistent intervals, units, meaningful comparison series, direct labeling, and honest treatment of missing observations.",
    businessQuestion: "How does a measure change over an ordered sequence or time period?", trigger: "create a line chart for a trend", antiTrigger: "when observations are unordered categories rather than a meaningful sequence",
    requiredInputs: ["ordered x values", "numeric y values"], methodology: "Validate ordering and intervals, preserve missingness, limit overlapping series, use labels and reference lines only when decision-relevant, and avoid implying interpolation across absent data.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "area-chart", name: "Area chart", domain: "visualization", subdomain: "time-composition", status: "planned",
    summary: "Generate an area chart when magnitude over an ordered axis and accumulated or compositional context matter, while avoiding occlusion and misleading overlapping fills.",
    businessQuestion: "How does magnitude or composition evolve over time when cumulative area is meaningful?", trigger: "create an area chart", antiTrigger: "when precise comparison of overlapping series is the primary task",
    requiredInputs: ["ordered x values", "numeric series"], methodology: "Validate additive or magnitude meaning, choose single or stacked area appropriately, maintain clear baselines and ordering, and prefer lines if filled area reduces accuracy.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "scatter-plot", name: "Scatter plot", domain: "visualization", subdomain: "relationship", status: "planned",
    summary: "Generate a scatter plot to show the relationship, spread, clusters, outliers, and nonlinear patterns between two quantitative variables without implying causation.",
    businessQuestion: "How are two quantitative variables associated across observations?", trigger: "create a scatter plot", antiTrigger: "when one or both axes are categorical rather than quantitative",
    requiredInputs: ["paired numeric observations"], methodology: "Validate paired observations and scales, display raw points or justified aggregation, identify outliers and density, and use trend lines only with clear model and causality caveats.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "bubble-chart", name: "Bubble chart", domain: "visualization", subdomain: "multivariate-relationship", status: "planned",
    summary: "Generate a bubble chart when a third quantitative measure materially adds context to a two-dimensional relationship and area scaling can be explained clearly.",
    businessQuestion: "How do two quantitative variables relate when the size of each observation is also decision-relevant?", trigger: "create a bubble chart", antiTrigger: "when bubble size would be decorative or difficult to compare accurately",
    requiredInputs: ["x values", "y values", "positive size measure"], methodology: "Scale bubble area rather than radius to the size variable, validate ranges, limit overlap, label salient points, and use another chart if size comparison is the main analytical task.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "histogram", name: "Histogram", domain: "visualization", subdomain: "distribution", status: "planned",
    summary: "Generate a histogram to show the distribution of a quantitative variable using a defensible bin strategy, clear units, sample size, and treatment of missing or extreme values.",
    businessQuestion: "What shape and concentration does this quantitative distribution have?", trigger: "create a histogram", antiTrigger: "when the values are categories rather than a quantitative continuum",
    requiredInputs: ["numeric observations"], methodology: "Validate numeric data, choose bin width from data and communication need, preserve full range or explain truncation, and distinguish counts from density.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "box-plot", name: "Box plot", domain: "visualization", subdomain: "distribution-comparison", status: "planned",
    summary: "Generate a box plot for compact comparison of medians, quartiles, spread, and potential outliers across groups while explaining the whisker convention.",
    businessQuestion: "How do distributions differ in center, spread, and tails across groups?", trigger: "create a box plot", antiTrigger: "when the audience needs to see the full distribution shape and sample is small enough for raw points",
    requiredInputs: ["numeric observations", "optional group labels"], methodology: "Calculate quartiles consistently, state whisker/outlier convention, show group sample sizes, and consider overlaying points when sparse data could make boxes misleading.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "waterfall-chart", name: "Waterfall chart", domain: "visualization", subdomain: "bridge", status: "planned",
    summary: "Generate a waterfall chart to reconcile a starting value through additive positive and negative drivers to an ending value, preserving sign, units, and exact bridge reconciliation.",
    businessQuestion: "Which additive drivers explain the change from starting value to ending value?", trigger: "create a waterfall or bridge chart", antiTrigger: "when components are percentages or non-additive effects that do not reconcile to the total",
    requiredInputs: ["starting value", "additive bridge components", "ending value"], methodology: "Validate that components reconcile to the ending value, order drivers meaningfully, label totals and contributions, and reject double-counted or non-additive components.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "funnel-chart", name: "Funnel chart", domain: "visualization", subdomain: "funnel", status: "planned",
    summary: "Generate a funnel chart or stage-conversion exhibit when stages represent a valid decreasing or process population, with explicit counts and conversion rates rather than decorative tapering.",
    businessQuestion: "Where does volume fall through a defined sequence of stages?", trigger: "create a funnel chart", antiTrigger: "when stages do not represent comparable sequential populations",
    requiredInputs: ["ordered stages", "stage counts"], methodology: "Validate stage definitions and population flow, calculate conversion rates, label counts and denominators, and use bars instead if funnel geometry would exaggerate differences.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "pareto-chart", name: "Pareto chart", domain: "visualization", subdomain: "prioritization", status: "planned",
    summary: "Generate a descending category bar chart with cumulative-share line to show which measured categories account for the largest observed contribution to an impact.",
    businessQuestion: "Which categories account for most of the measured impact and how quickly does cumulative contribution rise?", trigger: "create a Pareto chart", antiTrigger: "when categories have not been aggregated using a consistent impact measure",
    requiredInputs: ["categories", "impact values"], methodology: "Sort impact descending, calculate cumulative share against the total, show both scales clearly, and avoid interpreting the visual concentration as proof of root cause.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "heatmap", name: "Heatmap", domain: "visualization", subdomain: "matrix", status: "planned",
    summary: "Generate a heatmap for a matrix of comparable values where color encodes magnitude or category consistently and numeric labels or legends preserve interpretability and accessibility.",
    businessQuestion: "Where are high, low, or patterned values concentrated across two dimensions?", trigger: "create a heatmap", antiTrigger: "when color would encode incomparable metrics across cells",
    requiredInputs: ["row categories", "column categories", "cell values"], methodology: "Validate comparable cell measures, choose an appropriate sequential or diverging encoding, label scale and missingness, and provide values or text alternatives for accessibility.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "correlation-matrix", name: "Correlation matrix visualization", domain: "visualization", subdomain: "statistical-matrix", status: "planned",
    summary: "Generate a matrix view of pairwise correlation coefficients with consistent scale, sample-size or missingness awareness, and explicit warning that association is not causation.",
    businessQuestion: "Which variable pairs show the strongest positive or negative linear or rank association?", trigger: "visualize a correlation matrix", antiTrigger: "when correlations have not been calculated using compatible data and methods",
    requiredInputs: ["correlation matrix or multivariate data"], methodology: "Validate symmetric coefficients and variable labels, use a centered diverging scale, expose missing or low-sample cells, and avoid causal language.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "treemap", name: "Treemap", domain: "visualization", subdomain: "hierarchical-composition", status: "planned",
    summary: "Generate a treemap for hierarchical part-to-whole data when relative area comparison and hierarchy matter, while limiting depth and labels enough to remain readable.",
    businessQuestion: "How is a total distributed across hierarchical categories?", trigger: "create a treemap", antiTrigger: "when precise comparison of similar-sized categories is more important than hierarchy",
    requiredInputs: ["hierarchical categories", "positive size values"], methodology: "Validate additive hierarchy, size rectangles by area, limit levels, label major categories, and prefer bars when accurate rank comparison is the primary task.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "gantt-visual", name: "Gantt visualization", domain: "visualization", subdomain: "schedule", status: "planned",
    summary: "Render task spans, milestones, dependencies, owners, and schedule status on a time axis without inventing dates or hiding unscheduled or blocked work.",
    businessQuestion: "How do project tasks and milestones overlap and sequence over time?", trigger: "render a Gantt chart", antiTrigger: "when tasks lack dates or durations and only dependency order is known",
    requiredInputs: ["tasks", "start and end dates or durations"], methodology: "Validate schedule chronology, render task spans and milestones, distinguish baseline from actual or forecast when supplied, and show dependencies only when they improve comprehension.", mode: "artifact", outputs: ["visualization", "diagram"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "timeline", name: "Timeline visualization", domain: "visualization", subdomain: "time", status: "planned",
    summary: "Render dated events, phases, decisions, or milestones on a chronological axis with clear temporal spacing, labels, uncertainty where dates are approximate, and grouping when needed.",
    businessQuestion: "What is the chronological sequence of the material events or milestones?", trigger: "create a timeline", antiTrigger: "when durations and task overlaps require a Gantt rather than event chronology",
    requiredInputs: ["dated events or milestones"], methodology: "Validate dates and ordering, distinguish point events from periods, preserve approximate-date uncertainty, and prioritize material events to prevent label overload.", mode: "artifact", outputs: ["visualization", "diagram"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "control-run-chart", name: "Run or control chart", domain: "visualization", subdomain: "process-performance", status: "planned",
    summary: "Render time-ordered process measures with centerline and, when statistically appropriate, calculated control limits to distinguish common-cause variation from special signals.",
    businessQuestion: "Is process performance stable over time or showing unusual variation?", trigger: "create a run chart or control chart", antiTrigger: "when the data type subgrouping or control-chart assumptions are undefined",
    requiredInputs: ["time-ordered process observations"], methodology: "Choose run versus appropriate control chart from data structure, calculate center and limits reproducibly where valid, apply signal rules transparently, and distinguish control limits from specification limits.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output", "deterministic-engine"]
  },
  {
    id: "cohort-heatmap", name: "Cohort heatmap", domain: "visualization", subdomain: "cohort", status: "planned",
    summary: "Render cohort-by-lifecycle-period metrics as a matrix so retention, revenue, engagement, or other behavior can be compared across cohorts without confusing calendar and tenure effects.",
    businessQuestion: "How does lifecycle behavior differ across cohorts?", trigger: "create a cohort heatmap", antiTrigger: "when cohorts or lifecycle periods are not consistently defined",
    requiredInputs: ["cohort", "lifecycle period", "metric"], methodology: "Align cohorts on common tenure periods, preserve incomplete tails, use a consistent metric scale, and label cohort sizes or missingness where material.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "risk-heatmap", name: "Risk heatmap", domain: "visualization", subdomain: "risk", status: "planned",
    summary: "Render risks on defined likelihood and impact scales with identifiers and categories while preserving the ordinal nature and limitations of qualitative risk scoring.",
    businessQuestion: "Where do assessed risks fall across the defined likelihood and impact matrix?", trigger: "create a risk heatmap", antiTrigger: "when risk likelihood or impact has not been assessed using defined scales",
    requiredInputs: ["risk records", "likelihood and impact scores"], methodology: "Validate scale definitions, plot risks without implying interval precision, handle overlapping risks legibly, and pair the matrix with textual risk detail and treatment actions.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "tornado-chart", name: "Tornado sensitivity chart", domain: "visualization", subdomain: "sensitivity", status: "planned",
    summary: "Render one-way sensitivity ranges for model drivers ordered by their effect on a defined output, using consistent low/high assumptions and a clearly stated base case.",
    businessQuestion: "Which input assumptions have the largest one-way effect on the model outcome?", trigger: "create a tornado sensitivity chart", antiTrigger: "when sensitivities were not calculated from a consistent underlying model",
    requiredInputs: ["base output", "low and high output per driver"], methodology: "Validate common base case and one-way variation, calculate deviations consistently, sort by impact range, and label assumption values so visual width is traceable to model inputs.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "decision-tree-visual", name: "Decision-tree visualization", domain: "visualization", subdomain: "decision", status: "planned",
    summary: "Render decision nodes, chance or uncertainty branches, outcomes, and values or probabilities when supplied so sequential choices and contingent paths are understandable.",
    businessQuestion: "How do sequential decisions and uncertain outcomes branch from the current choice?", trigger: "create a decision tree diagram", antiTrigger: "when the request is a machine-learning classification tree rather than a business decision tree",
    requiredInputs: ["decision branches and outcomes"], methodology: "Distinguish decision from uncertainty nodes, preserve branch labels and supplied values, calculate expected values only when valid probabilities are supplied, and avoid inventing probabilities.", mode: "artifact", outputs: ["diagram", "visualization"], artifactFormats: ["svg", "mermaid"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "process-diagram", name: "Process diagram rendering", domain: "visualization", subdomain: "process", status: "partial",
    summary: "Render validated process steps, decisions, handoffs, start/end events, and exception paths as a clear vector or text-defined diagram without changing the underlying process logic.",
    businessQuestion: "How can the validated process structure be communicated visually?", trigger: "render a process flow diagram", antiTrigger: "when the current process has not yet been mapped or validated",
    requiredInputs: ["validated process model"], methodology: "Preserve node and decision semantics, choose a readable flow direction, minimize crossings, label exceptions and ownership when useful, and keep visual layout separate from process analysis.", mode: "artifact", outputs: ["diagram"], artifactFormats: ["svg", "mermaid"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "dependency-diagram", name: "Dependency diagram rendering", domain: "visualization", subdomain: "dependencies", status: "partial",
    summary: "Render directed dependencies among tasks, deliverables, systems, capabilities, or decisions with clear node labels, direction, grouping, and cycle visibility.",
    businessQuestion: "How can the validated dependency structure be shown clearly enough to reveal sequence and convergence?", trigger: "render a dependency diagram", antiTrigger: "when dependencies have not been defined and the user needs discovery rather than rendering",
    requiredInputs: ["dependency graph"], methodology: "Validate node identities and edge direction, choose a layout that minimizes crossings, highlight critical convergence or cycles, and avoid adding dependencies for visual symmetry.", mode: "artifact", outputs: ["diagram"], artifactFormats: ["svg", "mermaid"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "strategy-map-visual", name: "Strategy-map visualization", domain: "visualization", subdomain: "strategy", status: "partial",
    summary: "Render validated strategic objectives and causal hypotheses as an accessible strategy map while preserving direction, perspective grouping, and uncertainty in unproven links.",
    businessQuestion: "How can the validated cause-and-effect strategy logic be communicated visually?", trigger: "render a strategy map", antiTrigger: "when the strategic objective relationships have not yet been analyzed",
    requiredInputs: ["strategy-map model"], methodology: "Preserve objective identities and causal direction, group by meaningful perspective or layer, avoid decorative crossing arrows, and visually distinguish hypothesis from measured linkage when needed.", mode: "artifact", outputs: ["diagram"], artifactFormats: ["svg", "mermaid"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "positioning-map-visual", name: "Positioning map", domain: "visualization", subdomain: "market-positioning", status: "planned",
    summary: "Plot brands, products, or options on two evidence-backed positioning dimensions with transparent measurement, uncertainty, and axis interpretation rather than arbitrary perceptual coordinates.",
    businessQuestion: "How do options compare on two strategically meaningful positioning dimensions?", trigger: "create a positioning map", antiTrigger: "when axis values are purely invented or cannot be placed consistently",
    requiredInputs: ["options", "two positioning measures"], methodology: "Define axes from decision-relevant constructs, normalize comparable measures, plot points with labels and uncertainty where supported, and avoid implying precision beyond the underlying evidence.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "kpi-dashboard", name: "KPI dashboard design", domain: "visualization", subdomain: "dashboard", status: "planned",
    summary: "Design a decision-focused dashboard that prioritizes a small set of outcomes and drivers, trend context, targets, alerts, definitions, ownership, and drill-down paths without visual clutter.",
    businessQuestion: "Which measures and views should a decision-maker monitor together to understand performance and act?", trigger: "design a KPI dashboard", antiTrigger: "when the user only needs one chart or one metric card",
    requiredInputs: ["decision audience", "KPI definitions"], methodology: "Start from decisions and outcomes, select non-redundant measures, choose appropriate visual encodings, establish hierarchy and exceptions, and include definitions and freshness context.", mode: "artifact", outputs: ["visualization", "interactive"], artifactFormats: ["html", "svg"], surfaceRequirements: ["artifact-output", "interactive-ui"]
  },
  {
    id: "two-by-two-matrix", name: "2x2 matrix visualization", domain: "visualization", subdomain: "matrix", status: "planned",
    summary: "Render options on two explicitly defined dimensions with meaningful thresholds or quadrants, preserving underlying evidence and avoiding arbitrary axes chosen only for visual simplicity.",
    businessQuestion: "How do options distribute across two decision-relevant dimensions?", trigger: "create a 2x2 matrix", antiTrigger: "when the decision depends on more than two non-reducible dimensions and the matrix would hide them",
    requiredInputs: ["options", "two dimensions", "dimension values or categories"], methodology: "Define axes and threshold logic, normalize values, plot options, label quadrants descriptively rather than normatively unless justified, and preserve source evidence.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "nine-cell-grid", name: "9-cell grid visualization", domain: "visualization", subdomain: "matrix", status: "planned",
    summary: "Render entities across two three-level dimensions to support portfolio or talent-style categorization while making thresholds, evidence, and consequences explicit rather than treating cells as precise truth.",
    businessQuestion: "How do entities fall across two three-level assessment dimensions?", trigger: "create a 9 cell grid", antiTrigger: "when underlying measures cannot support defensible low medium high categorization",
    requiredInputs: ["entities", "two dimensions", "threshold rules"], methodology: "Define threshold rules, classify entities consistently, show labels and evidence, and avoid deriving high-stakes individual conclusions from weak ordinal categorization.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "marimekko-chart", name: "Marimekko chart", domain: "visualization", subdomain: "market-composition", status: "planned",
    summary: "Render a Marimekko-style chart when both category width and internal segment share encode meaningful additive dimensions, with explicit totals and labels to mitigate area-comparison difficulty.",
    businessQuestion: "How do both total category size and internal composition vary simultaneously?", trigger: "create a Marimekko chart", antiTrigger: "when the audience needs precise comparison better served by separate bars or tables",
    requiredInputs: ["category totals", "segment composition"], methodology: "Validate additive totals and segment shares, size widths and heights consistently, label major cells and totals, and use the form only when two-dimensional composition adds material insight.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "radar-chart", name: "Radar chart", domain: "visualization", subdomain: "profile-comparison", status: "planned",
    summary: "Render a radar chart only for a small set of comparable normalized dimensions when overall profile shape is useful and precise cross-axis comparison is not the primary task.",
    businessQuestion: "How do a small number of options differ in overall profile across normalized dimensions?", trigger: "create a radar chart", antiTrigger: "when dimensions use incompatible scales or precise pairwise comparison is important",
    requiredInputs: ["options", "normalized dimension values"], methodology: "Normalize dimensions to a common interpretable scale, keep axes and series limited, label values, and prefer bars or matrices when radar geometry would obscure differences.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  },
  {
    id: "geographic-map", name: "Geographic business map", domain: "visualization", subdomain: "geospatial", status: "planned",
    summary: "Map business measures to locations or geographic regions using an appropriate point, symbol, or choropleth encoding while respecting denominator, projection, boundary, and comparability issues.",
    businessQuestion: "How does the business measure vary geographically and where are meaningful spatial concentrations?", trigger: "create a geographic business map", antiTrigger: "when location is incidental and a non-map chart would communicate the comparison more accurately",
    requiredInputs: ["geographic identifiers or coordinates", "mapped measure"], methodology: "Validate geography and measure denominator, choose map type from analytical task, avoid area-driven distortion, document source boundaries, and provide a text or tabular alternative.", mode: "artifact", outputs: ["visualization"], artifactFormats: ["svg"], surfaceRequirements: ["artifact-output"]
  }
];

export const innovationDeliveryArtifactCapabilities = seeds.map(defineStandardCapability);
