import type { ExhibitSpecV1 } from "../visualization/types.js";

export type PresentationSlideV1 =
  | { kind: "title"; title: string; subtitle?: string }
  | { kind: "section"; title: string; subtitle?: string }
  | { kind: "summary"; title: string; bullets: string[]; takeaway?: string; sourceNote?: string }
  | {
      kind: "exhibit";
      title: string;
      takeaway?: string;
      exhibit: ExhibitSpecV1;
      sourceNote?: string;
      speakerNotes?: string[];
    };

export interface PresentationDeckV1 {
  version: 1;
  title: string;
  subtitle?: string;
  preparedFor?: string;
  preparedBy?: string;
  dateLabel?: string;
  confidentiality?: "none" | "confidential";
  accentColorHex?: string;
  slides: PresentationSlideV1[];
}

export interface PresentationMetrics {
  slideCount: number;
  exhibitCount: number;
  totalCharacterCount: number;
}

export const PRESENTATION_LIMITS = {
  maxSlides: 100,
  maxSlideTitleCharacters: 180,
  maxDeckTitleCharacters: 180,
  maxMetadataCharacters: 1_000,
  maxTotalCharacters: 250_000,
  maxBullets: 8,
  maxBulletCharacters: 300,
  maxTakeawayCharacters: 2_000,
  maxSourceCharacters: 2_000,
  maxSpeakerNotesCharacters: 5_000,
  maxSpeakerNoteItems: 50,
} as const;
