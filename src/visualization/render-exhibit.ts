import { contrastRatio } from "./accessibility.js";
import { assertSafeSvg, escapeXml, formatSvgNumber, svgText } from "./svg.js";
import type { ExhibitMetrics, ExhibitSpecV1 } from "./types.js";
import { validateExhibit } from "./validate.js";

export interface RenderedExhibitSvg {
  svg: string;
  width: 1200;
  height: 675;
  metrics: ExhibitMetrics;
}

const WIDTH = 1200 as const;
const HEIGHT = 675 as const;
const PLOT = { x: 105, y: 105, width: 990, height: 445 } as const;
const DEFAULT_ACCENT = "1F4E79";
const SERIES_COLORS = [
  "#1F4E79",
  "#A64B2A",
  "#2E6B57",
  "#6A4C93",
  "#8A6D1D",
  "#3D6F8E",
  "#7A3E65",
  "#4C6A2E",
  "#875D3B",
  "#5D5D5D",
  "#244C66",
  "#8B3A3A",
] as const;
const DASH_PATTERNS = ["", "8 5", "2 4", "12 4 2 4", "5 3 1 3"] as const;

interface Domain {
  min: number;
  max: number;
}

function domain(values: readonly number[], options: { includeZero?: boolean; margin?: number } = {}): Domain {
  if (values.length === 0) return { min: 0, max: 1 };
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (options.includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    min -= pad;
    max += pad;
  } else if ((options.margin ?? 0) > 0) {
    const pad = (max - min) * (options.margin ?? 0);
    min -= pad;
    max += pad;
  }
  return { min, max };
}

function scale(value: number, input: Domain, outputMin: number, outputMax: number): number {
  return outputMin + ((value - input.min) / (input.max - input.min)) * (outputMax - outputMin);
}

function colorFor(index: number, accent: string): string {
  return index === 0 ? accent : SERIES_COLORS[index % SERIES_COLORS.length]!;
}

