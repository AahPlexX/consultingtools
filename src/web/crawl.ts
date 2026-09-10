import { fetchPublicUrl, type PublicFetchOptions } from "./http-fetch.js";
import { extractHtmlPage, type ExtractedHtmlPage } from "./html.js";
import {
  isRobotsPathAllowed,
  parseRobots,
  ROBOTS_MAX_BYTES,
  type ParsedRobots,
  type RobotsDecision,
} from "./robots.js";
import type { PublicFetchResult } from "./types.js";
import { normalizePublicWebUrl } from "./url-policy.js";

const DEFAULT_MAX_PAGES = 25;
const MAX_PAGES = 100;
const REQUEST_DELAY_MS = 250;

export interface CrawlPage {
  fetch: Omit<PublicFetchResult, "body">;
  html?: ExtractedHtmlPage;
  robots: RobotsDecision;
}

export interface CrawlResult {
  origin: string;
  pages: CrawlPage[];
  blockedUrls: string[];
  externalLinks: string[];
  sitemapUrls: string[];
  stoppedOnRateLimit: boolean;
}

export interface SiteCrawlerAdapters {
  fetch(url: string, options?: PublicFetchOptions): Promise<PublicFetchResult>;
  sleep(milliseconds: number): Promise<void>;
}

type RobotsPolicy =
  | { state: "rules"; robotsUrl: string; parsed: ParsedRobots }
  | { state: "unavailable" | "unreachable"; robotsUrl: string };

function boundedMaxPages(value: number | undefined): number {
  const resolved = value ?? DEFAULT_MAX_PAGES;
  if (!Number.isSafeInteger(resolved) || resolved < 1 || resolved > MAX_PAGES) {
    throw new Error(`maxPages must be a safe integer between 1 and ${MAX_PAGES}.`);
  }
  return resolved;
}

function header(headers: Record<string, string>, name: string): string | undefined {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return value;
  }
  return undefined;
}

