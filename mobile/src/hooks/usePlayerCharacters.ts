/**
 * React hooks for PlayerCharacter CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { buildUpdates, type FieldSchema } from '../utils/entityHelpers';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import { parseJsonArray } from '../utils/parsing';
import type { PlayerCharacter, PlayerCharacterRow, RecordId } from '../types/schema';

const log = createLogger('player-characters');

/** Field schema for PlayerCharacter updates */
const PLAYER_CHARACTER_UPDATE_SCHEMA: FieldSchema = {
  name: 'string',
  player: 'string',
  race: 'string',
  class: 'string',
  background: 'string',
  image: 'string',
  campaignIds: 'array',
  noteIds: 'array',
};

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
    image: row.image || '',
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
  const table = useTable('playerCharacters', store);

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
  const table = useTable('playerCharacters', store);

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
  const row = useRow('playerCharacters', id, store);

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
  image?: string;
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
      log.debug('Creating player character', data.name);
      const id = generateId();
      const timestamp = now();

      store.setRow('playerCharacters', id, {
        id,
        name: data.name,
        player: data.player,
        race: data.race || '',
        class: data.class || '',
        background: data.background || '',
        image: data.image || '',
        campaignIds: JSON.stringify(data.campaignIds || []),
        noteIds: JSON.stringify(data.noteIds || []),
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created player character', id);
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
  image?: string;
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
        log.error('Player character not found', id);
        throw new Error(`PlayerCharacter ${id} not found`);
      }

      const updates = buildUpdates(data, PLAYER_CHARACTER_UPDATE_SCHEMA);
      store.setRow('playerCharacters', id, { ...existing, ...updates });
      log.debug('Updated player character', id);
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
      log.debug('Deleted player character', id);
    },
    [store]
  );
}