function visibleFrame(spec: ExhibitSpecV1, body: string): string {
  const notes: string[] = [];
  if (spec.sourceNote) notes.push(svgText(PLOT.x, 622, spec.sourceNote, { size: 12, fill: "#555555" }));
  if (spec.caveat) notes.push(svgText(PLOT.x, spec.sourceNote ? 642 : 622, spec.caveat, { size: 12, fill: "#555555" }));
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-labelledby="exhibit-title exhibit-desc">`,
    `<title id="exhibit-title">${escapeXml(spec.title)}</title>`,
    `<desc id="exhibit-desc">${escapeXml(spec.altText)}</desc>`,
    `<rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="#FFFFFF"/>`,
    svgText(PLOT.x, 52, spec.title, { size: 26, weight: 700, fill: "#1F1F1F" }),
    body,
    ...notes,
    `</svg>`,
  ].join("");
}

function axisLine(x1: number, y1: number, x2: number, y2: number, role?: string): string {
  return `<line x1="${formatSvgNumber(x1)}" y1="${formatSvgNumber(y1)}" x2="${formatSvgNumber(x2)}" y2="${formatSvgNumber(y2)}" stroke="#666666" stroke-width="1"${role ? ` data-role="${escapeXml(role)}"` : ""}/>`;
}

function legend(names: readonly string[], accent: string): string {
  if (names.length <= 1) return "";
  return names.map((name, index) => {
    const y = 74;
    const x = PLOT.x + index * Math.min(150, PLOT.width / names.length);
    const color = colorFor(index, accent);
    const dash = DASH_PATTERNS[index % DASH_PATTERNS.length]!;
    return `<g data-role="legend-item"><line x1="${formatSvgNumber(x)}" y1="${y}" x2="${formatSvgNumber(x + 24)}" y2="${y}" stroke="${color}" stroke-width="3"${dash ? ` stroke-dasharray="${dash}"` : ""}/>${svgText(x + 30, y + 5, name, { size: 12 })}</g>`;
  }).join("");
}

function renderVerticalBars(spec: Extract<ExhibitSpecV1, { kind: "bar" }>, accent: string): string {
  const stacked = spec.stacked === true;
  const totals = spec.categories.map((_, categoryIndex) => {
    if (!stacked) return spec.series.map((series) => series.values[categoryIndex]!);
    let positive = 0;
    let negative = 0;
    for (const series of spec.series) {
      const value = series.values[categoryIndex]!;
      if (value >= 0) positive += value;
      else negative += value;
    }
    return [negative, positive];
  }).flat();
  const values = stacked ? totals : spec.series.flatMap((series) => series.values);
  const yDomain = domain(values, { includeZero: true });
  const bottom = PLOT.y + PLOT.height;
  const yZero = scale(0, yDomain, bottom, PLOT.y);
  const slot = PLOT.width / spec.categories.length;
  const groupWidth = slot * 0.72;
  const barWidth = stacked ? groupWidth : groupWidth / spec.series.length;
  const pieces = [axisLine(PLOT.x, yZero, PLOT.x + PLOT.width, yZero, "zero-baseline")];

  spec.categories.forEach((category, categoryIndex) => {
    let positiveBase = 0;
    let negativeBase = 0;
    spec.series.forEach((series, seriesIndex) => {
      const value = series.values[categoryIndex]!;
      const startValue = stacked ? (value >= 0 ? positiveBase : negativeBase) : 0;
      const endValue = startValue + value;
      if (stacked) {
        if (value >= 0) positiveBase = endValue;
        else negativeBase = endValue;
      }
      const y1 = scale(startValue, yDomain, bottom, PLOT.y);
      const y2 = scale(endValue, yDomain, bottom, PLOT.y);
      const x = PLOT.x + categoryIndex * slot + (slot - groupWidth) / 2 + (stacked ? 0 : seriesIndex * barWidth);
      const y = Math.min(y1, y2);
      const height = Math.max(1, Math.abs(y2 - y1));
      pieces.push(`<rect data-role="bar" data-series="${seriesIndex}" data-value="${formatSvgNumber(value)}" x="${formatSvgNumber(x)}" y="${formatSvgNumber(y)}" width="${formatSvgNumber(barWidth - 2)}" height="${formatSvgNumber(height)}" fill="${colorFor(seriesIndex, accent)}"/>`);
    });
    pieces.push(svgText(PLOT.x + categoryIndex * slot + slot / 2, bottom + 24, category, { anchor: "middle", size: spec.categories.length > 20 ? 9 : 12, rotate: spec.categories.length > 12 ? -35 : undefined }));
  });
  pieces.push(legend(spec.series.map((series) => series.name), accent));
  return pieces.join("");
}

function renderHorizontalBars(spec: Extract<ExhibitSpecV1, { kind: "bar" }>, accent: string): string {
  const stacked = spec.stacked === true;
  const totals = spec.categories.map((_, categoryIndex) => {
    if (!stacked) return spec.series.map((series) => series.values[categoryIndex]!);
    let positive = 0;
    let negative = 0;
    for (const series of spec.series) {
      const value = series.values[categoryIndex]!;
      if (value >= 0) positive += value;
      else negative += value;
    }
    return [negative, positive];
  }).flat();
  const values = stacked ? totals : spec.series.flatMap((series) => series.values);
  const xDomain = domain(values, { includeZero: true });
  const xZero = scale(0, xDomain, PLOT.x, PLOT.x + PLOT.width);
  const slot = PLOT.height / spec.categories.length;
  const groupHeight = slot * 0.72;
  const barHeight = stacked ? groupHeight : groupHeight / spec.series.length;
  const pieces = [axisLine(xZero, PLOT.y, xZero, PLOT.y + PLOT.height, "zero-baseline")];
  spec.categories.forEach((category, categoryIndex) => {
    let positiveBase = 0;
    let negativeBase = 0;
    spec.series.forEach((series, seriesIndex) => {
      const value = series.values[categoryIndex]!;
      const startValue = stacked ? (value >= 0 ? positiveBase : negativeBase) : 0;
      const endValue = startValue + value;
      if (stacked) {
        if (value >= 0) positiveBase = endValue;
        else negativeBase = endValue;
      }
      const x1 = scale(startValue, xDomain, PLOT.x, PLOT.x + PLOT.width);
      const x2 = scale(endValue, xDomain, PLOT.x, PLOT.x + PLOT.width);
      const y = PLOT.y + categoryIndex * slot + (slot - groupHeight) / 2 + (stacked ? 0 : seriesIndex * barHeight);
      pieces.push(`<rect data-role="bar" data-series="${seriesIndex}" data-value="${formatSvgNumber(value)}" x="${formatSvgNumber(Math.min(x1, x2))}" y="${formatSvgNumber(y)}" width="${formatSvgNumber(Math.max(1, Math.abs(x2 - x1)))}" height="${formatSvgNumber(barHeight - 2)}" fill="${colorFor(seriesIndex, accent)}"/>`);
    });
    pieces.push(svgText(PLOT.x - 10, PLOT.y + categoryIndex * slot + slot / 2 + 4, category, { anchor: "end", size: spec.categories.length > 20 ? 9 : 12 }));
  });
  pieces.push(legend(spec.series.map((series) => series.name), accent));
  return pieces.join("");
}

function renderBar(spec: Extract<ExhibitSpecV1, { kind: "bar" }>, accent: string): string {
  return spec.orientation === "horizontal" ? renderHorizontalBars(spec, accent) : renderVerticalBars(spec, accent);
}

function renderLine(spec: Extract<ExhibitSpecV1, { kind: "line" }>, accent: string): string {
  const allValues = spec.series.flatMap((series) => series.values);
  const yDomain = domain(allValues, { margin: 0.08 });
  const bottom = PLOT.y + PLOT.height;
  const xAt = (index: number) => spec.categories.length === 1 ? PLOT.x + PLOT.width / 2 : PLOT.x + (index / (spec.categories.length - 1)) * PLOT.width;
  const yAt = (value: number) => scale(value, yDomain, bottom, PLOT.y);
  const pieces = [axisLine(PLOT.x, bottom, PLOT.x + PLOT.width, bottom), axisLine(PLOT.x, PLOT.y, PLOT.x, bottom)];
  spec.categories.forEach((category, index) => pieces.push(svgText(xAt(index), bottom + 24, category, { anchor: "middle", size: spec.categories.length > 20 ? 9 : 12, rotate: spec.categories.length > 12 ? -35 : undefined })));
  spec.series.forEach((series, seriesIndex) => {
    const color = colorFor(seriesIndex, accent);
    const dash = DASH_PATTERNS[seriesIndex % DASH_PATTERNS.length]!;
    const path = series.values.map((value, index) => `${index === 0 ? "M" : "L"}${formatSvgNumber(xAt(index))},${formatSvgNumber(yAt(value))}`).join(" ");
    pieces.push(`<path data-role="line-series" d="${path}" fill="none" stroke="${color}" stroke-width="3"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`);
    series.values.forEach((value, index) => {
      const marker = seriesIndex % 3;
      if (marker === 0) {
        pieces.push(`<circle data-role="line-marker" cx="${formatSvgNumber(xAt(index))}" cy="${formatSvgNumber(yAt(value))}" r="5" fill="#FFFFFF" stroke="${color}" stroke-width="2"/>`);
      } else if (marker === 1) {
        const x = xAt(index);
        const y = yAt(value);
        pieces.push(`<rect data-role="line-marker" x="${formatSvgNumber(x - 4)}" y="${formatSvgNumber(y - 4)}" width="8" height="8" fill="#FFFFFF" stroke="${color}" stroke-width="2"/>`);
      } else {
        const x = xAt(index);
        const y = yAt(value);
        pieces.push(`<path data-role="line-marker" d="M${formatSvgNumber(x)},${formatSvgNumber(y - 5)} L${formatSvgNumber(x + 5)},${formatSvgNumber(y + 5)} L${formatSvgNumber(x - 5)},${formatSvgNumber(y + 5)} Z" fill="#FFFFFF" stroke="${color}" stroke-width="2"/>`);
      }
    });
  });
  pieces.push(legend(spec.series.map((series) => series.name), accent));
  return pieces.join("");
}

function renderScatter(spec: Extract<ExhibitSpecV1, { kind: "scatter" }>, accent: string): string {
  const points = spec.series.flatMap((series) => series.points);
  const xDomain = domain(points.map((point) => point.x), { margin: 0.08 });
  const yDomain = domain(points.map((point) => point.y), { margin: 0.08 });
  const bottom = PLOT.y + PLOT.height;
  const pieces = [axisLine(PLOT.x, bottom, PLOT.x + PLOT.width, bottom), axisLine(PLOT.x, PLOT.y, PLOT.x, bottom)];
  pieces.push(svgText(PLOT.x + PLOT.width / 2, bottom + 42, spec.xLabel, { anchor: "middle", size: 13, weight: 600 }));
  pieces.push(svgText(24, PLOT.y + PLOT.height / 2, spec.yLabel, { anchor: "middle", size: 13, weight: 600, rotate: -90 }));
  spec.series.forEach((series, seriesIndex) => {
    const color = colorFor(seriesIndex, accent);
    series.points.forEach((point) => {
      const x = scale(point.x, xDomain, PLOT.x, PLOT.x + PLOT.width);
      const y = scale(point.y, yDomain, bottom, PLOT.y);
      pieces.push(`<circle data-role="scatter-point" cx="${formatSvgNumber(x)}" cy="${formatSvgNumber(y)}" r="6" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>`);
      if (point.label) pieces.push(svgText(x + 9, y - 8, point.label, { size: 11 }));
    });
  });
  pieces.push(legend(spec.series.map((series) => series.name), accent));
  return pieces.join("");
}

function renderWaterfall(spec: Extract<ExhibitSpecV1, { kind: "waterfall" }>, accent: string): string {
  let running = 0;
  const bars = spec.steps.map((step) => {
    const role = step.role ?? "change";
    const start = role === "change" ? running : 0;
    const end = role === "change" ? running + step.value : step.value;
    running = end;
    return { ...step, role, start, end, running };
  });
  const yDomain = domain(bars.flatMap((bar) => [bar.start, bar.end]), { includeZero: true });
  const bottom = PLOT.y + PLOT.height;
  const yZero = scale(0, yDomain, bottom, PLOT.y);
  const slot = PLOT.width / bars.length;
  const width = slot * 0.62;
  const pieces = [axisLine(PLOT.x, yZero, PLOT.x + PLOT.width, yZero, "zero-baseline")];
  bars.forEach((bar, index) => {
    const y1 = scale(bar.start, yDomain, bottom, PLOT.y);
    const y2 = scale(bar.end, yDomain, bottom, PLOT.y);
    const fill = bar.role === "total" || bar.role === "subtotal" ? accent : bar.end >= bar.start ? "#2E6B57" : "#A64B2A";
    const x = PLOT.x + index * slot + (slot - width) / 2;
    pieces.push(`<rect data-role="waterfall-bar" data-running-total="${formatSvgNumber(bar.running)}" data-role-type="${bar.role}" x="${formatSvgNumber(x)}" y="${formatSvgNumber(Math.min(y1, y2))}" width="${formatSvgNumber(width)}" height="${formatSvgNumber(Math.max(1, Math.abs(y2 - y1)))}" fill="${fill}"/>`);
    pieces.push(svgText(x + width / 2, bottom + 24, bar.label, { anchor: "middle", size: bars.length > 16 ? 9 : 12 }));
    if (index < bars.length - 1) {
      const nextX = PLOT.x + (index + 1) * slot + (slot - width) / 2;
      const connectorY = scale(bar.running, yDomain, bottom, PLOT.y);
      pieces.push(`<line data-role="waterfall-connector" x1="${formatSvgNumber(x + width)}" y1="${formatSvgNumber(connectorY)}" x2="${formatSvgNumber(nextX)}" y2="${formatSvgNumber(connectorY)}" stroke="#777777" stroke-width="1" stroke-dasharray="3 3"/>`);
    }
  });
  return pieces.join("");
}

function renderPareto(spec: Extract<ExhibitSpecV1, { kind: "pareto" }>, accent: string): string {
  if (spec.values.some((value) => value < 0)) throw new Error("Pareto values must be non-negative for cumulative contribution rendering.");
  const ordered = spec.categories.map((category, index) => ({ category, value: spec.values[index]!, index })).sort((a, b) => b.value - a.value || a.index - b.index);
  const total = ordered.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) throw new Error("Pareto values must contain a positive total.");
  const yDomain = domain(ordered.map((item) => item.value), { includeZero: true });
  const bottom = PLOT.y + PLOT.height;
  const slot = PLOT.width / ordered.length;
  const width = slot * 0.58;
  const pieces: string[] = [axisLine(PLOT.x, bottom, PLOT.x + PLOT.width, bottom)];
  let cumulative = 0;
  const cumulativePoints: { x: number; y: number; percent: number }[] = [];
  ordered.forEach((item, index) => {
    const x = PLOT.x + index * slot + (slot - width) / 2;
    const y = scale(item.value, yDomain, bottom, PLOT.y);
    pieces.push(`<rect data-role="pareto-bar" x="${formatSvgNumber(x)}" y="${formatSvgNumber(y)}" width="${formatSvgNumber(width)}" height="${formatSvgNumber(bottom - y)}" fill="${accent}"/>`);
    pieces.push(svgText(x + width / 2, bottom + 24, item.category, { anchor: "middle", size: ordered.length > 20 ? 9 : 12 }));
    cumulative += item.value;
    const percent = index === ordered.length - 1 ? 100 : (cumulative / total) * 100;
    cumulativePoints.push({ x: x + width / 2, y: bottom - (percent / 100) * PLOT.height, percent });
  });
  const path = cumulativePoints.map((point, index) => `${index === 0 ? "M" : "L"}${formatSvgNumber(point.x)},${formatSvgNumber(point.y)}`).join(" ");
  pieces.push(`<g data-role="pareto-cumulative"><path d="${path}" fill="none" stroke="#A64B2A" stroke-width="3"/>${cumulativePoints.map((point) => `<circle data-cumulative-percent="${formatSvgNumber(point.percent)}" cx="${formatSvgNumber(point.x)}" cy="${formatSvgNumber(point.y)}" r="4" fill="#FFFFFF" stroke="#A64B2A" stroke-width="2"/>`).join("")}</g>`);
  pieces.push(svgText(PLOT.x + PLOT.width, PLOT.y - 8, "100% cumulative", { anchor: "end", size: 11, fill: "#A64B2A" }));
  return pieces.join("");
}

function blendToAccent(intensity: number, accentHex: string): string {
  const normalized = accentHex.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const t = Math.max(0, Math.min(1, intensity)) * 0.75;
  const channel = (target: number) => Math.round(255 + (target - 255) * t).toString(16).padStart(2, "0").toUpperCase();
  return `#${channel(red)}${channel(green)}${channel(blue)}`;
}