function isHtmlResponse(result: PublicFetchResult): boolean {
  if (result.status < 200 || result.status > 299) return false;
  const mediaType = header(result.headers, "content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  return mediaType === "text/html" || mediaType === "application/xhtml+xml";
}

function fetchMetadata(result: PublicFetchResult): Omit<PublicFetchResult, "body"> {
  return {
    requestedUrl: result.requestedUrl,
    finalUrl: result.finalUrl,
    status: result.status,
    headers: { ...result.headers },
    fetchedAt: result.fetchedAt,
    sha256: result.sha256,
    redirects: result.redirects.map((redirect) => ({ ...redirect })),
  };
}

function pushUnique(target: string[], seen: Set<string>, value: string): void {
  if (seen.has(value)) return;
  seen.add(value);
  target.push(value);
}

function normalizedHref(value: string): string | undefined {
  try {
    return normalizePublicWebUrl(value).href;
  } catch {
    return undefined;
  }
}

async function loadRobotsPolicy(origin: string, fetcher: SiteCrawlerAdapters["fetch"]): Promise<RobotsPolicy> {
  const robotsUrl = new URL("/robots.txt", origin).href;
  let result: PublicFetchResult;
  try {
    result = await fetcher(robotsUrl, {
      maxBytes: ROBOTS_MAX_BYTES,
      maxRedirects: 5,
      timeoutMs: 10_000,
    });
  } catch {
    return { state: "unreachable", robotsUrl };
  }

  if (result.status >= 400 && result.status <= 499) return { state: "unavailable", robotsUrl };
  if (result.status < 200 || result.status > 299) return { state: "unreachable", robotsUrl };

  try {
    return {
      state: "rules",
      robotsUrl,
      parsed: parseRobots(result.body.toString("utf8")),
    };
  } catch {
    return { state: "unreachable", robotsUrl };
  }
}

function robotsDecision(policy: RobotsPolicy, url: URL): RobotsDecision {
  if (policy.state === "unavailable") {
    return { allowed: true, robotsUrl: policy.robotsUrl, state: "unavailable", sitemaps: [] };
  }
  if (policy.state === "unreachable") {
    return { allowed: false, robotsUrl: policy.robotsUrl, state: "unreachable", sitemaps: [] };
  }
  const decision = isRobotsPathAllowed(policy.parsed, url);
  return { ...decision, robotsUrl: policy.robotsUrl };
}

function normalizedSitemaps(policy: RobotsPolicy): string[] {
  if (policy.state !== "rules") return [];
  const values: string[] = [];
  const seen = new Set<string>();
  for (const candidate of policy.parsed.sitemaps) {
    const href = normalizedHref(candidate);
    if (href !== undefined) pushUnique(values, seen, href);
  }
  return values;
}

export function createSiteCrawler(adapters: SiteCrawlerAdapters) {
  return async function crawl(startUrl: string, options: { maxPages?: number } = {}): Promise<CrawlResult> {
    const maxPages = boundedMaxPages(options.maxPages);
    const start = normalizePublicWebUrl(startUrl);
    const origin = start.origin;
    const policy = await loadRobotsPolicy(origin, adapters.fetch);

    const pages: CrawlPage[] = [];
    const blockedUrls: string[] = [];
    const externalLinks: string[] = [];
    const blockedSeen = new Set<string>();
    const externalSeen = new Set<string>();
    const discovered = new Set<string>([start.href]);
    const fetched = new Set<string>();
    const queue: string[] = [start.href];
    let queueIndex = 0;
    let ordinaryRequests = 0;
    let stoppedOnRateLimit = false;

    while (queueIndex < queue.length && ordinaryRequests < maxPages && !stoppedOnRateLimit) {
      const requestedHref = queue[queueIndex++]!;
      if (fetched.has(requestedHref)) continue;
      const requestedUrl = new URL(requestedHref);
      const decision = robotsDecision(policy, requestedUrl);
      if (!decision.allowed) {
        pushUnique(blockedUrls, blockedSeen, requestedHref);
        continue;
      }

      if (ordinaryRequests > 0) await adapters.sleep(REQUEST_DELAY_MS);
      ordinaryRequests += 1;

      let result: PublicFetchResult;
      try {
        result = await adapters.fetch(requestedHref);
      } catch {
        fetched.add(requestedHref);
        continue;
      }

      fetched.add(requestedHref);
      const finalHref = normalizedHref(result.finalUrl);
      if (finalHref === undefined) continue;
      const finalUrl = new URL(finalHref);
      if (finalUrl.origin === origin) fetched.add(finalHref);

      const page: CrawlPage = {
        fetch: fetchMetadata(result),
        robots: decision,
      };

      if (result.status === 429) {
        pages.push(page);
        stoppedOnRateLimit = true;
        break;
      }

      if (finalUrl.origin !== origin) {
        pushUnique(externalLinks, externalSeen, finalHref);
        pages.push(page);
        continue;
      }

      const finalDecision = robotsDecision(policy, finalUrl);
      if (!finalDecision.allowed) {
        pushUnique(blockedUrls, blockedSeen, finalHref);
        pages.push(page);
        continue;
      }

      if (!isHtmlResponse(result)) {
        pages.push(page);
        continue;
      }

      const html = extractHtmlPage(result.body.toString("utf8"), finalHref);
      page.html = html;
      pages.push(page);

      const pageNofollow = html.robotsDirectives.includes("nofollow") || html.robotsDirectives.includes("none");
      for (const link of html.links) {
        const href = normalizedHref(link.href);
        if (href === undefined) continue;
        const url = new URL(href);
        if (url.origin !== origin) {
          pushUnique(externalLinks, externalSeen, href);
          continue;
        }
        if (pageNofollow || link.rel.includes("nofollow")) continue;
        if (discovered.has(href) || fetched.has(href)) continue;
        discovered.add(href);
        queue.push(href);
      }
    }

    return {
      origin,
      pages,
      blockedUrls,
      externalLinks,
      sitemapUrls: normalizedSitemaps(policy),
      stoppedOnRateLimit,
    };
  };
}

const defaultCrawler = createSiteCrawler({
  fetch: fetchPublicUrl,
  sleep: async (milliseconds) => {
    await new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
  },
});

export async function crawlPublicSite(
  startUrl: string,
  options: { maxPages?: number } = {},
): Promise<CrawlResult> {
  return defaultCrawler(startUrl, options);
}
