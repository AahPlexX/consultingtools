# Governance Source of Truth

`INTENT.md` at the repository root is the canonical project-level intent and current-state artifact. This directory is the authoritative index of **focused governance rules** that refine and operationalize that intent. It is intentionally a directory of focused rules rather than one rigid master template. Agents must compose the applicable rules for the work being performed.

## Required documents

| Document | Governs |
| --- | --- |
| `../INTENT.md` | Project purpose, intended outcomes, current/target state, invariants, non-goals, open questions, intent history |
| `north-star.md` | Detailed mission, product boundaries, non-negotiable outcomes |
| `open-access-boundary.md` | Public no-auth access model and prohibited credential/account integrations |
| `platform-baseline.md` | Dated OpenAI/MCP/runtime assumptions and mandatory revalidation triggers |
| `xlsx-engine-decision.md` | Dated XLSX engine security/preservation decision and revalidation conditions |
| `safety-security.md` | Authorization, privacy, untrusted input, destructive actions, secrets |
| `source-policy.md` | Evidence quality, freshness, provenance, uncertainty |
| `capability-policy.md` | Capability states, adaptive consulting method selection, truthful discovery |
| `execution-contract.md` | Repository and artifact CRUD execution sequence |
| `quality-gates.md` | Tests and evidence required before completion claims |

## Precedence

1. Applicable platform safety, law, and host-runtime constraints always apply.
2. Current explicit user instruction may intentionally change project intent; when it does, update `INTENT.md` and propagate the consequence downstream rather than silently modifying implementation alone.
3. Current authoritative external specifications supersede a stale dated platform baseline or package decision; update the affected dated governance and implementation together.
4. `INTENT.md` governs project purpose, accepted outcomes, current/target state, invariants, non-goals, and intent history.
5. The open-access boundary is a product constraint: ordinary Consulting Tools functionality must not be redesigned to require user API keys, OAuth, account linking, or private-provider credentials.
6. This governance directory applies repository-wide and supplies the focused rules that operationalize project intent.
7. More specific rules in this directory refine broader rules but may not weaken safety, evidence, truthfulness, freshness, open access, branch integrity, or accepted intent.
8. Task-specific docs and implementation notes may add constraints but may not contradict `INTENT.md` or governance.
9. If two repository rules conflict and cannot be reconciled safely, stop the conflicting state change, preserve data, and report the conflict instead of inventing a resolution.

## SSOT discipline

- Put project-level intent/current-state truth in `INTENT.md`; put each durable focused governing rule in exactly one best-fit governance file.
- Other files reference the canonical source instead of duplicating it.
- Keep examples illustrative, not normative templates.
- Treat dated external-platform/package facts as snapshots that require revalidation when a trigger in the applicable dated governance applies.
- A governance change must preserve consistency across affected intent, rules, code, tests, and plugin metadata.
- Planned behavior is not governing fact until the implementation and its quality gates exist.
- Existing implementation does not redefine intent merely because it exists; verified divergence is either a defect, an explicit intent change, or an unresolved conflict that must be reconciled.

## Change protocol

Before changing governance, identify the behavioral reason, affected intent/requirements, migration impact, tests that prove the new behavior, whether current authoritative external facts need revalidation, and whether the change weakens an existing protection. Governance changes must land on `main` and are subject to the same verification requirements as code.
