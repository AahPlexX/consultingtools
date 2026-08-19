export interface PearsonCorrelationResult {
  count: number;
  correlation: number;
  formula: string;
}

export interface SpearmanCorrelationResult extends PearsonCorrelationResult {
  ranksX: number[];
  ranksY: number[];
  rankConvention: string;
}

function validatePair(x: readonly number[], y: readonly number[]): void {
  if (x.length !== y.length) throw new Error("x and y must have the same length.");
  if (x.length < 2) throw new Error("Correlation requires at least two paired observations.");
  x.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new Error(`x[${index}] must be finite.`);
  });
  y.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new Error(`y[${index}] must be finite.`);
  });
}

function finiteResult(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must remain finite.`);
  return value;
}

export function calculatePearsonCorrelation(
  x: readonly number[],
  y: readonly number[],
): PearsonCorrelationResult {
  validatePair(x, y);

  let sumX = 0;
  let sumY = 0;
  for (let index = 0; index < x.length; index += 1) {
    sumX += x[index] as number;
    sumY += y[index] as number;
  }
  const meanX = sumX / x.length;
  const meanY = sumY / y.length;

  let cross = 0;
  let squareX = 0;
  let squareY = 0;
  for (let index = 0; index < x.length; index += 1) {
    const centeredX = (x[index] as number) - meanX;
    const centeredY = (y[index] as number) - meanY;
    cross += centeredX * centeredY;
    squareX += centeredX * centeredX;
    squareY += centeredY * centeredY;
  }

  if (squareX === 0 || squareY === 0) {
    throw new Error("Pearson correlation is undefined when either input has zero variance.");
  }

  const correlation = finiteResult(cross / Math.sqrt(squareX * squareY), "correlation");
  const boundedCorrelation = Math.max(-1, Math.min(1, correlation));
  return {
    count: x.length,
    correlation: boundedCorrelation,
    formula:
      "sum((x - meanX)(y - meanY)) / sqrt(sum((x - meanX)^2) * sum((y - meanY)^2))",
  };
}

function averageRanks(values: readonly number[]): number[] {
  const indexed = values
    .map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value || left.index - right.index);
  const ranks = new Array<number>(values.length);

  let start = 0;
  while (start < indexed.length) {
    let end = start + 1;
    while (end < indexed.length && indexed[end]?.value === indexed[start]?.value) end += 1;
    const averageRank = (start + 1 + end) / 2;
    for (let position = start; position < end; position += 1) {
      const item = indexed[position];
      if (item) ranks[item.index] = averageRank;
    }
    start = end;
  }
  return ranks;
}

export function calculateSpearmanCorrelation(
  x: readonly number[],
  y: readonly number[],
): SpearmanCorrelationResult {
  validatePair(x, y);
  const ranksX = averageRanks(x);
  const ranksY = averageRanks(y);
  const pearson = calculatePearsonCorrelation(ranksX, ranksY);
  return {
    ...pearson,
    ranksX,
    ranksY,
    rankConvention: "Tied observations receive the arithmetic mean of their occupied 1-based ranks.",
  };
}
