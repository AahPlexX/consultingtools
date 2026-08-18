# Quality Gates

A completion claim requires fresh evidence from the current repository/artifact state. Passing an earlier run is not evidence for a later mutation.

## Repository baseline

At minimum for code-bearing changes:

- dependency installation succeeds using the repository's declared package manager;
- type checking succeeds;
- unit/contract tests relevant to changed behavior succeed;
- plugin manifest and skill metadata parse and satisfy repository validators;
- no changed file contains committed secrets or obvious placeholder credentials;
- the final intended commit is on `main` and branch parity is verified.

## Capability promotion

A capability may move to `implemented` only when:

1. its user-visible contract is defined;
2. its happy path is executable;
3. relevant error and edge cases are handled;
4. safety annotations/authorization match actual behavior;
5. automated tests cover material invariants;
6. an end-to-end representative fixture or scenario succeeds;
7. output integrity is validated; and
8. documentation/metadata no longer contradicts actual behavior.

`provider-dependent` capabilities additionally require graceful handling of absent credentials/provider access and may not silently substitute fabricated metrics.

## Artifact CRUD gates

Before production-ready status for a file format, test at least:

- create from structured input;
- read/inspect an existing representative file;
- update a targeted part without unintended loss elsewhere;
- delete a supported element when deletion is in scope;
- malformed/corrupt input;
- large but bounded input;
- Unicode and accessibility-relevant content;
- round-trip reopen/parse;
- preservation tests for format-specific structures such as formulas, styles, relationships, metadata, annotations, or pages where promised.

## Research/analysis gates

- material external claims are traceable to evidence;
- calculations reproduce from documented assumptions;
- frameworks do not duplicate each other without a stated reason;
- uncertainty and material missing data are visible;
- recommendations follow from the analysis rather than preceding it.

## Public plugin gates

Before submission, validate the package against current OpenAI plugin packaging/submission requirements, run host-level skill/tool tests, complete security/privacy review, verify publisher/legal metadata, test a clean install, and provide reviewer test cases for all submitted MCP tools.

## Failure rule

If a required gate cannot run or fails, do not claim completion. Fix the failure or retain a truthful non-implemented/partial state and report the blocker.
