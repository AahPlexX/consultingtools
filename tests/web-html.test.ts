import { describe, expect, it } from "vitest";
import { extractHtmlPage } from "../src/web/html.js";

describe("public HTML source extraction", () => {
  it("extracts browser-parsed metadata, structure, safe links, JSON-LD syntax, and visible text", () => {
    const page = extractHtmlPage(`<!doctype html>
<html lang="en-US"><head>
<title>  Operating &amp; Model  </title><title>Ignored second title</title>
<meta name="description" content=" Primary description ">
<meta name="description" content="Ignored second description">
<meta name="robots" content="noindex, follow">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical alternate" href="/canonical#section">
<script>window.evil = 'do not extract';</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":["Organization","Thing"]}</script>
<script type="application/ld+json">{broken json}</script>
<style>.secret { display:none }</style>
<template>template secret</template>
</head><body>
<h1>Executive &amp; Findings</h1><h2>Primary issue</h2>
<a href="/next?q=1#part" rel="nofollow external"> Next   page </a>
<a href="javascript:alert(1)">unsafe</a>
<img src="/logo.png" alt="Company logo"><img src="https://cdn.example.org/chart.png">
<p>Hello    world.</p><div><p>Malformed paragraph<div>Still visible
</body></html>`, "https://example.com/report/index.html");

    expect(page).toMatchObject({
      title: "Operating & Model",
      metaDescription: "Primary description",
      canonicalUrl: "https://example.com/canonical#section",
      robotsDirectives: ["noindex", "follow"],
      lang: "en-US",
      viewport: "width=device-width, initial-scale=1",
    });
    expect(page.headings).toEqual([
      { level: 1, text: "Executive & Findings" },
      { level: 2, text: "Primary issue" },
    ]);
    expect(page.links).toEqual([
      {
        href: "https://example.com/next?q=1#part",
        text: "Next page",
        rel: ["nofollow", "external"],
      },
    ]);
    expect(page.images).toEqual([
      { src: "https://example.com/logo.png", alt: "Company logo" },
      { src: "https://cdn.example.org/chart.png" },
    ]);
    expect(page.jsonLd).toEqual([
      { validJson: true, types: ["Organization", "Thing"] },
      { validJson: false, types: [] },
    ]);
    expect(page.normalizedText).toContain("Executive & Findings Primary issue Next page unsafe Hello world.");
    expect(page.normalizedText).toContain("Malformed paragraph Still visible");
    expect(page.normalizedText).not.toMatch(/do not extract|secret|broken json|Operating & Model/i);
  });

  it("uses first metadata values deterministically and combines robots meta directives without duplicates", () => {
    const page = extractHtmlPage(`
<html><head>
<title>First</title><title>Second</title>
<meta name="description" content="First description"><meta name="description" content="Second description">
<link rel="canonical" href="/first"><link rel="canonical" href="/second">
<meta name="robots" content="NOINDEX, follow"><meta name="robots" content="follow, max-snippet:50">
</head><body><p>Body</p></body></html>`, "https://example.com/start");
    expect(page.title).toBe("First");
    expect(page.metaDescription).toBe("First description");
    expect(page.canonicalUrl).toBe("https://example.com/first");
    expect(page.robotsDirectives).toEqual(["noindex", "follow", "max-snippet:50"]);
  });

  it("keeps explicit empty image alt text distinct from a missing alt attribute", () => {
    const page = extractHtmlPage(`<html><body><img src="/decorative.png" alt=""><img src="/unknown.png"></body></html>`, "https://example.com/");
    expect(page.images).toEqual([
      { src: "https://example.com/decorative.png", alt: "" },
      { src: "https://example.com/unknown.png" },
    ]);
  });

  it("rejects an invalid final URL and excessive visible extracted text", () => {
    expect(() => extractHtmlPage("<p>text</p>", "not a URL")).toThrow(/url/i);
    expect(() => extractHtmlPage(`<body>${"x".repeat(1_000_001)}</body>`, "https://example.com/"))
      .toThrow(/text|character|limit/i);
  });
});