function renderHeatmap(spec: Extract<ExhibitSpecV1, { kind: "heatmap" }>, accent: string): string {
  const values = spec.values.flat();
  const valueDomain = domain(values);
  const leftLabel = 150;
  const topLabel = 45;
  const cellWidth = (PLOT.width - leftLabel) / spec.columnLabels.length;
  const cellHeight = (PLOT.height - topLabel) / spec.rowLabels.length;
  const pieces: string[] = [];
  spec.columnLabels.forEach((label, index) => pieces.push(svgText(PLOT.x + leftLabel + index * cellWidth + cellWidth / 2, PLOT.y + 20, label, { anchor: "middle", size: 11, weight: 600 })));
  spec.rowLabels.forEach((label, rowIndex) => {
    pieces.push(svgText(PLOT.x + leftLabel - 10, PLOT.y + topLabel + rowIndex * cellHeight + cellHeight / 2 + 4, label, { anchor: "end", size: 11, weight: 600 }));
    spec.values[rowIndex]!.forEach((value, columnIndex) => {
      const intensity = (value - valueDomain.min) / (valueDomain.max - valueDomain.min);
      const fill = blendToAccent(intensity, accent);
      const x = PLOT.x + leftLabel + columnIndex * cellWidth;
      const y = PLOT.y + topLabel + rowIndex * cellHeight;
      const textFill = intensity > 0.72 ? "#FFFFFF" : "#111111";
      pieces.push(`<g data-role="heatmap-cell" data-value="${formatSvgNumber(value)}"><rect x="${formatSvgNumber(x)}" y="${formatSvgNumber(y)}" width="${formatSvgNumber(cellWidth)}" height="${formatSvgNumber(cellHeight)}" fill="${fill}" stroke="#FFFFFF" stroke-width="2"/>${svgText(x + cellWidth / 2, y + cellHeight / 2 + 5, formatSvgNumber(value), { anchor: "middle", size: 12, weight: 700, fill: textFill })}</g>`);
    });
  });
  return pieces.join("");
}

