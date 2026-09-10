import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  createSiteCrawler,
  type SiteCrawlerAdapters,
} from "../src/web/crawl.js";
import type { PublicFetchResult } from "../src/web/types.js";

function response(
  requestedUrl: string,
  body: string,
  options: { status?: number; contentType?: string; finalUrl?: string } = {},
): PublicFetchResult {
  const bytes = Buffer.from(body, "utf8");
  return {
    requestedUrl,
    finalUrl: options.finalUrl ?? requestedUrl,
    status: options.status ?? 200,
    headers: { "content-type": options.contentType ?? "text/html; charset=utf-8" },
    body: bytes,
    fetchedAt: "2026-09-09T20:00:00.000Z",
    sha256: createHash("sha256").update(bytes).digest("hex"),
    redirects: [],
  };
}

function crawlerWith(
  fixtures: Record<string, PublicFetchResult | Error>,
  calls: string[],
  sleeps: number[],
) {
  const adapters: SiteCrawlerAdapters = {
    fetch: async (url) => {
      calls.push(url);
      const fixture = fixtures[url];
      if (fixture instanceof Error) throw fixture;
      if (!fixture) throw new Error(`Unexpected fetch: ${url}`);
      return fixture;
    },
    sleep: async (milliseconds) => {
      sleeps.push(milliseconds);
    },
  };
  return createSiteCrawler(adapters);
}

