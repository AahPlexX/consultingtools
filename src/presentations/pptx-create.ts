import { strFromU8, unzipSync } from "fflate";
import PptxGenJSModule from "pptxgenjs";
import { detectArtifactFormat } from "../artifacts/format.js";
import { contrastRatio } from "../visualization/accessibility.js";
import { renderExhibitSvg } from "../visualization/render-exhibit.js";
import type { PresentationDeckV1, PresentationMetrics, PresentationSlideV1 } from "./types.js";
import { validatePresentationDeck } from "./validate.js";

export interface CreatedPptxReport {
  bytes: Buffer;
  metrics: PresentationMetrics;
}

interface PptxSlideAdapter {
  background: { color: string };
  addText(text: string, options: Record<string, unknown>): void;
  addShape(shape: string, options: Record<string, unknown>): void;
  addImage(options: Record<string, unknown>): void;
  addNotes(notes: string): void;
}

interface PptxPresentationAdapter {
  layout: string;
  author: string;
  company: string;
  subject: string;
  title: string;
  lang: string;
  addSlide(): PptxSlideAdapter;
  write(options: Record<string, unknown>): Promise<unknown>;
}

type PptxConstructor = new () => PptxPresentationAdapter;

// PptxGenJS 4.0.1 exposes a default constructor at runtime, but its UMD-style
// declaration is interpreted as a module namespace by TypeScript NodeNext.
// Keep that compatibility cast isolated here; generated OOXML remains subject
// to the package/security assertions below and independent CI rendering gates.
const PptxGenJS = PptxGenJSModule as unknown as PptxConstructor;

const DEFAULT_ACCENT = "1F4E79";
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const TEXT = "222222";
const MUTED = "666666";
const LIGHT = "F3F6FA";
const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

function svgData(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function addTitle(slide: PptxSlideAdapter, title: string, accent: string): void {
  slide.addText(title, {
    x: 0.65,
    y: 0.35,
    w: 12.05,
    h: 0.55,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: TEXT,
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });
  slide.addShape("line", { x: 0.65, y: 1.02, w: 12.05, h: 0, line: { color: accent, width: 1.6 } });
}

function addSource(slide: PptxSlideAdapter, sourceNote: string | undefined): void {
  if (!sourceNote) return;
  slide.addText(sourceNote, {
    x: 0.7,
    y: 7.02,
    w: 11.9,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 8.5,
    color: MUTED,
    margin: 0,
    fit: "shrink",
  });
}

function renderTitleSlide(pptx: PptxPresentationAdapter, slideSpec: Extract<PresentationSlideV1, { kind: "title" }>, deck: PresentationDeckV1, accent: string): void {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.addShape("rect", { x: 0, y: 0, w: 0.22, h: SLIDE_H, line: { color: accent, transparency: 100 }, fill: { color: accent } });
  slide.addText(slideSpec.title, {
    x: 0.85,
    y: 2.15,
    w: 11.4,
    h: 0.85,
    fontFace: "Aptos Display",
    fontSize: 32,
    bold: true,
    color: TEXT,
    margin: 0,
    fit: "shrink",
  });
  if (slideSpec.subtitle) {
    slide.addText(slideSpec.subtitle, { x: 0.88, y: 3.15, w: 10.8, h: 0.52, fontFace: "Aptos", fontSize: 20, color: MUTED, margin: 0, fit: "shrink" });
  }
  const metadata = [deck.preparedFor ? `Prepared for: ${deck.preparedFor}` : undefined, deck.preparedBy ? `Prepared by: ${deck.preparedBy}` : undefined, deck.dateLabel]
    .filter((value): value is string => value !== undefined)
    .join("  ·  ");
  if (metadata) slide.addText(metadata, { x: 0.88, y: 5.75, w: 11.4, h: 0.35, fontFace: "Aptos", fontSize: 11, color: MUTED, margin: 0, fit: "shrink" });
  if (deck.confidentiality === "confidential") {
    slide.addText("CONFIDENTIAL", { x: 0.88, y: 6.3, w: 2.2, h: 0.25, fontFace: "Aptos", fontSize: 9, bold: true, color: MUTED, margin: 0 });
  }
}

function renderSectionSlide(pptx: PptxPresentationAdapter, slideSpec: Extract<PresentationSlideV1, { kind: "section" }>, accent: string): void {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.addShape("rect", { x: 0.75, y: 1.65, w: 0.16, h: 3.7, line: { color: accent, transparency: 100 }, fill: { color: accent } });
  slide.addText(slideSpec.title, { x: 1.25, y: 2.45, w: 10.8, h: 0.9, fontFace: "Aptos Display", fontSize: 31, bold: true, color: TEXT, margin: 0, fit: "shrink" });
  if (slideSpec.subtitle) slide.addText(slideSpec.subtitle, { x: 1.27, y: 3.55, w: 10, h: 0.55, fontFace: "Aptos", fontSize: 19, color: MUTED, margin: 0, fit: "shrink" });
}

function renderSummarySlide(pptx: PptxPresentationAdapter, slideSpec: Extract<PresentationSlideV1, { kind: "summary" }>, accent: string): void {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, slideSpec.title, accent);
  let y = 1.35;
  for (const bullet of slideSpec.bullets) {
    slide.addText(`• ${bullet}`, {
      x: 0.85,
      y,
      w: 11.55,
      h: 0.52,
      fontFace: "Aptos",
      fontSize: 18,
      color: TEXT,
      margin: 0.02,
      breakLine: false,
      fit: "shrink",
    });
    y += 0.62;
  }
  if (slideSpec.takeaway) {
    slide.addShape("rect", { x: 0.8, y: 5.8, w: 11.75, h: 0.72, line: { color: "DCE6F1", width: 1 }, fill: { color: LIGHT } });
    slide.addText(slideSpec.takeaway, { x: 1.0, y: 5.98, w: 11.3, h: 0.36, fontFace: "Aptos", fontSize: 14, bold: true, color: accent, margin: 0, fit: "shrink" });
  }
  addSource(slide, slideSpec.sourceNote);
}

