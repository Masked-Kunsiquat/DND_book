/**
 * Helpers for creating shadow entities from mention input.
 */

import { useCallback } from 'react';
import { useCurrentCampaign } from './useCampaigns';
import { useCreateNpc } from './useNpcs';
import { useCreateLocation } from './useLocations';
import { useCreateItem } from './useItems';
import { useGetOrCreateTag } from './useTags';
import type { EntityScope } from '../types/schema';

export type ShadowEntityType = 'character' | 'location' | 'item' | 'tag';

export interface ShadowEntityResult {
  id: string;
}

export interface UseShadowEntitiesResult {
  createShadowEntity: (type: ShadowEntityType, name: string) => string;
}

/**
 * Select the entity scope based on whether a campaign identifier is present.
 *
 * @param campaignId - The current campaign's identifier; omit or `undefined` when no campaign context exists.
 * @returns `campaign` if `campaignId` is truthy, `continuity` otherwise.
 */
function resolveScope(campaignId?: string): EntityScope {
  return campaignId ? 'campaign' : 'continuity';
}

/**
 * Creates placeholder ("shadow") entities for mentions that reference new resources.
 *
 * @returns An object with `createShadowEntity(type, name)` that creates a shadow entity of the given type (`'character' | 'location' | 'item' | 'tag'`) and returns the new entity's id; returns an empty string if the normalized name is empty or no entity is created.
 */
export function useShadowEntities(): UseShadowEntitiesResult {
  const currentCampaign = useCurrentCampaign();
  const campaignId = currentCampaign?.id || '';
  const continuityId = currentCampaign?.continuityId || '';
  const scope = resolveScope(campaignId);

  const createNpc = useCreateNpc();
  const createLocation = useCreateLocation();
  const createItem = useCreateItem();
  const getOrCreateTag = useGetOrCreateTag({
    continuityId,
    campaignId,
    scope,
  });

  const createShadowEntity = useCallback(
    (type: ShadowEntityType, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return '';
      const campaignIds = campaignId ? [campaignId] : [];

      switch (type) {
        case 'character':
          return createNpc({
            name: trimmed,
            status: 'shadow',
            scope,
            continuityId,
            campaignIds,
          });
        case 'location':
          return createLocation({
            name: trimmed,
            status: 'shadow',
            scope,
            continuityId,
            campaignIds,
          });
        case 'item':
          return createItem({
            name: trimmed,
            status: 'shadow',
            scope,
            continuityId,
            campaignIds,
          });
        case 'tag':
          return getOrCreateTag(trimmed);
        default:
          return '';
      }
    },
    [campaignId, continuityId, createItem, createLocation, createNpc, getOrCreateTag, scope]
  );

  return { createShadowEntity };
}