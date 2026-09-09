# Public Research, Fact Check & SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure open-access public-web retrieval and crawl substrate, traceable evidence/provenance primitives, and bounded public technical/on-page SEO analysis without requiring user API keys, private-provider credentials, or pretending deterministic code can semantically prove arbitrary claims.

**Architecture:** The MCP server accepts explicit public URLs selected by the user/host and retrieves them through a pinned-address HTTP(S) transport that validates URL, DNS, redirect, port, size, timeout, and network scope before every request. RFC 9309 robots policy governs recursive crawling. Parsed HTML/sitemap data becomes typed source evidence with hashes, dates, canonical/indexing metadata, links, headings, JSON-LD syntax observations, and bounded extracted text. Semantic source discovery, authority judgment, entailment, contradiction resolution, and final fact-check conclusions remain host/Skill responsibilities; deterministic code supplies safe retrieval, provenance, exact quote checks, structural claim/source validation, and public SEO observations.

**Tech Stack:** TypeScript 7.0.2, Node 24 CI, Vitest 4.1.10, MCP v2, Zod 4.4.3, Node `http`/`https`/`dns`/`net`/`crypto`, `parse5` 8.0.1 for WHATWG-style HTML parsing, `saxes` 6.0.0 for strict bounded sitemap XML parsing. No search-engine API, browser automation, OAuth, Search Console connector, commercial SEO provider, or credential vault.

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Authoritative basis checked 2026-09-09

- RFC 9309 is the IETF Robots Exclusion Protocol standard. Successful robots retrieval follows parseable rules; HTTP 4xx robots responses may be treated as unavailable/allow, while 5xx/network-unreachable robots is undefined and must be treated as complete disallow. Crawlers should follow at least five robots redirects and robots parsers must support at least 500 KiB input.
- WHATWG URL remains the authoritative living URL parsing model and explicitly treats untrusted URLs as a security-sensitive boundary.
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
- Only `http:` and `https:` URLs are accepted. Userinfo, non-web schemes, malformed hosts, and non-default ports are rejected in v1. URL fragments are retained only as user input metadata and stripped from network targets/crawl identities.
- Every redirect is resolved against the current URL and re-runs the complete URL/DNS/network policy before the next request.
- DNS validation and socket connection use the same validated address through a pinned `lookup` callback. After connect, `socket.remoteAddress` must normalize to the pinned address; mismatch fails closed.
- Block loopback, private, link-local, carrier-grade NAT, unspecified, multicast, documentation, benchmarking, reserved, and IPv4-mapped-private IPv6 destinations. Mixed DNS answers containing any disallowed address fail closed in v1.
- Send no cookies, authorization headers, client certificates, or user credentials. Use `Accept-Encoding: identity` so compressed expansion cannot bypass byte limits.
- Maximum redirect chain: 5. Maximum ordinary response body: 5 MiB. Maximum robots body parsed: 512 KiB. Maximum sitemap body: 5 MiB. Default request timeout: 10 seconds. These are hard v1 ceilings.
- Only textual HTML/XHTML/plain-text/robots/XML sitemap payloads are interpreted. Binary/public downloads remain outside this subproject.
- Retrieved content is untrusted data and cannot supply executable instructions to the plugin.
- Recursive crawl is same-origin after the initial/final origin is established, obeys RFC 9309 for `ConsultingToolsBot`, does not follow links marked `nofollow`, and never follows off-origin links as crawl targets.
- Crawl is sequential per origin with a fixed minimum 250 ms delay between ordinary page requests in production; tests inject a no-op sleeper. HTTP 429 stops further crawl requests for that origin and is reported; v1 does not automatically retry.
- Default crawl limit: 25 HTML pages; caller may request 1–100. A page-count limit is explicit and never silently exceeded.
- Fetch robots once per origin per crawl operation and reuse that parsed decision set within the operation. Do not persist robots cache across users in v1.
- `noindex` is reported as an indexing directive; it is not incorrectly treated as a robots.txt crawl prohibition.
- SEO findings are observations/guidance, not ranking guarantees. Never invent keyword volume, traffic, backlink counts, authority scores, ranking probability, Search Console metrics, or proprietary provider metrics.
- Structured-data v1 validates JSON syntax and records declared `@type` values; it does not claim feature-specific Rich Results eligibility.
- Evidence records carry requested/final URL, retrieval time, status, content hash, title/canonical where present, and selected excerpts. Exact quote verification compares normalized text only; broader semantic support/contradiction judgments remain host reasoning.
- No capability is promoted beyond the exact deterministic envelope proven by tests and full CI.
- Each task passes focused tests plus the full repository verification gate before the next task inherits it. Subproject closure additionally requires catalog-truth validation, a fresh documentation-head gate, exhaustive `main`-only branch enumeration, and a final truth-only closure record whose own CI remains green.

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
- `src/web/register-tools.ts`, `src/research/register-tools.ts`, `src/seo/register-tools.ts` — focused MCP surfaces.
- `src/server.ts` — compose new tools.
- `skills/analysis-and-reporting/SKILL.md` — research/fact-check orchestration and semantic boundary.
- `tests/web-ip-policy.test.ts`, `tests/web-url-policy.test.ts`, `tests/web-http-fetch.test.ts`, `tests/web-robots.test.ts`, `tests/web-html.test.ts`, `tests/web-sitemap.test.ts`, `tests/web-crawl.test.ts`, `tests/research-evidence.test.ts`, `tests/seo-analyze.test.ts`, `tests/web-tools.test.ts`, `tests/research-tools.test.ts`, `tests/seo-tools.test.ts`, `tests/catalog-status-truth.test.ts`.
- `package.json` — exact `parse5` and `saxes` pins only after their RED contracts exist.
- `governance/platform-baseline.md`, `governance/source-policy.md`, `governance/safety-security.md`, `README.md`, roadmap, this plan, and final closure record — closure truth after executable validation only.

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

