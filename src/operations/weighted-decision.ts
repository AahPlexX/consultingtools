export interface WeightedCriterionInput {
  id: string;
  weight: number;
}

export interface WeightedOptionInput {
  id: string;
  scores: Readonly<Record<string, number>>;
}

export interface WeightedDecisionInput {
  criteria: readonly WeightedCriterionInput[];
  options: readonly WeightedOptionInput[];
}

export function calculateWeightedDecision(input: WeightedDecisionInput) {
  if (input.criteria.length === 0) throw new Error("criteria must contain at least one criterion.");
  if (input.options.length === 0) throw new Error("options must contain at least one option.");

  const criterionIds = new Set<string>();
  let totalWeight = 0;
  for (const [index, criterion] of input.criteria.entries()) {
    if (!criterion.id.trim()) throw new Error(`criteria[${index}].id must not be blank.`);
    if (criterionIds.has(criterion.id)) throw new Error(`Duplicate criterion id: ${criterion.id}.`);
    criterionIds.add(criterion.id);
    if (!Number.isFinite(criterion.weight) || criterion.weight < 0) {
      throw new Error(`criteria[${index}].weight must be finite and non-negative.`);
    }
    totalWeight += criterion.weight;
  }
  if (!(totalWeight > 0) || !Number.isFinite(totalWeight)) {
    throw new Error("At least one criterion weight must be greater than zero and total weight must remain finite.");
  }

  const criteria = input.criteria.map((criterion) => ({
    ...criterion,
    normalizedWeight: criterion.weight / totalWeight,
  }));

  const optionIds = new Set<string>();
  const scored = input.options.map((option, inputIndex) => {
    if (!option.id.trim()) throw new Error(`options[${inputIndex}].id must not be blank.`);
    if (optionIds.has(option.id)) throw new Error(`Duplicate option id: ${option.id}.`);
    optionIds.add(option.id);

    const scoreKeys = Object.keys(option.scores).sort();
    const expectedKeys = [...criterionIds].sort();
    if (
      scoreKeys.length !== expectedKeys.length ||
      scoreKeys.some((key, index) => key !== expectedKeys[index])
    ) {
      throw new Error(`Option ${option.id} must provide exactly one criterion score for each criterion and no extra scores.`);
    }

    let weightedScore = 0;
    for (const criterion of criteria) {
      const score = option.scores[criterion.id];
      if (!Number.isFinite(score)) {
        throw new Error(`Option ${option.id} score for criterion ${criterion.id} must be finite.`);
      }
      weightedScore += (score as number) * criterion.normalizedWeight;
    }
    if (!Number.isFinite(weightedScore)) throw new Error(`Option ${option.id} weightedScore must remain finite.`);
    return {
      id: option.id,
      scores: { ...option.scores },
      weightedScore,
      inputIndex,
    };
  });

  scored.sort((left, right) => right.weightedScore - left.weightedScore || left.inputIndex - right.inputIndex);
  const options = scored.map(({ inputIndex: _inputIndex, ...option }, index) => ({
    ...option,
    rank: index + 1,
  }));

  return {
    criteria,
    options,
    formula: "weightedScore = sum(score_i * normalizedWeight_i)",
    convention:
      "Scores must be already comparable on a common decision scale. The engine normalizes weights only; it does not convert unlike raw units or infer criterion direction, desirability, or missing scores.",
  };
}
