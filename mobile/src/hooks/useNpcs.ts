/**
 * React hooks for NPC CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { buildUpdates, type FieldSchema } from '../utils/entityHelpers';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import { removeManagedImage } from '../utils/files';
import { parseJsonArray } from '../utils/parsing';
import type { Npc, NpcRow, RecordId } from '../types/schema';

const log = createLogger('npcs');

/** Field schema for NPC updates */
const NPC_UPDATE_SCHEMA: FieldSchema = {
  name: 'string',
  race: 'string',
  role: 'string',
  background: 'string',
  status: 'string',
  image: 'string',
  scope: 'string',
  continuityId: 'string',
  originId: 'string',
  originContinuityId: 'string',
  forkedAt: 'string',
  campaignIds: 'array',
  locationIds: 'array',
  noteIds: 'array',
  tagIds: 'array',
};

/**
 * Convert a TinyBase NpcRow into a normalized Npc object.
 *
 * Missing or empty fields are normalized: `status` defaults to `"complete"`, `scope` defaults to `"campaign"`,
 * continuity-related string fields default to `""`, and JSON-array fields (`campaignIds`, `locationIds`, `noteIds`, `tagIds`)
 * are parsed into arrays.
 *
 * @param row - The TinyBase row representing an NPC
 * @returns The corresponding `Npc` with defaults applied and arrays parsed
 */
function rowToNpc(row: NpcRow): Npc {
  return {
    id: row.id,
    name: row.name,
    race: row.race,
    role: row.role,
    background: row.background,
    status: (row.status as Npc['status']) || 'complete',
    image: row.image,
    scope: (row.scope as Npc['scope']) || 'campaign',
    continuityId: row.continuityId || '',
    originId: row.originId || '',
    originContinuityId: row.originContinuityId || '',
    forkedAt: row.forkedAt || '',
    campaignIds: parseJsonArray(row.campaignIds),
    locationIds: parseJsonArray(row.locationIds),
    noteIds: parseJsonArray(row.noteIds),
    tagIds: parseJsonArray(row.tagIds),
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all NPCs, optionally filtered by campaign.
 */
export function useNpcs(campaignId?: string): Npc[] {
  const store = useStore();
  const table = useTable('npcs', store);

  return useMemo(() => {
    const npcs = Object.values(table).map((row) => rowToNpc(row as unknown as NpcRow));

    if (campaignId) {
      return npcs.filter((npc) => npc.campaignIds.includes(campaignId));
    }

    return npcs;
  }, [table, campaignId]);
}

/**
 * Hook to get NPCs by location.
 */
export function useNpcsByLocation(locationId: string): Npc[] {
  const store = useStore();
  const table = useTable('npcs', store);

  return useMemo(() => {
    return Object.values(table)
      .map((row) => rowToNpc(row as unknown as NpcRow))
      .filter((npc) => npc.locationIds.includes(locationId));
  }, [table, locationId]);
}

/**
 * Hook to get NPCs by tag.
 */
export function useNpcsByTag(tagId: string): Npc[] {
  const store = useStore();
  const table = useTable('npcs', store);

  return useMemo(() => {
    return Object.values(table)
      .map((row) => rowToNpc(row as unknown as NpcRow))
      .filter((npc) => npc.tagIds.includes(tagId));
  }, [table, tagId]);
}

/**
 * Hook to get a single NPC by ID.
 */
export function useNpc(id: string): Npc | null {
  const store = useStore();
  const table = useTable('npcs', store);
  const row = table[id] as unknown as NpcRow | undefined;

  return useMemo(() => {
    if (!row || Object.keys(row).length === 0) return null;
    return rowToNpc(row as unknown as NpcRow);
  }, [row]);
}

export interface CreateNpcInput {
  name: string;
  race?: string;
  role?: string;
  background?: string;
  status?: Npc['status'];
  image?: string;
  scope?: Npc['scope'];
  continuityId?: RecordId;
  originId?: RecordId;
  originContinuityId?: RecordId;
  forkedAt?: string;
  campaignIds?: RecordId[];
  locationIds?: RecordId[];
  noteIds?: RecordId[];
  tagIds?: RecordId[];
}

/**
 * Creates a new NPC row in the store and returns its generated ID.
 *
 * @returns A function that accepts a CreateNpcInput and returns the created NPC's ID.
 */
export function useCreateNpc(): (data: CreateNpcInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreateNpcInput) => {
      log.debug('Creating npc', data.name);
      const id = generateId();
      const timestamp = now();

      store.setRow('npcs', id, {
        id,
        name: data.name,
        race: data.race || '',
        role: data.role || '',
        background: data.background || '',
        status: data.status || 'complete',
        image: data.image || '',
        scope: data.scope || 'campaign',
        continuityId: data.continuityId || '',
        originId: data.originId || '',
        originContinuityId: data.originContinuityId || '',
        forkedAt: data.forkedAt || '',
        campaignIds: JSON.stringify(data.campaignIds || []),
        locationIds: JSON.stringify(data.locationIds || []),
        noteIds: JSON.stringify(data.noteIds || []),
        tagIds: JSON.stringify(data.tagIds || []),
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created npc', id);
      return id;
    },
    [store]
  );
}

export interface UpdateNpcInput {
  name?: string;
  race?: string;
  role?: string;
  background?: string;
  status?: Npc['status'];
  image?: string;
  scope?: Npc['scope'];
  continuityId?: RecordId;
  originId?: RecordId;
  originContinuityId?: RecordId;
  forkedAt?: string;
  campaignIds?: RecordId[];
  locationIds?: RecordId[];
  noteIds?: RecordId[];
  tagIds?: RecordId[];
}

/**
 * Create a function that applies provided field updates to an existing NPC by ID.
 *
 * The returned updater sets the `updated` timestamp, JSON-serializes any ID arrays, and only changes fields present on `data`.
 *
 * @param id - The ID of the NPC to update
 * @param data - Partial NPC fields to apply; only properties that are defined will be updated
 * @returns A function that updates the NPC with the provided fields and persists the changes
 * @throws Error if no NPC with the given `id` exists
 */
export function useUpdateNpc(): (id: string, data: UpdateNpcInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdateNpcInput) => {
      const existing = store.getRow('npcs', id);
      if (!existing || Object.keys(existing).length === 0) {
        log.error('Npc not found', id);
        throw new Error(`NPC ${id} not found`);
      }

      const updates = buildUpdates(data, NPC_UPDATE_SCHEMA);
      store.setRow('npcs', id, { ...existing, ...updates });
      log.debug('Updated npc', id);
    },
    [store]
  );
}

/**
 * Hook to delete an NPC.
 */
export function useDeleteNpc(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      const row = store.getRow('npcs', id) as unknown as NpcRow | undefined;
      store.delRow('npcs', id);
      if (row?.image) {
        void removeManagedImage(row.image);
      }
      log.debug('Deleted npc', id);
    },
    [store]
  );
}