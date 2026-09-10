import { createHash } from "node:crypto";
import type { ClaimRecord } from "../epistemics/types.js";
import { normalizePublicWebUrl } from "../web/url-policy.js";

const SHA256_PATTERN = /^[0-9a-f]{64}$/iu;
const MAX_TITLE_CHARACTERS = 10_000;
const MAX_EXCERPT_CHARACTERS = 100_000;

export interface SourceEvidenceInput {
  requestedUrl: string;
  finalUrl: string;
  fetchedAt: string;
  status: number;
  sha256: string;
  title?: string;
  excerpt?: string;
}

export interface SourceEvidenceRecord {
  id: string;
  requestedUrl: string;
  finalUrl: string;
  fetchedAt: string;
  status: number;
  sha256: string;
  title?: string;
  excerpt?: string;
}

export interface ExactQuoteVerification {
  matched: boolean;
  index: number | null;
}

export type ClaimSourceMappingFinding =
  | {
      code: "verified-fact-unknown-source";
      severity: "error";
      claimId: string;
      sourceId: string;
    }
  | {
      code: "duplicate-source-id";
      severity: "error";
      sourceId: string;
    };

function validatedTimestamp(value: string): string {
  if (value.trim() === "" || !Number.isFinite(Date.parse(value))) {
    throw new Error("Evidence fetchedAt must be a valid date-time string.");
  }
  return value;
}

function validatedStatus(value: number): number {
  if (!Number.isInteger(value) || value < 100 || value > 599) {
    throw new Error("Evidence status must be an integer HTTP status between 100 and 599.");
  }
  return value;
}

function validatedSha256(value: string): string {
  if (!SHA256_PATTERN.test(value)) throw new Error("Evidence sha256 must be exactly 64 hexadecimal characters.");
  return value.toLowerCase();
}

function optionalBoundedText(value: string | undefined, maximum: number, label: string): string | undefined {
  if (value === undefined) return undefined;
  if (value.length > maximum) throw new Error(`${label} exceeds the ${maximum}-character limit.`);
  return value;
}

function evidenceId(finalUrl: string, sha256: string): string {
  return `source_${createHash("sha256").update(`${finalUrl}\n${sha256}`, "utf8").digest("hex")}`;
}

export function createSourceEvidenceRecord(input: SourceEvidenceInput): SourceEvidenceRecord {
  const requestedUrl = normalizePublicWebUrl(input.requestedUrl).href;
  const finalUrl = normalizePublicWebUrl(input.finalUrl).href;
  const fetchedAt = validatedTimestamp(input.fetchedAt);
  const status = validatedStatus(input.status);
  const sha256 = validatedSha256(input.sha256);
  const title = optionalBoundedText(input.title, MAX_TITLE_CHARACTERS, "Evidence title");
  const excerpt = optionalBoundedText(input.excerpt, MAX_EXCERPT_CHARACTERS, "Evidence excerpt");

  const record: SourceEvidenceRecord = {
    id: evidenceId(finalUrl, sha256),
    requestedUrl,
    finalUrl,
    fetchedAt,
    status,
    sha256,
  };
  if (title !== undefined) record.title = title;
  if (excerpt !== undefined) record.excerpt = excerpt;
  return record;
}

function normalizeExactQuoteText(value: string): string {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

export function verifyExactQuote(quote: string, normalizedText: string): ExactQuoteVerification {
  const expected = normalizeExactQuoteText(quote);
  if (expected === "") throw new Error("Exact quote must not be blank.");
  const source = normalizeExactQuoteText(normalizedText);
  const index = source.indexOf(expected);
  return index < 0 ? { matched: false, index: null } : { matched: true, index };
}

export function validateClaimSourceMappings(
  claims: readonly ClaimRecord[],
  sources: readonly SourceEvidenceRecord[],
): ClaimSourceMappingFinding[] {
  const findings: ClaimSourceMappingFinding[] = [];
  const knownSourceIds = new Set<string>();
  const duplicateSourceIds = new Set<string>();

  for (const source of sources) {
    if (knownSourceIds.has(source.id)) {
      if (!duplicateSourceIds.has(source.id)) {
        duplicateSourceIds.add(source.id);
        findings.push({ code: "duplicate-source-id", severity: "error", sourceId: source.id });
      }
      continue;
    }
    knownSourceIds.add(source.id);
  }

  for (const claim of claims) {
    if (claim.classification !== "verified-external-fact") continue;
    const reported = new Set<string>();
    for (const sourceId of claim.sourceIds ?? []) {
      if (!knownSourceIds.has(sourceId) && !reported.has(sourceId)) {
        reported.add(sourceId);
        findings.push({
          code: "verified-fact-unknown-source",
          severity: "error",
          claimId: claim.id,
          sourceId,
        });
      }
    }
  }

  return findings;
}
