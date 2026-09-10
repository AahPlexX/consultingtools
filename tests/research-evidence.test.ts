import { describe, expect, it } from "vitest";
import type { ClaimRecord } from "../src/epistemics/types.js";
import {
  createSourceEvidenceRecord,
  validateClaimSourceMappings,
  verifyExactQuote,
} from "../src/research/evidence.js";

const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);

describe("source evidence records", () => {
  it("derives deterministic identity from normalized final URL plus content hash, not retrieval time", () => {
    const first = createSourceEvidenceRecord({
      requestedUrl: "https://example.com/report#section",
      finalUrl: "https://EXAMPLE.com:443/report#top",
      fetchedAt: "2026-09-09T20:00:00.000Z",
      status: 200,
      sha256: SHA_A,
      title: "Annual Report",
      excerpt: "Operating income increased.",
    });
    const repeated = createSourceEvidenceRecord({
      requestedUrl: "https://example.com/report",
      finalUrl: "https://example.com/report",
      fetchedAt: "2026-09-09T21:00:00.000Z",
      status: 200,
      sha256: SHA_A,
    });
    const changed = createSourceEvidenceRecord({
      requestedUrl: "https://example.com/report",
      finalUrl: "https://example.com/report",
      fetchedAt: "2026-09-09T21:00:00.000Z",
      status: 200,
      sha256: SHA_B,
    });

    expect(first.finalUrl).toBe("https://example.com/report");
    expect(first.requestedUrl).toBe("https://example.com/report");
    expect(first.fetchedAt).toBe("2026-09-09T20:00:00.000Z");
    expect(first.id).toMatch(/^source_[0-9a-f]{64}$/);
    expect(repeated.id).toBe(first.id);
    expect(changed.id).not.toBe(first.id);
  });

  it.each([
    ["invalid retrieval time", { fetchedAt: "yesterday" }],
    ["invalid status", { status: 99 }],
    ["invalid sha", { sha256: "not-a-sha" }],
    ["non-web requested URL", { requestedUrl: "file:///tmp/report" }],
    ["non-web final URL", { finalUrl: "ftp://example.com/report" }],
  ])("rejects %s", (_label, override) => {
    expect(() => createSourceEvidenceRecord({
      requestedUrl: "https://example.com/report",
      finalUrl: "https://example.com/report",
      fetchedAt: "2026-09-09T20:00:00.000Z",
      status: 200,
      sha256: SHA_A,
      ...override,
    })).toThrow();
  });
});

describe("exact quote verification", () => {
  it("matches after Unicode NFC and whitespace normalization only", () => {
    const decomposedCafe = "Cafe\u0301";
    const text = `Summary\n\n${decomposedCafe}\toperating income increased by 12%.`;
    const result = verifyExactQuote("Café operating income increased by 12%.", text);
    expect(result.matched).toBe(true);
    expect(result.index).toBe("Summary ".length);
  });

  it("is case-sensitive and never performs fuzzy quote invention", () => {
    expect(verifyExactQuote("Operating Income", "Operating income increased.")).toEqual({ matched: false, index: null });
    expect(verifyExactQuote("income increased 12%", "income increased by 12%"))
      .toEqual({ matched: false, index: null });
  });

  it("rejects blank quotes instead of treating them as universal matches", () => {
    expect(() => verifyExactQuote("  \n\t ", "Some text")).toThrow(/quote|blank/i);
  });
});

describe("claim-source mapping validation", () => {
  const source = createSourceEvidenceRecord({
    requestedUrl: "https://example.com/report",
    finalUrl: "https://example.com/report",
    fetchedAt: "2026-09-09T20:00:00.000Z",
    status: 200,
    sha256: SHA_A,
  });

  it("allows verified external facts to reference known evidence records", () => {
    const claims: ClaimRecord[] = [{
      id: "claim-1",
      text: "Operating income increased.",
      classification: "verified-external-fact",
      sourceIds: [source.id],
    }];
    expect(validateClaimSourceMappings(claims, [source])).toEqual([]);
  });

  it("reports every unknown source referenced by a verified external fact", () => {
    const claims: ClaimRecord[] = [{
      id: "claim-1",
      text: "Operating income increased.",
      classification: "verified-external-fact",
      sourceIds: [source.id, "source_missing"],
    }];
    expect(validateClaimSourceMappings(claims, [source])).toEqual([{
      code: "verified-fact-unknown-source",
      severity: "error",
      claimId: "claim-1",
      sourceId: "source_missing",
    }]);
  });

  it("reports duplicate evidence IDs independently of claim classification", () => {
    expect(validateClaimSourceMappings([], [source, { ...source }])).toEqual([{
      code: "duplicate-source-id",
      severity: "error",
      sourceId: source.id,
    }]);
  });

  it("does not require non-external epistemic classes to cite external evidence", () => {
    const claims: ClaimRecord[] = [{
      id: "rec-1",
      text: "Pilot the change before rollout.",
      classification: "recommendation",
      sourceIds: ["source_not_required_for_recommendation"],
    }];
    expect(validateClaimSourceMappings(claims, [source])).toEqual([]);
  });
});
