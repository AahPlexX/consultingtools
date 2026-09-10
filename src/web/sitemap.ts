import { SaxesParser } from "saxes";

const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";
const SITEMAP_MAX_BYTES = 5 * 1024 * 1024;
const SITEMAP_MAX_URLS = 5_000;

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

export interface ParsedSitemap {
  kind: "urlset" | "sitemapindex";
  urls: SitemapEntry[];
}

interface ActiveEntry {
  depth: number;
  loc?: string;
  lastmod?: string;
}

interface ActiveCapture {
  depth: number;
  field: "loc" | "lastmod";
  text: string;
}

function assertSafeDocument(xml: string): void {
  if (Buffer.byteLength(xml, "utf8") > SITEMAP_MAX_BYTES) {
    throw new Error(`Sitemap XML exceeds the ${SITEMAP_MAX_BYTES}-byte (5 MiB) size limit.`);
  }
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/iu.test(xml)) {
    throw new Error("Sitemap XML must not contain DOCTYPE or ENTITY declarations.");
  }
}

function validatedLocation(value: string): string {
  const loc = value.trim();
  if (loc === "") throw new Error("Sitemap entry loc must not be blank.");

  let url: URL;
  try {
    url = new URL(loc);
  } catch {
    throw new Error("Sitemap entry loc must be an absolute valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Sitemap entry loc must use http or https.");
  }
  if (url.username !== "" || url.password !== "") {
    throw new Error("Sitemap entry loc must not contain credentials.");
  }
  return loc;
}

export function parseSitemapXml(xml: string): ParsedSitemap {
  assertSafeDocument(xml);

  let depth = 0;
  let kind: ParsedSitemap["kind"] | undefined;
  let activeEntry: ActiveEntry | undefined;
  let activeCapture: ActiveCapture | undefined;
  const urls: SitemapEntry[] = [];

  const parser = new SaxesParser({ xmlns: true });

  parser.on("opentag", (tag) => {
    depth += 1;
    const local = tag.local;
    const uri = tag.uri;

    if (depth === 1) {
      if ((local !== "urlset" && local !== "sitemapindex") || uri !== SITEMAP_NAMESPACE) {
        throw new Error("Sitemap root must be urlset or sitemapindex in the standard sitemap namespace.");
      }
      kind = local;
      return;
    }

    const expectedEntry = kind === "urlset" ? "url" : "sitemap";
    if (depth === 2 && uri === SITEMAP_NAMESPACE && local === expectedEntry) {
      if (activeEntry !== undefined) throw new Error("Sitemap entries must not be nested.");
      activeEntry = { depth };
      return;
    }

    if (
      activeEntry !== undefined &&
      depth === activeEntry.depth + 1 &&
      uri === SITEMAP_NAMESPACE &&
      (local === "loc" || local === "lastmod")
    ) {
      if (activeCapture !== undefined) throw new Error("Sitemap loc/lastmod elements must not be nested.");
      activeCapture = { depth, field: local, text: "" };
    }
  });

  const appendText = (text: string) => {
    if (activeCapture !== undefined) activeCapture.text += text;
  };
  parser.on("text", appendText);
  parser.on("cdata", appendText);

  parser.on("closetag", () => {
    if (activeCapture !== undefined && depth === activeCapture.depth) {
      if (activeEntry === undefined) throw new Error("Sitemap parser lost entry context.");
      const value = activeCapture.text.trim();
      if (activeCapture.field === "loc") {
        if (activeEntry.loc !== undefined) throw new Error("Sitemap entry must contain exactly one loc element.");
        activeEntry.loc = validatedLocation(value);
      } else {
        if (activeEntry.lastmod !== undefined) throw new Error("Sitemap entry must not contain duplicate lastmod elements.");
        if (value === "") throw new Error("Sitemap lastmod must not be blank when supplied.");
        activeEntry.lastmod = value;
      }
      activeCapture = undefined;
    }

    if (activeEntry !== undefined && depth === activeEntry.depth) {
      if (activeEntry.loc === undefined) throw new Error("Sitemap entry must contain a loc element.");
      const entry: SitemapEntry = { loc: activeEntry.loc };
      if (activeEntry.lastmod !== undefined) entry.lastmod = activeEntry.lastmod;
      urls.push(entry);
      if (urls.length > SITEMAP_MAX_URLS) {
        throw new Error(`Sitemap URL count exceeds the ${SITEMAP_MAX_URLS.toLocaleString("en-US")}-URL limit.`);
      }
      activeEntry = undefined;
    }

    depth -= 1;
  });

  parser.write(xml).close();

  if (kind === undefined) throw new Error("Sitemap XML does not contain a supported root element.");
  if (depth !== 0 || activeEntry !== undefined || activeCapture !== undefined) {
    throw new Error("Sitemap XML ended with incomplete structure.");
  }

  return { kind, urls };
}
