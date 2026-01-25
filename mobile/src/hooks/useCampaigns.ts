/**
 * React hooks for Campaign CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable, useValue } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import type { Campaign, CampaignRow } from '../types/schema';

const log = createLogger('campaigns');

/**
 * Converts a TinyBase row to a Campaign object.
 */
function rowToCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    name: row.name,
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all campaigns.
 */
export function useCampaigns(): Campaign[] {
  const store = useStore();
  const table = useTable(store, 'campaigns');

  return useMemo(() => {
    return Object.values(table).map((row) => rowToCampaign(row as unknown as CampaignRow));
  }, [table]);
}

/**
 * Hook to get a single campaign by ID.
 */
export function useCampaign(id: string): Campaign | null {
  const store = useStore();
  const row = useRow(store, 'campaigns', id);

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
  const currentCampaignId = useValue(store, 'currentCampaignId') as string;

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
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created campaign', id);
      return id;
    },
    [store]
  );
}

export interface UpdateCampaignInput {
  name?: string;
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

      const sanitizedData = Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value as string;
        }
        return acc;
      }, {});

      store.setRow('campaigns', id, {
        ...existing,
        ...sanitizedData,
        updated: now(),
      });

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
