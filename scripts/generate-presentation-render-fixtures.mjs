import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createConsultingPptx } from "../dist/src/presentations/pptx-create.js";
import { renderExhibitSvg } from "../dist/src/visualization/render-exhibit.js";

const outputDirectory = process.argv[2];
if (!outputDirectory) {
  throw new Error("Usage: node scripts/generate-presentation-render-fixtures.mjs <output-dir>");
}

const output = resolve(outputDirectory);
await mkdir(output, { recursive: true });

const exhibits = [
  {
    name: "regional-revenue.svg",
    spec: {
      version: 1,
      kind: "bar",
      title: "Regional revenue",
      altText: "Bar chart comparing North and South regional revenue.",
      sourceNote: "Source: deterministic validation fixture.",
      categories: ["North", "South", "West"],
      series: [{ name: "Revenue", values: [12, 18, 15] }],
    },
  },
  {
    name: "operational-heatmap.svg",
    spec: {
      version: 1,
      kind: "heatmap",
      title: "Operational intensity",
      altText: "Heatmap comparing three teams across three operating dimensions.",
      sourceNote: "Source: deterministic validation fixture.",
      rowLabels: ["Team A", "Team B", "Team C"],
      columnLabels: ["Volume", "Delay", "Quality"],
      values: [[8, 3, 7], [5, 8, 6], [6, 4, 9]],
    },
  },
  {
    name: "implementation-gantt.svg",
    spec: {
      version: 1,
      kind: "gantt",
      title: "Implementation sequence",
      altText: "Gantt exhibit showing discovery, pilot, and rollout task timing.",
      sourceNote: "Source: deterministic validation fixture.",
      tasks: [
        { id: "discover", label: "Discovery", start: 0, end: 3, group: "Design" },
        { id: "pilot", label: "Pilot", start: 3, end: 7, group: "Delivery" },
        { id: "rollout", label: "Rollout", start: 7, end: 12, group: "Delivery" },
      ],
    },
  },
];

const rendered = exhibits.map(({ name, spec }) => ({ name, rendered: renderExhibitSvg(spec) }));
await Promise.all(rendered.map(({ name, rendered: item }) => writeFile(resolve(output, name), item.svg, "utf8")));

const deck = {
  version: 1,
  title: "Consulting Tools Presentation Validation",
  subtitle: "Independent PPTX rendering fixture",
  preparedFor: "Validation environment",
  preparedBy: "Consulting Tools",
  dateLabel: "Deterministic fixture",
  confidentiality: "confidential",
  accentColorHex: "1F4E79",
  slides: [
    { kind: "title", title: "Consulting Tools Presentation Validation", subtitle: "Independent PPTX rendering fixture" },
    {
      kind: "summary",
      title: "The deck must remain readable outside its generating library",
      bullets: [
        "Slide titles remain unique and action-oriented.",
        "Standalone SVG exhibits are reused in the deck.",
        "Source notes and alt text remain part of the governed output.",
      ],
      takeaway: "Independent rendering is a promotion gate, not an optional smoke test.",
      sourceNote: "Source: deterministic repository validation fixture.",
    },
    {
      kind: "exhibit",
      title: "Regional revenue is balanced across the sample portfolio",
      takeaway: "No single sample region represents a majority of the supplied total.",
      exhibit: exhibits[0].spec,
      sourceNote: "Source: deterministic repository validation fixture.",
      speakerNotes: ["Validate that speaker notes do not create external package relationships."],
    },
    { kind: "section", title: "Validation appendix", subtitle: "Last-page rasterization target" },
  ],
};

const pptx = await createConsultingPptx(deck);
await writeFile(resolve(output, "consulting-presentation.pptx"), pptx.bytes);
await writeFile(resolve(output, "presentation-render-manifest.json"), JSON.stringify({
  expectedSlideCount: pptx.metrics.slideCount,
  svgFiles: exhibits.map((entry) => entry.name),
}, null, 2));

console.log(JSON.stringify({
  pptxBytes: pptx.bytes.byteLength,
  slideCount: pptx.metrics.slideCount,
  svgCount: exhibits.length,
}));