function renderMatrix(spec: Extract<ExhibitSpecV1, { kind: "matrix-2x2" }>, accent: string): string {
  const xDomain = domain(spec.points.map((point) => point.x), { margin: 0.08 });
  const yDomain = domain(spec.points.map((point) => point.y), { margin: 0.08 });
  const bottom = PLOT.y + PLOT.height;
  const midX = PLOT.x + PLOT.width / 2;
  const midY = PLOT.y + PLOT.height / 2;
  const pieces = [
    `<rect x="${PLOT.x}" y="${PLOT.y}" width="${PLOT.width}" height="${PLOT.height}" fill="#FAFAFA" stroke="#777777"/>`,
    axisLine(midX, PLOT.y, midX, bottom),
    axisLine(PLOT.x, midY, PLOT.x + PLOT.width, midY),
    svgText(PLOT.x, bottom + 24, spec.xAxis.low, { size: 11 }),
    svgText(PLOT.x + PLOT.width, bottom + 24, spec.xAxis.high, { anchor: "end", size: 11 }),
    svgText(PLOT.x + PLOT.width / 2, bottom + 42, spec.xAxis.label, { anchor: "middle", size: 13, weight: 600 }),
    svgText(32, bottom, spec.yAxis.low, { size: 11 }),
    svgText(32, PLOT.y + 10, spec.yAxis.high, { size: 11 }),
    svgText(22, PLOT.y + PLOT.height / 2, spec.yAxis.label, { anchor: "middle", size: 13, weight: 600, rotate: -90 }),
  ];
  spec.points.forEach((point) => {
    const x = scale(point.x, xDomain, PLOT.x + 18, PLOT.x + PLOT.width - 18);
    const y = scale(point.y, yDomain, bottom - 18, PLOT.y + 18);
    pieces.push(`<g data-role="matrix-point" data-x="${formatSvgNumber(point.x)}" data-y="${formatSvgNumber(point.y)}"><circle cx="${formatSvgNumber(x)}" cy="${formatSvgNumber(y)}" r="7" fill="${accent}" stroke="#FFFFFF" stroke-width="2"/>${svgText(x + 10, y - 8, point.label, { size: 11, weight: 600 })}</g>`);
  });
  return pieces.join("");
}