- [ ] **Step 1:** Write RED IP/URL tests accepting representative global IPv4/IPv6 and rejecting loopback, RFC1918, link-local, CGNAT, unspecified, multicast, TEST-NET/documentation, benchmarking/reserved, IPv4-mapped-private IPv6, userinfo, non-http(s), malformed URLs, and ports other than 80/443.
- [ ] **Step 2:** Confirm RED.
- [ ] **Step 3:** Implement IP math and WHATWG `URL` normalization. Normalize host/default port, strip fragment from network target, retain original requested URL string in result metadata.
- [ ] **Step 4:** Write RED transport tests using internal injected resolver/request/sleeper adapters. Require every DNS answer public, chosen address passed through request `lookup`, connected `remoteAddress` equals pinned normalized address, `Accept-Encoding: identity`, no auth/cookie headers, 5-redirect cap, cross-host redirect revalidation, content-length precheck, streaming byte cutoff, timeout, and deterministic hash/time metadata with an injected clock.
- [ ] **Step 5:** Implement Node `http`/`https` transport with manual redirects and pinned validated lookup; no uncontrolled second DNS resolution.
- [ ] **Step 6:** Run focused tests and full `npm run verify`; record exact GREEN SHA/run before Task 2.

### Task 2: RFC 9309 Robots Policy

**Files:** Create `src/web/robots.ts`; create `tests/web-robots.test.ts`.

**Interfaces:**

```ts
export interface RobotsRule { directive: "allow" | "disallow"; pattern: string }
export interface ParsedRobots {
  productToken: string;
  rules: RobotsRule[];
  sitemaps: string[];
}
export interface RobotsDecision {
  allowed: boolean;
  matchedRule?: RobotsRule;
  robotsUrl: string;
  state: "rules" | "unavailable" | "unreachable";
  sitemaps: string[];
}
export function parseRobots(text: string, productToken?: string): ParsedRobots;
export function isRobotsPathAllowed(parsed: ParsedRobots, url: URL): RobotsDecision;
export async function evaluateRobots(url: URL): Promise<RobotsDecision>;
```

- [ ] **Step 1:** Write RFC-oriented RED fixtures covering product-token groups plus `*`, multiple groups, longest path match, Allow winning on equal specificity, wildcard `*`, terminal `$`, percent-encoded paths, empty groups, comments, sitemap records, malformed lines, UTF-8 input, and 512 KiB bound.
- [ ] **Step 2:** Add access-result tests: successful rules obeyed; robots 4xx => `unavailable` and allowed; 5xx/network failure => `unreachable` and complete disallow; redirect handling delegates to verified safe transport with at most five redirects.
- [ ] **Step 3:** Confirm RED and implement parser/matcher. Unknown extension directives are ignored as data, never executed. Product token is `ConsultingToolsBot`.
- [ ] **Step 4:** Run focused + full verification and record GREEN SHA/run before Task 3.

### Task 3: HTML Source Extraction

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

