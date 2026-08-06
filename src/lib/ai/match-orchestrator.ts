/**
 * DEPRECATED: Group matching orchestrator has been moved to the Lambda backend.
 * This stub remains for type compatibility during migration.
 */

import { z } from "zod";
import {
  TopicVector,
  greedyGroupFormation,
  computeComplementarityScore,
} from "./match";

/**
 * Result returned for each formed study group.
 */
export interface GroupMatchResult {
  members: string[];
  name: string;
  rationale: string;
  score: number;
  groupId: string;
}

/**
 * Zod schema for the AI group naming response.
 */
export const GroupNamingSchema = z.object({
  name: z.string(),
  rationale: z.string(),
});

export type GroupNaming = z.infer<typeof GroupNamingSchema>;

/**
 * DEPRECATED: matchGroups now lives in the Lambda backend.
 * This stub remains for type compatibility during migration.
 */
export async function matchGroups(_courseId: string): Promise<GroupMatchResult[]> {
  throw new Error(
    "matchGroups has been moved to the Lambda backend. Use the API client instead."
  );
}

// Re-export for test compatibility
export { greedyGroupFormation, computeComplementarityScore };
export type { TopicVector };
