/**
 * React hooks for NPC CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import { removeManagedImage } from '../utils/files';
import type { Npc, NpcRow, RecordId } from '../types/schema';

const log = createLogger('npcs');

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
 * Converts a TinyBase row to an Npc object.
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
 * Hook to create a new NPC.
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
 * Hook to update an existing NPC.
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

      const updates: Record<string, string> = { updated: now() };

      if (data.name !== undefined) updates.name = data.name;
      if (data.race !== undefined) updates.race = data.race;
      if (data.role !== undefined) updates.role = data.role;
      if (data.background !== undefined) updates.background = data.background;
      if (data.status !== undefined) updates.status = data.status;
      if (data.image !== undefined) updates.image = data.image;
      if (data.scope !== undefined) updates.scope = data.scope;
      if (data.continuityId !== undefined) updates.continuityId = data.continuityId;
      if (data.originId !== undefined) updates.originId = data.originId;
      if (data.originContinuityId !== undefined)
        updates.originContinuityId = data.originContinuityId;
      if (data.forkedAt !== undefined) updates.forkedAt = data.forkedAt;
      if (data.campaignIds !== undefined) updates.campaignIds = JSON.stringify(data.campaignIds);
      if (data.locationIds !== undefined) updates.locationIds = JSON.stringify(data.locationIds);
      if (data.noteIds !== undefined) updates.noteIds = JSON.stringify(data.noteIds);
      if (data.tagIds !== undefined) updates.tagIds = JSON.stringify(data.tagIds);

      store.setRow('npcs', id, {
        ...existing,
        ...updates,
      });

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
