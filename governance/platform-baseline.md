# Platform and Runtime Baseline

**Verified:** 2026-08-18 (America/Chicago)

This file records the externally verified platform/runtime assumptions that implementation work is currently allowed to rely on. It is a dated snapshot, not permanent truth. Any material release, dependency migration, plugin-submission change, new external integration, or capability promotion must revalidate the affected facts against authoritative current sources before implementation or publication.

## OpenAI plugin platform

Current authoritative OpenAI documentation establishes the following baseline:

- The public Plugin Directory is the primary distribution/discovery surface for workflow capabilities across ChatGPT and Codex.
- A plugin can package Skills and can depend on apps/MCP-backed capabilities; the appropriate shape is the smallest architecture that fully supports the workflow.
- Every packaged plugin uses `.codex-plugin/plugin.json` as its manifest. `skills/` and a bundled `.mcp.json` are supported package components.
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
- For stdio, this repository uses `serveStdio(() => createServer())` from `@modelcontextprotocol/server/stdio` so protocol negotiation is not locked to a legacy direct-transport path.
- For remote MCP, this repository uses `createMcpHandler(() => createServer())`. This is the current web-standard v2 HTTP entry that negotiates the 2026-07-28 protocol and can also serve stateless 2025-era traffic by default.
- The raw MCP handler does not validate `Host`, `Origin`, or bearer tokens. Production mounts must put those controls in front of MCP dispatch. The repository therefore exposes a guarded HTTP wrapper requiring an explicit allowed-host list and supporting an optional allowed-origin list.
- MCP tool schemas use Standard Schema objects (`z.object(...)` here) rather than the deprecated raw-shape overload.

Authoritative sources:

- https://github.com/modelcontextprotocol/typescript-sdk
- https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/http.md
- https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/web-standard.md
- https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/migration/support-2026-07-28.md
- https://www.npmjs.com/package/@modelcontextprotocol/server
- https://www.npmjs.com/package/@modelcontextprotocol/client
- https://modelcontextprotocol.io/specification/2026-07-28

## Verified dependency snapshot

The current pinned baseline is:

| Package | Verified pin | Policy |
| --- | --- | --- |
| `@modelcontextprotocol/server` | `2.0.0` | Current stable MCP server package |
| `@modelcontextprotocol/client` | `2.0.0` | Matching stable client used for protocol tests |
| `zod` | `4.4.3` | Current stable release used by MCP schemas |
| `typescript` | `7.0.2` | Current stable compiler |
| `vitest` | `4.1.10` | Current stable test runner |
| `@types/node` | `24.13.3` | Current verified Node 24 type line matching CI runtime |

Package versions are snapshot facts. Re-check the authoritative package registry before changing them or claiming they are current.

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
3. Manifest schema, submission metadata, authentication, or tool-annotation changes.
4. Promotion of a capability from `planned`, `partial`, or `provider-dependent` to `implemented`.
5. Adding a new external provider or changing provider permissions.
6. Selecting or changing the production MCP hosting/runtime boundary.
7. Any claim that a package, platform behavior, API, law, price, search-engine rule, or integration is "current", "latest", or universally available.

If current authoritative sources conflict with this file, the current authoritative sources win. Update this file and all affected code/tests in the same execution sequence; never preserve a stale baseline merely to avoid migration work.
