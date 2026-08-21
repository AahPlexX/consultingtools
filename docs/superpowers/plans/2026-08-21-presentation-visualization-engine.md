# Presentation & Visualization Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Each task follows RED → implementation → focused verification → full repository verification. `main` remains the sole authoritative branch by explicit project policy.

**Goal:** Add deterministic, accessible consulting exhibits, bounded Mermaid-source diagrams, and professional PPTX creation without conflating visual generation with arbitrary PowerPoint editing or promoting every visualization capability merely because one generic renderer exists.

**Architecture:** A typed `ExhibitSpecV1` owns analytical intent, validated data, accessibility description, provenance note, and visual semantics. A deterministic exhibit selector recommends a visualization only from an explicit analytical job/data shape; natural-language interpretation remains a Skill/host responsibility. Core exhibit renderers generate self-contained accessible SVG as the durable figure asset. PPTX generation consumes those SVG assets so the same validated visual is used in standalone SVG and presentation output; it does not rely on PptxGenJS native chart objects. A separate closed-world `DiagramSpecV1` generates Mermaid source without accepting arbitrary Mermaid text or executing Mermaid in the runtime. `PresentationDeckV1` owns slide semantics, unique titles, action-oriented headings, reading order, source notes, exhibit alt text, and bounded deck size. PptxGenJS is used only as the OOXML composition layer, with independent package inspection and LibreOffice Impress/Poppler rendering before catalog promotion.

**Tech Stack:** TypeScript 7.0.2, Node 24 CI, Vitest 4.1.10, PptxGenJS 4.0.1, `fflate` 0.8.3, Zod 4.4.3, existing MCP v2 artifact store. No Mermaid runtime dependency in v1. CI-only validators: LibreOffice Impress, Poppler, and librsvg (`rsvg-convert`).

**Spec:** `docs/superpowers/specs/2026-08-18-universal-consulting-capability-engine-design.md`

## Current authoritative basis — 2026-08-21

- PptxGenJS `4.0.1` is the current npm release and latest upstream GitHub release observed in this planning pass. Its documented APIs support PowerPoint text, shapes, SVG images, image/chart alt text, slide masters/placeholders, presentation metadata, and in-memory `nodebuffer` output.
- The PptxGenJS issue tracker has active 2026 compatibility/PowerPoint-repair reports. Therefore PptxGenJS is not treated as self-validating: every representative presentation must pass our independent package and LibreOffice Impress/Poppler gates before the corresponding catalog capability is promoted.
- Microsoft accessibility guidance requires unique slide titles, logical reading order, meaningful alt text for visuals, sufficient contrast, and avoiding color as the sole information channel.
- W3C SVG guidance requires a meaningful accessible name for non-decorative SVG and supports `title`, `desc`, WAI-ARIA roles, and `aria-labelledby`; browser/AT support for SVG descriptive elements alone is inconsistent, so generated SVG uses both descriptive elements and explicit ARIA naming.
- WCAG 2.2 AA uses 4.5:1 minimum text contrast, with 3:1 for large text; essential non-text graphical information also requires sufficient contrast and color may not be the only visual cue.
- Mermaid's current configuration still defaults `securityLevel` to `strict`, while Mermaid itself notes that rendering untrusted diagram text has a meaningful security surface. V1 therefore emits Mermaid source from a structured model and does not execute arbitrary Mermaid source in the plugin runtime.
- LibreOffice supports headless `--convert-to` operation and Impress documents. This enables independent PPTX → PDF validation without a PowerPoint license.

Authoritative references:

- https://www.npmjs.com/package/pptxgenjs
- https://github.com/gitbrent/PptxGenJS/releases
- https://gitbrent.github.io/PptxGenJS/docs/introduction/
- https://gitbrent.github.io/PptxGenJS/docs/api-images/
- https://gitbrent.github.io/PptxGenJS/docs/masters.html
- https://gitbrent.github.io/PptxGenJS/docs/usage-saving/
- https://support.microsoft.com/en-us/accessibility/powerpoint/make-your-powerpoint-presentations-accessible-to-people-with-disabilities
- https://support.microsoft.com/en-US/PowerPoint/make-slides-easier-to-read-by-using-the-reading-order-pane
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/standards-guidelines/act/rules/7d6734/
- https://www.w3.org/TR/SVG/struct.html
- https://mermaid.js.org/config/schema-docs/config.html
- https://mermaid.js.org/config/usage
- https://help.libreoffice.org/latest/en-US/text/shared/guide/start_parameters.html

