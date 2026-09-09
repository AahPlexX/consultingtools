import { parse } from "parse5";

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

interface HtmlAttribute {
  name: string;
  value: string;
}

interface HtmlNode {
  nodeName: string;
  tagName?: string;
  attrs?: HtmlAttribute[];
  childNodes?: HtmlNode[];
  value?: string;
}

const MAX_VISIBLE_TEXT = 1_000_000;
const MAX_HEADINGS = 2_000;
const MAX_LINKS = 5_000;
const MAX_IMAGES = 5_000;
const MAX_JSON_LD_BLOCKS = 200;
const HIDDEN_TEXT_ELEMENTS = new Set(["script", "style", "template"]);

function attribute(node: HtmlNode, name: string): string | undefined {
  const target = name.toLowerCase();
  return node.attrs?.find((entry) => entry.name.toLowerCase() === target)?.value;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function rawText(node: HtmlNode): string {
  if (node.nodeName === "#text") return node.value ?? "";
  return (node.childNodes ?? []).map(rawText).join("");
}

function safeResolvedWebUrl(value: string, baseUrl: URL): string | undefined {
  try {
    const resolved = new URL(value, baseUrl);
    return resolved.protocol === "http:" || resolved.protocol === "https:" ? resolved.href : undefined;
  } catch {
    return undefined;
  }
}

function resolvedReference(value: string, baseUrl: URL): string {
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return value;
  }
}

function relTokens(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.toLowerCase().split(/\s+/u).map((token) => token.trim()).filter(Boolean))];
}

function jsonLdTypes(value: unknown): string[] {
  const types: string[] = [];
  const seen = new Set<string>();
  const stack: unknown[] = [value];
  let visited = 0;
  while (stack.length > 0 && visited < 10_000) {
    const current = stack.pop();
    visited += 1;
    if (Array.isArray(current)) {
      for (const item of current) stack.push(item);
      continue;
    }
    if (typeof current !== "object" || current === null) continue;
    const record = current as Record<string, unknown>;
    const declared = record["@type"];
    const candidates = Array.isArray(declared) ? declared : [declared];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim() !== "" && !seen.has(candidate)) {
        seen.add(candidate);
        types.push(candidate);
      }
    }
    for (const nested of Object.values(record)) stack.push(nested);
  }
  return types;
}

function pushBounded<T>(target: T[], value: T, maximum: number, label: string): void {
  if (target.length >= maximum) throw new Error(`HTML ${label} count exceeds the ${maximum}-item limit.`);
  target.push(value);
}

export function extractHtmlPage(html: string, finalUrl: string): ExtractedHtmlPage {
  let baseUrl: URL;
  try {
    baseUrl = new URL(finalUrl);
  } catch {
    throw new Error("HTML final URL must be an absolute valid URL.");
  }
  if (baseUrl.protocol !== "http:" && baseUrl.protocol !== "https:") {
    throw new Error("HTML final URL must use http or https.");
  }

  const document = parse(html) as unknown as HtmlNode;
  let title: string | undefined;
  let metaDescription: string | undefined;
  let canonicalUrl: string | undefined;
  let lang: string | undefined;
  let viewport: string | undefined;
  const robotsDirectives: string[] = [];
  const headings: ExtractedHtmlPage["headings"] = [];
  const links: ExtractedHtmlPage["links"] = [];
  const images: ExtractedHtmlPage["images"] = [];
  const jsonLd: ExtractedHtmlPage["jsonLd"] = [];
  const visibleText: string[] = [];

  function visit(node: HtmlNode, inBody: boolean, hidden: boolean): void {
    if (node.nodeName === "#text") {
      if (inBody && !hidden && node.value) visibleText.push(node.value);
      return;
    }

    const tag = (node.tagName ?? node.nodeName).toLowerCase();
    const nowInBody = inBody || tag === "body";
    const nowHidden = hidden || HIDDEN_TEXT_ELEMENTS.has(tag);

    if (tag === "html" && lang === undefined) {
      const value = attribute(node, "lang")?.trim();
      if (value) lang = value;
    }

    if (tag === "title" && title === undefined) {
      const value = normalizeText(rawText(node));
      if (value) title = value;
    }

    if (tag === "meta") {
      const name = attribute(node, "name")?.trim().toLowerCase();
      const content = attribute(node, "content")?.trim() ?? "";
      if (name === "description" && metaDescription === undefined && content !== "") metaDescription = content;
      if (name === "viewport" && viewport === undefined && content !== "") viewport = content;
      if (name === "robots" && content !== "") {
        for (const directive of content.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)) {
          if (!robotsDirectives.includes(directive)) robotsDirectives.push(directive);
        }
      }
    }

    if (tag === "link" && canonicalUrl === undefined) {
      const rel = relTokens(attribute(node, "rel"));
      const href = attribute(node, "href")?.trim();
      if (href && rel.includes("canonical")) canonicalUrl = resolvedReference(href, baseUrl);
    }

    if (/^h[1-6]$/u.test(tag)) {
      const text = normalizeText(rawText(node));
      if (text) {
        pushBounded(headings, { level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6, text }, MAX_HEADINGS, "heading");
      }
    }

    if (tag === "a") {
      const href = attribute(node, "href")?.trim();
      const resolved = href ? safeResolvedWebUrl(href, baseUrl) : undefined;
      if (resolved) {
        pushBounded(
          links,
          { href: resolved, text: normalizeText(rawText(node)), rel: relTokens(attribute(node, "rel")) },
          MAX_LINKS,
          "link",
        );
      }
    }

    if (tag === "img") {
      const src = attribute(node, "src")?.trim();
      const resolved = src ? safeResolvedWebUrl(src, baseUrl) : undefined;
      if (resolved) {
        const alt = attribute(node, "alt");
        pushBounded(images, alt === undefined ? { src: resolved } : { src: resolved, alt }, MAX_IMAGES, "image");
      }
    }

    if (tag === "script" && attribute(node, "type")?.trim().toLowerCase() === "application/ld+json") {
      if (jsonLd.length >= MAX_JSON_LD_BLOCKS) throw new Error(`HTML JSON-LD block count exceeds the ${MAX_JSON_LD_BLOCKS}-item limit.`);
      const source = rawText(node).trim();
      try {
        const parsed = JSON.parse(source) as unknown;
        jsonLd.push({ validJson: true, types: jsonLdTypes(parsed) });
      } catch {
        jsonLd.push({ validJson: false, types: [] });
      }
    }

    for (const child of node.childNodes ?? []) visit(child, nowInBody, nowHidden);
  }

  visit(document, false, false);
  const normalizedText = normalizeText(visibleText.join(" "));
  if (normalizedText.length > MAX_VISIBLE_TEXT) {
    throw new Error(`HTML visible text exceeds the ${MAX_VISIBLE_TEXT}-character limit.`);
  }

  const result: ExtractedHtmlPage = {
    robotsDirectives,
    headings,
    links,
    images,
    jsonLd,
    normalizedText,
  };
  if (title !== undefined) result.title = title;
  if (metaDescription !== undefined) result.metaDescription = metaDescription;
  if (canonicalUrl !== undefined) result.canonicalUrl = canonicalUrl;
  if (lang !== undefined) result.lang = lang;
  if (viewport !== undefined) result.viewport = viewport;
  return result;
}
