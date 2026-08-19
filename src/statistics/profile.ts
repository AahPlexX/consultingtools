export type ObservedColumnType =
  | "finite-number"
  | "non-finite-number"
  | "string"
  | "blank-string"
  | "boolean"
  | "array"
  | "object"
  | "other";

export interface ColumnProfileCounts {
  missing: number;
  finiteNumber: number;
  nonFiniteNumber: number;
  string: number;
  blankString: number;
  boolean: number;
  array: number;
  object: number;
  other: number;
}

export interface ColumnProfileResult {
  totalCount: number;
  nonMissingCount: number;
  missingCount: number;
  counts: ColumnProfileCounts;
  observedTypes: ObservedColumnType[];
  numericClean: boolean;
  uniquePrimitiveCount: number | null;
  uniqueCountTruncated: boolean;
  convention: string;
}

const MAX_UNIQUE_PRIMITIVES = 10_000;
const typeOrder: readonly ObservedColumnType[] = [
  "finite-number",
  "non-finite-number",
  "string",
  "blank-string",
  "boolean",
  "array",
  "object",
  "other",
];

function primitiveKey(value: string | number | boolean): string {
  return `${typeof value}:${String(value)}`;
}

export function profileColumn(values: readonly unknown[]): ColumnProfileResult {
  const counts: ColumnProfileCounts = {
    missing: 0,
    finiteNumber: 0,
    nonFiniteNumber: 0,
    string: 0,
    blankString: 0,
    boolean: 0,
    array: 0,
    object: 0,
    other: 0,
  };
  const observed = new Set<ObservedColumnType>();
  const uniquePrimitives = new Set<string>();
  let uniqueCountTruncated = false;

  const trackPrimitive = (value: string | number | boolean) => {
    if (uniqueCountTruncated) return;
    uniquePrimitives.add(primitiveKey(value));
    if (uniquePrimitives.size > MAX_UNIQUE_PRIMITIVES) {
      uniquePrimitives.clear();
      uniqueCountTruncated = true;
    }
  };

  for (const value of values) {
    if (value === null || value === undefined) {
      counts.missing += 1;
      continue;
    }

    if (typeof value === "number") {
      if (Number.isFinite(value)) {
        counts.finiteNumber += 1;
        observed.add("finite-number");
      } else {
        counts.nonFiniteNumber += 1;
        observed.add("non-finite-number");
      }
      trackPrimitive(value);
      continue;
    }

    if (typeof value === "string") {
      if (value.trim().length === 0) {
        counts.blankString += 1;
        observed.add("blank-string");
      } else {
        counts.string += 1;
        observed.add("string");
      }
      trackPrimitive(value);
      continue;
    }

    if (typeof value === "boolean") {
      counts.boolean += 1;
      observed.add("boolean");
      trackPrimitive(value);
      continue;
    }

    if (Array.isArray(value)) {
      counts.array += 1;
      observed.add("array");
      continue;
    }

    if (typeof value === "object") {
      counts.object += 1;
      observed.add("object");
      continue;
    }

    counts.other += 1;
    observed.add("other");
  }

  const missingCount = counts.missing;
  const nonMissingCount = values.length - missingCount;
  const numericClean =
    nonMissingCount > 0 &&
    counts.finiteNumber === nonMissingCount &&
    counts.nonFiniteNumber === 0;

  return {
    totalCount: values.length,
    nonMissingCount,
    missingCount,
    counts,
    observedTypes: typeOrder.filter((type) => observed.has(type)),
    numericClean,
    uniquePrimitiveCount: uniqueCountTruncated ? null : uniquePrimitives.size,
    uniqueCountTruncated,
    convention:
      "null and undefined are missing; NaN and infinities are non-finite numbers; strings and other values are never coerced to numbers.",
  };
}
