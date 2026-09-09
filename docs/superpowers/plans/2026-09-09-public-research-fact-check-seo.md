# Public Research, Fact Check & SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure open-access public-web retrieval and crawl substrate, traceable evidence/provenance primitives, and bounded public technical/on-page SEO analysis without requiring user API keys, private-provider credentials, or pretending deterministic code can semantically prove arbitrary claims.

**Architecture:** The MCP server will accept explicit public URLs selected by the user/host and retrieve them through a pinned-address HTTP(S) transport that validates URL, DNS, redirect, port, size, timeout, and network-scope policy before every request. A separate RFC 9309 robots layer governs recursive crawling. Parsed HTML and sitemap data become typed source snapshots with hashes, dates, canonical/indexing metadata, links, headings, JSON-LD syntax observations, and bounded extracted text. Semantic source discovery, claim interpretation, contradiction resolution, and final fact-check judgment remain host/Skill responsibilities; deterministic code supplies safe retrieval, provenance, structural evidence validation, and SEO observations.

**Tech Stack:** TypeScript 7.0.2, Node 24 CI, Vitest 4.1.10, MCP v2, Zod 4.4.3, Node `http`/`https`/`dns`/`net`/`crypto`, `parse5` 8.0.1 for WHATWG-style HTML parsing, `saxes` 6.0.0 for strict bounded sitemap XML parsing. No search-engine API, browser automation, OAuth, Search Console connector, commercial SEO provider, or credential vault.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Authoritative basis checked 2026-09-09

- RFC 9309 is the IETF Robots Exclusion Protocol standard. Successful robots retrieval must follow parseable rules; HTTP 4xx robots responses may be treated as unavailable/allow, while 5xx/network-unreachable robots is undefined and must be treated as complete disallow. Crawlers should follow at least five robots redirects and robots parsers must support at least 500 KiB input.
- WHATWG URL remains the authoritative living URL parsing model and explicitly warns that URLs from untrusted parties require careful handling.
- OWASP SSRF guidance treats arbitrary outbound URL fetching as a high-risk trust boundary and recommends strong application/network validation when an allowlist is not possible.
- Google Search Central currently distinguishes crawl control (`robots.txt`) from indexing control (`noindex`/robots meta/X-Robots-Tag), treats redirects and `rel=canonical` as stronger canonical signals than sitemap inclusion, describes sitemaps as hints rather than guarantees, recommends descriptive page titles and page-specific meta descriptions, and does not guarantee rich results merely because structured data is syntactically valid.
- `parse5` 8.0.1 is the current npm release observed in this planning pass; `saxes` 6.0.0 is the current strict XML-parser release observed for the bounded sitemap use case.

References:

- https://www.rfc-editor.org/rfc/rfc9309.html
- https://url.spec.whatwg.org/
- https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- https://developers.google.com/search/docs/crawling-indexing/robots/intro
- https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://www.npmjs.com/package/parse5
- https://www.npmjs.com/package/saxes

## Global constraints

