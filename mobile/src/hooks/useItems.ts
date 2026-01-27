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
 * Parses a JSON-encoded array string and returns its array value.
 *
 * @param value - JSON string expected to represent an array
 * @returns The parsed array of strings, or an empty array if `value` is falsy, parsing fails, or the parsed value is not an array
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
 * Convert a TinyBase ItemRow into an Item.
 *
 * Maps row fields to an Item, applying defaults for missing fields: `status` defaults to `"complete"`, `scope` defaults to `"campaign"`, `continuityId`, `ownerId`, `locationId`, and `value` default to empty strings, and `ownerType` defaults to `null`. `campaignIds` and `tagIds` are parsed from JSON strings into string arrays.
 *
 * @param row - The TinyBase row representing an item
 * @returns The corresponding Item object
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
 * Get all items from the store, optionally limited to those belonging to a specific campaign.
 *
 * @param campaignId - If provided, only items whose `campaignIds` include this ID are returned
 * @returns An array of `Item` objects
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
 * Get the item matching the given ID or null if no such item exists.
 *
 * @param id - The item ID to retrieve
 * @returns The `Item` corresponding to `id`, or `null` if not found
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
 * Creates and returns a callback that inserts a new item row into the store.
 *
 * The callback generates a new ID and timestamp, writes a row to the `items`
 * table, sets `created` and `updated` to the timestamp, serializes `campaignIds`
 * and `tagIds` as JSON strings, and applies defaults for optional fields.
 *
 * @param data - Input fields for the new item
 * @returns The generated ID of the created item
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
 * Returns a function that updates fields of an existing item row in the store.
 *
 * The returned updater merges provided fields into the existing row, sets `updated` to the current time,
 * serializes `campaignIds` and `tagIds` to JSON strings, and coerces a missing `ownerType` to an empty string.
 *
 * @returns A function `(id, data)` that applies the provided updates to the item with the given `id`.
 * @throws An `Error` if no item with the given `id` exists.
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
 * Creates a callback that deletes an item row with the given id from the central store.
 *
 * @returns A function that takes an `id` and deletes the corresponding item row (returns `void`)
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