import { describe, expect, it } from "vitest";
import { parseSitemapXml } from "../src/web/sitemap.js";

const NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

describe("strict sitemap parsing", () => {
  it("parses urlset namespaces entities absolute URLs and optional lastmod", () => {
    const parsed = parseSitemapXml(`<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="${NS}">
        <url><loc>https://example.com/</loc><lastmod>2026-09-09</lastmod></url>
        <url><loc>https://example.com/a?x=1&amp;y=2</loc></url>
      </urlset>`);

    expect(parsed).toEqual({
      kind: "urlset",
      urls: [
        { loc: "https://example.com/", lastmod: "2026-09-09" },
        { loc: "https://example.com/a?x=1&y=2" },
      ],
    });
  });

  it("parses sitemap indexes with the standard namespace", () => {
    expect(parseSitemapXml(`
      <sitemapindex xmlns="${NS}">
        <sitemap><loc>https://example.com/sitemap-1.xml</loc><lastmod>2026-09-08T12:00:00Z</lastmod></sitemap>
        <sitemap><loc>https://example.com/sitemap-2.xml</loc></sitemap>
      </sitemapindex>`)).toEqual({
        kind: "sitemapindex",
        urls: [
          { loc: "https://example.com/sitemap-1.xml", lastmod: "2026-09-08T12:00:00Z" },
          { loc: "https://example.com/sitemap-2.xml" },
        ],
      });
  });

  it("ignores namespaced extension elements without treating them as sitemap entries", () => {
    const parsed = parseSitemapXml(`
      <urlset xmlns="${NS}" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
        <url>
          <loc>https://example.com/a</loc>
          <image:image><image:loc>https://cdn.example.com/a.jpg</image:loc></image:image>
        </url>
      </urlset>`);
    expect(parsed.urls).toEqual([{ loc: "https://example.com/a" }]);
  });

  it.each([
    ["DOCTYPE", `<!DOCTYPE urlset [<!ENTITY x "boom">]><urlset xmlns="${NS}"><url><loc>https://example.com/&x;</loc></url></urlset>`],
    ["external entity", `<!DOCTYPE urlset SYSTEM "https://example.com/evil.dtd"><urlset xmlns="${NS}"/>`],
    ["malformed XML", `<urlset xmlns="${NS}"><url><loc>https://example.com/</url></urlset>`],
    ["unsupported root", `<feed xmlns="${NS}"><loc>https://example.com/</loc></feed>`],
    ["non-http URL", `<urlset xmlns="${NS}"><url><loc>file:///etc/passwd</loc></url></urlset>`],
    ["relative URL", `<urlset xmlns="${NS}"><url><loc>/relative</loc></url></urlset>`],
  ])("rejects %s", (_label, xml) => {
    expect(() => parseSitemapXml(xml)).toThrow();
  });

  it("rejects input above the 5 MiB parser bound", () => {
    const oversized = `<urlset xmlns="${NS}">${" ".repeat(5 * 1024 * 1024)}</urlset>`;
    expect(() => parseSitemapXml(oversized)).toThrow(/5 MiB|size limit/i);
  });

  it("rejects more than 5,000 extracted URLs", () => {
    const entries = Array.from({ length: 5_001 }, (_, index) =>
      `<url><loc>https://example.com/${index}</loc></url>`,
    ).join("");
    expect(() => parseSitemapXml(`<urlset xmlns="${NS}">${entries}</urlset>`)).toThrow(/5,000|URL limit/i);
  });

  it("rejects entries without a nonblank loc instead of inventing a URL", () => {
    expect(() => parseSitemapXml(`<urlset xmlns="${NS}"><url><lastmod>2026-09-09</lastmod></url></urlset>`))
      .toThrow(/loc/i);
  });
});