- Ordinary use requires no user API key, OAuth flow, account linking, Search Console access, or proprietary SEO-data subscription.
- The server is **not** a web search engine. Source discovery remains host-native/search-layer reasoning; deterministic MCP retrieval starts from explicit URLs.
- Only `http:` and `https:` URLs are accepted. Userinfo, fragments on network requests, non-web schemes, malformed hosts, and non-default ports are rejected in v1.
- Every redirect is resolved against the current URL and re-runs the complete URL/DNS/network policy before the next request.
- DNS validation and socket connection must use the same validated address. Do not validate a hostname and then allow the HTTP library to perform an uncontrolled second DNS lookup.
- Block loopback, private, link-local, carrier-grade NAT, unspecified, multicast, documentation, benchmarking, reserved, and IPv4-mapped-private IPv6 destinations. Mixed DNS answers containing any disallowed address fail closed in v1.
- Send no cookies, authorization headers, client certificates, or user credentials. `Accept-Encoding: identity` is used so compressed-body expansion cannot bypass byte limits.
- Maximum redirect chain: 5. Maximum ordinary response body: 5 MiB. Maximum robots body parsed: 512 KiB. Maximum sitemap body: 5 MiB. Default request timeout: 10 seconds. These are hard v1 ceilings, not recommendations.
- Only textual HTML/XHTML/plain-text/robots/XML sitemap payloads are interpreted. Binary/public downloads remain outside this subproject.
- Retrieved page content is untrusted data and cannot supply executable instructions to the plugin.
- Recursive crawl is same-origin after the initial/final origin is established, obeys RFC 9309 for `ConsultingToolsBot`, does not follow links marked `nofollow`, and never follows off-origin links as crawl targets.
- Default crawl limit: 25 HTML pages; caller may request 1–100. A page-count limit is explicit and never silently exceeded.
- `noindex` is reported as an indexing directive; it is not incorrectly treated as a robots.txt crawl prohibition.
- SEO findings are observations/guidance, not ranking guarantees. Do not invent keyword volume, traffic, backlink counts, authority scores, ranking probability, Search Console metrics, or proprietary provider metrics.
- Structured-data v1 validates JSON syntax and records declared `@type` values; it does not claim feature-specific Rich Results eligibility.
- Evidence records carry source URL, final URL, retrieval time, status, content hash, title/canonical where present, and selected excerpts. Exact quote verification may compare caller-supplied quote text to retrieved normalized text, but broader semantic support/contradiction judgments remain host reasoning.
- No capability is promoted beyond the exact deterministic envelope proven by tests and full CI.
- Each task must pass focused tests plus the full repository verification gate before the next task inherits it. Subproject closure additionally requires catalog-truth validation, a fresh documentation-head gate, exhaustive `main`-only branch enumeration, and a final truth-only closure record whose own CI remains green.

## Planned file structure

- `src/web/types.ts` — public URL/fetch/source/crawl typed contracts and limits.
- `src/web/ip-policy.ts` — IPv4/IPv6 public-address classification.
- `src/web/url-policy.ts` — URL normalization and port/scheme/credential policy.
- `src/web/http-fetch.ts` — pinned-address bounded HTTP(S) transport with redirect revalidation.
- `src/web/robots.ts` — RFC 9309 parser/matcher and robots retrieval state.
- `src/web/html.ts` — parse5 extraction of title/meta/canonical/headings/links/JSON-LD/text.
- `src/web/sitemap.ts` — bounded strict sitemap/sitemap-index XML extraction.
- `src/web/crawl.ts` — robots-aware same-origin bounded BFS crawl.
- `src/research/evidence.ts` — provenance snapshots, excerpt/quote matching, claim-source mapping validation.
- `src/seo/analyze.ts` — deterministic page/site SEO observations and severity model.
- `src/web/register-tools.ts` — public fetch/crawl MCP tools.
- `src/research/register-tools.ts` — evidence/quote/provenance MCP tools.
- `src/seo/register-tools.ts` — public SEO MCP tool.
- `src/server.ts` — compose new tools.
- `skills/analysis-and-reporting/SKILL.md` — research/fact-check orchestration and semantic boundary.
- `skills/artifact-operations/SKILL.md` only if evidence export behavior is added; otherwise unchanged.
- `tests/web-ip-policy.test.ts`
- `tests/web-url-policy.test.ts`
- `tests/web-http-fetch.test.ts`
- `tests/web-robots.test.ts`
- `tests/web-html.test.ts`
- `tests/web-sitemap.test.ts`
- `tests/web-crawl.test.ts`
- `tests/research-evidence.test.ts`
- `tests/seo-analyze.test.ts`
- `tests/web-tools.test.ts`
- `tests/research-tools.test.ts`
- `tests/seo-tools.test.ts`
- `tests/catalog-status-truth.test.ts`
- `package.json` — add exact `parse5` and `saxes` pins only after their RED contracts exist.
- `governance/platform-baseline.md`, `governance/source-policy.md`, `governance/safety-security.md`, `README.md`, roadmap, and this plan — closure truth after executable validation only.

