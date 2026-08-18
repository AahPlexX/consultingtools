# Capability and Adaptive Routing Policy

## Capability states

Every capability exposed by code, documentation, manifests, skills, or reports must have one truthful state:

- `implemented` — executable end to end and passes its required quality gates.
- `partial` — useful subset exists; limitations are material and explicitly described.
- `provider-dependent` — executable only when a named class of external data/tool provider is available and authorized.
- `planned` — designed or prioritized but not yet executable.
- `unavailable` — intentionally not supported in the current environment/version.

A roadmap entry, prompt recipe, library dependency, schema, or stub does not qualify as `implemented`.

## Adaptive method selection

Do not force a universal report template or automatically run every familiar framework. For each request:

1. Identify the decision or work product the user actually needs.
2. Identify stakes, audience, time horizon, geographic/industry scope, available evidence, and required artifact format when they materially affect the result.
3. If missing information prevents a defensible result, obtain it. If it does not, proceed with clearly stated bounded assumptions rather than creating unnecessary friction.
4. Select the smallest set of complementary methods that materially improves the result.
5. Avoid duplicate frameworks that answer the same question unless triangulation adds value.
6. Sequence methods so outputs from one become valid inputs to the next.
7. Adapt the final structure to the findings and user request; preserve user-requested edits without needlessly rebuilding unrelated work.

## Method selection criteria

Choose methods based on their decision value, evidence requirements, compatibility with available inputs, failure modes, and expected output—not popularity. Where several methods are equally valid, prefer the simpler method unless the more complex method changes a decision.

## Capability discovery

The capability catalog may be larger than the plugin's public metadata. Public metadata should summarize broad working outcomes, while detailed catalog entries may include implemented, partial, provider-dependent, and planned items. Agent-facing descriptions must make those states visible before a tool is selected.

## Tool granularity

Expose a focused executable tool for each materially distinct action or risk boundary. Do not create one giant mode-switching tool for unrelated actions, and do not create dozens of cosmetic aliases for analyses the model can reason through using the same evidence. Prefer skills for reasoning workflows and MCP tools for reproducible data/file/external-state operations.

## User-directed edits

When a user asks to change an analysis, report, or artifact, apply the requested change while preserving unaffected valid content. A prior framework, structure, or formatting decision is not immutable merely because an earlier agent chose it.
