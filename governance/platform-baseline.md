# Platform and Runtime Baseline

**Verified:** 2026-08-21 (America/Chicago)

This file records the externally verified platform/runtime assumptions that implementation work is currently allowed to rely on. It is a dated snapshot, not permanent truth. Any material release, dependency migration, plugin-submission change, new external integration, or capability promotion must revalidate the affected facts against authoritative current sources before implementation or publication.

## OpenAI plugin platform

Current authoritative OpenAI documentation establishes the following baseline:

- The public Plugin Directory is the primary distribution/discovery surface for workflow capabilities across ChatGPT and Codex.
- A plugin can package Skills and can depend on apps/MCP-backed capabilities; the appropriate shape is the smallest architecture that fully supports the workflow.
- Every packaged plugin uses `.codex-plugin/plugin.json` as its manifest. `skills/` and a bundled `.mcp.json` are supported package components.
- `mcpServers` may point to an `.mcp.json` containing either a direct server map or a wrapped `mcp_servers` object. These are both currently supported configuration shapes; they are not MCP protocol V1 versus V2.
- Public plugins are published to the universal plugin directory shared by ChatGPT and Codex, while actual installation/invocation can vary by plan, workspace settings, role, region, supported surface, and app availability.
- A public submission using MCP requires a public production MCP server URL. Universal MCP URLs are the normal case; template URLs require OpenAI approval for the applicable use case.
- Public submission requires a verified developer or business identity and production listing materials including website, support, privacy, and terms URLs.
- Every MCP tool submitted for review must accurately describe its behavior and provide accurate `readOnlyHint`, `openWorldHint`, and `destructiveHint` annotations.
- The submission package must include at least five positive and three negative test cases with reproducible expected behavior.

Authoritative sources:

- https://developers.openai.com/plugins/concepts/plugins
- https://developers.openai.com/plugins/build/plugins
- https://developers.openai.com/plugins/deploy/submission
- https://help.openai.com/en/articles/20001256-plugins-in-chatgpt-and-codex

## MCP runtime

Current authoritative Model Context Protocol sources establish this runtime baseline:

- The stable TypeScript MCP v2 server package is `@modelcontextprotocol/server`.
- This repository targets `@modelcontextprotocol/server@2.0.0`, which implements the MCP 2026-07-28 protocol line.
- The matching `@modelcontextprotocol/client@2.0.0` package is used only as a test harness to verify the real remote protocol boundary.
- The old monolithic `@modelcontextprotocol/sdk` v1 server import path is not the repository baseline.
- For stdio, this repository uses `serveStdio(() => createServer())` from `@modelcontextprotocol/server/stdio`. Current v2 guidance identifies `serveStdio(factory)` as the entry required to serve/negotiate the 2026-07-28 modern protocol era over stdio; directly connecting an `McpServer` to `StdioServerTransport` remains a 2025-era/legacy path unless the higher-level serving entry is used.
- The repository's direct-map `.mcp.json` is only a launcher/configuration shape (`command` plus `args`). It does not determine MCP wire-protocol generation. Do not migrate it to the wrapped `mcp_servers` form merely to make it appear "V2"; change configuration shape only for a concrete supported need.
- `serveStdio` can support both modern and legacy openings by default. Do not set `legacy: "reject"` unless compatibility requirements explicitly change and corresponding tests prove the decision.
- For remote MCP, this repository uses `createMcpHandler(() => createServer())`. This is the current web-standard v2 HTTP entry that negotiates the 2026-07-28 protocol and can also serve stateless 2025-era traffic by default.
- The raw MCP handler does not validate `Host`, `Origin`, or bearer tokens. Production mounts must put those controls in front of MCP dispatch. The repository therefore exposes a guarded HTTP wrapper requiring an explicit allowed-host list and supporting an optional allowed-origin list.
- MCP tool schemas use Standard Schema objects (`z.object(...)` here) rather than the deprecated raw-shape overload.
- MCP resources can return binary data as base64 `blob` content, and tools can return `resource_link` content so large artifacts are referenced instead of copied into every tool result.

Authoritative sources:

- https://github.com/modelcontextprotocol/typescript-sdk
- https://ts.sdk.modelcontextprotocol.io/v2/migration/upgrade-to-v2
- https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28
- https://ts.sdk.modelcontextprotocol.io/v2/protocol-versions
- https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/http.md
- https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/web-standard.md
- https://www.npmjs.com/package/@modelcontextprotocol/server
- https://www.npmjs.com/package/@modelcontextprotocol/client
- https://modelcontextprotocol.io/specification/2026-07-28

## Verified dependency snapshot

The current pinned baseline is:

| Package | Verified pin | Policy |
| --- | --- | --- |
| `@modelcontextprotocol/server` | `2.0.0` | Current stable MCP server package |
| `@modelcontextprotocol/client` | `2.0.0` | Matching stable client used for protocol tests |
| `docx` | `9.7.1` | DOCX engine for governed professional creation plus bounded macro-free placeholder inspection/patching |
| `fflate` | `0.8.3` | ZIP/DEFLATE utility used for bounded package inspection, managed XLSX, and preservation fixtures |
| `pdf-lib` | `1.17.1` | PDF engine for governed native creation, inspection/metadata mutation, and derivative page composition |
| `zod` | `4.4.3` | Current stable release used by MCP schemas |
| `typescript` | `7.0.2` | Current stable compiler |
| `vitest` | `4.1.10` | Current stable test runner |
| `@types/node` | `24.13.3` | Current verified Node 24 type line matching CI runtime |

Package versions are snapshot facts. Re-check the authoritative package registry before changing them or claiming they are current.

## Artifact workspace baseline

The plugin-owned artifact workspace is intentionally format-neutral and separate from PDF/DOCX/XLSX/PPTX editing engines.

- Artifact bytes are stored behind `artifact://` resources with SHA-256, revision metadata, explicit size bounds, and optimistic revision preconditions for state-changing operations.
- Inline base64 import/replacement is a bounded fallback when a caller already has the bytes. It is not a universal ChatGPT attachment, local-file, cloud-drive, or arbitrary-URL ingestion mechanism.
- MCP `resources/read` exposes current artifact bytes as a base64 `blob`; tools return `resource_link` entries rather than duplicating full binaries into normal text results.
- Artifact-level replacement preserves prior revisions inside the active store. Deleting an artifact makes its active and historical revisions unavailable through the store API.
- In-memory storage is a development/runtime substrate, not the final multi-instance production persistence layer.

## File-package inspection baseline

Before any format-specific mutation, the actual bytes must be classified independently of filename and caller-declared MIME metadata.

- PDF is initially recognized by its required `%PDF-` header; deeper PDF structure validation belongs to the PDF adapter gate.
- DOCX, XLSX, and PPTX are Open Packaging Convention ZIP packages. The detector reads only `[Content_Types].xml` with a one-megabyte uncompressed bound rather than inflating the full archive.
- `fflate@0.8.3` supplies filtered ZIP decompression for this narrow inspection path.
- Macro-enabled Word, Excel, and PowerPoint main-part content types are classified separately as DOCM, XLSM, and PPTM. Their macros or embedded active content must never be executed by inspection or editing code.
- A ZIP signature plus an unrecognized or unreadable package is not sufficient to claim a valid Office document. Format-specific adapters must perform stronger package validation before mutation.

Authoritative sources:

- https://github.com/101arrowz/fflate
- https://www.npmjs.com/package/fflate
- https://learn.microsoft.com/en-us/openspecs/office_standards/ms-oe376/
- https://learn.microsoft.com/en-us/openspecs/office_standards/ms-docx/
- https://learn.microsoft.com/en-us/openspecs/office_standards/ms-xlsx/
- https://learn.microsoft.com/en-us/openspecs/office_standards/ms-pptx/

## Consulting document creation boundary

`ConsultingDocumentV1` is the verified format-neutral creation model for bounded text-centric consulting reports. It supports headings, paragraphs, bullet lists, numbered lists, key metrics, tables, callouts, source notes, explicit page breaks, and bounded report metadata such as title, prepared-for/prepared-by labels, date, confidentiality, header/footer labels, page size, and accent color.

