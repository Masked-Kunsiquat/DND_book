/**
 * React hooks for PlayerCharacter CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import type { PlayerCharacter, PlayerCharacterRow, RecordId } from '../types/schema';

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
 * Converts a TinyBase row to a PlayerCharacter object.
 */
function rowToPlayerCharacter(row: PlayerCharacterRow): PlayerCharacter {
  return {
    id: row.id,
    name: row.name,
    player: row.player,
    race: row.race,
    class: row.class,
    background: row.background,
    campaignIds: parseJsonArray(row.campaignIds),
    noteIds: parseJsonArray(row.noteIds),
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all player characters, optionally filtered by campaign.
 */
export function usePlayerCharacters(campaignId?: string): PlayerCharacter[] {
  const store = useStore();
  const table = store.getTable('playerCharacters');

  return useMemo(() => {
    const pcs = Object.values(table).map((row) => rowToPlayerCharacter(row as unknown as PlayerCharacterRow));

    if (campaignId) {
      return pcs.filter((pc) => pc.campaignIds.includes(campaignId));
    }

    return pcs;
  }, [table, campaignId]);
}

/**
 * Hook to get player characters by player name.
 */
export function usePlayerCharactersByPlayer(playerName: string): PlayerCharacter[] {
  const store = useStore();
  const table = store.getTable('playerCharacters');

  return useMemo(() => {
    const lowerName = playerName.toLowerCase();
    return Object.values(table)
      .map((row) => rowToPlayerCharacter(row as unknown as PlayerCharacterRow))
      .filter((pc) => pc.player.toLowerCase() === lowerName);
  }, [table, playerName]);
}

/**
 * Hook to get a single player character by ID.
 */
export function usePlayerCharacter(id: string): PlayerCharacter | null {
  const store = useStore();
  const row = store.getRow('playerCharacters', id);

  return useMemo(() => {
    if (!row || Object.keys(row).length === 0) return null;
    return rowToPlayerCharacter(row as unknown as PlayerCharacterRow);
  }, [row]);
}

export interface CreatePlayerCharacterInput {
  name: string;
  player: string;
  race?: string;
  class?: string;
  background?: string;
  campaignIds?: RecordId[];
  noteIds?: RecordId[];
}

/**
 * Hook to create a new player character.
 */
export function useCreatePlayerCharacter(): (data: CreatePlayerCharacterInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreatePlayerCharacterInput) => {
      const id = generateId();
      const timestamp = now();

      store.setRow('playerCharacters', id, {
        id,
        name: data.name,
        player: data.player,
        race: data.race || '',
        class: data.class || '',
        background: data.background || '',
        campaignIds: JSON.stringify(data.campaignIds || []),
        noteIds: JSON.stringify(data.noteIds || []),
        created: timestamp,
        updated: timestamp,
      });

      return id;
    },
    [store]
  );
}

export interface UpdatePlayerCharacterInput {
  name?: string;
  player?: string;
  race?: string;
  class?: string;
  background?: string;
  campaignIds?: RecordId[];
  noteIds?: RecordId[];
}

/**
 * Hook to update an existing player character.
 */
export function useUpdatePlayerCharacter(): (id: string, data: UpdatePlayerCharacterInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdatePlayerCharacterInput) => {
      const existing = store.getRow('playerCharacters', id);
      if (!existing || Object.keys(existing).length === 0) {
        throw new Error(`PlayerCharacter ${id} not found`);
      }

      const updates: Record<string, string> = { updated: now() };

      if (data.name !== undefined) updates.name = data.name;
      if (data.player !== undefined) updates.player = data.player;
      if (data.race !== undefined) updates.race = data.race;
      if (data.class !== undefined) updates.class = data.class;
      if (data.background !== undefined) updates.background = data.background;
      if (data.campaignIds !== undefined) updates.campaignIds = JSON.stringify(data.campaignIds);
      if (data.noteIds !== undefined) updates.noteIds = JSON.stringify(data.noteIds);

      store.setRow('playerCharacters', id, {
        ...existing,
        ...updates,
      });
    },
    [store]
  );
}

/**
 * Hook to delete a player character.
 */
export function useDeletePlayerCharacter(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      store.delRow('playerCharacters', id);
    },
    [store]
  );
}
