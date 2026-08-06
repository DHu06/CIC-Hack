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
 * Compute target group sizes that ensure all members are placed in groups
 * of minSize to maxSize members.
 *
 * For any n >= minSize, finds a partition into groups where each group
 * has between minSize and maxSize members.
 *
 * @param n - Total number of members
 * @param minSize - Minimum group size
 * @param maxSize - Maximum group size
 * @returns Array of target sizes for each group, or empty if impossible
 */
function computeGroupSizes(
  n: number,
  minSize: number,
  maxSize: number
): number[] {
  if (n < minSize) return [];

  // Try to partition n into groups of minSize to maxSize
  // Strategy: use as many groups of minSize as possible, then distribute remainder
  const numGroups = Math.ceil(n / maxSize);
  const baseSize = Math.floor(n / numGroups);
  const extra = n - baseSize * numGroups;

  const sizes: number[] = [];
  for (let i = 0; i < numGroups; i++) {
    sizes.push(baseSize + (i < extra ? 1 : 0));
  }

  // Verify all sizes are within bounds
  if (sizes.every((s) => s >= minSize && s <= maxSize)) {
    return sizes;
  }

  // Fallback: try different number of groups
  for (let g = Math.ceil(n / maxSize); g <= Math.floor(n / minSize); g++) {
    const base = Math.floor(n / g);
    const remainder = n - base * g;
    const attempt = Array.from({ length: g }, (_, i) =>
      base + (i < remainder ? 1 : 0)
    );
    if (attempt.every((s) => s >= minSize && s <= maxSize)) {
      return attempt;
    }
  }

  // If truly impossible (shouldn't happen for reasonable inputs), 
  // use a single group allowing slight overflow
  return [n];
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
 * 3. Compute target group sizes to ensure all members are placed
 * 4. For each target size: seed a group, greedily add best-scoring members
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
  const targetSizes = computeGroupSizes(vectors.length, minSize, maxSize);
  const groups: TopicVector[][] = [];

  for (const targetSize of targetSizes) {
    if (remaining.length === 0) break;

    // Take the first remaining user as seed
    const seed = remaining.shift()!;
    const group: TopicVector[] = [seed];

    // Greedily add members that maximize complementarity until target size
    while (group.length < targetSize && remaining.length > 0) {
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

      group.push(remaining.splice(bestIdx, 1)[0]);
    }

    groups.push(group);
  }

  // Safety: assign any unexpected leftovers (shouldn't happen with correct sizing)
  if (remaining.length > 0 && groups.length > 0) {
    assignLeftovers(groups, remaining, maxSize);
  }

  return groups;
}