## Global constraints

- Ordinary use remains open-access: no user API key, OAuth, account linking, or private provider credential.
- Natural-language semantic interpretation stays in the host/Skill layer. Deterministic selection code accepts explicit analytical jobs/data-shape metadata only.
- Do not use 3D charts, decorative chart junk, perspective effects, fake gradients, shadows as data encodings, or pie/doughnut charts as a default comparison mechanism.
- Never invent data, interpolate missing observations, silently normalize units, or choose an axis transformation without explicit input/methodology.
- Do not truncate categories/series/labels silently. Reject bounds violations or return explicit warnings where a fallback is defined.
- Standalone SVG must contain no script, `foreignObject`, hyperlinks, remote resources, event handlers, external stylesheets, or arbitrary embedded markup.
- Color cannot be the sole distinguishing channel for multi-series line charts; line style/marker/direct labeling must provide a second cue.
- Every meaningful SVG requires a non-empty accessible title and description plus explicit ARIA naming.
- Presentation slides require unique, non-empty titles. Exhibit slides require explicit `altText`; the same semantic description is used for the embedded SVG image.
- Presentation content is added in intentional reading order. Decorative shapes must be minimized; information-bearing figures are embedded as one alt-text-bearing SVG image instead of dozens of anonymous PowerPoint shapes.
- PptxGenJS native charts are outside v1. Core exhibits are generated by the repository's own deterministic SVG engine and embedded as SVG images.
- Existing third-party PPTX mutation is outside v1. Broad `pptx-crud` remains `planned` unless a separate preservation/editing envelope is later proven.
- No arbitrary Mermaid input is accepted. Mermaid output is generated only from a structured closed-world diagram model; directives, frontmatter, click actions, raw HTML, links, scripts, and user-controlled Mermaid configuration are impossible through the v1 interface.
- PPTX creation is accepted only after byte classification as macro-free PPTX, package-part checks, slide-count checks, alt-text/title checks, and independent rendering.
- Each task is independently verified before the next task is allowed to inherit its behavior.
- Subproject 8 is not complete until the code/catalog gate, independent SVG/PPTX render gate, documentation-head gate, final closure-record gate, and exhaustive `main`-only branch check all pass on exact SHAs.

## Planned file structure

- `src/visualization/types.ts` — canonical exhibit and diagram types, palette/theme types, bounds.
- `src/visualization/validate.ts` — closed-world exhibit/diagram validation and normalized metrics.
- `src/visualization/selection.ts` — explicit analytical-job/data-shape → recommended exhibit selector.
- `src/visualization/accessibility.ts` — WCAG contrast helpers and accessible-description validation.
- `src/visualization/svg.ts` — shared SVG document/escaping/accessibility helpers.
- `src/visualization/render-exhibit.ts` — deterministic core exhibit SVG renderers.
- `src/visualization/mermaid.ts` — closed-world structured diagram → Mermaid source generator.
- `src/presentations/types.ts` — `PresentationDeckV1`, slide types, deck bounds.
- `src/presentations/validate.ts` — deck/title/source/exhibit/read-order validation.
- `src/presentations/pptx-create.ts` — PptxGenJS composition using repository SVG figures.
- `src/visualization/register-tools.ts` — selector/SVG/Mermaid MCP tools.
- `src/presentations/register-tools.ts` — PPTX creation MCP tool.
- `src/server.ts` — compose visualization/presentation tools.
- `tests/exhibit-model.test.ts`
- `tests/exhibit-selection.test.ts`
- `tests/exhibit-accessibility.test.ts`
- `tests/exhibit-svg.test.ts`
- `tests/mermaid-generation.test.ts`
- `tests/presentation-model.test.ts`
- `tests/pptx-create.test.ts`
- `tests/visualization-tools.test.ts`
- `tests/presentation-tools.test.ts`
- `tests/catalog-status-truth.test.ts`
- `scripts/generate-presentation-render-fixtures.mjs`
- `scripts/verify-presentation-rendering.sh`
- `.github/workflows/ci.yml` — extend independent rendering gate.
- `package.json` — add exact `pptxgenjs` pin only after Task 5 RED contract is established.
- Skills/governance/README/roadmap — closure truth after executable validation only.

