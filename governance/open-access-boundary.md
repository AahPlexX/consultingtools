# Open-Access Product Boundary

**Established:** 2026-08-18 (America/Chicago)

Consulting Tools is a public, open-access ChatGPT/Codex plugin. Its core functionality must not require a user to create or connect a third-party account, provide an API key, complete OAuth, or supply another provider credential.

## Non-negotiable access model

The plugin may use:

- user-supplied text, files, and structured data that the active host can legitimately pass to the plugin;
- plugin-owned deterministic computation and document/data processing;
- public web pages and other openly accessible Internet resources that require no user account, API key, OAuth grant, or paid/private provider credential;
- plugin-owned server infrastructure required to execute the MCP tools, provided users do not need separate credentials for that infrastructure;
- host-native capabilities that are already available to the user through ChatGPT or Codex, when the active host actually exposes them and using them does not require Consulting Tools to add a separate account-linking flow.

The plugin must not require or add:

- user-supplied API keys;
- OAuth or OpenID Connect account linking;
- Google Drive, Google Docs, Google Sheets, Microsoft 365, CRM, analytics, project-management, database, or similar private-account connectors as part of the Consulting Tools product;
- commercial SEO/keyword/backlink provider credentials;
- Search Console or other first-party account authorization;
- a paid third-party data subscription as a prerequisite for a core feature;
- per-customer MCP URLs or tenant-specific authentication merely to provide ordinary Consulting Tools functionality.

## Public research boundary

Live research and SEO may fetch and analyze public websites directly when permitted by applicable law, site controls, robots directives where relevant, rate limits, and repository security/source policies. Public-web research must not invent private-provider metrics that cannot be observed or reproduced from open evidence.

Examples:

- In scope: crawlable page content, response metadata, robots directives, sitemaps, canonical tags, internal links, structured data, public search-result evidence, public competitor pages, and other openly retrievable facts.
- Out of scope: private Search Console impressions/clicks, authenticated analytics, proprietary keyword-volume/difficulty scores, private backlink indexes, CRM records, private cloud-drive files, or private databases unless the user directly supplies the relevant data as an input artifact.

If a user uploads an export from one of those systems, the plugin may analyze the supplied file because the data arrived as user-provided input; that does not create or authorize a connector to the originating system.

## Capability-state consequence

Any catalog item whose execution inherently requires API credentials, OAuth, account linking, or a private provider connection is `unavailable` under the current product boundary, not merely `provider-dependent`.

`provider-dependent` may remain useful only for capabilities supplied by the active host or an anonymous/open provider that requires no new user credential and is not necessary for the plugin's baseline operation. It must never be used as a back door for adding account-linked integrations.

## Architecture consequence

Do not build a generic provider ecosystem, credential vault, OAuth broker, connector marketplace, or user account-linking subsystem. Those systems add complexity and contradict the open-access product goal.

Prefer:

1. user-supplied files/data;
2. anonymous public-web retrieval;
3. plugin-owned computation;
4. deterministic document/data transformation;
5. host-native capability use only when already available and requiring no additional Consulting Tools authentication flow.

## Revalidation

OpenAI currently documents that many plugin MCP servers can operate anonymously and that authentication is needed for customer-specific data or authenticated/write scenarios. If OpenAI changes its public-plugin requirements in a way that makes anonymous MCP operation impossible, revalidate this boundary against the current official documentation before changing the product architecture.

Authoritative OpenAI sources verified 2026-08-18:

- https://developers.openai.com/plugins/build/auth
- https://developers.openai.com/plugins/concepts/plugins
- https://developers.openai.com/plugins/deploy/submission