---

### Task 1: Public URL, IP, DNS and Pinned HTTP(S) Trust Boundary

**Files:** Create `src/web/types.ts`, `src/web/ip-policy.ts`, `src/web/url-policy.ts`, `src/web/http-fetch.ts`; create `tests/web-ip-policy.test.ts`, `tests/web-url-policy.test.ts`, `tests/web-http-fetch.test.ts`.

**Interfaces:**

```ts
export interface DnsAddress { address: string; family: 4 | 6 }
export interface PublicFetchRedirect { from: string; to: string; status: number }
export interface PublicFetchResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  body: Buffer;
  fetchedAt: string;
  sha256: string;
  redirects: PublicFetchRedirect[];
}

export function assertPublicIpAddress(address: string): void;
export function normalizePublicWebUrl(value: string): URL;
export async function fetchPublicUrl(url: string, options?: {
  maxBytes?: number;
  timeoutMs?: number;
  maxRedirects?: number;
}): Promise<PublicFetchResult>;
```

- [ ] **Step 1: Write failing IP/URL tests.** Accept normal global IPv4/IPv6 fixtures; reject loopback, RFC1918, link-local, CGNAT, unspecified, multicast, TEST-NET/documentation, benchmarking/reserved, IPv4-mapped private IPv6, userinfo, non-http(s), malformed URLs, and ports other than 80/443.
- [ ] **Step 2: Confirm RED.**
- [ ] **Step 3: Implement IP math and WHATWG `URL` normalization.** Normalize host case/default ports and strip fragment from the actual network target while retaining the requested URL string in result metadata.
- [ ] **Step 4: Write failing transport tests using injected resolver/request adapters.** Require all DNS answers to be public, selected validated address to be passed through the request `lookup` callback, `Accept-Encoding: identity`, no auth/cookie forwarding, 5-redirect cap, cross-host redirect revalidation, content-length precheck, streaming byte cutoff, timeout, unsupported protocol rejection, and source hash/fetchedAt metadata.
- [ ] **Step 5: Implement Node `http`/`https` transport with manual redirects and pinned validated lookup.** Never use an uncontrolled second DNS resolution after validation.
- [ ] **Step 6: Run focused tests and full `npm run verify`; record exact GREEN SHA/run before Task 2.**

### Task 2: RFC 9309 Robots Policy

**Files:** Create `src/web/robots.ts`; create `tests/web-robots.test.ts`.

**Interfaces:**

```ts
export interface RobotsDecision {
  allowed: boolean;
  matchedRule?: { directive: "allow" | "disallow"; pattern: string };
  robotsUrl: string;
  state: "rules" | "unavailable" | "unreachable";
  sitemaps: string[];
}
export function parseRobots(text: string, productToken?: string): ParsedRobots;
export function isRobotsPathAllowed(parsed: ParsedRobots, url: URL): RobotsDecision;
export async function evaluateRobots(url: URL): Promise<RobotsDecision>;
```

- [ ] **Step 1: Write RFC-oriented RED fixtures.** Cover product-token matching plus `*`, multiple groups, longest path match, Allow winning on equal specificity, wildcard `*`, terminal `$`, percent-encoded paths, empty groups, comments, sitemap records, malformed lines, UTF-8 input, and 512 KiB bound.
- [ ] **Step 2: Add access-result tests:** successful rules obeyed; robots 4xx => `unavailable` and access allowed; 5xx/network failure => `unreachable` and complete disallow; redirect handling delegates to the already-verified safe transport with at most five redirects.
- [ ] **Step 3: Confirm RED, then implement parser/matcher without executing unknown extension directives.** User-agent product token is `ConsultingToolsBot`.
- [ ] **Step 4: Run focused + full verification and record GREEN SHA/run before Task 3.**

