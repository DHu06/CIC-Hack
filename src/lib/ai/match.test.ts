import { describe, it, expect } from "vitest";
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
