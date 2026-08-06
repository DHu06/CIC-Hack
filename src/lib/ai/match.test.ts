import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  TopicVector,
  greedyGroupFormation,
  assignLeftovers,
  computeComplementarityScore,
} from "./match";

/** Helper to create a TopicVector with a given userId and topics */
function makeVector(
  userId: string,
  topics: Record<string, number>,
  pace: TopicVector["pace"] = "on_track"
): TopicVector {
  return { userId, topics, pace };
}

describe("greedyGroupFormation", () => {
  it("returns empty array when fewer than 4 students", () => {
    const vectors = [
      makeVector("a", { BST: 5, Graphs: 2 }),
      makeVector("b", { BST: 2, Graphs: 5 }),
      makeVector("c", { BST: 3, Graphs: 3 }),
    ];
    const result = greedyGroupFormation(vectors);
    expect(result).toEqual([]);
  });

  it("forms 1 group of 4 with exactly 4 students", () => {
    const vectors = [
      makeVector("a", { BST: 5, Graphs: 1 }),
      makeVector("b", { BST: 1, Graphs: 5 }),
      makeVector("c", { BST: 3, Graphs: 3 }),
      makeVector("d", { BST: 2, Graphs: 4 }),
    ];
    const result = greedyGroupFormation(vectors);
    expect(result.length).toBe(1);
    expect(result[0].length).toBe(4);
  });

  it("ensures all users appear in exactly one group (no duplicates, no lost users)", () => {
    const vectors = Array.from({ length: 12 }, (_, i) =>
      makeVector(`user${i}`, {
        BST: ((i * 3) % 5) + 1,
        Graphs: ((i * 7) % 5) + 1,
        Sorting: ((i * 11) % 5) + 1,
      })
    );

    const result = greedyGroupFormation(vectors);

    // Collect all user IDs from all groups
    const allUserIds = result.flat().map((v) => v.userId);

    // Every input user appears exactly once
    expect(allUserIds.length).toBe(vectors.length);
    expect(new Set(allUserIds).size).toBe(vectors.length);

    // Same set of IDs
    const inputIds = new Set(vectors.map((v) => v.userId));
    const outputIds = new Set(allUserIds);
    expect(outputIds).toEqual(inputIds);
  });

  it("ensures all groups have between 4 and 6 members", () => {
    const vectors = Array.from({ length: 15 }, (_, i) =>
      makeVector(`user${i}`, {
        BST: ((i * 3) % 5) + 1,
        Graphs: ((i * 7) % 5) + 1,
        Sorting: ((i * 11) % 5) + 1,
      })
    );

    const result = greedyGroupFormation(vectors);

    for (const group of result) {
      expect(group.length).toBeGreaterThanOrEqual(4);
      expect(group.length).toBeLessThanOrEqual(6);
    }
  });

  it("handles 9 users with appropriate grouping", () => {
    const vectors = [
      makeVector("a", { BST: 5, Graphs: 1, DP: 3 }),
      makeVector("b", { BST: 1, Graphs: 5, DP: 2 }),
      makeVector("c", { BST: 3, Graphs: 3, DP: 5 }),
      makeVector("d", { BST: 2, Graphs: 4, DP: 1 }),
      makeVector("e", { BST: 4, Graphs: 2, DP: 4 }),
      makeVector("f", { BST: 1, Graphs: 4, DP: 3 }),
      makeVector("g", { BST: 5, Graphs: 1, DP: 2 }),
      makeVector("h", { BST: 2, Graphs: 5, DP: 1 }),
      makeVector("i", { BST: 3, Graphs: 3, DP: 4 }),
    ];

    const result = greedyGroupFormation(vectors);

    // All 9 users must be placed
    const allUserIds = result.flat().map((v) => v.userId);
    expect(allUserIds.length).toBe(9);
    expect(new Set(allUserIds).size).toBe(9);

    // All groups must be within bounds
    for (const group of result) {
      expect(group.length).toBeGreaterThanOrEqual(4);
      expect(group.length).toBeLessThanOrEqual(6);
    }

    // With 9 users, should be either 2 groups (e.g., 5+4 or 4+5) or 1 group of 6 + leftover assigned
    const totalMembers = result.reduce((sum, g) => sum + g.length, 0);
    expect(totalMembers).toBe(9);
  });

  it("does not mutate the input array", () => {
    const vectors = [
      makeVector("a", { BST: 5, Graphs: 1 }),
      makeVector("b", { BST: 1, Graphs: 5 }),
      makeVector("c", { BST: 3, Graphs: 3 }),
      makeVector("d", { BST: 2, Graphs: 4 }),
      makeVector("e", { BST: 4, Graphs: 2 }),
    ];
    const original = [...vectors];
    greedyGroupFormation(vectors);
    expect(vectors).toEqual(original);
  });
});