### Task 3: HTML Source Extraction and Provenance Snapshot

**Files:** Add `parse5: "8.0.1"` to `package.json`; create `src/web/html.ts`; create `tests/web-html.test.ts`.

**Interfaces:**

```ts
export interface ExtractedHtmlPage {
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robotsDirectives: string[];
  headings: { level: 1 | 2 | 3 | 4 | 5 | 6; text: string }[];
  links: { href: string; text: string; rel: string[] }[];
  images: { src: string; alt?: string }[];
  jsonLd: { validJson: boolean; types: string[] }[];
  lang?: string;
  viewport?: string;
  normalizedText: string;
}
export function extractHtmlPage(html: string, finalUrl: string): ExtractedHtmlPage;
```

- [ ] **Step 1: Write RED fixtures** for malformed-but-browser-parseable HTML, HTML entities, title/meta/canonical, relative URL resolution, robots meta, headings, nofollow links, image alt, language/viewport, script/style/template exclusion from normalized text, JSON-LD valid/invalid syntax, adversarial markup, and duplicate metadata behavior.
- [ ] **Step 2: Confirm RED, pin/install parse5 8.0.1, then implement tree traversal with no HTML execution.** JSON-LD is parsed only with `JSON.parse`; no script is executed.
- [ ] **Step 3: Run focused + full verification and record GREEN SHA/run before Task 4.**

### Task 4: Bounded Sitemap Parsing and Robots-Aware Same-Origin Crawl

**Files:** Add `saxes: "6.0.0"` to `package.json`; create `src/web/sitemap.ts`, `src/web/crawl.ts`; create `tests/web-sitemap.test.ts`, `tests/web-crawl.test.ts`.

**Interfaces:**

```ts
export function parseSitemapXml(xml: string): {
  kind: "urlset" | "sitemapindex";
  urls: { loc: string; lastmod?: string }[];
};
export interface CrawlPage {
  fetch: Omit<PublicFetchResult, "body">;
  html?: ExtractedHtmlPage;
  robots: RobotsDecision;
}
export async function crawlPublicSite(startUrl: string, options?: { maxPages?: number }): Promise<{
  origin: string;
  pages: CrawlPage[];
  blockedUrls: string[];
  externalLinks: string[];
  sitemapUrls: string[];
}>;
```

- [ ] **Step 1: Write strict sitemap RED tests.** Accept `urlset`/`sitemapindex`, namespaces, entity decoding, absolute URL extraction and optional valid `lastmod`; reject DTD/DOCTYPE, external entities, malformed XML, unsupported root, >5 MiB input, >5,000 extracted URLs, and non-http(s) locations.
- [ ] **Step 2: Write crawl RED tests with deterministic fake transport.** Require BFS/stable ordering, default 25/max 100 page bound, same-origin follow only, URL dedupe ignoring fragments, nofollow non-follow, robots denial before page request, HTML-only recursion, redirect-final-origin handling, outbound-link reporting, and no silent limit overrun.
- [ ] **Step 3: Confirm RED, pin/install saxes 6.0.0, implement strict sitemap parsing and crawl orchestration.** Do not use XML DTD/entity expansion.
- [ ] **Step 4: Run focused + full verification and record GREEN SHA/run before Task 5.**

### Task 5: Evidence, Quote Verification and Claim-Source Mapping Contracts

**Files:** Create `src/research/evidence.ts`; create `tests/research-evidence.test.ts`.

**Interfaces:**

```ts
export interface SourceEvidenceRecord {
  id: string;
  requestedUrl: string;
  finalUrl: string;
  fetchedAt: string;
  status: number;
  sha256: string;
  title?: string;
  canonicalUrl?: string;
  excerpt?: string;
}
export function createSourceEvidenceRecord(page: CrawlPage | PublicFetchResult, excerpt?: string): SourceEvidenceRecord;
export function verifyExactQuote(quote: string, normalizedText: string): { matched: boolean; index: number | null };
export function validateClaimSourceMappings(claims: readonly ClaimRecord[], sources: readonly SourceEvidenceRecord[]): ClaimValidationFinding[];
```