function renderExhibitSlide(pptx: PptxPresentationAdapter, slideSpec: Extract<PresentationSlideV1, { kind: "exhibit" }>, accent: string): void {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, slideSpec.title, accent);
  const rendered = renderExhibitSvg({ ...slideSpec.exhibit, accentColorHex: slideSpec.exhibit.accentColorHex ?? accent });
  slide.addImage({
    data: svgData(rendered.svg),
    x: 0.75,
    y: 1.15,
    w: 11.85,
    h: 5.38,
    altText: slideSpec.exhibit.altText,
  });
  if (slideSpec.takeaway) {
    slide.addText(slideSpec.takeaway, { x: 0.95, y: 6.55, w: 11.45, h: 0.32, fontFace: "Aptos", fontSize: 11.5, bold: true, color: accent, margin: 0, fit: "shrink" });
  }
  addSource(slide, slideSpec.sourceNote ?? slideSpec.exhibit.sourceNote);
  if (slideSpec.speakerNotes && slideSpec.speakerNotes.length > 0) slide.addNotes(slideSpec.speakerNotes.join("\n"));
}

function assertGeneratedPptx(bytes: Buffer, expectedSlideCount: number): void {
  const detected = detectArtifactFormat(bytes);
  if (detected.format !== "pptx" || detected.macroEnabled || detected.detectedMimeType !== PPTX_MIME) {
    throw new Error("Generated presentation did not classify as a macro-free PPTX artifact.");
  }

  const parts = unzipSync(bytes);
  const names = Object.keys(parts);
  const required = ["[Content_Types].xml", "ppt/presentation.xml", "ppt/theme/theme1.xml", "docProps/core.xml"];
  for (const name of required) if (!parts[name]) throw new Error(`Generated PPTX is missing required package part ${name}.`);
  const slideCount = names.filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).length;
  if (slideCount !== expectedSlideCount) {
    throw new Error(`Generated PPTX contains ${slideCount} slides; expected ${expectedSlideCount}.`);
  }
  const prohibitedParts = names.filter((name) =>
    /vbaProject\.bin$|(^|\/)externalLinks\/|(^|\/)embeddings\/[^/]+/i.test(name),
  );
  if (prohibitedParts.length > 0) {
    throw new Error(`Generated PPTX contains prohibited package part(s): ${prohibitedParts.join(", ")}.`);
  }
  for (const name of names.filter((entry) => entry.endsWith(".rels"))) {
    const text = strFromU8(parts[name]!);
    if (/TargetMode=["']External["']/i.test(text) || /Target=["']https?:\/\//i.test(text)) {
      throw new Error(`Generated PPTX relationship ${name} contains a prohibited external target.`);
    }
  }
}

export async function createConsultingPptx(deck: PresentationDeckV1): Promise<CreatedPptxReport> {
  const metrics = validatePresentationDeck(deck);
  const accent = (deck.accentColorHex ?? DEFAULT_ACCENT).toUpperCase();
  if (contrastRatio(accent, "FFFFFF") < 3) {
    throw new Error("Presentation accent color must have at least 3:1 contrast against white for essential graphics.");
  }

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = deck.preparedBy ?? "Consulting Tools";
  pptx.company = "Consulting Tools";
  pptx.subject = deck.subtitle ?? "Professional consulting presentation";
  pptx.title = deck.title;
  pptx.lang = "en-US";

  for (const slide of deck.slides) {
    switch (slide.kind) {
      case "title": renderTitleSlide(pptx, slide, deck, accent); break;
      case "section": renderSectionSlide(pptx, slide, accent); break;
      case "summary": renderSummarySlide(pptx, slide, accent); break;
      case "exhibit": renderExhibitSlide(pptx, slide, accent); break;
    }
  }

  const output = await pptx.write({ outputType: "nodebuffer", compression: true });
  const bytes = Buffer.isBuffer(output) ? Buffer.from(output) : Buffer.from(output as ArrayBuffer);
  assertGeneratedPptx(bytes, metrics.slideCount);
  return { bytes, metrics };
}
