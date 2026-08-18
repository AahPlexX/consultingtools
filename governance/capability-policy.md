# Capability and Adaptive Routing Policy

## Capability states

Every capability exposed by code, documentation, manifests, skills, or reports must have one truthful state:

- `implemented` — executable end to end and passes its required quality gates.
- `partial` — useful subset exists; limitations are material and explicitly described.
- `provider-dependent` — executable only when the active host or an anonymous/open external capability is available, with no additional user API key, OAuth grant, account link, or private-provider credential required by Consulting Tools.
- `planned` — designed or prioritized but not yet executable.
- `unavailable` — intentionally unsupported in the current product/environment, including any capability whose execution inherently requires user API credentials, OAuth, account linking, or a private provider connection prohibited by `open-access-boundary.md`.

A roadmap entry, prompt recipe, library dependency, schema, or stub does not qualify as `implemented`.

`provider-dependent` must not be used as a back door for credentialed integrations. Google Drive/Docs/Sheets, Microsoft 365, CRMs, authenticated analytics, Search Console, commercial keyword/backlink providers, private databases, and similar account-linked systems are outside the current product boundary. If a user directly supplies an export from one of those systems, analysis of that supplied artifact is ordinary input processing rather than a provider integration.

## Adaptive method selection

Do not force a universal report template or automatically run every familiar framework. For each request:

1. Identify the decision or work product the user actually needs.
2. Identify stakes, audience, time horizon, geographic/industry scope, available evidence, and required artifact format when they materially affect the result.
3. If missing information prevents a defensible result, obtain it from user-supplied input or openly accessible evidence when possible. Do not require an account-linked provider merely to fill a gap.
4. If the missing information cannot be obtained within the open-access boundary, state the limitation instead of inventing it or requesting credentials.
5. Select the smallest set of complementary methods that materially improves the result.
6. Avoid duplicate frameworks that answer the same question unless triangulation adds value.
7. Sequence methods so outputs from one become valid inputs to the next.
8. Adapt the final structure to the findings and user request; preserve user-requested edits without needlessly rebuilding unrelated work.

## Method selection criteria

Choose methods based on their decision value, evidence requirements, compatibility with available inputs, failure modes, and expected output—not popularity. Where several methods are equally valid, prefer the simpler method unless the more complex method changes a decision.

## Capability discovery

The capability catalog may be larger than the plugin's public metadata. Public metadata should summarize broad working outcomes, while detailed catalog entries may include implemented, partial, provider-dependent, unavailable, and planned items. Agent-facing descriptions must make those states visible before a tool is selected.

Any catalog entry that inherently depends on credentials or private account authorization must be `unavailable` under the current product boundary, even if a third-party service exists that could theoretically provide the data.

## Tool granularity

Expose a focused executable tool for each materially distinct action or risk boundary. Do not create one giant mode-switching tool for unrelated actions, and do not create dozens of cosmetic aliases for analyses the model can reason through using the same evidence. Prefer skills for reasoning workflows and MCP tools for reproducible data/file/public-research operations.

Do not build a generic provider ecosystem, OAuth broker, credential vault, or connector marketplace for Consulting Tools.

## User-directed edits

When a user asks to change an analysis, report, or artifact, apply the requested change while preserving unaffected valid content. A prior framework, structure, or formatting decision is not immutable merely because an earlier agent chose it.