- [ ] **Step 1: Write RED tests.** Require stable evidence IDs/hashes, explicit retrieval time, exact quote matching after whitespace normalization only, no fuzzy quote invention, duplicate/missing source-ID detection, and `verified-external-fact` claims to reference known source records.
- [ ] **Step 2: Confirm RED and implement by extending—not bypassing—the existing epistemic claim model.** Semantic entailment, source-authority judgment and contradiction resolution remain outside deterministic code.
- [ ] **Step 3: Run focused + full verification and record GREEN SHA/run before Task 6.**

### Task 6: Public Technical and On-Page SEO Analyzer

**Files:** Create `src/seo/analyze.ts`; create `tests/seo-analyze.test.ts`.

**Interfaces:**

```ts
export type SeoSeverity = "info" | "warning" | "error";
export interface SeoFinding { code: string; severity: SeoSeverity; url?: string; message: string; evidence: string[] }
export function analyzePublicSeo(crawl: Awaited<ReturnType<typeof crawlPublicSite>>): {
  findings: SeoFinding[];
  summary: { crawledPages: number; indexablePagesObserved: number; blockedPages: number };
};
```

- [ ] **Step 1: Write RED fixtures** for HTTP failures, missing/duplicate titles, missing/duplicate meta descriptions, multiple/missing H1 as structural observation, canonical missing/invalid/off-origin/conflicting targets, `noindex`, X-Robots/robots-meta observations, blocked pages, broken internal links within crawled evidence, missing image alt as an accessibility/content observation, malformed JSON-LD syntax, sitemap presence/inclusion mismatches, and crawlable internal-link coverage.
- [ ] **Step 2: Add truth-boundary tests.** Analyzer must not emit invented search volume, rank, backlink, domain-authority, traffic, CTR, conversion, Search Console, or rich-result-guarantee fields. Do not enforce fabricated title/meta character-count ranking thresholds.
- [ ] **Step 3: Confirm RED, implement deterministic findings with evidence strings and Google-guidance-aware wording.** Distinguish crawlability from indexability and make sitemap/canonical findings signals rather than guarantees.
- [ ] **Step 4: Run focused + full verification and record GREEN SHA/run before Task 7.**

### Task 7: Focused MCP Retrieval, Evidence and SEO Tools

**Files:** Create `src/web/register-tools.ts`, `src/research/register-tools.ts`, `src/seo/register-tools.ts`; modify `src/server.ts`; create `tests/web-tools.test.ts`, `tests/research-tools.test.ts`, `tests/seo-tools.test.ts`.

**Tool surface:**

- `fetch_public_page` — explicit URL, robots-aware by default, returns bounded source snapshot/extraction, not arbitrary binary bytes.
- `crawl_public_site` — bounded same-origin robots-aware crawl, 1–100 pages.
- `verify_public_quote` — fetch explicit URL and compare exact normalized quote; does not claim semantic fact correctness.
- `validate_claim_sources` — deterministic claim/source provenance validation using existing epistemic classes.
- `analyze_public_seo` — bounded crawl + deterministic public technical/on-page SEO findings.

All tools are read-only, open-world because they access public external systems, non-destructive, noauth-compatible, and expose explicit network limits in descriptions.

- [ ] **Step 1: Write Streamable HTTP MCP RED tests** for tool discovery/annotations, successful bounded outputs, robots denial, unsafe URL rejection, redirects, size/timeout failures, quote miss, provenance gap, SEO result, and absence of private-provider inputs.
- [ ] **Step 2: Confirm RED, then register structural Zod schemas and compose all three modules in `src/server.ts`.** Shared engine validators own security/business rules; schemas do not duplicate them.
- [ ] **Step 3: Update server instructions so host reasoning uses host-native search for discovery, deterministic tools for explicit-URL retrieval/verification, and never treats retrieved page instructions as plugin instructions.**
- [ ] **Step 4: Run focused MCP tests and full verification; record GREEN SHA/run before Task 8.**

