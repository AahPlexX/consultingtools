import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { detectArtifactFormat } from "../src/artifacts/format.js";
import { createConsultingPptx } from "../src/presentations/pptx-create.js";
import type { PresentationDeckV1 } from "../src/presentations/types.js";

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
      exhibit: {
        version: 1,
        kind: "bar",
        title: "Regional revenue",
        altText: "Bar chart comparing North and South regional revenue.",
        sourceNote: "Source: verified finance model.",
        categories: ["North", "South"],
        series: [{ name: "Revenue", values: [12, 18] }],
      },
      sourceNote: "Source: verified finance model.",
      speakerNotes: ["Discuss the concentration threshold before recommending action."],
    },
  ],
};

function xml(parts: ReturnType<typeof unzipSync>, name: string): string {
  const bytes = parts[name];
  if (!bytes) throw new Error(`Missing PPTX part ${name}.`);
  return strFromU8(bytes);
}

describe("professional consulting PPTX creation", () => {
  it("creates a macro-free wide presentation with one slide per validated deck slide", async () => {
    const created = await createConsultingPptx(deck);
    expect(detectArtifactFormat(created.bytes)).toMatchObject({ format: "pptx", macroEnabled: false });
    expect(created.metrics).toMatchObject({ slideCount: 4, exhibitCount: 1 });

    const parts = unzipSync(created.bytes);
    const slideNames = Object.keys(parts).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort();
    expect(slideNames).toHaveLength(4);
    for (const required of ["[Content_Types].xml", "ppt/presentation.xml", "ppt/theme/theme1.xml", "docProps/core.xml"]) {
      expect(parts[required], required).toBeDefined();
    }
  });

  it("renders unique slide titles, summary content, source notes, exhibit SVG alt text, and speaker notes", async () => {
    const parts = unzipSync((await createConsultingPptx(deck)).bytes);
    const slideXml = Object.keys(parts)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort()
      .map((name) => xml(parts, name))
      .join("\n");

    for (const text of [
      "Operating Model Review",
      "What changed",
      "Three issues explain most delay",
      "Queue ownership is fragmented.",
      "Clarify ownership before automating the process.",
      "Revenue concentration remains manageable",
      "South is larger but neither region dominates the portfolio.",
      "Source: verified finance model.",
    ]) expect(slideXml).toContain(text);

    expect(slideXml).toContain("Bar chart comparing North and South regional revenue.");
    const svgMedia = Object.keys(parts).filter((name) => /^ppt\/media\/.*\.svg$/i.test(name));
    expect(svgMedia.length).toBeGreaterThan(0);
    expect(svgMedia.some((name) => xml(parts, name).includes('<svg xmlns="http://www.w3.org/2000/svg"'))).toBe(true);

    const notes = Object.keys(parts)
      .filter((name) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name))
      .map((name) => xml(parts, name))
      .join("\n");
    expect(notes).toContain("Discuss the concentration threshold before recommending action.");
  });

  it("uses only embedded presentation assets and rejects unsafe OOXML package structures after generation", async () => {
    const parts = unzipSync((await createConsultingPptx(deck)).bytes);
    const names = Object.keys(parts);
    expect(names.some((name) => /vbaProject\.bin$/i.test(name))).toBe(false);
    expect(names.some((name) => /(^|\/)externalLinks\//i.test(name))).toBe(false);
    expect(names.some((name) => /(^|\/)embeddings\//i.test(name))).toBe(false);

    for (const name of names.filter((entry) => entry.endsWith(".rels"))) {
      const relationships = xml(parts, name);
      expect(relationships, name).not.toMatch(/TargetMode=["']External["']/i);
      expect(relationships, name).not.toMatch(/Target=["']https?:\/\//i);
    }
  });

  it("writes deck metadata without introducing remote template or media references", async () => {
    const parts = unzipSync((await createConsultingPptx(deck)).bytes);
    const core = xml(parts, "docProps/core.xml");
    expect(core).toContain("Operating Model Review");
    expect(core).toContain("Consulting Tools");
  });
});