function renderRiskMatrix(spec: Extract<ExhibitSpecV1, { kind: "risk-matrix" }>, accent: string): string {
  const cellWidth = PLOT.width / 5;
  const cellHeight = PLOT.height / 5;
  const pieces: string[] = [];
  for (let impact = 1; impact <= 5; impact += 1) {
    for (let likelihood = 1; likelihood <= 5; likelihood += 1) {
      const score = impact * likelihood;
      const fill = score >= 16 ? "#F7D9D4" : score >= 9 ? "#F8E9C7" : "#E4F0E9";
      const x = PLOT.x + (likelihood - 1) * cellWidth;
      const y = PLOT.y + (5 - impact) * cellHeight;
      pieces.push(`<g data-role="risk-cell" data-likelihood="${likelihood}" data-impact="${impact}"><rect x="${formatSvgNumber(x)}" y="${formatSvgNumber(y)}" width="${formatSvgNumber(cellWidth)}" height="${formatSvgNumber(cellHeight)}" fill="${fill}" stroke="#FFFFFF" stroke-width="2"/>${svgText(x + 8, y + 18, `L${likelihood} · I${impact}`, { size: 10, fill: "#555555" })}</g>`);
    }
  }
  pieces.push(svgText(PLOT.x + PLOT.width / 2, PLOT.y + PLOT.height + 38, "Likelihood →", { anchor: "middle", size: 13, weight: 600 }));
  pieces.push(svgText(24, PLOT.y + PLOT.height / 2, "Impact →", { anchor: "middle", size: 13, weight: 600, rotate: -90 }));
  spec.points.forEach((point, index) => {
    const x = PLOT.x + (point.likelihood - 0.5) * cellWidth;
    const y = PLOT.y + (5 - point.impact + 0.5) * cellHeight;
    const offset = (index % 3 - 1) * 8;
    pieces.push(`<g data-role="risk-point" data-likelihood="${point.likelihood}" data-impact="${point.impact}"><circle cx="${formatSvgNumber(x + offset)}" cy="${formatSvgNumber(y)}" r="7" fill="${accent}" stroke="#FFFFFF" stroke-width="2"/>${svgText(x + offset + 10, y - 8, point.label, { size: 10, weight: 600 })}</g>`);
  });
  return pieces.join("");
}