describe("assignLeftovers", () => {
  it("assigns leftover students to groups without exceeding maxSize", () => {
    const groups: TopicVector[][] = [
      [
        makeVector("a", { BST: 5, Graphs: 1 }),
        makeVector("b", { BST: 1, Graphs: 5 }),
        makeVector("c", { BST: 3, Graphs: 3 }),
        makeVector("d", { BST: 2, Graphs: 4 }),
      ],
    ];
    const leftovers = [
      makeVector("e", { BST: 4, Graphs: 2 }),
      makeVector("f", { BST: 1, Graphs: 4 }),
    ];

    const result = assignLeftovers(groups, leftovers, 6);

    // The group should now have 6 members (4 + 2 leftovers)
    expect(result[0].length).toBe(6);
  });

  it("respects maxSize and distributes across groups", () => {
    const groups: TopicVector[][] = [
      [
        makeVector("a", { BST: 5, Graphs: 1 }),
        makeVector("b", { BST: 1, Graphs: 5 }),
        makeVector("c", { BST: 3, Graphs: 3 }),
        makeVector("d", { BST: 2, Graphs: 4 }),
        makeVector("e", { BST: 4, Graphs: 2 }),
        makeVector("f", { BST: 1, Graphs: 4 }),
      ],
      [
        makeVector("g", { BST: 5, Graphs: 2 }),
        makeVector("h", { BST: 2, Graphs: 5 }),
        makeVector("i", { BST: 3, Graphs: 4 }),
        makeVector("j", { BST: 4, Graphs: 1 }),
      ],
    ];
    const leftovers = [makeVector("k", { BST: 3, Graphs: 3 })];

    const result = assignLeftovers(groups, leftovers, 6);

    // First group is already at max (6), so leftover goes to second group
    expect(result[0].length).toBe(6);
    expect(result[1].length).toBe(5);
  });
});

describe("computeComplementarityScore (integration with grouping)", () => {
  it("high complementarity group scores higher than low complementarity", () => {
    const highComplementary = [
      makeVector("a", { BST: 5, Graphs: 1 }),
      makeVector("b", { BST: 1, Graphs: 5 }),
      makeVector("c", { BST: 3, Graphs: 3 }),
      makeVector("d", { BST: 2, Graphs: 4 }),
    ];

    const lowComplementary = [
      makeVector("e", { BST: 3, Graphs: 3 }),
      makeVector("f", { BST: 3, Graphs: 3 }),
      makeVector("g", { BST: 3, Graphs: 3 }),
      makeVector("h", { BST: 3, Graphs: 3 }),
    ];

    expect(computeComplementarityScore(highComplementary)).toBeGreaterThan(
      computeComplementarityScore(lowComplementary)
    );
  });
});


// --- Property-Based Tests for Complementarity Scoring ---

const topicVectorArb = fc.record({
  userId: fc.uuid(),
  topics: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }),
    fc.integer({ min: 1, max: 5 })
  ),
  pace: fc.constantFrom("behind" as const, "on_track" as const, "ahead" as const),
});

