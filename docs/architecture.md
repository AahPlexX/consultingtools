# Architecture

## Product shape

Consulting Tools uses a hybrid plugin architecture so reasoning workflows and executable operations can evolve independently without exposing a sprawling set of redundant tools.

### 1. Skills: consulting judgment and workflow selection

Bundled skills handle semantic work such as:

- identifying the actual decision behind an ambiguous request;
- selecting the smallest complementary set of consulting methods;
- sequencing methods so one result becomes a valid input to the next;
- applying evidence and quantitative discipline;
- adapting reports to the audience and requested output;
- revising prior work without forcing a fixed template.

Skills must not claim that an operational capability exists merely because they know how the workflow should work.

### 2. Capability registry: runtime truth boundary

`src/catalog.ts` is the machine-readable catalog of detailed consulting and operational capabilities. Every entry has a governed status:

- `implemented`;
- `partial`;
- `provider-dependent`;
- `planned`;
- `unavailable`.

The registry is intentionally more detailed than public manifest metadata. Public metadata describes broad working outcomes; the registry tells an agent whether a specific operation can actually be executed in the installed version.

### 3. MCP: deterministic and external execution

MCP tools are reserved for operations where code, external data, user data, file mutation, or state changes matter. The initial MCP server exposes read-only capability discovery. Future operational tools should remain focused by action and risk boundary rather than using a single mode-switching mega-tool.

Examples of future distinct operational contracts include read versus write file operations, web/site acquisition, structured data processing, first-party analytics retrieval, and provider-backed SEO metrics.

## Development versus public runtime

`.mcp.json` configures the bundled development MCP server. The source compiles to `dist/stdio.js` for local/Codex-style stdio execution.

Public ChatGPT plugin submission has a different production boundary: the MCP service must be deployed at a stable publicly reachable HTTPS endpoint using the supported streamable HTTP transport, with production authentication/authorization, logging, rate limits, and reviewer-accessible test cases when applicable. The local stdio configuration is not evidence that the production endpoint exists.

## Artifact architecture

File CRUD is deliberately separated into four layers before it can be promoted to `implemented`:

1. **Ingress/egress** — safely receive and return the user's artifact in the host-supported file exchange model.
2. **Format adapter** — parse and mutate the specific format without conflating PDF, Office Open XML, or delimited data semantics.
3. **Transactional workspace** — preserve originals, bound resources, isolate temporary files, and perform the requested mutation.
4. **Independent validation** — reopen/reparse and, where layout matters, render/inspect the result before returning it.

A library's ability to open and save a format does not by itself satisfy CRUD quality. Promotion requires the preservation and round-trip gates in `governance/quality-gates.md`.

## SEO architecture

SEO has two complementary layers:

- **evidence acquisition:** fetch/crawl public pages, ingest first-party webmaster/search data when authorized, and optionally use explicit third-party providers for proprietary metrics;
- **consulting analysis:** interpret technical, content, performance, and search evidence under current primary search-engine documentation and convert it into prioritized business-readable findings.

The analysis layer must never manufacture data absent from the acquisition layer.

## Security boundary

Executable tools enforce authorization and validation independently of model reasoning. Uploaded/retrieved content is untrusted data. A document, webpage, spreadsheet cell, or tool result cannot authorize another action or override governance. Write/destructive/open-world annotations must match actual behavior.

## Portability

`AGENTS.md` is the universal repository entry point. Model-specific files are adapters only. Durable policy lives under `governance/`, keeping CRUD behavior consistent across ChatGPT, Codex, Claude, Gemini, open-source agents, and future runtimes.