function renderGantt(spec: Extract<ExhibitSpecV1, { kind: "gantt" }>, accent: string): string {
  const timeDomain = domain(spec.tasks.flatMap((task) => [task.start, task.end]));
  const labelWidth = 190;
  const timelineX = PLOT.x + labelWidth;
  const timelineWidth = PLOT.width - labelWidth;
  const rowHeight = PLOT.height / spec.tasks.length;
  const pieces: string[] = [axisLine(timelineX, PLOT.y, timelineX, PLOT.y + PLOT.height)];
  spec.tasks.forEach((task, index) => {
    const y = PLOT.y + index * rowHeight + rowHeight * 0.25;
    const height = Math.max(8, rowHeight * 0.5);
    const x1 = scale(task.start, timeDomain, timelineX, timelineX + timelineWidth);
    const x2 = scale(task.end, timeDomain, timelineX, timelineX + timelineWidth);
    pieces.push(svgText(timelineX - 10, y + height / 2 + 4, task.label, { anchor: "end", size: spec.tasks.length > 25 ? 9 : 11, weight: 600 }));
    pieces.push(`<rect data-role="gantt-task" data-start="${formatSvgNumber(task.start)}" data-end="${formatSvgNumber(task.end)}" x="${formatSvgNumber(x1)}" y="${formatSvgNumber(y)}" width="${formatSvgNumber(Math.max(5, x2 - x1))}" height="${formatSvgNumber(height)}" rx="3" fill="${colorFor(index, accent)}"/>`);
    if (task.group) pieces.push(svgText(timelineX + 6, y + height - 4, task.group, { size: 9, fill: "#FFFFFF", weight: 600 }));
  });
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = timeDomain.min + ((timeDomain.max - timeDomain.min) * tick) / 4;
    const x = timelineX + (timelineWidth * tick) / 4;
    pieces.push(axisLine(x, PLOT.y, x, PLOT.y + PLOT.height));
    pieces.push(svgText(x, PLOT.y + PLOT.height + 22, formatSvgNumber(value), { anchor: "middle", size: 10 }));
  }
  return pieces.join("");
}

