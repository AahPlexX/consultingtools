# Governance Source of Truth

This directory is the authoritative governance index for Consulting Tools. It is intentionally a directory of focused rules rather than one rigid master template. Agents must compose the applicable rules for the work being performed.

## Required documents

| Document | Governs |
| --- | --- |
| `north-star.md` | Mission, product boundaries, non-negotiable outcomes |
| `safety-security.md` | Authorization, privacy, untrusted input, destructive actions, secrets |
| `source-policy.md` | Evidence quality, freshness, provenance, uncertainty |
| `capability-policy.md` | Capability states, adaptive consulting method selection, truthful discovery |
| `execution-contract.md` | Repository and artifact CRUD execution sequence |
| `quality-gates.md` | Tests and evidence required before completion claims |

## Precedence

1. Applicable platform safety, law, and host-runtime constraints always apply.
2. This governance directory applies repository-wide.
3. More specific rules in this directory refine broader rules but may not weaken safety, evidence, truthfulness, or branch-integrity requirements.
4. Task-specific docs and implementation notes may add constraints but may not contradict governance.
5. If two repository rules conflict and cannot be reconciled safely, stop the conflicting state change, preserve data, and report the conflict instead of inventing a resolution.

## SSOT discipline

- Put each durable governing rule in exactly one best-fit governance file.
- Other files reference the rule instead of duplicating it.
- Keep examples illustrative, not normative templates.
- A governance change must preserve consistency across affected rules, code, tests, and plugin metadata.
- Planned behavior is not governing fact until the implementation and its quality gates exist.

## Change protocol

Before changing governance, identify the behavioral reason, affected contracts, migration impact, tests that prove the new behavior, and whether the change weakens an existing protection. Governance changes must land on `main` and are subject to the same verification requirements as code.
