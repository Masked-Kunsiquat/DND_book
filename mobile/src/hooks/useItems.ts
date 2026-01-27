/**
 * React hooks for Item CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import type { Item, ItemRow, RecordId } from '../types/schema';

const log = createLogger('items');

/**
 * Safely parses a JSON array string, returning empty array on failure.
 */
function parseJsonArray(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Converts a TinyBase row to an Item object.
 */
function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: (row.status as Item['status']) || 'complete',
    scope: (row.scope as Item['scope']) || 'campaign',
    continuityId: row.continuityId || '',
    campaignIds: parseJsonArray(row.campaignIds),
    ownerId: row.ownerId || '',
    ownerType: (row.ownerType as Item['ownerType']) || null,
    locationId: row.locationId || '',
    value: row.value || '',
    tagIds: parseJsonArray(row.tagIds),
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all items, optionally filtered by campaign.
 */
export function useItems(campaignId?: string): Item[] {
  const store = useStore();
  const table = useTable('items', store);

  return useMemo(() => {
    const items = Object.values(table).map((row) => rowToItem(row as unknown as ItemRow));

    if (campaignId) {
      return items.filter((item) => item.campaignIds.includes(campaignId));
    }

    return items;
  }, [table, campaignId]);
}

/**
 * Hook to get a single item by ID.
 */
export function useItem(id: string): Item | null {
  const store = useStore();
  const row = useRow('items', id, store);

  return useMemo(() => {
    if (!row || Object.keys(row).length === 0) return null;
    return rowToItem(row as unknown as ItemRow);
  }, [row]);
}

export interface CreateItemInput {
  name: string;
  description?: string;
  status?: Item['status'];
  scope?: Item['scope'];
  continuityId?: RecordId;
  campaignIds?: RecordId[];
  ownerId?: RecordId;
  ownerType?: Item['ownerType'];
  locationId?: RecordId;
  value?: string;
  tagIds?: RecordId[];
}

/**
 * Hook to create a new item.
 */
export function useCreateItem(): (data: CreateItemInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreateItemInput) => {
      log.debug('Creating item', data.name);
      const id = generateId();
      const timestamp = now();

      store.setRow('items', id, {
        id,
        name: data.name,
        description: data.description || '',
        status: data.status || 'complete',
        scope: data.scope || 'campaign',
        continuityId: data.continuityId || '',
        campaignIds: JSON.stringify(data.campaignIds || []),
        ownerId: data.ownerId || '',
        ownerType: data.ownerType || '',
        locationId: data.locationId || '',
        value: data.value || '',
        tagIds: JSON.stringify(data.tagIds || []),
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created item', id);
      return id;
    },
    [store]
  );
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  status?: Item['status'];
  scope?: Item['scope'];
  continuityId?: RecordId;
  campaignIds?: RecordId[];
  ownerId?: RecordId;
  ownerType?: Item['ownerType'];
  locationId?: RecordId;
  value?: string;
  tagIds?: RecordId[];
}

/**
 * Hook to update an existing item.
 */
export function useUpdateItem(): (id: string, data: UpdateItemInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdateItemInput) => {
      const existing = store.getRow('items', id);
      if (!existing || Object.keys(existing).length === 0) {
        log.error('Item not found', id);
        throw new Error(`Item ${id} not found`);
      }

      const updates: Record<string, string> = { updated: now() };

      if (data.name !== undefined) updates.name = data.name;
      if (data.description !== undefined) updates.description = data.description;
      if (data.status !== undefined) updates.status = data.status;
      if (data.scope !== undefined) updates.scope = data.scope;
      if (data.continuityId !== undefined) updates.continuityId = data.continuityId;
      if (data.campaignIds !== undefined) updates.campaignIds = JSON.stringify(data.campaignIds);
      if (data.ownerId !== undefined) updates.ownerId = data.ownerId;
      if (data.ownerType !== undefined) updates.ownerType = data.ownerType || '';
      if (data.locationId !== undefined) updates.locationId = data.locationId;
      if (data.value !== undefined) updates.value = data.value;
      if (data.tagIds !== undefined) updates.tagIds = JSON.stringify(data.tagIds);

      store.setRow('items', id, {
        ...existing,
        ...updates,
      });

      log.debug('Updated item', id);
    },
    [store]
  );
}

/**
 * Hook to delete an item.
 */
export function useDeleteItem(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      store.delRow('items', id);
      log.debug('Deleted item', id);
    },
    [store]
  );
}