---

## Task 1: Canonical Exhibit V1, Accessibility Contract, and Selection Rules

### Interfaces

```ts
export type ExhibitKind =
  | "bar"
  | "line"
  | "scatter"
  | "waterfall"
  | "pareto"
  | "heatmap"
  | "matrix-2x2"
  | "risk-matrix"
  | "gantt"
  | "funnel";

export interface ExhibitBase {
  version: 1;
  kind: ExhibitKind;
  title: string;
  altText: string;
  sourceNote?: string;
  caveat?: string;
  accentColorHex?: string;
}

export type ExhibitSpecV1 =
  | (ExhibitBase & { kind: "bar"; categories: string[]; series: { name: string; values: number[] }[]; orientation?: "vertical" | "horizontal"; stacked?: boolean })
  | (ExhibitBase & { kind: "line"; categories: string[]; series: { name: string; values: number[] }[] })
  | (ExhibitBase & { kind: "scatter"; xLabel: string; yLabel: string; series: { name: string; points: { x: number; y: number; label?: string }[] }[] })
  | (ExhibitBase & { kind: "waterfall"; steps: { label: string; value: number; role?: "change" | "subtotal" | "total" }[] })
  | (ExhibitBase & { kind: "pareto"; categories: string[]; values: number[] })
  | (ExhibitBase & { kind: "heatmap"; rowLabels: string[]; columnLabels: string[]; values: number[][] })
  | (ExhibitBase & { kind: "matrix-2x2"; xAxis: { label: string; low: string; high: string }; yAxis: { label: string; low: string; high: string }; points: { label: string; x: number; y: number }[] })
  | (ExhibitBase & { kind: "risk-matrix"; points: { label: string; likelihood: 1 | 2 | 3 | 4 | 5; impact: 1 | 2 | 3 | 4 | 5 }[] })
  | (ExhibitBase & { kind: "gantt"; tasks: { id: string; label: string; start: number; end: number; group?: string }[] })
  | (ExhibitBase & { kind: "funnel"; stages: { label: string; value: number }[] });

export interface ExhibitMetrics {
  dataPointCount: number;
  seriesCount: number;
  categoryCount: number;
}

export function validateExhibit(spec: ExhibitSpecV1): ExhibitMetrics;

export type AnalyticalExhibitJob =
  | "category-comparison"
  | "time-trend"
  | "relationship"
  | "bridge"
  | "contributor-priority"
  | "two-dimensional-intensity"
  | "portfolio-positioning"
  | "risk-prioritization"
  | "schedule"
  | "stage-conversion";

export function recommendExhibit(input: {
  job: AnalyticalExhibitJob;
  categoryCount?: number;
  seriesCount?: number;
  hasNegativeValues?: boolean;
}): { kind: ExhibitKind; rationale: string; warnings: string[] };

export function contrastRatio(foregroundHex: string, backgroundHex: string): number;
export function validateExhibitAccessibility(spec: ExhibitSpecV1): { findings: string[] };
```

### Bounds

- title: 1–180 characters;
- alt text: 1–800 characters;
- source/caveat: ≤2,000 each;
- ≤100 categories per ordinary categorical exhibit;
- ≤12 series;
- ≤5,000 total data points;
- heatmap ≤50×50;
- matrix/risk ≤250 points;
- Gantt ≤250 tasks;
- funnel ≤30 stages;
- every numeric value must be finite;
- Gantt `end >= start` and IDs unique;
- category/series lengths must match exactly;
- empty labels rejected;
- no silently sorted/reordered input except Pareto, whose output ordering is definitionally descending and must report the ordering in metadata/tests.

### TDD sequence

