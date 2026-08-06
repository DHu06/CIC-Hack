/**
 * Group matching algorithm for StudyHall UBC.
 * Forms complementary study groups by maximizing topic spread diversity.
 */

export interface TopicVector {
  userId: string;
  topics: Record<string, number>; // topic name -> confidence (1-5)
  pace: "behind" | "on_track" | "ahead";
}

const PACE_VALUES: Record<TopicVector["pace"], number> = {
  behind: 0,
  on_track: 1,
  ahead: 2,
};

/**
 * Compute the complementarity score for a group of students.
 *
 * Score = sum of per-topic confidence spread (max - min among members who have that topic)
 *       - pace penalty (if pace spread > 1 step, penalty = paceSpread * 2)
 *
 * Higher scores indicate a more complementary group where members can teach each other.
 *
 * @param group - Array of TopicVector (must have length >= 2)
 * @returns complementarity score (can be negative if pace penalty dominates)
 */
export function computeComplementarityScore(group: TopicVector[]): number {
  if (group.length < 2) {
    return 0;
  }

  // Collect all unique topics across group members
  const allTopics = new Set<string>();
  for (const member of group) {
    for (const topic of Object.keys(member.topics)) {
      allTopics.add(topic);
    }
  }

  // For each topic, compute spread (max - min confidence) among members who have it
  let complementaritySum = 0;
  for (const topic of Array.from(allTopics)) {
    const confidences = group
      .map((m) => m.topics[topic] ?? 0)
      .filter((c) => c > 0); // only members who have this topic

    if (confidences.length >= 2) {
      const spread = Math.max(...confidences) - Math.min(...confidences);
      complementaritySum += spread;
    }
  }

  // Penalize pace differences > 1 step
  const paces = group.map((m) => PACE_VALUES[m.pace]);
  const paceSpread = Math.max(...paces) - Math.min(...paces);
  const pacePenalty = paceSpread > 1 ? paceSpread * 2 : 0;

  return complementaritySum - pacePenalty;
}

/**
 * Assign leftover students to the group where they produce the highest
 * complementarity score, as long as that group hasn't exceeded maxSize.
 *
 * @param groups - Already-formed groups
 * @param leftovers - Students not yet assigned to any group
 * @param maxSize - Maximum allowed group size
 * @returns The groups array with leftovers distributed
 */
export function assignLeftovers(
  groups: TopicVector[][],
  leftovers: TopicVector[],
  maxSize: number
): TopicVector[][] {
  for (const leftover of leftovers) {
    let bestGroupIdx = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length >= maxSize) {
        continue;
      }
      const candidateGroup = [...groups[i], leftover];
      const score = computeComplementarityScore(candidateGroup);
      if (score > bestScore) {
        bestScore = score;
        bestGroupIdx = i;
      }
    }

    if (bestGroupIdx >= 0) {
      groups[bestGroupIdx].push(leftover);
    }
  }

  return groups;
}

/**
 * Greedy group formation algorithm.
 *
 * Forms groups of minSize to maxSize students by greedily adding the member
 * that maximizes complementarity score at each step.
 *
 * Algorithm:
 * 1. If fewer than minSize vectors, return []
 * 2. Copy the input (don't mutate)
 * 3. While remaining >= minSize: seed a group, greedily add best-scoring members
 * 4. Assign leftovers to existing groups
 *
 * Postconditions:
 * - Every input vector appears in exactly one output group
 * - Each group has between minSize and maxSize members
 *
 * @param vectors - All student topic vectors to group
 * @param minSize - Minimum group size (default 4)
 * @param maxSize - Maximum group size (default 6)
 * @returns Array of groups, each group is an array of TopicVectors
 */
export function greedyGroupFormation(
  vectors: TopicVector[],
  minSize: number = 4,
  maxSize: number = 6
): TopicVector[][] {
  if (vectors.length < minSize) {
    return [];
  }

  const remaining = [...vectors];
  const groups: TopicVector[][] = [];

  while (remaining.length >= minSize) {
    // Take the first remaining user as seed
    const seed = remaining.shift()!;
    const group: TopicVector[] = [seed];

    // Greedily add members that maximize complementarity
    while (group.length < maxSize && remaining.length > 0) {
      let bestIdx = -1;
      let bestScore = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = [...group, remaining[i]];
        const score = computeComplementarityScore(candidate);
        if (score > bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }

      // Stop adding if we already have minSize and adding more doesn't improve score
      if (
        group.length >= minSize &&
        bestScore <= computeComplementarityScore(group)
      ) {
        break;
      }

      group.push(remaining.splice(bestIdx, 1)[0]);
    }

    if (group.length >= minSize) {
      groups.push(group);
    } else {
      // Put members back if group couldn't reach minSize
      remaining.push(...group);
      break;
    }
  }

  // Assign any leftovers to the best-scoring existing group
  if (remaining.length > 0 && groups.length > 0) {
    assignLeftovers(groups, remaining, maxSize);
  }

  return groups;
}
