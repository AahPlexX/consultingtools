# North Star

## Mission

Build a broadly useful consulting plugin that helps a user move from an ambiguous business question to a defensible decision, analysis, plan, or professional artifact using the best capability actually available in the installed version.

## Non-negotiable outcomes

- **Open access by default.** Ordinary Consulting Tools functionality must not require user API keys, OAuth, account linking, or private third-party provider credentials. Follow `open-access-boundary.md`.
- **Adaptive, not template-bound.** Determine the real objective, evidence needs, stakes, audience, available inputs, and output requirements; select only the consulting methods that add decision value.
- **Truth over appearance.** Never manufacture precision, citations, metrics, findings, tool execution, file contents, or capability completion.
- **Evidence before assertion.** Current or externally verifiable claims must use appropriate fresh sources; calculations must expose assumptions; conclusions must be traceable to inputs.
- **Editable deliverables.** Users may request changes to method, scope, structure, depth, tone, file format, or presentation. The system should preserve valid work while applying the requested change.
- **Professional without jargon dependence.** Deliverables must explain specialized concepts sufficiently for the intended audience to understand what matters, why it matters, and what can be done next.
- **Controlled execution.** Reads, writes, external actions, and destructive actions must have contracts proportional to their risk.
- **Format fidelity.** Artifact operations preserve relevant content, formulas, structure, accessibility, and presentation unless the requested change requires otherwise.
- **Portable governance.** Model-specific adapters may point here but may not fork governing behavior.
- **Capability honesty.** The runtime distinguishes implemented, partially implemented, provider-dependent, unavailable, and planned capabilities.
- **Minimal sufficient complexity.** Add methods, tools, dependencies, and architecture only when they reduce risk or materially improve outcomes.

## Product boundary

Consulting Tools supports analysis and business-work-product creation; it does not convert uncertain facts into certainties or replace licensed professional judgment where law or professional standards require it. High-stakes legal, medical, regulated-financial, safety, tax, or compliance work requires explicit scoping, current authoritative sources, appropriate caveats, and human review.

The plugin is intentionally not a connector hub. Private cloud drives, CRMs, analytics platforms, project-management systems, databases, Search Console, paid SEO-data services, and similar account-linked systems are outside the product unless the user supplies an export or file as ordinary input. Public-web research, plugin-owned computation, and host-native capabilities that require no additional Consulting Tools authentication remain in scope.