- [ ] Write `tests/exhibit-model.test.ts` first with valid fixtures for all ten types plus malformed shape, duplicate IDs, non-finite values, ragged heatmap, mismatched series/category lengths, excessive data, and invalid Gantt intervals.
- [ ] Write `tests/exhibit-selection.test.ts` first. Require explicit deterministic mappings: comparison→bar, time→line, relationship→scatter, bridge→waterfall, contributor-priority→pareto, 2D intensity→heatmap, portfolio-positioning→matrix-2x2, risk→risk-matrix, schedule→gantt, stage-conversion→funnel. Test warnings for excessive categories/series rather than silent chart substitution.
- [ ] Write `tests/exhibit-accessibility.test.ts` first. Verify WCAG luminance/contrast fixtures, non-empty alt text, no color-only line-series contract, and palette/text contrast thresholds.
- [ ] Confirm RED before production files exist.
- [ ] Implement type/validation/selection/accessibility modules without rendering dependencies.
- [ ] Run focused tests and full `npm run verify`; record exact GREEN SHA/run before Task 2.

---

## Task 2: Accessible Durable SVG Exhibit Renderer

### Interface

```ts
export interface RenderedExhibitSvg {
  svg: string;
  width: 1200;
  height: 675;
  metrics: ExhibitMetrics;
}

export function renderExhibitSvg(spec: ExhibitSpecV1): RenderedExhibitSvg;
```

### Rendering contract

- fixed 16:9 1200×675 viewBox;
- white/default background with accessible neutral theme;
- explicit axes/baselines where analytically meaningful;
- direct labels or legend names with stable ordering;
- multi-series line charts use both color and line/marker differences;
- bar labels use a zero baseline unless a mathematically explicit exception is introduced later;
- line/scatter axes may choose a bounded data-domain margin but cannot log-transform or truncate without an explicit future spec;
- waterfall maintains running total and explicitly styles totals/subtotals;
- Pareto sorts descending and renders cumulative-percentage line on a 0–100% secondary semantic scale;
- heatmap/risk matrix include text/position cues; color is supplemental rather than sole meaning;
- Gantt uses supplied numeric start/end positions only; it does not infer dependencies/calendars;
- SVG contains `<title>` + `<desc>`, `role="img"`, `aria-labelledby`, and deterministic IDs;
- no scripts, `foreignObject`, links, event handlers, external resource URLs, `style` imports, or raw markup injection;
- all user strings XML-escaped.

### TDD sequence

- [ ] Write `tests/exhibit-svg.test.ts` first with one representative fixture per exhibit type.
- [ ] Assert valid SVG namespace/viewBox, explicit accessible name/description, escaped adversarial labels, required chart marks, deterministic output, and absence of active/external constructs.
- [ ] Add semantic assertions: bar baseline, stacked totals, line markers/dash differences, waterfall running totals, Pareto order/cumulative line, heatmap dimensions, matrix/risk point placement, Gantt spans, funnel monotonic stage layout.
- [ ] Confirm RED.
- [ ] Implement shared escaping/layout helpers and renderer.
- [ ] Add `rsvg-convert` independent SVG fixture validation only in Task 7; Task 2 closes on structural/unit/full-repo verification.
- [ ] Run focused + full verification; record GREEN SHA/run before Task 3.

---

## Task 3: Closed-World Mermaid Source Generation

### Interface

```ts
export type DiagramSpecV1 =
  | { version: 1; kind: "process"; direction?: "LR" | "TB"; title: string; nodes: DiagramNode[]; edges: DiagramEdge[] }
  | { version: 1; kind: "dependency"; direction?: "LR" | "TB"; title: string; nodes: DiagramNode[]; edges: DiagramEdge[] }
  | { version: 1; kind: "decision-tree"; direction?: "LR" | "TB"; title: string; nodes: DiagramNode[]; edges: DiagramEdge[] };

export interface DiagramNode { id: string; label: string; role?: "start" | "step" | "decision" | "outcome" | "milestone" }
export interface DiagramEdge { from: string; to: string; label?: string }

export function generateMermaidSource(spec: DiagramSpecV1): string;
```

### Security/behavior contract