function renderFunnel(spec: Extract<ExhibitSpecV1, { kind: "funnel" }>, accent: string): string {
  if (spec.stages.some((stage) => stage.value < 0)) throw new Error("Funnel stage values must be non-negative for proportional stage rendering.");
  const max = Math.max(...spec.stages.map((stage) => stage.value));
  if (max <= 0) throw new Error("Funnel stage values must contain a positive maximum.");
  const maxWidth = 760;
  const stageHeight = Math.min(72, PLOT.height / spec.stages.length);
  const centerX = PLOT.x + PLOT.width / 2;
  const pieces: string[] = [];
  spec.stages.forEach((stage, index) => {
    const width = (stage.value / max) * maxWidth;
    const y = PLOT.y + index * stageHeight;
    const nextValue = spec.stages[index + 1]?.value ?? stage.value;
    const nextWidth = (nextValue / max) * maxWidth;
    const leftTop = centerX - width / 2;
    const rightTop = centerX + width / 2;
    const leftBottom = centerX - nextWidth / 2;
    const rightBottom = centerX + nextWidth / 2;
    const fill = colorFor(index, accent);
    pieces.push(`<g data-role="funnel-stage" data-width="${formatSvgNumber(width)}" data-value="${formatSvgNumber(stage.value)}"><polygon points="${formatSvgNumber(leftTop)},${formatSvgNumber(y)} ${formatSvgNumber(rightTop)},${formatSvgNumber(y)} ${formatSvgNumber(rightBottom)},${formatSvgNumber(y + stageHeight - 4)} ${formatSvgNumber(leftBottom)},${formatSvgNumber(y + stageHeight - 4)}" fill="${fill}"/>${svgText(centerX, y + stageHeight / 2 + 4, `${stage.label}: ${formatSvgNumber(stage.value)}`, { anchor: "middle", size: 12, weight: 700, fill: "#FFFFFF" })}</g>`);
  });
  return pieces.join("");
}

