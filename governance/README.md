# Governance Source of Truth

This directory is the authoritative governance index for Consulting Tools. It is intentionally a directory of focused rules rather than one rigid master template. Agents must compose the applicable rules for the work being performed.

## Required documents

| Document | Governs |
| --- | --- |
| `north-star.md` | Mission, product boundaries, non-negotiable outcomes |
| `platform-baseline.md` | Dated OpenAI/MCP/runtime assumptions and mandatory revalidation triggers |
| `xlsx-engine-decision.md` | Dated XLSX engine security/preservation decision and revalidation conditions |
| `safety-security.md` | Authorization, privacy, untrusted input, destructive actions, secrets |
| `source-policy.md` | Evidence quality, freshness, provenance, uncertainty |
| `capability-policy.md` | Capability states, adaptive consulting method selection, truthful discovery |
| `execution-contract.md` | Repository and artifact CRUD execution sequence |
| `quality-gates.md` | Tests and evidence required before completion claims |

## Precedence

1. Applicable platform safety, law, and host-runtime constraints always apply.
2. Current authoritative external specifications supersede a stale dated platform baseline or package decision; update the affected dated governance and implementation together.
3. This governance directory applies repository-wide.
4. More specific rules in this directory refine broader rules but may not weaken safety, evidence, truthfulness, freshness, or branch-integrity requirements.
5. Task-specific docs and implementation notes may add constraints but may not contradict governance.
6. If two repository rules conflict and cannot be reconciled safely, stop the conflicting state change, preserve data, and report the conflict instead of inventing a resolution.

## SSOT discipline

- Put each durable governing rule in exactly one best-fit governance file.
- Other files reference the rule instead of duplicating it.
- Keep examples illustrative, not normative templates.
- Treat dated external-platform/package facts as snapshots that require revalidation when a trigger in the applicable dated governance applies.
- A governance change must preserve consistency across affected rules, code, tests, and plugin metadata.
- Planned behavior is not governing fact until the implementation and its quality gates exist.

## Change protocol

Before changing governance, identify the behavioral reason, affected contracts, migration impact, tests that prove the new behavior, whether current authoritative external facts need revalidation, and whether the change weakens an existing protection. Governance changes must land on `main` and are subject to the same verification requirements as code.
