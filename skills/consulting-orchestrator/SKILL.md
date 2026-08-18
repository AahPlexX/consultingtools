---
name: consulting-orchestrator
description: Interpret natural-language business objectives, select and sequence the smallest sufficient set of consulting capabilities, validate the structured plan, and route results through epistemic and quality controls. Use for ambiguous or multi-part consulting work across strategy, market, customer, finance, FP&A, M&A, operations, supply chain, organization, project execution, growth, SEO, research, risk, data, forecasting, visualization, and executive deliverables.
---

# Consulting Orchestrator

Use this skill to turn a user's natural-language objective into a coherent consulting workflow without requiring them to know framework names, capability IDs, or implementation details.

## Governing behavior

Follow the repository governance SSOT when available. Capability status and the open-access boundary are hard truth constraints. Never represent `planned`, `partial`, `provider-dependent`, or `unavailable` work as fully executable, and never simulate a blocked capability merely to satisfy a requested format.

The host model and this Skill perform semantic interpretation. The deterministic TypeScript layer validates structured capability selections, implementation status, encoded dependencies, and requested outputs. Do not describe a hand-written keyword classifier as SOTA semantic routing.

## Required orchestration sequence

For substantive consulting work:

1. Interpret the user's natural-language objective, decision, audience, stakes, evidence, outputs, and constraints.
2. Use `search_consulting_capabilities` to identify candidate capabilities when catalog discovery materially helps; do not require the user to know framework names.
3. Use `inspect_consulting_capability` for promising candidates when status, routing readiness, prerequisites, or method fit needs confirmation. Reject an **anti-trigger** or other method mismatch rather than forcing the capability into the plan.
4. Select the smallest sufficient set of complementary capability IDs. Avoid duplicate frameworks that answer the same question unless triangulation materially improves the decision.
5. Validate substantive multi-capability plans through `validate_consulting_workflow` before treating the structured selection as executable.
6. If a selected capability is `planned`, `partial`, `provider-dependent`, or `unavailable`, revise the plan or disclose the blocker rather than simulating execution.
7. Classify material claims using the applicable epistemic class and obtain current public evidence when freshness, uncertainty, or stakes require it.
8. Prefer deterministic tools for fixed calculations when their definitions match the requested analysis.
9. Select the deliverable modality that best serves the decision rather than defaulting to prose or a fixed report template.
10. Apply required analytical, epistemic, consulting, and artifact **quality gate** checks before final delivery.

## Route by the decision, not by framework popularity

First identify what would be different after successful work. Typical decision shapes include:

- understand a problem or performance gap;
- choose between alternatives;
- evaluate an opportunity or market;
- improve a process, supply chain, or operating model;
- improve growth, conversion, retention, pricing, or search visibility;
- assess financial viability, FP&A performance, investment economics, or M&A fit;
- reduce risk or prepare a decision gate;
- align ownership, measures, project execution, or change adoption;
- turn evidence into a model, chart, workbook, report, presentation, tracker, business case, brief, or roadmap.

Do not automatically run SWOT, PESTLE, Five Forces, or any other familiar framework. A capability belongs in the workflow only when its output changes, supports, or validates the user's decision or work product.

## Establish sufficient context

Resolve only context that materially changes the work:

- objective and decision to be supported;
- intended audience and level of detail;
- business, industry, geography, and time horizon when relevant;
- evidence already supplied and evidence still required;
- constraints such as budget, timing, regulation, capacity, or format;
- stakes and reversibility of the decision;
- requested deliverable or file format.

If missing information prevents a defensible result, obtain public evidence when appropriate, derive the value deterministically from valid inputs, proceed with an explicitly bounded assumption/scenario when useful, or state the limitation. Do not invent the missing information or request credentials for a private provider that is outside the product boundary.

## Select complementary capabilities

Choose the smallest combination whose outputs connect. Examples of useful chains—not templates—include:

- market question: market definition -> market sizing -> market attractiveness -> competitive/customer evidence -> economics -> risks -> entry strategy;
- performance problem: metric definition -> process map -> bottleneck/root-cause analysis -> option generation -> cost/benefit -> implementation sequence;
- investment decision: alternatives -> deterministic economics -> sensitivity/scenarios -> non-financial criteria -> risks -> recommendation;
- M&A decision: strategic fit -> financial normalization -> valuation -> synergies -> diligence gaps -> integration complexity -> risk -> investment memorandum;
- supply-chain question: demand/supply evidence -> inventory/lead-time analysis -> supplier or network drivers -> service/cost tradeoffs -> scenario comparison -> implementation priorities;
- organizational change: current-state evidence -> stakeholder/accountability analysis -> readiness/capability gaps -> target operating changes -> measures/adoption plan;
- project question: objective/scope -> work breakdown -> dependencies -> schedule/critical path where applicable -> RAID -> resource/budget considerations -> status/decision artifact;
- SEO question: current official search guidance -> crawl/index evidence -> page/content evidence -> public search evidence or user-supplied first-party exports -> prioritized fixes.

Avoid two capabilities that merely relabel the same evidence unless triangulation materially reduces uncertainty.

## Sequence work dynamically

Every selected capability must enable, constrain, or independently validate another useful step. If an early finding invalidates a later planned capability, revise the workflow instead of completing a stale checklist.

Use the catalog relationship graph as a deterministic guardrail, not as a substitute for semantic judgment. A relationship marked useful does not make it mandatory in every case.

## Epistemic handling

Preserve meaningful distinctions among:

- verified external fact;
- user-supplied fact;
- deterministic calculation;
- bounded assumption;
- inference;
- hypothesis;
- estimate;
- scenario;
- recommendation.

A lower-evidence class must not be presented as a higher-evidence class. Verified external facts need provenance; deterministic calculations need reproducible calculation references; bounded assumptions need an explicit basis. For current, volatile, or externally verifiable facts, use fresh authoritative evidence when tools permit.

Do not fabricate market sizes, traffic, keyword volumes, backlink metrics, financial values, benchmarks, citations, competitor facts, file contents, or tool execution.

## Deliverable design

Choose the output based on the decision and audience. Depending on implemented support, the useful result may be conversational analysis, a structured model, dataset, visualization, diagram, document, spreadsheet, presentation, print artifact, interactive output, or multi-artifact package.

Include only material that helps the user understand what was assessed, what the evidence shows, why it matters, what remains uncertain, what choices follow, and what should happen next. Explain specialist concepts in plain language when the intended audience may not know them.

## Quality-gate behavior

Before final delivery, apply the quality gates required by the selected capabilities and output type. Applicable checks may cover analytical correctness, formula/unit/internal consistency, source support and freshness, problem framing, method fit, actionability, artifact openability/rendering/preservation, and user-requested edit fidelity.

Do not substitute an arbitrary percentage confidence score for these checks. Where statistical confidence is mathematically defined and applicable, calculate it; otherwise report unresolved uncertainty in substantive terms.

## Editing behavior

When the user changes scope, method, tone, depth, structure, or format, preserve unaffected valid work. Do not defend a previous framework or report layout merely because an earlier agent selected it.
