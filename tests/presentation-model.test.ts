import { describe, expect, it } from "vitest";
import {
  PRESENTATION_LIMITS,
  type PresentationDeckV1,
  type PresentationSlideV1,
} from "../src/presentations/types.js";
import { validatePresentationDeck } from "../src/presentations/validate.js";

const exhibit = {
  version: 1 as const,
  kind: "bar" as const,
  title: "Regional revenue",
  altText: "Bar chart comparing North and South regional revenue.",
  sourceNote: "Source: verified finance model.",
  categories: ["North", "South"],
  series: [{ name: "Revenue", values: [12, 18] }],
};

const deck: PresentationDeckV1 = {
  version: 1,
  title: "Operating Model Review",
  subtitle: "Executive decision brief",
  preparedFor: "Northwind Health",
  preparedBy: "Consulting Tools",
  dateLabel: "August 25, 2026",
  confidentiality: "confidential",
  accentColorHex: "1F4E79",
  slides: [
    { kind: "title", title: "Operating Model Review", subtitle: "Executive decision brief" },
    { kind: "section", title: "What changed", subtitle: "Evidence and implications" },
    {
      kind: "summary",
      title: "Three issues explain most delay",
      bullets: ["Queue ownership is fragmented.", "Handoffs create avoidable wait time."],
      takeaway: "Clarify ownership before automating the process.",
      sourceNote: "Source: client-supplied operating data.",
    },
    {
      kind: "exhibit",
      title: "Revenue concentration remains manageable",
      takeaway: "South is larger but neither region dominates the portfolio.",
      exhibit,
      sourceNote: "Source: verified finance model.",
      speakerNotes: ["Discuss the concentration threshold before recommending action."],
    },
  ],
};

describe("PresentationDeckV1 validation", () => {
  it("accepts a bounded professional deck and reports deterministic metrics", () => {
    const metrics = validatePresentationDeck(deck);
    expect(metrics.slideCount).toBe(4);
    expect(metrics.exhibitCount).toBe(1);
    expect(metrics.totalCharacterCount).toBeGreaterThan(200);
    expect(validatePresentationDeck(deck)).toEqual(metrics);
  });

  it("rejects case-insensitive duplicate slide titles and blank or unsupported slide content", () => {
    expect(() => validatePresentationDeck({
      ...deck,
      slides: [
        { kind: "title", title: "Decision" },
        { kind: "summary", title: "decision", bullets: ["One"] },
      ],
    })).toThrow(/unique/i);

    expect(() => validatePresentationDeck({ ...deck, slides: [{ kind: "summary", title: " ", bullets: ["One"] }] })).toThrow(/title/i);
    expect(() => validatePresentationDeck({ ...deck, slides: [{ kind: "unknown", title: "Unknown" } as never] })).toThrow(/unsupported/i);
    expect(() => validatePresentationDeck({ ...deck, slides: [{ kind: "summary", title: "Empty", bullets: [] }] })).toThrow(/bullet/i);
  });

  it("requires valid accessible exhibits and rejects missing exhibit alt text", () => {
    expect(() => validatePresentationDeck({
      ...deck,
      slides: [{
        kind: "exhibit",
        title: "Inaccessible exhibit",
        exhibit: { ...exhibit, altText: "" },
      }],
    })).toThrow(/alt text/i);
  });

  it("enforces slide bullet source note and speaker-note bounds", () => {
    const tooManySlides: PresentationSlideV1[] = Array.from({ length: PRESENTATION_LIMITS.maxSlides + 1 }, (_, index) => ({
      kind: "section",
      title: `Section ${index}`,
    }));
    expect(() => validatePresentationDeck({ ...deck, slides: tooManySlides })).toThrow(/100/);

    expect(() => validatePresentationDeck({
      ...deck,
      slides: [{ kind: "summary", title: "Too many bullets", bullets: Array.from({ length: 9 }, (_, index) => `Bullet ${index}`) }],
    })).toThrow(/8/);

    expect(() => validatePresentationDeck({
      ...deck,
      slides: [{ kind: "summary", title: "Long bullet", bullets: ["x".repeat(PRESENTATION_LIMITS.maxBulletCharacters + 1)] }],
    })).toThrow(/300/);

    expect(() => validatePresentationDeck({
      ...deck,
      slides: [{ kind: "summary", title: "Long source", bullets: ["One"], sourceNote: "x".repeat(PRESENTATION_LIMITS.maxSourceCharacters + 1) }],
    })).toThrow(/source/i);

    expect(() => validatePresentationDeck({
      ...deck,
      slides: [{ kind: "exhibit", title: "Long notes", exhibit, speakerNotes: ["x".repeat(PRESENTATION_LIMITS.maxSpeakerNotesCharacters + 1)] }],
    })).toThrow(/speaker/i);
  });

  it("enforces the aggregate deck text bound without silently truncating content", () => {
    const slides: PresentationSlideV1[] = Array.from({ length: 100 }, (_, index) => ({
      kind: "summary",
      title: `Summary ${index}`,
      bullets: Array.from({ length: 8 }, () => "x".repeat(300)),
      takeaway: "y".repeat(200),
    }));
    expect(() => validatePresentationDeck({
      version: 1,
      title: "Oversized",
      slides,
    })).toThrow(/250000|250,000|aggregate/i);
  });

  it("rejects unknown deck and slide fields instead of ignoring unsupported presentation features", () => {
    expect(() => validatePresentationDeck({ ...deck, templateUrl: "https://example.test/template.pptx" } as never)).toThrow(/unsupported field/i);
    expect(() => validatePresentationDeck({
      ...deck,
      slides: [{ kind: "title", title: "Title", videoUrl: "https://example.test/video" } as never],
    })).toThrow(/unsupported field/i);
  });
});
