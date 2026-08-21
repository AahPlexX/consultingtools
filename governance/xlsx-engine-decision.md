# XLSX Engine Decision

**Verified:** 2026-08-21 (America/Chicago)

## Current decision

Do not add `exceljs` to the production dependency tree at this time. Use the repository's verified managed-XLSX v1 engine for the deliberately bounded creation/editing envelope described below, and keep arbitrary third-party workbook mutation outside the supported claim.

The earlier ExcelJS review did not establish a preservation/security basis strong enough for unrestricted workbook round-tripping. The narrower managed-workbook approach now has repository-level verification and avoids implying preservation of unknown OOXML structures.

## Verified managed-XLSX v1 envelope

Consulting Tools can create, inspect, and patch only workbooks that it owns through the managed-v1 package contract. The package contains the `ConsultingToolsManagedWorkbook=1` custom property and an exact, bounded macro-free SpreadsheetML structure.

Verified support includes:

- creation and inspection of macro-free managed `.xlsx` workbooks;
- inline literal strings, finite numbers, booleans, blanks, empty strings, and empty rows;
- worksheet add/delete/rename plus cell, row, and column mutations;
- case-insensitive worksheet-name uniqueness and Excel's 31-character/forbidden-character worksheet-name boundary;
- constrained explicit formula cells using an allowlisted tokenizer/parser; ordinary strings beginning with `=` remain literal text;
- formula functions `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `IF`, `AND`, `OR`, and `ROUND`, with bounded same-workbook references;
- formula rejection for external-workbook references, URLs/protocols, DDE/external-data constructs, `WEBSERVICE`, `FILTERXML`, `HYPERLINK`, `RTD`, `_xll.` forms, malformed tokens, unknown sheet references, controls, and overlength expressions;
- no fabricated cached formula result; the workbook requests recalculation on open;
- bounded ZIP/package validation including traversal, duplicate-entry, expanded-size, unexpected-part, malformed-reference, macro-enabled, and non-managed-package rejection;
- artifact-store revision preconditions for MCP mutation through `patch_managed_xlsx`.

The executable/catalog code gate for CSV plus managed-XLSX passed on commit `485ec1a10f241bed3212abc3a8b8ffd9f3563e62` through GitHub Actions run `32491018071`.

## Explicit non-support boundary

Broad `xlsx-crud` remains `planned` and has no deterministic-engine binding. The managed-v1 implementation does **not** claim arbitrary lossless editing or preservation of third-party workbook styles, charts, drawings, pivots, conditional formatting, data validation, named items, comments, external links/data connections, VBA/macros, unknown relationships/parts, or full Excel formula compatibility.

A generic `.xlsx` that is not a valid Consulting Tools managed-v1 package can be detected as XLSX by the format detector, but `readManagedXlsx`/`patch_managed_xlsx` reject it for managed mutation. This is intentional rather than a missing fallback.

## ExcelJS consequence

- Do not install ExcelJS merely to satisfy the roadmap faster.
- Do not describe generic artifact storage/format detection or managed-v1 mutation as unrestricted Excel workbook CRUD.
- Reconsider a broader XLSX engine only after current dependency/security review and representative third-party preservation fixtures establish a specific supported envelope.
- Managed-v1 can evolve independently where each added workbook feature has explicit parse/write/preservation/security fixtures and does not silently discard unknown workbook state.

## Revalidation

Revisit the broader-engine decision when any of the following occurs:

1. A maintained engine has a current security posture and representative preservation evidence sufficient for the proposed mutation envelope.
2. A new managed-v1 feature can be proven without accepting or silently rewriting arbitrary unknown workbook structures.
3. MCP, OpenAI plugin, SpreadsheetML, or relevant dependency behavior materially changes.

Current authoritative evidence supersedes this file if it becomes stale. Update this decision and affected code/tests in the same execution sequence.