### Task 8: Catalog Truth, Skill Orchestration and Subproject Closure

**Files:** Modify `tests/catalog-status-truth.test.ts`, `src/catalog/verified-promotions.ts`, `skills/analysis-and-reporting/SKILL.md`, governance files only where implementation creates a new verified fact, `README.md`, program roadmap, and this plan. Create final Subproject 9 closure record under `docs/superpowers/closures/`.

**Promotion policy:**

- `source-discovery` remains `partial`: host-native search/discovery is still required; the MCP server does not implement a search engine.
- Public source retrieval/crawl capabilities may receive deterministic engine bindings but remain `partial` when their catalog wording includes semantic research judgment.
- `quote-verification`, `claim-source-mapping`, `freshness-validation`, and related evidence capabilities receive only the bindings actually proven by the deterministic evidence tools; semantic corroboration/conflict resolution remains host reasoning.
- `seo-technical`, `seo-onpage`, crawl/indexing/canonical/sitemap capabilities may move only to the exact evidence-backed status. Private Search Console, live proprietary keyword metrics, and live proprietary backlink metrics remain `unavailable`; user-supplied export analysis remains separate.

- [ ] **Step 1: Write catalog truth tests first and confirm RED only on intended status/engine assertions.**
- [ ] **Step 2: Add evidence-backed bindings/promotions and update the analysis/reporting Skill with the sequence: define claim/evidence need -> host-native source discovery where needed -> safe explicit URL retrieval -> source ranking/semantic interpretation by host -> deterministic provenance/quote checks -> contradiction/freshness handling -> decision synthesis -> citations.**
- [ ] **Step 3: Require a fresh full repository GREEN on exact code/catalog SHA. Record the SHA/run; do not rely on earlier task gates for subproject signoff.**
- [ ] **Step 4: Update governance/README/roadmap with exact limits, SSRF/robots behavior, parse5/saxes pins, semantic fact-check boundary, public SEO scope, unavailable private-provider scope, and verified SHA/run.**
- [ ] **Step 5: Require a second fresh full repository GREEN on the final documentation HEAD.**
- [ ] **Step 6: Enumerate every branch page and confirm only `main`.**
- [ ] **Step 7: Write a final truth-only Subproject 9 closure record and require that exact closure-record HEAD to pass full CI before external signoff.**
- [ ] **Step 8: Only after that GREEN result advance to Subproject 10 — Executive & Project Workflows.**

## Self-review

- **Spec coverage:** public research/fetch, provenance, fact-check support, public SEO, open-access policy, deterministic/semantic separation, quality truth, security, and catalog promotion all have explicit tasks.
- **SSRF boundary:** URL parsing alone is insufficient; DNS results and the actual connected socket address are coupled through a pinned lookup callback and are revalidated on every redirect.
- **Robots boundary:** crawl follows RFC 9309 access results and does not misuse robots.txt as an indexing directive.
- **Fact-check honesty:** deterministic code can verify retrieval provenance and exact quote presence; it does not pretend lexical matching proves arbitrary semantic claims.
- **SEO honesty:** public technical/on-page observations are supported; proprietary metrics, ranking guarantees, and Search Console access remain excluded.
- **Dependency discipline:** only parse5 8.0.1 and saxes 6.0.0 are proposed, each after a RED parser contract and for a single clear responsibility.
- **No credential ecosystem:** no search API key, OAuth, Search Console connector, commercial SEO API, or credential vault is introduced.
- **Validation discipline:** every task has an independent full-repository gate; final subproject signoff requires additional code/catalog, documentation-head, branch, and closure-record gates.