`create_consulting_document` can create DOCX, PDF, or both. All requested formats are generated/preflighted before storage so a combined request does not intentionally leave a partial result when one requested format cannot be produced. This model does not accept arbitrary HTML/CSS, images/logos, charts, footnotes, comments, tracked changes, embedded files, macros, custom fonts, or arbitrary Office/PDF object graphs.

The executable/catalog envelope was verified on `1c789291e9488f1a325ddc27a0ca29966338b791` through GitHub Actions run `32536219577`, including independent LibreOffice/Poppler rendering.

## DOCX creation and template boundary

`docx@9.7.1` is used for two distinct bounded workflows.

New-document creation:

- `create_consulting_document` may create a macro-free professional DOCX from `ConsultingDocumentV1`.
- Generated documents use explicit paragraph styles, Heading 1–3 outline structure, bullet/decimal numbering, fixed-layout tables, key-metric/callout structures, headers/footers, and a page-number field.
- Generated output is reclassified as macro-free DOCX before being accepted.

Existing-template operation:

- `patchDetector` lists placeholder keys from an existing DOCX template.
- `patchDocument` replaces caller-supplied placeholder keys with paragraph-inline text content and can retain original placeholder styles.
- The plugin rejects any package that byte-detection does not classify as macro-free DOCX before calling the patch engine.
- Unknown replacement keys are rejected before mutation.
- Patched bytes are reclassified as macro-free DOCX and scanned again to ensure each requested placeholder was resolved before a new artifact revision is committed.
- MCP patch requests are bounded by placeholder count and aggregate replacement-text size and use the artifact `expectedRevision` precondition.
- Preservation fixtures cover representative unrelated header, footer, styles, numbering, table, section properties, and image relationships around a body placeholder.

This does **not** make arbitrary existing-DOCX text, relationship, field, revision, drawing, content-control, comment, tracked-change, or layout CRUD implemented. Broad `docx-crud` is `partial` only, with verified bindings `create_consulting_document`, `inspect_docx_template`, and `patch_docx_template`.

Authoritative sources:

- https://www.npmjs.com/package/docx
- https://docx.js.org/api/classes/File.html
- https://docx.js.org/api/classes/Table.html
- https://docx.js.org/api/types/ISectionOptions.html
- https://docx.js.org/api/functions/patchDetector.html
- https://docx.js.org/api/functions/patchDocument.html
- https://docx.js.org/api/types/PatchDocumentOptions.html

## PDF creation, metadata, and derivative-composition boundary

`pdf-lib@1.17.1` is used for three distinct bounded workflows.

New-document creation:

- `create_consulting_document` may create a professional PDF from `ConsultingDocumentV1` using deterministic page geometry/layout and PDF standard Helvetica/HelveticaBold fonts.
- Every rendered string is preflighted against the selected standard font. Unsupported characters fail explicitly; they are not silently substituted or dropped.
- PDF creation reopens output and verifies page count/metadata before return.
- PDF v1 does not claim custom font embedding, Unicode-complete typography, tagged PDF/PDF-UA, forms, annotations, attachments, outlines, signatures, or JavaScript.

Existing-document metadata:

- `inspect_pdf` loads a byte-detected PDF and reports page count plus document-level metadata without mutation.
- `update_pdf_metadata` changes only explicitly supplied document metadata fields, requires the artifact `expectedRevision`, saves/reopens the document, and rejects the result if page count changed.
- Metadata operations cover title, author, subject, keywords, creator, and producer. Creation/modification dates are inspected but are not caller-controlled write fields in this subset.
- Preservation fixtures verify representative page count, page geometry/rotation, and observable content/resource references alongside source-buffer immutability.

Derivative page composition:

- `compose_pdf_artifact` creates a new PDF from explicitly selected zero-based pages of existing PDF artifacts.
- Supplied source order and page order are preserved; deliberate duplicate page selections are allowed.
- Source artifacts remain read-only and are not revised by composition.
- This operation does not claim preservation of source document-level metadata, AcroForms, annotations, outlines/bookmarks, attachments, signatures, JavaScript, or cross-document navigation.

This does **not** make broad existing-PDF editing implemented. Broad `pdf-crud` is `partial` only, with verified bindings `create_consulting_document`, `inspect_pdf`, `update_pdf_metadata`, and `compose_pdf_artifact`.