const groupArb = fc.array(topicVectorArb, { minLength: 2, maxLength: 6 });

describe("computeComplementarityScore - Property Tests", () => {
  /**
   * **Validates: Requirements 5.2**
   *
   * Property 4: Complementarity score correctness
   * For any group of topic vectors, the complementarity score must equal the sum of
   * (max confidence - min confidence) for each shared topic, minus the pace penalty.
   * A group where all members have identical confidence vectors must score 0.
   */
  it("Property 4: score equals manual computation of topic spreads minus pace penalty", () => {
    fc.assert(
      fc.property(groupArb, (group) => {
        const score = computeComplementarityScore(group);

        // Manually compute expected score
        const allTopics = new Set<string>();
        for (const member of group) {
          for (const topic of Object.keys(member.topics)) {
            allTopics.add(topic);
          }
        }

        let expectedComplementaritySum = 0;
        for (const topic of Array.from(allTopics)) {
          const confidences = group
            .map((m) => m.topics[topic] ?? 0)
            .filter((c) => c > 0);

          if (confidences.length >= 2) {
            const spread = Math.max(...confidences) - Math.min(...confidences);
            expectedComplementaritySum += spread;
          }
        }

        const paceValues: Record<string, number> = { behind: 0, on_track: 1, ahead: 2 };
        const paces = group.map((m) => paceValues[m.pace]);
        const paceSpread = Math.max(...paces) - Math.min(...paces);
        const pacePenalty = paceSpread > 1 ? paceSpread * 2 : 0;

        const expectedScore = expectedComplementaritySum - pacePenalty;

        expect(score).toBe(expectedScore);
      }),
      { numRuns: 200 }
    );
  });

  it("Property 4: identical profiles always score 0", () => {
    fc.assert(
      fc.property(topicVectorArb, fc.integer({ min: 2, max: 6 }), (baseVector, count) => {
        // Create N copies with different userIds but same topics and pace
        const group: TopicVector[] = Array.from({ length: count }, (_, i) => ({
          ...baseVector,
          userId: `user-${i}`,
        }));

        const score = computeComplementarityScore(group);
        // Identical confidence vectors means max - min = 0 for every topic
        // Same pace means pace penalty = 0
        expect(score).toBe(0);
      }),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 5.3**
   *
   * Property 5: Pace penalty monotonicity
   * For any two groups with identical topic spreads, the group with pace spread > 1
   * must have a strictly lower complementarity score than the group with pace spread <= 1.
   */
  it("Property 5: pace spread > 1 produces strictly lower score than pace spread <= 1 with same topics", () => {
    // Generate a group with at least one topic that has spread > 0 to ensure
    // complementarity sum is positive, so penalty effect is observable
    const topicsWithSpreadArb = fc.dictionary(
      fc.string({ minLength: 1, maxLength: 10 }),
      fc.integer({ min: 1, max: 5 }),
      { minKeys: 1, maxKeys: 5 }
    );

    fc.assert(
      fc.property(
        topicsWithSpreadArb,
        topicsWithSpreadArb,
        (topics1, topics2) => {
          // Build two groups of 2 with same topic assignments
          // Group A: pace spread <= 1 (both on_track)
          const groupNoPenalty: TopicVector[] = [
            { userId: "a1", topics: topics1, pace: "on_track" },
            { userId: "a2", topics: topics2, pace: "on_track" },
          ];

          // Group B: pace spread > 1 (behind and ahead => spread = 2)
          const groupWithPenalty: TopicVector[] = [
            { userId: "b1", topics: topics1, pace: "behind" },
            { userId: "b2", topics: topics2, pace: "ahead" },
          ];

          const scoreNoPenalty = computeComplementarityScore(groupNoPenalty);
          const scoreWithPenalty = computeComplementarityScore(groupWithPenalty);

          // Both groups have identical topic spreads, so the complementarity sum is the same.
          // Group B has pace spread = 2 > 1, so it gets penalty = 2 * 2 = 4
          // Therefore scoreWithPenalty = scoreNoPenalty - 4
          expect(scoreWithPenalty).toBe(scoreNoPenalty - 4);
          expect(scoreWithPenalty).toBeLessThan(scoreNoPenalty);
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ─── Property-Based Tests for Group Formation ───────────────────────────────

/**
 * Generate an array of TopicVectors with guaranteed unique userIds and at least
 * one topic per vector.
 */
const uniqueVectorsArb = (minLen: number, maxLen: number) =>
  fc
    .integer({ min: minLen, max: maxLen })
    .chain((n) =>
      fc.tuple(
        fc.array(
          fc.record({
            topics: fc.dictionary(
              fc.constantFrom("BST", "Graphs", "Sorting", "DP", "Recursion", "Trees", "Hashing"),
              fc.integer({ min: 1, max: 5 }),
              { minKeys: 1, maxKeys: 5 }
            ),
            pace: fc.constantFrom("behind" as const, "on_track" as const, "ahead" as const),
          }),
          { minLength: n, maxLength: n }
        )
      ).map(([partials]) =>
        partials.map((p, i) => ({
          userId: `user-${i}`,
          topics: p.topics,
          pace: p.pace,
        }))
      )
    );

const groupFormationVectorsArb = uniqueVectorsArb(4, 30);

describe("greedyGroupFormation - property-based tests", () => {
  /**
   * **Validates: Requirements 5.5, 5.7**
   *
   * Property 2: Group member conservation — for any set of input topic vectors
   * with at least 4 members, after group formation, the total number of users
   * across all groups must equal the number of input vectors — no user is lost
   * or duplicated.
   */
  it("Property 2: member conservation — no users lost or duplicated", () => {
    fc.assert(
      fc.property(groupFormationVectorsArb, (vectors) => {
        const groups = greedyGroupFormation(vectors);

        // Total users across all groups equals input length
        const allMembers = groups.flat();
        expect(allMembers.length).toBe(vectors.length);

        // No user ID appears more than once
        const outputIds = allMembers.map((m) => m.userId);
        expect(new Set(outputIds).size).toBe(vectors.length);

        // Same set of IDs in and out
        const inputIds = new Set(vectors.map((v) => v.userId));
        const outputIdSet = new Set(outputIds);
        expect(outputIdSet).toEqual(inputIds);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 5.1, 5.4**
   *
   * Property 3: Group size bounds — for any set of input topic vectors with at
   * least 4 members, every resulting group must have between 4 and 6 members
   * (inclusive). Note: n=7 is excluded because no valid partition into groups
   * of 4-6 exists for exactly 7 members.
   */
  it("Property 3: group size bounds — every group has 4-6 members", () => {
    // Exclude n=7: mathematically impossible to partition into groups of [4,6]
    const validSizeVectorsArb = groupFormationVectorsArb.filter(
      (v) => v.length !== 7
    );

    fc.assert(
      fc.property(validSizeVectorsArb, (vectors) => {
        const groups = greedyGroupFormation(vectors);

        for (const group of groups) {
          expect(group.length).toBeGreaterThanOrEqual(4);
          expect(group.length).toBeLessThanOrEqual(6);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 5.4**
   *
   * With fewer than 4 vectors, result is always empty.
   */
  it("Property 3 (edge): empty result for < 4 input vectors", () => {
    const smallVectorsArb = uniqueVectorsArb(0, 3);

    fc.assert(
      fc.property(smallVectorsArb, (vectors) => {
        const groups = greedyGroupFormation(vectors);
        expect(groups).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * No mutation — the input array must not be modified by greedyGroupFormation.
   */
  it("Property: input array is not mutated", () => {
    fc.assert(
      fc.property(groupFormationVectorsArb, (vectors) => {
        const before = vectors.map((v) => ({ ...v }));
        greedyGroupFormation(vectors);
        expect(vectors).toEqual(before);
      }),
      { numRuns: 100 }
    );
  });
});