describe("bounded robots-aware same-origin crawl", () => {
  it("uses stable BFS order, strips fragments, ignores nofollow crawl targets, reports outbound links, and fetches robots once", async () => {
    const calls: string[] = [];
    const sleeps: number[] = [];
    const robots = response("https://example.com/robots.txt", [
      "User-agent: *",
      "Allow: /",
      "Sitemap: https://example.com/sitemap.xml",
    ].join("\n"), { contentType: "text/plain" });
    const fixtures = {
      "https://example.com/robots.txt": robots,
      "https://example.com/": response("https://example.com/", `
        <html><head><title>Home</title></head><body>
          <a href="/b">B</a>
          <a href="/a#section">A</a>
          <a href="/a#other">A duplicate fragment</a>
          <a href="/skip" rel="nofollow">Skip</a>
          <a href="https://outside.example/path">Outside</a>
        </body></html>`),
      "https://example.com/b": response("https://example.com/b", `<a href="/c">C</a>`),
      "https://example.com/a": response("https://example.com/a", `<p>A</p>`),
      "https://example.com/c": response("https://example.com/c", `<p>C</p>`),
    };

    const crawl = crawlerWith(fixtures, calls, sleeps);
    const result = await crawl("https://example.com/", { maxPages: 4 });

    expect(result.origin).toBe("https://example.com");
    expect(result.pages.map((page) => page.fetch.finalUrl)).toEqual([
      "https://example.com/",
      "https://example.com/b",
      "https://example.com/a",
      "https://example.com/c",
    ]);
    expect(calls.filter((url) => url.endsWith("/robots.txt"))).toHaveLength(1);
    expect(calls).not.toContain("https://example.com/skip");
    expect(calls).not.toContain("https://outside.example/path");
    expect(calls.filter((url) => url === "https://example.com/a")).toHaveLength(1);
    expect(result.externalLinks).toEqual(["https://outside.example/path"]);
    expect(result.sitemapUrls).toEqual(["https://example.com/sitemap.xml"]);
    expect(result.blockedUrls).toEqual([]);
    expect(result.stoppedOnRateLimit).toBe(false);
    expect(sleeps).toEqual([250, 250, 250]);
  });

  it("checks robots before requesting a blocked page", async () => {
    const calls: string[] = [];
    const sleeps: number[] = [];
    const fixtures = {
      "https://example.com/robots.txt": response(
        "https://example.com/robots.txt",
        "User-agent: *\nDisallow: /private",
        { contentType: "text/plain" },
      ),
      "https://example.com/": response("https://example.com/", `<a href="/private">Private</a><a href="/public">Public</a>`),
      "https://example.com/public": response("https://example.com/public", `<p>Public</p>`),
    };
    const result = await crawlerWith(fixtures, calls, sleeps)("https://example.com/", { maxPages: 10 });
    expect(result.blockedUrls).toEqual(["https://example.com/private"]);
    expect(calls).not.toContain("https://example.com/private");
    expect(calls).toContain("https://example.com/public");
  });

  it("recurses only from successful HTML responses", async () => {
    const calls: string[] = [];
    const fixtures = {
      "https://example.com/robots.txt": response("https://example.com/robots.txt", "User-agent: *\nAllow: /", { contentType: "text/plain" }),
      "https://example.com/": response("https://example.com/", `<a href="/data.json">Data</a><a href="/missing">Missing</a>`),
      "https://example.com/data.json": response("https://example.com/data.json", `{"url":"/hidden"}`, { contentType: "application/json" }),
      "https://example.com/missing": response("https://example.com/missing", `<a href="/also-hidden">Hidden</a>`, { status: 404 }),
    };
    const result = await crawlerWith(fixtures, calls, [])("https://example.com/", { maxPages: 10 });
    expect(result.pages).toHaveLength(3);
    expect(calls).not.toContain("https://example.com/hidden");
    expect(calls).not.toContain("https://example.com/also-hidden");
    expect(result.pages[1]!.html).toBeUndefined();
    expect(result.pages[2]!.html).toBeUndefined();
  });

  it("does not recurse after an in-scope request redirects to another origin", async () => {
    const calls: string[] = [];
    const fixtures = {
      "https://example.com/robots.txt": response("https://example.com/robots.txt", "User-agent: *\nAllow: /", { contentType: "text/plain" }),
      "https://example.com/": response("https://example.com/", `<a href="/moved">Moved</a>`),
      "https://example.com/moved": response("https://example.com/moved", `<a href="https://outside.example/deeper">Deeper</a>`, {
        finalUrl: "https://outside.example/moved",
      }),
    };
    const result = await crawlerWith(fixtures, calls, [])("https://example.com/", { maxPages: 10 });
    expect(result.pages.map((page) => page.fetch.finalUrl)).toEqual([
      "https://example.com/",
      "https://outside.example/moved",
    ]);
    expect(calls).not.toContain("https://outside.example/deeper");
    expect(result.externalLinks).toContain("https://outside.example/moved");
  });

  it("stops immediately after HTTP 429 and does not silently continue", async () => {
    const calls: string[] = [];
    const fixtures = {
      "https://example.com/robots.txt": response("https://example.com/robots.txt", "User-agent: *\nAllow: /", { contentType: "text/plain" }),
      "https://example.com/": response("https://example.com/", `<a href="/rate">Rate</a><a href="/later">Later</a>`),
      "https://example.com/rate": response("https://example.com/rate", "Too Many Requests", { status: 429, contentType: "text/plain" }),
      "https://example.com/later": response("https://example.com/later", `<p>Later</p>`),
    };
    const result = await crawlerWith(fixtures, calls, [])("https://example.com/", { maxPages: 10 });
    expect(result.stoppedOnRateLimit).toBe(true);
    expect(calls).not.toContain("https://example.com/later");
    expect(result.pages.at(-1)?.fetch.status).toBe(429);
  });

  it("enforces default 25 and caller maximum 100 page limits without overrun", async () => {
    const makeFixtures = (count: number) => {
      const fixtures: Record<string, PublicFetchResult> = {
        "https://example.com/robots.txt": response("https://example.com/robots.txt", "User-agent: *\nAllow: /", { contentType: "text/plain" }),
      };
      for (let index = 0; index < count; index += 1) {
        const url = index === 0 ? "https://example.com/" : `https://example.com/${index}`;
        const next = index + 1 < count ? `<a href="/${index + 1}">Next</a>` : "done";
        fixtures[url] = response(url, next);
      }
      return fixtures;
    };

    const defaultCalls: string[] = [];
    const defaultResult = await crawlerWith(makeFixtures(40), defaultCalls, [])("https://example.com/");
    expect(defaultResult.pages).toHaveLength(25);
    expect(defaultCalls.filter((url) => !url.endsWith("robots.txt"))).toHaveLength(25);

    const maxCalls: string[] = [];
    const maxResult = await crawlerWith(makeFixtures(120), maxCalls, [])("https://example.com/", { maxPages: 100 });
    expect(maxResult.pages).toHaveLength(100);
    expect(maxCalls.filter((url) => !url.endsWith("robots.txt"))).toHaveLength(100);

    await expect(crawlerWith(makeFixtures(2), [], [])("https://example.com/", { maxPages: 101 })).rejects.toThrow(/100/);
    await expect(crawlerWith(makeFixtures(2), [], [])("https://example.com/", { maxPages: 0 })).rejects.toThrow(/1/);
  });

  it("fails closed when robots is unreachable", async () => {
    const calls: string[] = [];
    const fixtures = {
      "https://example.com/robots.txt": new Error("network unavailable"),
    };
    const result = await crawlerWith(fixtures, calls, [])("https://example.com/", { maxPages: 5 });
    expect(result.pages).toEqual([]);
    expect(result.blockedUrls).toEqual(["https://example.com/"]);
    expect(calls).toEqual(["https://example.com/robots.txt"]);
  });
});
