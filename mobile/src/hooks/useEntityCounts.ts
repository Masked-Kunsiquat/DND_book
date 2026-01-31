/**
 * Hook for counting entities by campaign ID.
 *
 * Provides a generic way to count how many entities belong to each campaign,
 * useful for displaying counts on campaign cards.
 */

import { useMemo } from 'react';

/**
 * Counts entities by campaign ID using a provided extractor function.
 *
 * The extractor should return an array of campaign IDs that the entity belongs to.
 * Returns a Map where keys are campaign IDs and values are counts.
 *
 * @param entities - Array of entities to count
 * @param getCampaignIds - Function that extracts campaign IDs from an entity
 * @returns A Map of campaign ID to count
 *
 * @example
 * // Simple case: entity has campaignIds array
 * const npcCounts = useEntityCounts(npcs, (npc) => npc.campaignIds);
 *
 * @example
 * // Complex case: notes have different behavior based on scope
 * const noteCounts = useEntityCounts(notes, (note) =>
 *   note.scope === 'campaign' ? [note.campaignId] : note.campaignIds
 * );
 */
export function useEntityCounts<T>(
  entities: T[],
  getCampaignIds: (entity: T) => string[]
): Map<string, number> {
  return useMemo(() => {
    const counts = new Map<string, number>();
    entities.forEach((entity) => {
      const ids = getCampaignIds(entity);
      ids.forEach((id) => {
        if (!id) return;
        counts.set(id, (counts.get(id) || 0) + 1);
      });
    });
    return counts;
  }, [entities, getCampaignIds]);
}
