import {
  EXHIBIT_LIMITS,
  type ExhibitMetrics,
  type ExhibitSpecV1,
} from "./types.js";

type UnknownRecord = Record<string, unknown>;

const BASE_KEYS = ["version", "kind", "title", "altText", "sourceNote", "caveat", "accentColorHex"] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRecord(value: unknown, label: string): asserts value is UnknownRecord {
  if (!isRecord(value)) throw new Error(`${label} must be an object.`);
}

function assertOnlyKeys(value: UnknownRecord, allowed: readonly string[], label: string): void {
  const allowedSet = new Set(allowed);
  const extras = Object.keys(value).filter((key) => !allowedSet.has(key));
  if (extras.length > 0) throw new Error(`${label} contains unsupported field(s): ${extras.join(", ")}.`);
}

function requiredText(value: unknown, label: string, maximum?: number): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} must be non-empty text.`);
  if (maximum !== undefined && value.length > maximum) throw new Error(`${label} exceeds the ${maximum}-character limit.`);
  return value;
}

function optionalText(value: unknown, label: string, maximum: number): void {
  if (value === undefined) return;
  requiredText(value, label, maximum);
}

function finite(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${label} must be a finite number.`);
  return value;
}

function assertArray(value: unknown, label: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
}

function labels(value: unknown, label: string, maximum: number): string[] {
  assertArray(value, label);
  if (value.length < 1) throw new Error(`${label} must contain at least one label.`);
  if (value.length > maximum) throw new Error(`${label} exceeds the ${maximum}-category limit.`);
  return value.map((item, index) => requiredText(item, `${label} ${index + 1}`));
}

function baseValidation(record: UnknownRecord): void {
  if (record.version !== 1) throw new Error("Exhibit version must be exactly 1.");
  requiredText(record.title, "Exhibit title", EXHIBIT_LIMITS.maxTitleCharacters);
  requiredText(record.altText, "Exhibit alt text", EXHIBIT_LIMITS.maxAltTextCharacters);
  optionalText(record.sourceNote, "Exhibit source note", EXHIBIT_LIMITS.maxSourceCharacters);
  optionalText(record.caveat, "Exhibit caveat", EXHIBIT_LIMITS.maxCaveatCharacters);
  if (record.accentColorHex !== undefined) {
    if (typeof record.accentColorHex !== "string" || !/^[0-9A-Fa-f]{6}$/.test(record.accentColorHex)) {
      throw new Error("Exhibit accent color must be exactly six hexadecimal digits without a leading #.");
    }
  }
}

function validateNamedSeries(value: unknown, categories: readonly string[]): { dataPoints: number; seriesCount: number } {
  assertArray(value, "Exhibit series");
  if (value.length < 1) throw new Error("Exhibit series must contain at least one series.");
  if (value.length > EXHIBIT_LIMITS.maxSeries) throw new Error(`Exhibit series exceeds the ${EXHIBIT_LIMITS.maxSeries}-series limit.`);
  const names = new Set<string>();
  let dataPoints = 0;
  value.forEach((entry, seriesIndex) => {
    assertRecord(entry, `Series ${seriesIndex + 1}`);
    assertOnlyKeys(entry, ["name", "values"], `Series ${seriesIndex + 1}`);
    const name = requiredText(entry.name, `Series ${seriesIndex + 1} name`);
    if (names.has(name)) throw new Error(`Series names must be unique; duplicate name: ${name}.`);
    names.add(name);
    assertArray(entry.values, `Series ${seriesIndex + 1} values`);
    if (entry.values.length !== categories.length) throw new Error("Series values must match the category count exactly.");
    entry.values.forEach((item, valueIndex) => finite(item, `Series ${seriesIndex + 1} value ${valueIndex + 1}`));
    dataPoints += entry.values.length;
  });
  return { dataPoints, seriesCount: value.length };
}

function enforceDataPointLimit(count: number): void {
  if (count > EXHIBIT_LIMITS.maxDataPoints) throw new Error(`Exhibit data point count exceeds the ${EXHIBIT_LIMITS.maxDataPoints}-point limit.`);
}

