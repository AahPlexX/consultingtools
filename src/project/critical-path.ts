export interface CriticalPathActivityInput {
  id: string;
  duration: number;
  predecessorIds: readonly string[];
}

export interface CriticalPathInput {
  activities: readonly CriticalPathActivityInput[];
}

export interface CriticalPathActivityResult {
  id: string;
  duration: number;
  predecessorIds: string[];
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  totalFloat: number;
  critical: boolean;
}

export interface CriticalPathResult {
  projectDuration: number;
  topologicalOrder: string[];
  activities: CriticalPathActivityResult[];
  criticalActivityIds: string[];
  criticalPaths: string[][];
  criticalPathsTruncated: boolean;
  convention: string;
}

const MAX_ACTIVITIES = 10_000;
const MAX_CRITICAL_PATHS = 1_000;

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite number greater than or equal to zero.`);
  }
}

function almostEqual(left: number, right: number, scale: number): boolean {
  return Math.abs(left - right) <= 1e-10 * Math.max(1, scale);
}

export function calculateCriticalPath(input: CriticalPathInput): CriticalPathResult {
  if (input.activities.length === 0) {
    throw new Error("activities must contain at least one activity.");
  }
  if (input.activities.length > MAX_ACTIVITIES) {
    throw new Error(`activities may contain at most ${MAX_ACTIVITIES} activities.`);
  }

  const byId = new Map<string, CriticalPathActivityInput>();
  const indexById = new Map<string, number>();
  input.activities.forEach((activity, index) => {
    if (!activity.id.trim()) throw new Error(`activities[${index}].id must not be blank.`);
    if (byId.has(activity.id)) throw new Error(`Duplicate activity id: ${activity.id}.`);
    finiteNonNegative(activity.duration, `Activity ${activity.id} duration`);
    if (new Set(activity.predecessorIds).size !== activity.predecessorIds.length) {
      throw new Error(`Activity ${activity.id} contains a duplicate predecessor id.`);
    }
    byId.set(activity.id, activity);
    indexById.set(activity.id, index);
  });

  const successors = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const activity of input.activities) {
    successors.set(activity.id, []);
    indegree.set(activity.id, activity.predecessorIds.length);
  }
  for (const activity of input.activities) {
    for (const predecessorId of activity.predecessorIds) {
      if (!byId.has(predecessorId)) {
        throw new Error(`Activity ${activity.id} references unknown predecessor ${predecessorId}.`);
      }
      successors.get(predecessorId)?.push(activity.id);
    }
  }

  const ready = input.activities
    .filter((activity) => (indegree.get(activity.id) ?? 0) === 0)
    .map(({ id }) => id);
  const topologicalOrder: string[] = [];
  while (ready.length > 0) {
    ready.sort((left, right) => (indexById.get(left) ?? 0) - (indexById.get(right) ?? 0));
    const id = ready.shift();
    if (id === undefined) break;
    topologicalOrder.push(id);
    for (const successorId of successors.get(id) ?? []) {
      const next = (indegree.get(successorId) ?? 0) - 1;
      indegree.set(successorId, next);
      if (next === 0) ready.push(successorId);
    }
  }
  if (topologicalOrder.length !== input.activities.length) {
    throw new Error("Activity dependency graph contains a cycle.");
  }

  const earlyStart = new Map<string, number>();
  const earlyFinish = new Map<string, number>();
  let projectDuration = 0;
  for (const id of topologicalOrder) {
    const activity = byId.get(id);
    if (!activity) throw new Error(`Internal activity lookup failed for ${id}.`);
    let start = 0;
    for (const predecessorId of activity.predecessorIds) {
      start = Math.max(start, earlyFinish.get(predecessorId) ?? 0);
    }
    const finish = start + activity.duration;
    if (!Number.isFinite(finish)) throw new Error(`Activity ${id} early finish must remain finite.`);
    earlyStart.set(id, start);
    earlyFinish.set(id, finish);
    projectDuration = Math.max(projectDuration, finish);
  }

  const lateStart = new Map<string, number>();
  const lateFinish = new Map<string, number>();
  for (let index = topologicalOrder.length - 1; index >= 0; index -= 1) {
    const id = topologicalOrder[index] as string;
    const activity = byId.get(id);
    if (!activity) throw new Error(`Internal activity lookup failed for ${id}.`);
    const activitySuccessors = successors.get(id) ?? [];
    let finish = projectDuration;
    if (activitySuccessors.length > 0) {
      finish = Math.min(...activitySuccessors.map((successorId) => lateStart.get(successorId) ?? projectDuration));
    }
    const start = finish - activity.duration;
    lateFinish.set(id, finish);
    lateStart.set(id, start);
  }

  const toleranceScale = projectDuration;
  const activityResults = topologicalOrder.map((id) => {
    const activity = byId.get(id) as CriticalPathActivityInput;
    const es = earlyStart.get(id) as number;
    const ef = earlyFinish.get(id) as number;
    const ls = lateStart.get(id) as number;
    const lf = lateFinish.get(id) as number;
    const rawFloat = ls - es;
    const totalFloat = almostEqual(rawFloat, 0, toleranceScale) ? 0 : rawFloat;
    return {
      id,
      duration: activity.duration,
      predecessorIds: [...activity.predecessorIds],
      earlyStart: es,
      earlyFinish: ef,
      lateStart: ls,
      lateFinish: lf,
      totalFloat,
      critical: totalFloat === 0,
    };
  });
  const resultById = new Map(activityResults.map((activity) => [activity.id, activity]));
  const criticalActivityIds = activityResults.filter(({ critical }) => critical).map(({ id }) => id);

  const criticalPaths: string[][] = [];
  let criticalPathsTruncated = false;
  const criticalEnds = activityResults.filter(
    ({ id, critical, earlyFinish: finish }) =>
      critical &&
      (successors.get(id)?.length ?? 0) === 0 &&
      almostEqual(finish, projectDuration, toleranceScale),
  );

  const visitBackward = (currentId: string, reversedPath: string[]): void => {
    if (criticalPaths.length >= MAX_CRITICAL_PATHS) {
      criticalPathsTruncated = true;
      return;
    }
    const current = resultById.get(currentId);
    const source = byId.get(currentId);
    if (!current || !source) return;
    const eligiblePredecessors = source.predecessorIds.filter((predecessorId) => {
      const predecessor = resultById.get(predecessorId);
      return (
        predecessor?.critical === true &&
        almostEqual(predecessor.earlyFinish, current.earlyStart, toleranceScale)
      );
    });
    if (eligiblePredecessors.length === 0) {
      criticalPaths.push([currentId, ...reversedPath]);
      return;
    }
    for (const predecessorId of eligiblePredecessors) {
      visitBackward(predecessorId, [currentId, ...reversedPath]);
      if (criticalPathsTruncated) return;
    }
  };

  for (const end of criticalEnds) {
    visitBackward(end.id, []);
    if (criticalPathsTruncated) break;
  }

  return {
    projectDuration,
    topologicalOrder,
    activities: activityResults,
    criticalActivityIds,
    criticalPaths,
    criticalPathsTruncated,
    convention:
      "Activity-on-node critical-path calculation using finish-to-start, zero-lag dependencies in one caller-defined duration unit. No calendars, resource leveling, leads/lags, or alternative dependency types are inferred.",
  };
}