Authoritative sources:

- https://www.npmjs.com/package/pdf-lib
- https://github.com/Hopding/pdf-lib
- https://pdf-lib.js.org/docs/api/classes/pdfdocument
- https://pdf-lib.js.org/docs/api/classes/pdfpage

## Independent document renderability baseline

The repository CI includes an independent DOCX/PDF renderability gate after the ordinary TypeScript/test/build gate:

1. generate deterministic representative DOCX and native PDF fixtures from built repository engines;
2. convert the DOCX using headless LibreOffice Writer PDF export;
3. parse both the converted DOCX PDF and native PDF using Poppler `pdfinfo`;
4. rasterize the first and last pages of both using `pdftoppm` and require non-empty PNG output.

The CI-only renderer dependencies are `libreoffice-writer` and `poppler-utils`; production runtime does not depend on them. A passing render gate is evidence that representative outputs independently open and render. It is **not** a claim of pixel parity with Microsoft Word or Adobe Acrobat, universal font parity, PDF/UA conformance, or exhaustive rendering proof for every possible bounded document.

The integrated code/catalog render gate passed on `1c789291e9488f1a325ddc27a0ca29966338b791` through Actions run `32536219577`.

## Format-editor selection boundary

Current package research does **not** justify treating one JavaScript library as a universal lossless Office/PDF editor.

- `pdf-lib@1.17.1` is installed for the bounded PDF creation/metadata/derivative-composition workflows above; its documented feature set still does not justify unrestricted existing-page text editing or full document-level preservation claims.
- `docx@9.7.1` is installed for bounded professional creation and placeholder-template workflows; arbitrary lossless editing of every existing DOCX structure is still not assumed.
- Broad arbitrary third-party XLSX mutation remains unclaimed. The repository has a separately verified Consulting Tools managed-v1 SpreadsheetML engine; its scope is governed by `governance/xlsx-engine-decision.md` and must not be generalized into arbitrary workbook preservation.
- PPTX editing engine selection remains open until preservation behavior is researched and tested against the same quality gates.

Candidate package sources and prior research remain evidence inputs, not installed dependencies or capability claims. Revalidate candidates immediately before adoption.

## Remote deployment boundary

Source-level remote MCP support is not the same thing as a public production MCP service.

- `src/http.ts` provides a web-standard Streamable HTTP handler and the required Host/Origin guard layer.
- No production hostname, HTTPS endpoint, authentication issuer, deployment provider, or OpenAI domain-verification token is fabricated in this repository.
- Until an actual production service is deployed and externally exercised, remote MCP remains an implementation boundary rather than a publication-ready endpoint.
- Any host adapter must preserve request-size/resource bounds, safe logs, request correlation, shutdown behavior, least privilege, and the guarded dispatch contract.

## Host-native capability boundary

ChatGPT and Codex capabilities evolve independently of this repository. The plugin may take advantage of host-native file, research, browsing, artifact, or other capabilities only when the active host actually exposes them. A capability that depends on the host or an authorized external provider must remain `provider-dependent` or otherwise explicitly conditional in the capability registry; host availability must never be generalized into a universal plugin-owned implementation claim.

## Revalidation triggers

Revalidate the affected baseline before any of the following:

1. Public plugin submission or resubmission.
2. MCP SDK/server/client dependency changes.
3. Manifest schema, `.mcp.json` packaging behavior, submission metadata, authentication, or tool-annotation changes.
4. Promotion of a capability from `planned`, `partial`, or `provider-dependent` to `implemented`.
5. Adding a new external provider or changing provider permissions.
6. Selecting or changing the production MCP hosting/runtime boundary.
7. Selecting, upgrading, or changing a PDF/Office package inspection or editing engine.
8. Expanding a file adapter's claimed preservation envelope or supported mutation types.
9. Any claim that a package, platform behavior, API, law, price, search-engine rule, or integration is "current", "latest", or universally available.

If current authoritative sources conflict with this file, the current authoritative sources win. Update this file and all affected code/tests in the same execution sequence; never preserve a stale baseline merely to avoid migration work.