function bodyFor(spec: ExhibitSpecV1, accent: string): string {
  switch (spec.kind) {
    case "bar": return renderBar(spec, accent);
    case "line": return renderLine(spec, accent);
    case "scatter": return renderScatter(spec, accent);
    case "waterfall": return renderWaterfall(spec, accent);
    case "pareto": return renderPareto(spec, accent);
    case "heatmap": return renderHeatmap(spec, accent);
    case "matrix-2x2": return renderMatrix(spec, accent);
    case "risk-matrix": return renderRiskMatrix(spec, accent);
    case "gantt": return renderGantt(spec, accent);
    case "funnel": return renderFunnel(spec, accent);
  }
}

export function renderExhibitSvg(spec: ExhibitSpecV1): RenderedExhibitSvg {
  const metrics = validateExhibit(spec);
  const accentHex = (spec.accentColorHex ?? DEFAULT_ACCENT).toUpperCase();
  const accent = `#${accentHex}`;
  if (contrastRatio(accentHex, "FFFFFF") < 3) {
    throw new Error("Exhibit accent color must have at least 3:1 contrast against the default white background for essential graphics.");
  }
  const svg = visibleFrame(spec, bodyFor(spec, accent));
  assertSafeSvg(svg);
  return { svg, width: WIDTH, height: HEIGHT, metrics };
}
