import { describe, expect, it } from "vitest";
import {
  createRobotsEvaluator,
  isRobotsPathAllowed,
  parseRobots,
} from "../src/web/robots.js";
import type { PublicFetchResult } from "../src/web/types.js";

function fetched(status: number, body: string): PublicFetchResult {
  return {
    requestedUrl: "https://example.com/robots.txt",
    finalUrl: "https://example.com/robots.txt",
    status,
    headers: { "content-type": "text/plain" },
    body: Buffer.from(body),
    fetchedAt: "2026-09-09T22:40:00.000Z",
    sha256: "0".repeat(64),
    redirects: [],
  };
}

describe("RFC 9309 robots policy", () => {
  it("selects the specific product-token group over wildcard and combines repeated matching groups", () => {
    const parsed = parseRobots(`
User-agent: *
Disallow: /wild

User-agent: ConsultingToolsBot
Disallow: /bot

User-agent: consultingtoolsbot
Allow: /bot/open
Sitemap: https://example.com/sitemap.xml
`);

    expect(parsed.productToken).toBe("ConsultingToolsBot");
    expect(parsed.rules).toEqual([
      { directive: "disallow", pattern: "/bot" },
      { directive: "allow", pattern: "/bot/open" },
    ]);
    expect(parsed.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/wild"))).toMatchObject({ allowed: true });
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/bot/private"))).toMatchObject({ allowed: false });
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/bot/open"))).toMatchObject({ allowed: true });
  });

  it("falls back to wildcard and uses longest match with allow winning an equal-specificity tie", () => {
    const parsed = parseRobots(`
User-agent: *
Disallow: /private/*
Allow: /private/public$
Disallow: /same
Allow: /same
`);

    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/private/a"))).toMatchObject({
      allowed: false,
      matchedRule: { directive: "disallow", pattern: "/private/*" },
    });
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/private/public"))).toMatchObject({ allowed: true });
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/private/public/more"))).toMatchObject({ allowed: false });
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/same"))).toMatchObject({
      allowed: true,
      matchedRule: { directive: "allow", pattern: "/same" },
    });
  });

  it("normalizes percent-encoded unreserved octets and matches path plus query", () => {
    const parsed = parseRobots(`
User-agent: *
Disallow: /~user
Disallow: /*.pdf$
`);
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/%7Euser"))).toMatchObject({ allowed: false });
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/report.pdf"))).toMatchObject({ allowed: false });
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/report.pdf?download=1"))).toMatchObject({ allowed: true });
  });

  it("ignores empty disallow and malformed or unknown directives without executing them", () => {
    const parsed = parseRobots(`
User-agent: *
Disallow:
Bad malformed line
Crawl-delay: 0
X-Execute: rm -rf /
`);
    expect(parsed.rules).toEqual([]);
    expect(isRobotsPathAllowed(parsed, new URL("https://example.com/anything"))).toMatchObject({ allowed: true });
  });

  it("rejects robots input above the v1 parser bound", () => {
    expect(() => parseRobots(`User-agent: *\n#${"x".repeat(512 * 1024)}`)).toThrow(/512|size|robots/i);
  });

  it("maps successful, unavailable, and unreachable robots access states conservatively", async () => {
    const allowEvaluator = createRobotsEvaluator(async () => fetched(404, ""));
    await expect(allowEvaluator(new URL("https://example.com/private"))).resolves.toMatchObject({
      allowed: true,
      state: "unavailable",
      robotsUrl: "https://example.com/robots.txt",
    });

    const unavailableEvaluator = createRobotsEvaluator(async () => fetched(503, "maintenance"));
    await expect(unavailableEvaluator(new URL("https://example.com/"))).resolves.toMatchObject({
      allowed: false,
      state: "unreachable",
    });

    const networkEvaluator = createRobotsEvaluator(async () => {
      throw new Error("network down");
    });
    await expect(networkEvaluator(new URL("https://example.com/"))).resolves.toMatchObject({
      allowed: false,
      state: "unreachable",
    });
  });

  it("applies fetched rules and carries sitemap declarations", async () => {
    const evaluator = createRobotsEvaluator(async (_url, options) => {
      expect(options).toMatchObject({ maxBytes: 512 * 1024, maxRedirects: 5 });
      return fetched(200, `User-agent: ConsultingToolsBot\nDisallow: /private\nSitemap: https://example.com/site.xml\n`);
    });
    await expect(evaluator(new URL("https://example.com/private/a"))).resolves.toMatchObject({
      allowed: false,
      state: "rules",
      sitemaps: ["https://example.com/site.xml"],
    });
  });
});