export function validateExhibit(spec: ExhibitSpecV1): ExhibitMetrics {
  assertRecord(spec, "Exhibit");
  baseValidation(spec);
  const kind = spec.kind;
  if (typeof kind !== "string") throw new Error("Exhibit kind must be text.");

  switch (kind) {
    case "bar": {
      assertOnlyKeys(spec, [...BASE_KEYS, "categories", "series", "orientation", "stacked"], "Bar exhibit");
      const categories = labels(spec.categories, "Bar categories", EXHIBIT_LIMITS.maxCategories);
      if (spec.orientation !== undefined && spec.orientation !== "vertical" && spec.orientation !== "horizontal") throw new Error("Bar orientation must be vertical or horizontal.");
      if (spec.stacked !== undefined && typeof spec.stacked !== "boolean") throw new Error("Bar stacked must be boolean when supplied.");
      const series = validateNamedSeries(spec.series, categories);
      enforceDataPointLimit(series.dataPoints);
      return { dataPointCount: series.dataPoints, seriesCount: series.seriesCount, categoryCount: categories.length };
    }
    case "line": {
      assertOnlyKeys(spec, [...BASE_KEYS, "categories", "series"], "Line exhibit");
      const categories = labels(spec.categories, "Line categories", EXHIBIT_LIMITS.maxCategories);
      const series = validateNamedSeries(spec.series, categories);
      enforceDataPointLimit(series.dataPoints);
      return { dataPointCount: series.dataPoints, seriesCount: series.seriesCount, categoryCount: categories.length };
    }
    case "scatter": {
      assertOnlyKeys(spec, [...BASE_KEYS, "xLabel", "yLabel", "series"], "Scatter exhibit");
      requiredText(spec.xLabel, "Scatter x-axis label");
      requiredText(spec.yLabel, "Scatter y-axis label");
      assertArray(spec.series, "Scatter series");
      if (spec.series.length < 1 || spec.series.length > EXHIBIT_LIMITS.maxSeries) throw new Error(`Scatter series must contain 1-${EXHIBIT_LIMITS.maxSeries} series.`);
      let count = 0;
      const names = new Set<string>();
      spec.series.forEach((entry, seriesIndex) => {
        assertRecord(entry, `Scatter series ${seriesIndex + 1}`);
        assertOnlyKeys(entry, ["name", "points"], `Scatter series ${seriesIndex + 1}`);
        const name = requiredText(entry.name, `Scatter series ${seriesIndex + 1} name`);
        if (names.has(name)) throw new Error(`Scatter series names must be unique; duplicate name: ${name}.`);
        names.add(name);
        assertArray(entry.points, `Scatter series ${seriesIndex + 1} points`);
        entry.points.forEach((point, pointIndex) => {
          assertRecord(point, `Scatter point ${pointIndex + 1}`);
          assertOnlyKeys(point, ["x", "y", "label"], `Scatter point ${pointIndex + 1}`);
          finite(point.x, `Scatter point ${pointIndex + 1} x`);
          finite(point.y, `Scatter point ${pointIndex + 1} y`);
          if (point.label !== undefined) requiredText(point.label, `Scatter point ${pointIndex + 1} label`);
        });
        count += entry.points.length;
      });
      enforceDataPointLimit(count);
      return { dataPointCount: count, seriesCount: spec.series.length, categoryCount: 0 };
    }
    case "waterfall": {
      assertOnlyKeys(spec, [...BASE_KEYS, "steps"], "Waterfall exhibit");
      assertArray(spec.steps, "Waterfall steps");
      if (spec.steps.length < 1 || spec.steps.length > EXHIBIT_LIMITS.maxCategories) throw new Error(`Waterfall steps must contain 1-${EXHIBIT_LIMITS.maxCategories} entries.`);
      spec.steps.forEach((step, index) => {
        assertRecord(step, `Waterfall step ${index + 1}`);
        assertOnlyKeys(step, ["label", "value", "role"], `Waterfall step ${index + 1}`);
        requiredText(step.label, `Waterfall step ${index + 1} label`);
        finite(step.value, `Waterfall step ${index + 1} value`);
        if (step.role !== undefined && !["change", "subtotal", "total"].includes(String(step.role))) throw new Error("Waterfall role must be change, subtotal, or total.");
      });
      return { dataPointCount: spec.steps.length, seriesCount: 1, categoryCount: spec.steps.length };
    }
    case "pareto": {
      assertOnlyKeys(spec, [...BASE_KEYS, "categories", "values"], "Pareto exhibit");
      const categories = labels(spec.categories, "Pareto categories", EXHIBIT_LIMITS.maxCategories);
      assertArray(spec.values, "Pareto values");
      if (spec.values.length !== categories.length) throw new Error("Pareto values must match the category count exactly.");
      spec.values.forEach((value, index) => finite(value, `Pareto value ${index + 1}`));
      return { dataPointCount: spec.values.length, seriesCount: 1, categoryCount: categories.length };
    }
    case "heatmap": {
      assertOnlyKeys(spec, [...BASE_KEYS, "rowLabels", "columnLabels", "values"], "Heatmap exhibit");
      const rows = labels(spec.rowLabels, "Heatmap row labels", EXHIBIT_LIMITS.maxHeatmapRows);
      const columns = labels(spec.columnLabels, "Heatmap column labels", EXHIBIT_LIMITS.maxHeatmapColumns);
      assertArray(spec.values, "Heatmap values");
      if (spec.values.length !== rows.length) throw new Error("Heatmap row count must match row labels exactly.");
      spec.values.forEach((row, rowIndex) => {
        assertArray(row, `Heatmap row ${rowIndex + 1}`);
        if (row.length !== columns.length) throw new Error("Heatmap row column count must match column labels exactly.");
        row.forEach((value, columnIndex) => finite(value, `Heatmap row ${rowIndex + 1} column ${columnIndex + 1}`));
      });
      const count = rows.length * columns.length;
      enforceDataPointLimit(count);
      return { dataPointCount: count, seriesCount: rows.length, categoryCount: columns.length };
    }
    case "matrix-2x2": {
      assertOnlyKeys(spec, [...BASE_KEYS, "xAxis", "yAxis", "points"], "2x2 matrix exhibit");
      for (const [axisName, axis] of [["x", spec.xAxis], ["y", spec.yAxis]] as const) {
        assertRecord(axis, `${axisName}-axis`);
        assertOnlyKeys(axis, ["label", "low", "high"], `${axisName}-axis`);
        requiredText(axis.label, `${axisName}-axis label`);
        requiredText(axis.low, `${axisName}-axis low label`);
        requiredText(axis.high, `${axisName}-axis high label`);
      }
      assertArray(spec.points, "2x2 matrix points");
      if (spec.points.length > EXHIBIT_LIMITS.maxMatrixPoints) throw new Error(`2x2 matrix point count exceeds the ${EXHIBIT_LIMITS.maxMatrixPoints}-point limit.`);
      spec.points.forEach((point, index) => {
        assertRecord(point, `2x2 matrix point ${index + 1}`);
        assertOnlyKeys(point, ["label", "x", "y"], `2x2 matrix point ${index + 1}`);
        requiredText(point.label, `2x2 matrix point ${index + 1} label`);
        finite(point.x, `2x2 matrix point ${index + 1} x`);
        finite(point.y, `2x2 matrix point ${index + 1} y`);
      });
      return { dataPointCount: spec.points.length, seriesCount: 1, categoryCount: spec.points.length };
    }
    case "risk-matrix": {
      assertOnlyKeys(spec, [...BASE_KEYS, "points"], "Risk matrix exhibit");
      assertArray(spec.points, "Risk matrix points");
      if (spec.points.length > EXHIBIT_LIMITS.maxRiskPoints) throw new Error(`Risk matrix point count exceeds the ${EXHIBIT_LIMITS.maxRiskPoints}-point limit.`);
      spec.points.forEach((point, index) => {
        assertRecord(point, `Risk point ${index + 1}`);
        assertOnlyKeys(point, ["label", "likelihood", "impact"], `Risk point ${index + 1}`);
        requiredText(point.label, `Risk point ${index + 1} label`);
        if (!Number.isInteger(point.likelihood) || Number(point.likelihood) < 1 || Number(point.likelihood) > 5) throw new Error("Risk likelihood must be an integer from 1 to 5.");
        if (!Number.isInteger(point.impact) || Number(point.impact) < 1 || Number(point.impact) > 5) throw new Error("Risk impact must be an integer from 1 to 5.");
      });
      return { dataPointCount: spec.points.length, seriesCount: 1, categoryCount: spec.points.length };
    }
    case "gantt": {
      assertOnlyKeys(spec, [...BASE_KEYS, "tasks"], "Gantt exhibit");
      assertArray(spec.tasks, "Gantt tasks");
      if (spec.tasks.length < 1 || spec.tasks.length > EXHIBIT_LIMITS.maxGanttTasks) throw new Error(`Gantt tasks must contain 1-${EXHIBIT_LIMITS.maxGanttTasks} tasks.`);
      const ids = new Set<string>();
      spec.tasks.forEach((task, index) => {
        assertRecord(task, `Gantt task ${index + 1}`);
        assertOnlyKeys(task, ["id", "label", "start", "end", "group"], `Gantt task ${index + 1}`);
        const id = requiredText(task.id, `Gantt task ${index + 1} id`);
        if (ids.has(id)) throw new Error(`Gantt task IDs must be unique; duplicate ID: ${id}.`);
        ids.add(id);
        requiredText(task.label, `Gantt task ${index + 1} label`);
        const start = finite(task.start, `Gantt task ${index + 1} start`);
        const end = finite(task.end, `Gantt task ${index + 1} end`);
        if (end < start) throw new Error(`Gantt task ${id} end must be greater than or equal to start.`);
        if (task.group !== undefined) requiredText(task.group, `Gantt task ${index + 1} group`);
      });
      return { dataPointCount: spec.tasks.length, seriesCount: 1, categoryCount: spec.tasks.length };
    }
    case "funnel": {
      assertOnlyKeys(spec, [...BASE_KEYS, "stages"], "Funnel exhibit");
      assertArray(spec.stages, "Funnel stages");
      if (spec.stages.length < 1 || spec.stages.length > EXHIBIT_LIMITS.maxFunnelStages) throw new Error(`Funnel stages must contain 1-${EXHIBIT_LIMITS.maxFunnelStages} stages.`);
      spec.stages.forEach((stage, index) => {
        assertRecord(stage, `Funnel stage ${index + 1}`);
        assertOnlyKeys(stage, ["label", "value"], `Funnel stage ${index + 1}`);
        requiredText(stage.label, `Funnel stage ${index + 1} label`);
        finite(stage.value, `Funnel stage ${index + 1} value`);
      });
      return { dataPointCount: spec.stages.length, seriesCount: 1, categoryCount: spec.stages.length };
    }
    default:
      throw new Error(`Unsupported exhibit kind: ${kind}.`);
  }
}