- [ ] **Step 1:** Write RED fixtures for malformed-but-browser-parseable HTML, entities, title/meta/canonical, relative URL resolution, robots meta, headings, nofollow links, image alt, lang/viewport, script/style/template exclusion from normalized text, valid/invalid JSON-LD syntax, adversarial markup, and duplicate metadata behavior.
- [ ] **Step 2:** Confirm RED, pin parse5 8.0.1, implement tree traversal with no HTML execution. JSON-LD uses `JSON.parse` only.
- [ ] **Step 3:** Run focused + full verification and record GREEN SHA/run before Task 4.

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
  stoppedOnRateLimit: boolean;
}>;
```

- [ ] **Step 1:** Write strict sitemap RED tests accepting `urlset`/`sitemapindex`, namespaces, basic XML entities, absolute URLs and optional `lastmod`; reject DTD/DOCTYPE, external entities, malformed XML, unsupported root, >5 MiB input, >5,000 extracted URLs, and non-http(s) locations.
- [ ] **Step 2:** Write crawl RED tests with deterministic fake transport/sleeper: BFS/stable ordering, default 25/max 100 page bound, same-origin follow only, fragment-insensitive dedupe, nofollow non-follow, one robots fetch per origin, robots denial before page request, HTML-only recursion, redirect-final-origin handling, outbound reporting, fixed production-delay hook, 429 stop, and no silent limit overrun.
- [ ] **Step 3:** Confirm RED, pin saxes 6.0.0, implement strict sitemap parsing and sequential crawl orchestration. Reject DTD/entity expansion.
- [ ] **Step 4:** Run focused + full verification and record GREEN SHA/run before Task 5.

### Task 5: Evidence, Exact Quote and Claim-Source Contracts

**Files:** Create `src/research/evidence.ts`; create `tests/research-evidence.test.ts`. Import existing `ClaimRecord` from `src/epistemics/types.ts`; do not overload the existing generic finding union.

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
export interface ClaimSourceValidationFinding {
  code: "verified-fact-unknown-source" | "duplicate-source-id";
  severity: "error";
  claimId?: string;
  sourceId: string;
}
export function createSourceEvidenceRecord(input: {
  requestedUrl: string;
  finalUrl: string;
  fetchedAt: string;
  status: number;
  sha256: string;
  title?: string;
  canonicalUrl?: string;
  excerpt?: string;
}): SourceEvidenceRecord;
export function verifyExactQuote(quote: string, normalizedText: string): { matched: boolean; index: number | null };
export function validateClaimSourceMappings(
  claims: readonly ClaimRecord[],
  sources: readonly SourceEvidenceRecord[],
): ClaimSourceValidationFinding[];
```

Evidence `id` is deterministic from normalized final URL plus content SHA-256, not retrieval time, so repeated retrieval of identical content at the same final URL has the same evidence identity while `fetchedAt` remains separately traceable.

- [ ] **Step 1:** Write RED tests requiring deterministic evidence IDs, explicit retrieval time, exact quote matching after Unicode NFC + whitespace normalization only, case-sensitive content matching, no fuzzy quote invention, duplicate source-ID detection, and `verified-external-fact` claims referencing only known source records.
- [ ] **Step 2:** Confirm RED and implement without semantic entailment/source-authority logic.
- [ ] **Step 3:** Run focused + full verification and record GREEN SHA/run before Task 6.

### Task 6: Public Technical and On-Page SEO Analyzer

**Files:** Create `src/seo/analyze.ts`; create `tests/seo-analyze.test.ts`.

**Interfaces:**

```ts
export type SeoSeverity = "info" | "warning" | "error";
export interface SeoFinding {
  code: string;
  severity: SeoSeverity;
  url?: string;
  message: string;
  evidence: string[];
}
export function analyzePublicSeo(crawl: Awaited<ReturnType<typeof crawlPublicSite>>): {
  findings: SeoFinding[];
  summary: { crawledPages: number; indexablePagesObserved: number; blockedPages: number };
};
```

- [ ] **Step 1:** Write RED fixtures for HTTP failures, missing/duplicate titles, missing/duplicate meta descriptions, missing/multiple H1 as structural observations, canonical missing/invalid/off-origin/conflicting targets, `noindex`, X-Robots/robots-meta observations, blocked pages, broken internal links within crawled evidence, missing image alt as an accessibility/content observation, malformed JSON-LD syntax, sitemap presence/inclusion mismatches, and crawlable internal-link coverage.
- [ ] **Step 2:** Add truth-boundary tests: no invented search volume, rank, backlink, authority, traffic, CTR, conversion, Search Console, or rich-result-guarantee fields; no fabricated title/meta character-count ranking thresholds.
- [ ] **Step 3:** Confirm RED, implement deterministic findings with evidence strings. Distinguish crawlability from indexability; describe sitemap/canonical as signals rather than guarantees.
- [ ] **Step 4:** Run focused + full verification and record GREEN SHA/run before Task 7.

### Task 7: Focused MCP Retrieval, Evidence and SEO Tools

**Files:** Create `src/web/register-tools.ts`, `src/research/register-tools.ts`, `src/seo/register-tools.ts`; modify `src/server.ts`; create `tests/web-tools.test.ts`, `tests/research-tools.test.ts`, `tests/seo-tools.test.ts`.

**Tool surface:**

