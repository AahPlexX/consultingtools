# XLSX Engine Decision

**Verified:** 2026-08-18 (America/Chicago)

## Current decision

Do not add `exceljs` to the production dependency tree at this time.

The current latest ExcelJS release remains `4.4.0`. Its own public issue tracker currently contains an open July/August 2026 dependency-security concern documenting vulnerable transitive `uuid` and `tmp` ranges in the latest package, and the tracker also contains current reports where round-tripping existing workbooks can lose or break workbook features. Those findings conflict with this repository's preservation-first and supply-chain safety requirements for a public plugin.

Authoritative/current package and project sources:

- https://www.npmjs.com/package/exceljs
- https://github.com/exceljs/exceljs/releases/tag/v4.4.0
- https://github.com/exceljs/exceljs/issues/3055
- https://github.com/exceljs/exceljs/issues

## Consequence

- Broad `xlsx-crud` remains `planned`.
- Do not install ExcelJS merely to satisfy the roadmap faster.
- Do not describe the existing generic artifact storage/format detector as Excel workbook CRUD.
- A future XLSX engine may be adopted only after current security/advisory review and representative preservation fixtures establish the exact supported envelope.
- A creation-only or read-only XLSX implementation may be promoted separately if its scope can be proven without implying arbitrary lossless existing-workbook mutation.

## Revalidation

Revisit this decision when any of the following occurs:

1. ExcelJS publishes a new release that resolves the current dependency-security concern.
2. A better-maintained engine satisfies the repository's security and preservation gates.
3. A deliberately narrower implementation can be proven without the risky dependency path.

Current external evidence supersedes this file if it becomes stale. Update this decision and affected code in the same execution sequence.