- no raw Mermaid source input;
- generated internal node identifiers are deterministic and do not reuse user IDs directly as Mermaid syntax;
- labels are encoded so `<`, `>`, `&`, quotes, brackets, braces, pipes, backticks, newlines, and Mermaid delimiter characters cannot escape the label context;
- reject unknown node references, duplicate IDs, self-loop where the selected diagram contract prohibits it, >250 nodes, >500 edges, blank title/labels;
- generated source contains no `%%{`, YAML frontmatter, `click`, hyperlink, `javascript:`, HTML tag, raw style/class directive, or user-controlled configuration;
- v1 output is `.mmd`/plain text only. Do not install or execute Mermaid merely to claim source generation.

### TDD sequence

- [ ] Write `tests/mermaid-generation.test.ts` first with process/dependency/decision fixtures plus adversarial labels/config-like strings.
- [ ] Confirm RED.
- [ ] Implement validator/generator and deterministic source snapshots.
- [ ] Full verification; record GREEN SHA/run before Task 4.

---

## Task 4: Canonical Presentation Deck V1 Model

### Interfaces

```ts
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

export type PresentationSlideV1 =
  | { kind: "title"; title: string; subtitle?: string }
  | { kind: "section"; title: string; subtitle?: string }
  | { kind: "summary"; title: string; bullets: string[]; takeaway?: string; sourceNote?: string }
  | { kind: "exhibit"; title: string; takeaway?: string; exhibit: ExhibitSpecV1; sourceNote?: string; speakerNotes?: string[] };

export interface PresentationMetrics {
  slideCount: number;
  exhibitCount: number;
  totalCharacterCount: number;
}

export function validatePresentationDeck(deck: PresentationDeckV1): PresentationMetrics;
```

### Bounds/quality contract

- 1–100 slides;
- every slide title non-empty, ≤180 chars, and unique case-insensitively;
- deck text aggregate ≤250,000 chars;
- summary ≤8 bullets; each ≤300 chars;
- speaker notes ≤5,000 chars/slide;
- exhibit alt text required by Exhibit V1;
- source note ≤2,000 chars;
- 16:9 only in v1;
- no arbitrary HTML, remote images, videos, embedded files, hyperlinks, macros, animations, or custom template ingestion;
- slide narrative order is title → takeaway/body → exhibit → source/caveat; renderer must add objects in the same semantic order where practical;
- primary slide text default ≥18pt; source/caveat text may be smaller but must preserve high contrast and readability;
- slide title must be represented through a title placeholder if PptxGenJS can generate it without failing package/render gates. If that path proves unreliable, the capability may remain partial and documentation must state the semantic-title limitation rather than hiding it.

### TDD sequence

- [ ] Write `tests/presentation-model.test.ts` first, including duplicate-title rejection, missing exhibit alt text, slide/text/bullet/note bounds, and supported slide kinds.
- [ ] Confirm RED.
- [ ] Implement deck types/validator only; no PptxGenJS yet.
- [ ] Full verification; record GREEN SHA/run before Task 5.

---

## Task 5: Professional PPTX Creation Engine

### Dependency gate

Only after Task 4 is green:

- add exact runtime pin `"pptxgenjs": "4.0.1"` to `package.json`;
- do not add a Mermaid runtime dependency;
- preserve current exact dependency pins.

### Interface

```ts
export interface CreatedPresentation {
  bytes: Buffer;
  slideCount: number;
  metrics: PresentationMetrics;
}

export async function createConsultingPptx(deck: PresentationDeckV1): Promise<CreatedPresentation>;
```

### PPTX contract

- PptxGenJS `LAYOUT_WIDE` only;
- professional neutral consulting theme with user accent override after contrast validation;
- title/section/summary/exhibit layouts generated from the bounded deck model;
- unique titles visible on every non-title slide;
- test a minimal title placeholder/master path and use it only if package/render validation remains clean;
- exhibit visuals use repository-generated SVG data with PptxGenJS `addImage` and non-empty `altText`; do not use native chart objects in v1;
- source notes rendered visibly and optionally repeated in speaker notes when supplied;
- no remote paths/URLs; SVG is in-memory data only;
- presentation metadata sets title, author/preparedBy when supplied, subject, company only when explicitly provided later; no fabricated client metadata;
- `write({ outputType: "nodebuffer", compression: true })` for in-memory bytes;
- classify bytes as macro-free PPTX and inspect required OOXML parts;
- reject `vbaProject.bin`, externalLinks, embeddings, remote media relationships, unexpected macro content types, and slide-count mismatch;
- inspect slide XML for title text and image alt descriptions; do not claim Microsoft Accessibility Checker parity unless later independently tested in Microsoft PowerPoint.