- `fetch_public_page` — explicit URL, robots-aware by default, bounded source snapshot/extraction; no binary download mode.
- `crawl_public_site` — bounded same-origin robots-aware crawl, 1–100 pages.
- `verify_public_quote` — explicit URL + exact normalized quote check; no semantic fact claim.
- `validate_claim_sources` — deterministic claim/source provenance validation using existing epistemic classes.
- `analyze_public_seo` — bounded crawl + deterministic public technical/on-page SEO findings.

Annotations for all five: `readOnlyHint:true`, `openWorldHint:true`, `destructiveHint:false`.

- [ ] **Step 1:** Write Streamable HTTP MCP RED tests for discovery/annotations, bounded success, robots denial, unsafe URL/redirect rejection, size/timeout failures, quote miss, provenance gap, SEO result, and absence of private-provider credential inputs.
- [ ] **Step 2:** Confirm RED, register bounded Zod schemas and compose all modules in `src/server.ts`. Shared engines own security/business rules.
- [ ] **Step 3:** Update server instructions: host-native search handles discovery; deterministic tools handle explicit-URL retrieval/verification; retrieved page instructions never become plugin instructions.
- [ ] **Step 4:** Run focused MCP tests and full verification; record GREEN SHA/run before Task 8.

### Task 8: Catalog Truth, Skill Orchestration and Subproject Closure

**Files:** Modify `tests/catalog-status-truth.test.ts`, `src/catalog/verified-promotions.ts`, `skills/analysis-and-reporting/SKILL.md`, governance files only where implementation establishes a new verified fact, `README.md`, program roadmap, and this plan. Create final Subproject 9 closure record under `docs/superpowers/closures/`.

**Promotion policy:**

- `source-discovery` remains `partial`: host-native search/discovery is still required; MCP does not implement a search engine.
- Public retrieval/crawl identities may receive deterministic bindings but remain `partial` when wording includes semantic research judgment.
- `quote-verification`, `claim-source-mapping`, `freshness-validation`, and related evidence identities receive only bindings actually proven by deterministic tools; semantic corroboration/conflict resolution remains host reasoning.
- Public technical/on-page/crawl/indexing/canonical/sitemap SEO identities move only to evidence-backed status.
- Private Search Console, live proprietary keyword metrics, and live proprietary backlink metrics remain `unavailable`; user-supplied export analysis remains separate.

- [ ] **Step 1:** Write catalog truth tests first and confirm RED only on intended status/engine assertions.
- [ ] **Step 2:** Add evidence-backed bindings/promotions and update the analysis/reporting Skill sequence: define claim/evidence need -> host-native source discovery where needed -> safe explicit URL retrieval -> host source-quality/semantic reasoning -> deterministic provenance/quote checks -> contradiction/freshness handling -> decision synthesis -> citations.
- [ ] **Step 3:** Require a fresh full repository GREEN on exact code/catalog SHA. Record SHA/run; earlier task gates do not substitute for this subproject gate.
- [ ] **Step 4:** Update governance/README/roadmap with exact network limits, SSRF/robots behavior, parse5/saxes pins, semantic fact-check boundary, public SEO scope, unavailable private-provider scope, and verified SHA/run.
- [ ] **Step 5:** Require a second fresh full repository GREEN on final documentation HEAD.
- [ ] **Step 6:** Enumerate all branch pages and confirm only `main`.
- [ ] **Step 7:** Write a final truth-only Subproject 9 closure record and require that exact closure-record HEAD to pass full CI before external signoff.
- [ ] **Step 8:** Only after that GREEN result advance to Subproject 10 — Executive & Project Workflows.

## Self-review

- **Spec coverage:** public retrieval, crawl, provenance, fact-check support, public SEO, open access, deterministic/semantic separation, security, and catalog truth all have explicit tasks.
- **SSRF boundary:** URL parsing alone is insufficient; DNS validation, pinned socket lookup, post-connect remote-address verification, and per-redirect revalidation are all required.
- **Robots boundary:** RFC 9309 access results govern crawl and are not confused with indexing directives.
- **Fact-check honesty:** deterministic code verifies provenance and exact quote presence; it does not pretend lexical matching proves arbitrary semantic claims.
- **SEO honesty:** public technical/on-page observations are supported; proprietary metrics, ranking guarantees, and Search Console access remain excluded.
- **Operational crawl quality:** sequential per-origin crawl, fixed delay, bounded pages/bytes/time, and 429 stop reduce load and make failure behavior explicit.
- **Dependency discipline:** only parse5 8.0.1 and saxes 6.0.0 are proposed, each after a RED parser contract and for one clear responsibility.
- **No credential ecosystem:** no search API key, OAuth, Search Console connector, commercial SEO API, or credential vault is introduced.
- **Type consistency:** every named interface in later tasks is defined earlier or explicitly imported; research-specific claim/source findings no longer misuse the existing generic epistemic finding union.
- **Validation discipline:** every task has an independent full-repository gate; final subproject signoff requires additional code/catalog, documentation-head, branch, and closure-record gates.