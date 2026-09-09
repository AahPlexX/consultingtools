import { fetchPublicUrl, type PublicFetchOptions } from "./http-fetch.js";
import type { PublicFetchResult } from "./types.js";

export const ROBOTS_MAX_BYTES = 512 * 1024;
export const ROBOTS_PRODUCT_TOKEN = "ConsultingToolsBot";

export interface RobotsRule {
  directive: "allow" | "disallow";
  pattern: string;
}

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

interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
}

type RobotsFetcher = (url: string, options?: PublicFetchOptions) => Promise<PublicFetchResult>;

function normalizeOctets(value: string): string {
  let result = "";
  for (let index = 0; index < value.length;) {
    const character = value[index]!;
    if (character === "%" && /^[0-9a-fA-F]{2}$/.test(value.slice(index + 1, index + 3))) {
      const hex = value.slice(index + 1, index + 3).toUpperCase();
      const byte = Number.parseInt(hex, 16);
      const decoded = String.fromCharCode(byte);
      if (/^[A-Za-z0-9._~-]$/.test(decoded)) result += decoded;
      else result += `%${hex}`;
      index += 3;
      continue;
    }

    const codePoint = value.codePointAt(index)!;
    const token = String.fromCodePoint(codePoint);
    if (codePoint > 0x7f) {
      result += encodeURIComponent(token).replace(/%[0-9a-f]{2}/gi, (encoded) => encoded.toUpperCase());
    } else {
      result += token;
    }
    index += token.length;
  }
  return result;
}

function ruleSpecificity(pattern: string): number {
  const withoutAnchor = pattern.endsWith("$") ? pattern.slice(0, -1) : pattern;
  return Buffer.byteLength(withoutAnchor.replaceAll("*", ""), "utf8");
}

function escapeRegex(value: string): string {
  return value.replace(/[\\^$+?.()|[\]{}]/g, "\\$&");
}

function ruleMatches(pattern: string, target: string): boolean {
  const normalizedPattern = normalizeOctets(pattern);
  const anchored = normalizedPattern.endsWith("$");
  const body = anchored ? normalizedPattern.slice(0, -1) : normalizedPattern;
  const expression = body.split("*").map(escapeRegex).join(".*");
  return new RegExp(`^${expression}${anchored ? "$" : ""}`, "u").test(target);
}

function flushGroup(groups: RobotsGroup[], agents: string[], rules: RobotsRule[]): void {
  if (agents.length === 0) return;
  groups.push({ agents: [...agents], rules: rules.map((rule) => ({ ...rule })) });
}

export function parseRobots(text: string, productToken = ROBOTS_PRODUCT_TOKEN): ParsedRobots {
  if (Buffer.byteLength(text, "utf8") > ROBOTS_MAX_BYTES) {
    throw new Error(`robots.txt exceeds the ${ROBOTS_MAX_BYTES}-byte parser size limit.`);
  }
  const token = productToken.trim();
  if (!/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(token)) {
    throw new Error("Robots product token is invalid.");
  }

  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let agents: string[] = [];
  let rules: RobotsRule[] = [];
  let rulesStarted = false;

  for (const rawLine of text.split(/\r\n|\n|\r/)) {
    const line = rawLine.split("#", 1)[0]!.trim();
    if (line === "") continue;
    const colon = line.indexOf(":");
    if (colon < 1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (field === "user-agent") {
      if (rulesStarted) {
        flushGroup(groups, agents, rules);
        agents = [];
        rules = [];
        rulesStarted = false;
      }
      if (value !== "") agents.push(value.toLowerCase());
      continue;
    }

    if (field === "allow" || field === "disallow") {
      if (agents.length === 0) continue;
      rulesStarted = true;
      if (value === "") continue;
      rules.push({ directive: field, pattern: value });
      continue;
    }

    if (field === "sitemap" && value !== "") {
      if (!sitemaps.includes(value)) sitemaps.push(value);
    }
  }
  flushGroup(groups, agents, rules);

  const normalizedToken = token.toLowerCase();
  const specific = groups.filter((group) => group.agents.includes(normalizedToken));
  const selected = specific.length > 0 ? specific : groups.filter((group) => group.agents.includes("*"));

  return {
    productToken: token,
    rules: selected.flatMap((group) => group.rules.map((rule) => ({ ...rule }))),
    sitemaps: [...sitemaps],
  };
}

export function isRobotsPathAllowed(parsed: ParsedRobots, url: URL): RobotsDecision {
  const target = normalizeOctets(`${url.pathname}${url.search}`);
  let selected: { rule: RobotsRule; specificity: number } | undefined;

  for (const rule of parsed.rules) {
    if (!ruleMatches(rule.pattern, target)) continue;
    const specificity = ruleSpecificity(normalizeOctets(rule.pattern));
    if (
      selected === undefined ||
      specificity > selected.specificity ||
      (specificity === selected.specificity && rule.directive === "allow" && selected.rule.directive === "disallow")
    ) {
      selected = { rule, specificity };
    }
  }

  const base = {
    allowed: selected?.rule.directive !== "disallow",
    robotsUrl: new URL("/robots.txt", url).href,
    state: "rules" as const,
    sitemaps: [...parsed.sitemaps],
  };
  return selected === undefined ? base : { ...base, matchedRule: { ...selected.rule } };
}

export function createRobotsEvaluator(fetcher: RobotsFetcher) {
  return async function evaluate(url: URL): Promise<RobotsDecision> {
    const robotsUrl = new URL("/robots.txt", url).href;
    let result: PublicFetchResult;
    try {
      result = await fetcher(robotsUrl, {
        maxBytes: ROBOTS_MAX_BYTES,
        maxRedirects: 5,
        timeoutMs: 10_000,
      });
    } catch {
      return { allowed: false, robotsUrl, state: "unreachable", sitemaps: [] };
    }

    if (result.status >= 400 && result.status <= 499) {
      return { allowed: true, robotsUrl, state: "unavailable", sitemaps: [] };
    }
    if (result.status < 200 || result.status > 299) {
      return { allowed: false, robotsUrl, state: "unreachable", sitemaps: [] };
    }

    try {
      const parsed = parseRobots(result.body.toString("utf8"));
      const decision = isRobotsPathAllowed(parsed, url);
      return { ...decision, robotsUrl };
    } catch {
      return { allowed: false, robotsUrl, state: "unreachable", sitemaps: [] };
    }
  };
}

const defaultEvaluator = createRobotsEvaluator(fetchPublicUrl);

export async function evaluateRobots(url: URL): Promise<RobotsDecision> {
  return defaultEvaluator(url);
}