### TDD sequence

- [ ] Write `tests/pptx-create.test.ts` first before dependency/code changes. Require macro-free PPTX classification, expected slide count, presentation/slide/layout/theme/media parts, metadata, unique slide title text, embedded SVG image relationships, image alt text, source text, and no active/external parts.
- [ ] Confirm RED because PptxGenJS/renderer is absent.
- [ ] Pin PptxGenJS 4.0.1 and implement renderer.
- [ ] If slide-master/title-placeholder generation causes package or renderer failure, simplify without weakening tests unrelated to semantics; if semantic title placeholder cannot be safely produced, keep the limitation explicit and do not fabricate compliance.
- [ ] Reopen/inspect package after generation.
- [ ] Run focused + full verification; record GREEN SHA/run before Task 6.

---

## Task 6: MCP Visualization and Presentation Tools

### Tools

1. `recommend_consulting_exhibit`
   - read-only, closed-world, non-destructive;
   - input is explicit analytical job/data-shape metadata;
   - output recommended kind, rationale, warnings.

2. `create_consulting_exhibit`
   - closed-world, non-destructive write;
   - input `{ name, exhibit: ExhibitSpecV1 }`;
   - output SVG artifact metadata + exhibit metrics + resource link.

3. `create_mermaid_diagram`
   - closed-world, non-destructive write;
   - input `{ name, diagram: DiagramSpecV1 }`;
   - output `.mmd` plain-text artifact + resource link.

4. `create_consulting_presentation`
   - closed-world, non-destructive write;
   - input `{ name, deck: PresentationDeckV1 }`;
   - preflight/creates one PPTX artifact only after the complete deck validates and renders in memory;
   - output PPTX artifact metadata + presentation metrics + resource link.

### TDD sequence

- [ ] Write HTTP MCP tests first for discovery annotations, valid operations, invalid analytical job, malformed exhibit data, injection-like labels, invalid Mermaid references, duplicate slide titles, unsupported deck content, artifact names/MIME/revisions, and resource links.
- [ ] Confirm RED before registration.
- [ ] Implement focused `src/visualization/register-tools.ts` and `src/presentations/register-tools.ts`; compose in `src/server.ts`.
- [ ] Full MCP + repository verification; record GREEN SHA/run before Task 7.

---

## Task 7: Independent SVG and PPTX Rendering/Accessibility Gate

### CI-only dependencies

Extend the existing Ubuntu render gate with:

- `libreoffice-impress` for PPTX → PDF;
- `librsvg2-bin` for `rsvg-convert` SVG rasterization;
- existing `poppler-utils` for PDF parsing/rasterization.

Do not add these to runtime dependencies.

### Fixtures

`node scripts/generate-presentation-render-fixtures.mjs <output-dir>` writes deterministic fixtures:

- one SVG per supported core exhibit kind (10 files);
- one Mermaid `.mmd` source fixture per diagram kind (3 files; syntax/source safety validation only, not runtime Mermaid rendering);
- one `consulting-deck.pptx` containing title, section, summary, and representative exhibit slides including multi-page/first-last coverage.

### Validator

`scripts/verify-presentation-rendering.sh <output-dir>` must:

1. run `rsvg-convert` on every generated SVG and require non-empty PNG output;
2. reject active/external SVG constructs with structural checks before rasterization;
3. convert the PPTX headlessly to PDF through LibreOffice Impress;
4. require converted PDF page count to equal expected slide count;
5. run `pdfinfo` on the converted PDF;
6. rasterize first and last presentation pages through `pdftoppm` and require non-empty PNGs;
7. independently inspect the PPTX ZIP/package for macro/external/embedding exclusions, slide count, required media, and alt-text/title evidence;
8. fail the entire existing `ci/verify` status on any presentation/SVG validation failure.

### Accessibility fixtures

