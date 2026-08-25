import type { ExhibitSpecV1 } from "../visualization/types.js";
import { validateExhibit } from "../visualization/validate.js";
import {
  PRESENTATION_LIMITS,
  type PresentationDeckV1,
  type PresentationMetrics,
} from "./types.js";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(value: UnknownRecord, allowed: readonly string[], label: string): void {
  const allowedSet = new Set(allowed);
  const extras = Object.keys(value).filter((key) => !allowedSet.has(key));
  if (extras.length > 0) throw new Error(`${label} contains unsupported field(s): ${extras.join(", ")}.`);
}

interface CharacterCounter {
  total: number;
}

function addCharacters(counter: CharacterCounter, value: string): void {
  counter.total += value.length;
  if (counter.total > PRESENTATION_LIMITS.maxTotalCharacters) {
    throw new Error(`Presentation aggregate text exceeds the ${PRESENTATION_LIMITS.maxTotalCharacters}-character limit.`);
  }
}

function requiredText(counter: CharacterCounter, value: unknown, label: string, maximum: number): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} must be non-empty text.`);
  if (value.length > maximum) throw new Error(`${label} exceeds the ${maximum}-character limit.`);
  addCharacters(counter, value);
  return value;
}

function optionalText(counter: CharacterCounter, value: unknown, label: string, maximum: number): void {
  if (value !== undefined) requiredText(counter, value, label, maximum);
}

function countValidatedExhibitStrings(counter: CharacterCounter, value: unknown): void {
  if (typeof value === "string") {
    addCharacters(counter, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => countValidatedExhibitStrings(counter, entry));
    return;
  }
  if (isRecord(value)) {
    Object.values(value).forEach((entry) => countValidatedExhibitStrings(counter, entry));
  }
}

function validateSpeakerNotes(counter: CharacterCounter, value: unknown, slideIndex: number): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) throw new Error(`Slide ${slideIndex + 1} speaker notes must be an array.`);
  if (value.length > PRESENTATION_LIMITS.maxSpeakerNoteItems) {
    throw new Error(`Slide ${slideIndex + 1} speaker notes exceed the ${PRESENTATION_LIMITS.maxSpeakerNoteItems}-item limit.`);
  }
  let slideNotesCharacters = 0;
  value.forEach((note, noteIndex) => {
    if (typeof note !== "string" || note.trim().length === 0) {
      throw new Error(`Slide ${slideIndex + 1} speaker note ${noteIndex + 1} must be non-empty text.`);
    }
    slideNotesCharacters += note.length;
    if (slideNotesCharacters > PRESENTATION_LIMITS.maxSpeakerNotesCharacters) {
      throw new Error(`Slide ${slideIndex + 1} speaker notes exceed the ${PRESENTATION_LIMITS.maxSpeakerNotesCharacters}-character limit.`);
    }
    addCharacters(counter, note);
  });
}

export function validatePresentationDeck(deck: PresentationDeckV1): PresentationMetrics {
  if (!isRecord(deck)) throw new Error("Presentation deck must be an object.");
  assertOnlyKeys(
    deck,
    ["version", "title", "subtitle", "preparedFor", "preparedBy", "dateLabel", "confidentiality", "accentColorHex", "slides"],
    "Presentation deck",
  );
  if (deck.version !== 1) throw new Error("Presentation deck version must be exactly 1.");

  const counter: CharacterCounter = { total: 0 };
  requiredText(counter, deck.title, "Presentation deck title", PRESENTATION_LIMITS.maxDeckTitleCharacters);
  optionalText(counter, deck.subtitle, "Presentation deck subtitle", PRESENTATION_LIMITS.maxMetadataCharacters);
  optionalText(counter, deck.preparedFor, "Presentation prepared-for text", PRESENTATION_LIMITS.maxMetadataCharacters);
  optionalText(counter, deck.preparedBy, "Presentation prepared-by text", PRESENTATION_LIMITS.maxMetadataCharacters);
  optionalText(counter, deck.dateLabel, "Presentation date label", PRESENTATION_LIMITS.maxMetadataCharacters);
  if (deck.confidentiality !== undefined && deck.confidentiality !== "none" && deck.confidentiality !== "confidential") {
    throw new Error("Presentation confidentiality must be none or confidential.");
  }
  if (deck.accentColorHex !== undefined && !/^[0-9A-Fa-f]{6}$/.test(deck.accentColorHex)) {
    throw new Error("Presentation accent color must be exactly six hexadecimal digits without a leading #.");
  }
  if (!Array.isArray(deck.slides)) throw new Error("Presentation slides must be an array.");
  if (deck.slides.length < 1) throw new Error("Presentation must contain at least one slide.");
  if (deck.slides.length > PRESENTATION_LIMITS.maxSlides) {
    throw new Error(`Presentation slide count exceeds the ${PRESENTATION_LIMITS.maxSlides}-slide limit.`);
  }

  const titles = new Set<string>();
  let exhibitCount = 0;
  deck.slides.forEach((slide, slideIndex) => {
    if (!isRecord(slide)) throw new Error(`Slide ${slideIndex + 1} must be an object.`);
    const kind = slide.kind;
    if (kind !== "title" && kind !== "section" && kind !== "summary" && kind !== "exhibit") {
      throw new Error(`Slide ${slideIndex + 1} has an unsupported slide kind.`);
    }

    const title = requiredText(counter, slide.title, `Slide ${slideIndex + 1} title`, PRESENTATION_LIMITS.maxSlideTitleCharacters);
    const normalizedTitle = title.trim().toLocaleLowerCase();
    if (titles.has(normalizedTitle)) throw new Error(`Slide titles must be unique case-insensitively; duplicate title: ${title}.`);
    titles.add(normalizedTitle);

    if (kind === "title" || kind === "section") {
      assertOnlyKeys(slide, ["kind", "title", "subtitle"], `Slide ${slideIndex + 1}`);
      optionalText(counter, slide.subtitle, `Slide ${slideIndex + 1} subtitle`, PRESENTATION_LIMITS.maxMetadataCharacters);
      return;
    }

    if (kind === "summary") {
      assertOnlyKeys(slide, ["kind", "title", "bullets", "takeaway", "sourceNote"], `Slide ${slideIndex + 1}`);
      if (!Array.isArray(slide.bullets)) throw new Error(`Slide ${slideIndex + 1} bullets must be an array.`);
      if (slide.bullets.length < 1 || slide.bullets.length > PRESENTATION_LIMITS.maxBullets) {
        throw new Error(`Slide ${slideIndex + 1} must contain 1-${PRESENTATION_LIMITS.maxBullets} bullets.`);
      }
      slide.bullets.forEach((bullet, bulletIndex) =>
        requiredText(counter, bullet, `Slide ${slideIndex + 1} bullet ${bulletIndex + 1}`, PRESENTATION_LIMITS.maxBulletCharacters),
      );
      optionalText(counter, slide.takeaway, `Slide ${slideIndex + 1} takeaway`, PRESENTATION_LIMITS.maxTakeawayCharacters);
      optionalText(counter, slide.sourceNote, `Slide ${slideIndex + 1} source note`, PRESENTATION_LIMITS.maxSourceCharacters);
      return;
    }

    assertOnlyKeys(slide, ["kind", "title", "takeaway", "exhibit", "sourceNote", "speakerNotes"], `Slide ${slideIndex + 1}`);
    optionalText(counter, slide.takeaway, `Slide ${slideIndex + 1} takeaway`, PRESENTATION_LIMITS.maxTakeawayCharacters);
    optionalText(counter, slide.sourceNote, `Slide ${slideIndex + 1} source note`, PRESENTATION_LIMITS.maxSourceCharacters);
    if (!isRecord(slide.exhibit)) throw new Error(`Slide ${slideIndex + 1} exhibit must be an object.`);
    validateExhibit(slide.exhibit as ExhibitSpecV1);
    countValidatedExhibitStrings(counter, slide.exhibit);
    validateSpeakerNotes(counter, slide.speakerNotes, slideIndex);
    exhibitCount += 1;
  });

  return {
    slideCount: deck.slides.length,
    exhibitCount,
    totalCharacterCount: counter.total,
  };
}
