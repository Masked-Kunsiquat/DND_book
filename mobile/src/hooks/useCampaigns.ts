/**
 * React hooks for Campaign CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable, useValue } from 'tinybase/ui-react';
import { useStore } from '../store';
import { buildUpdates, type FieldSchema } from '../utils/entityHelpers';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import type { Campaign, CampaignRow } from '../types/schema';

const log = createLogger('campaigns');

/** Field schema for Campaign updates */
const CAMPAIGN_UPDATE_SCHEMA: FieldSchema = {
  name: 'string',
  continuityId: 'string',
};

/**
 * Converts a TinyBase row to a Campaign object.
 */
function rowToCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    name: row.name,
    continuityId: row.continuityId,
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all campaigns.
 */
export function useCampaigns(): Campaign[] {
  const store = useStore();
  const table = useTable('campaigns', store);

  return useMemo(() => {
    return Object.values(table).map((row) => rowToCampaign(row as unknown as CampaignRow));
  }, [table]);
}

/**
 * Hook to get a single campaign by ID.
 */
export function useCampaign(id: string): Campaign | null {
  const store = useStore();
  const row = useRow('campaigns', id, store);

  return useMemo(() => {
    if (!id || !row || Object.keys(row).length === 0) return null;
    return rowToCampaign(row as unknown as CampaignRow);
  }, [row, id]);
}

/**
 * Hook to get the current active campaign.
 */
export function useCurrentCampaign(): Campaign | null {
  const store = useStore();
  const currentCampaignId = useValue('currentCampaignId', store) as string;

  return useCampaign(currentCampaignId || '');
}

/**
 * Hook to set the current active campaign.
 */
export function useSetCurrentCampaign(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      log.debug('Set current campaign', id);
      store.setValue('currentCampaignId', id);
    },
    [store]
  );
}

export interface CreateCampaignInput {
  name: string;
  continuityId: string;
}

/**
 * Hook to create a new campaign.
 */
export function useCreateCampaign(): (data: CreateCampaignInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreateCampaignInput) => {
      log.debug('Creating campaign', data.name);
      const id = generateId();
      const timestamp = now();

      store.setRow('campaigns', id, {
        id,
        name: data.name,
        continuityId: data.continuityId,
        created: timestamp,
        updated: timestamp,
      });

      const locationsTable = store.getTable('locations');
      Object.entries(locationsTable).forEach(([locationId, row]) => {
        const scope = (row as { scope?: string }).scope;
        const continuityId = (row as { continuityId?: string }).continuityId;
        if (scope !== 'continuity' || continuityId !== data.continuityId) return;
        const existingCampaignIds = (() => {
          try {
            const parsed = JSON.parse((row as { campaignIds?: string }).campaignIds || '[]');
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })();
        if (!existingCampaignIds.includes(id)) {
          store.setRow('locations', locationId, {
            ...row,
            campaignIds: JSON.stringify([...existingCampaignIds, id]),
            updated: now(),
          });
        }
      });

      const npcsTable = store.getTable('npcs');
      Object.entries(npcsTable).forEach(([npcId, row]) => {
        const scope = (row as { scope?: string }).scope;
        const continuityId = (row as { continuityId?: string }).continuityId;
        if (scope !== 'continuity' || continuityId !== data.continuityId) return;
        const existingCampaignIds = (() => {
          try {
            const parsed = JSON.parse((row as { campaignIds?: string }).campaignIds || '[]');
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })();
        if (!existingCampaignIds.includes(id)) {
          store.setRow('npcs', npcId, {
            ...row,
            campaignIds: JSON.stringify([...existingCampaignIds, id]),
            updated: now(),
          });
        }
      });

      log.debug('Created campaign', id);
      return id;
    },
    [store]
  );
}

export interface UpdateCampaignInput {
  name?: string;
  continuityId?: string;
}

/**
 * Hook to update an existing campaign.
 */
export function useUpdateCampaign(): (id: string, data: UpdateCampaignInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdateCampaignInput) => {
      const existing = store.getRow('campaigns', id);
      if (!existing || Object.keys(existing).length === 0) {
        log.error('Campaign not found', id);
        throw new Error(`Campaign ${id} not found`);
      }

      const updates = buildUpdates(data, CAMPAIGN_UPDATE_SCHEMA);
      store.setRow('campaigns', id, { ...existing, ...updates });
      log.debug('Updated campaign', id);
    },
    [store]
  );
}

/**
 * Hook to delete a campaign.
 */
export function useDeleteCampaign(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      store.delRow('campaigns', id);
      log.debug('Deleted campaign', id);

      // Clear current campaign if it was deleted
      const currentId = store.getValue('currentCampaignId');
      if (currentId === id) {
        store.setValue('currentCampaignId', '');
      }
    },
    [store]
  );
}