- title and body theme color pairs satisfy the repository's WCAG contrast helper;
- every meaningful SVG contains accessible title/description and ARIA naming;
- every embedded exhibit image has alt text;
- each slide has a unique visible title;
- line charts have non-color distinction;
- risk/heatmap meaning is not encoded by color alone;
- slide-object insertion sequence is unit-tested to match intended semantic order where controllable through PptxGenJS.

### TDD sequence

- [ ] Add fixture generator and validator before modifying CI.
- [ ] Add CI installation/render step and confirm RED if any generated output fails independently.
- [ ] Fix engines/fixtures—not the independent validator—for legitimate product output defects.
- [ ] Require exact code SHA to pass ordinary repository verification plus the new SVG/PPTX render gate before Task 8 catalog promotion.

---

## Task 8: Truthful Catalog Promotion, Documentation, and Subproject Closure

### Catalog truth policy

Do **not** promote all visualization capabilities.

Eligible for promotion only when their exact SVG renderer has passed Task 7:

- `bar-chart`
- `stacked-bar-chart` only if the shared bar renderer explicitly verifies stacked mode;
- `line-chart`
- `scatter-plot`
- `waterfall-chart`
- `pareto-chart`
- `heatmap`
- `matrix-2x2`
- `risk-heatmap` or the exact existing risk-matrix catalog identity after lookup;
- `gantt-chart` or the exact existing Gantt catalog identity after lookup;
- `funnel-chart`.

Each becomes at most `partial` unless its catalog description is exactly satisfied by the verified deterministic renderer. Do not guess catalog IDs; inspect them before writing promotion tests.

Diagram capabilities may receive a Mermaid-source engine binding only when the exact catalog wording is satisfied. A source generator is not an interactive diagram renderer and must not be promoted as such.

`pptx-crud` remains `planned` because v1 creates new governed presentations and does not mutate arbitrary existing PPTX files.

A narrower existing presentation-generation/executive-artifact capability may move to `partial` with `create_consulting_presentation` only after exact catalog wording is inspected and the renderer/CI gate passes. It may become `implemented` only if the advertised capability is no broader than the verified creation envelope; otherwise keep it partial.

### Closure files

- `tests/catalog-status-truth.test.ts`
- `src/catalog/verified-promotions.ts`
- `skills/analysis-and-reporting/SKILL.md`
- `skills/artifact-operations/SKILL.md`
- `governance/platform-baseline.md`
- `README.md`
- `docs/superpowers/plans/2026-08-18-universal-consulting-program-roadmap.md`
- this plan.

### Closure gates

- [ ] Write catalog truth tests first against exact existing IDs/descriptions and confirm RED.
- [ ] Add only evidence-backed partial/implemented bindings.
- [ ] Require fresh full repository + SVG/PPTX independent-rendering GREEN on exact code/catalog SHA.
- [ ] Update Skills/governance/README/roadmap with exact supported exhibit types, PptxGenJS pin, Mermaid-source boundary, PPTX creation boundary, accessibility/rendering evidence, and excluded semantics.
- [ ] Require a second fresh full repository + render GREEN on final documentation HEAD.
- [ ] Exhaust branch enumeration and confirm only `main`.
- [ ] Write final truth-only closure record and require it to remain GREEN before externally signing off Subproject 8.
- [ ] Only then advance the roadmap to Subproject 9 — Public Research, Fact Check & SEO.

## Self-review

- **No arbitrary PPTX editing claim:** presentation work is new-file creation only; `pptx-crud` stays planned.
- **No PptxGenJS native chart dependency:** core analytical visuals are our own deterministic accessible SVG assets, reducing native-chart compatibility risk and ensuring identical standalone/deck figures.
- **No arbitrary Mermaid execution:** structured model → bounded source only; no raw Mermaid strings or runtime rendering dependency.
- **Accessibility is testable:** unique titles, alt text, accessible SVG naming, non-color cues, contrast calculations, and semantic ordering are explicit gates rather than prose aspirations.
- **Independent rendering is mandatory:** SVG through librsvg; PPTX through LibreOffice Impress → PDF → Poppler. Library self-reopening alone is insufficient.
- **Truthful breadth:** only exact renderer/catalog intersections get promoted; the many remaining planned visualization identities stay planned/partial until independently implemented.
- **No stale confidence claims:** verification is exact-SHA/run based, not a confidence percentage.
