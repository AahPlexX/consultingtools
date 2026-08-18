---
name: seo-research
description: Research, audit, explain, and report search-engine optimization issues using current authoritative search-engine guidance and available site evidence. Use for technical SEO, crawl/indexing, on-page, content, structured data, Core Web Vitals, local visibility, search performance, content gaps, or prioritized SEO consulting reports.
---

# SEO Research and Reporting

SEO guidance changes over time. Before treating a technical rule, supported feature, metric threshold, crawler behavior, or search policy as current fact, verify it against current primary documentation when research tools are available. Prefer Google Search Central, web.dev/Chrome performance documentation, Bing Webmaster documentation, schema.org for vocabulary semantics, and first-party webmaster/search-console data.

## Evidence boundary

Do not fabricate rankings, traffic, impressions, clicks, query volume, backlink counts, authority scores, index status, Core Web Vitals field data, or competitor performance. Distinguish:

- directly observed page/site behavior;
- first-party search/performance data;
- third-party provider estimates;
- current search-engine documentation;
- analytical inference.

A third-party metric is a provider-defined estimate, not a universal search-engine fact.

## Choose audit dimensions from the evidence

Do not force every site through one checklist. Select relevant dimensions from:

- discovery and crawl access;
- HTTP status, redirect, and error behavior;
- indexability directives and robots controls;
- canonicalization and duplicate URL handling;
- XML sitemaps and discovery paths;
- internal links and site architecture;
- mobile rendering and JavaScript-rendered content;
- titles, snippets/meta descriptions, headings, semantics, and page intent;
- structured data correctness and current search-feature eligibility;
- content quality, originality, clarity, helpfulness, and intent coverage;
- media/image discoverability where relevant;
- internationalization and locale targeting where relevant;
- page experience and current Core Web Vitals evidence;
- HTTPS/security signals that affect accessibility or trust;
- local/business information consistency where relevant;
- search performance from authorized first-party tools;
- competitor/content-gap evidence when current retrieval is available;
- links/off-site evidence only when a reliable source is available.

## Technical audit sequence

1. Define the business/search objective and target scope.
2. Establish what URLs/pages are actually reachable and what evidence can be inspected.
3. Verify current official crawler/indexing guidance for material rules.
4. Check discovery, status codes, directives, canonical signals, and sitemap consistency.
5. Check renderability, internal discovery, page semantics, and structured data where applicable.
6. Evaluate content/search intent with evidence rather than keyword-density heuristics.
7. Incorporate field/lab performance data when available; do not substitute a synthetic score for real-user evidence without saying so.
8. Use first-party search performance data when authorized.
9. Prioritize findings by likely business/search impact, evidence confidence, effort, dependency, and reversibility.
10. Define how each fix will be validated after implementation.

## Reporting requirement

Every material SEO finding must explain in plain language:

- what the concept means;
- what was actually observed;
- why it can matter to crawling, indexing, search presentation, user experience, or business performance;
- what evidence supports the finding;
- what kind of correction is appropriate;
- how to verify the correction;
- any uncertainty or dependency.

Do not tell a non-developer merely to “fix LCP,” “add canonicals,” or “improve crawlability.” Explain the concept and describe the outcome that remediation should achieve. Developer-level implementation details may be included when the audience requests them.

## Core Web Vitals

Use the current official metric definitions and thresholds at audit time because the metric set can evolve. Prefer field data at the recommended percentile when available and keep mobile/desktop segmentation visible when the source provides it. Lab diagnostics may explain likely causes but must not be mislabeled as field performance.

## Structured data

Validate that markup represents visible page content and is eligible under current search-engine feature documentation. Schema validity alone does not guarantee a rich result or search visibility. Do not recommend irrelevant markup solely to increase the amount of structured data.

## Prioritization

Prioritize blockers to discovery/indexing and severe sitewide issues before cosmetic metadata improvements when the evidence supports that ordering. Account for dependency: a recommendation that cannot create value until another issue is fixed should not be presented as the first independent action.

## No ranking guarantees

SEO can improve discoverability, technical quality, content clarity, and eligibility; it does not justify guarantees of a particular ranking, traffic level, rich result, citation, or AI-search placement.
