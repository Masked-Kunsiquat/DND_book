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

function resolveScope(campaignId?: string): EntityScope {
  return campaignId ? 'campaign' : 'continuity';
}

/**
 * Hook to create placeholder entities when mentions reference something new.
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
