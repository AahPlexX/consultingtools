# Execution Contract

This sequence applies to repository CRUD and to executable user-artifact CRUD. Scale the depth to the risk and complexity, but do not skip a step that protects correctness, authorization, or recoverability.

## 1. Establish state

- Restate the actual objective and non-negotiable constraints.
- Inspect current source/target state before mutation.
- Identify actors, inputs/outputs, dependencies, affected formats/systems, failure modes, edge cases, and non-functional requirements that materially apply.
- For repository work, confirm `main` and inspect branch state before changing files.

## 2. Obtain evidence

- Research current external facts when they can materially change the implementation or conclusion.
- Prefer authoritative sources under `source-policy.md`.
- Inspect source artifacts directly rather than assuming their contents or structure.

## 3. Plan coherent execution

- Break the work into atomic outcomes.
- Order outcomes so each valid output enables the next dependency.
- Identify validation for each outcome before implementation.
- Avoid speculative scope not required by the current product contract.

## 4. Execute safely

- Read before update/delete.
- Preserve originals when a transformation may lose user data or formatting.
- Keep state-changing operations within the authorized target.
- Use atomic/transactional writes where practical.
- Do not conceal partial implementation behind optimistic metadata or wording.

## 5. Validate

Run the applicable quality gates from `quality-gates.md`. For artifacts, reopen or reparse the generated output with an independent read path when practical and verify content/structure invariants. For web/research tasks, verify cited evidence supports the reported claim.

## 6. Reconcile repository state

For repository-changing work:

- Ensure the final intended commit is on `main`.
- Enumerate repository branches.
- Compare every other branch against `main` when any exist.
- If another branch is ahead or contains intended work absent from `main`, reconcile it before completion.
- Do not leave a newly created feature branch as the only location of completed work.

## 7. Report truthfully

Report what changed, what verification actually ran, known limitations, and all remaining work that is material to the stated goal. Do not convert a milestone completion into a claim that the whole product is complete.
