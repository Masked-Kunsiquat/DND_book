/**
 * React hooks for PlayerCharacterTemplate CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import type {
  PlayerCharacterTemplate,
  PlayerCharacterTemplateRow,
  RecordId,
} from '../types/schema';

const log = createLogger('player-character-templates');

/**
 * Converts a TinyBase row to a PlayerCharacterTemplate object.
 */
function rowToTemplate(row: PlayerCharacterTemplateRow): PlayerCharacterTemplate {
  return {
    id: row.id,
    name: row.name,
    player: row.player,
    race: row.race,
    class: row.class,
    background: row.background,
    image: row.image || '',
    continuityId: row.continuityId || '',
    originId: row.originId || '',
    originContinuityId: row.originContinuityId || '',
    forkedAt: row.forkedAt || '',
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all player character templates, optionally filtered by continuity.
 */
export function usePlayerCharacterTemplates(continuityId?: string): PlayerCharacterTemplate[] {
  const store = useStore();
  const table = useTable('playerCharacterTemplates', store);

  return useMemo(() => {
    const templates = Object.values(table).map((row) =>
      rowToTemplate(row as unknown as PlayerCharacterTemplateRow)
    );
    if (!continuityId) return templates;
    return templates.filter((template) => template.continuityId === continuityId);
  }, [table, continuityId]);
}

/**
 * Hook to get a single player character template by ID.
 */
export function usePlayerCharacterTemplate(id: string): PlayerCharacterTemplate | null {
  const store = useStore();
  const row = useRow('playerCharacterTemplates', id, store);

  return useMemo(() => {
    if (!row || Object.keys(row).length === 0) return null;
    return rowToTemplate(row as unknown as PlayerCharacterTemplateRow);
  }, [row]);
}

export interface CreatePlayerCharacterTemplateInput {
  name: string;
  player: string;
  race?: string;
  class?: string;
  background?: string;
  image?: string;
  continuityId: RecordId;
  originId?: string;
  originContinuityId?: string;
  forkedAt?: string;
}

/**
 * Hook to create a new player character template.
 */
export function useCreatePlayerCharacterTemplate(): (
  data: CreatePlayerCharacterTemplateInput
) => string {
  const store = useStore();

  return useCallback(
    (data: CreatePlayerCharacterTemplateInput) => {
      log.debug('Creating player character template', data.name);
      const id = generateId();
      const timestamp = now();

      store.setRow('playerCharacterTemplates', id, {
        id,
        name: data.name,
        player: data.player,
        race: data.race || '',
        class: data.class || '',
        background: data.background || '',
        image: data.image || '',
        continuityId: data.continuityId,
        originId: data.originId || '',
        originContinuityId: data.originContinuityId || '',
        forkedAt: data.forkedAt || '',
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created player character template', id);
      return id;
    },
    [store]
  );
}

export interface UpdatePlayerCharacterTemplateInput {
  name?: string;
  player?: string;
  race?: string;
  class?: string;
  background?: string;
  image?: string;
  continuityId?: RecordId;
  originId?: string;
  originContinuityId?: string;
  forkedAt?: string;
}

/**
 * Hook to update an existing player character template.
 */
export function useUpdatePlayerCharacterTemplate(): (
  id: string,
  data: UpdatePlayerCharacterTemplateInput
) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdatePlayerCharacterTemplateInput) => {
      const existing = store.getRow('playerCharacterTemplates', id);
      if (!existing || Object.keys(existing).length === 0) {
        log.error('Player character template not found', id);
        throw new Error(`PlayerCharacterTemplate ${id} not found`);
      }

      const updates: Record<string, string> = { updated: now() };
      if (data.name !== undefined) updates.name = data.name;
      if (data.player !== undefined) updates.player = data.player;
      if (data.race !== undefined) updates.race = data.race;
      if (data.class !== undefined) updates.class = data.class;
      if (data.background !== undefined) updates.background = data.background;
      if (data.image !== undefined) updates.image = data.image;
      if (data.continuityId !== undefined) updates.continuityId = data.continuityId;
      if (data.originId !== undefined) updates.originId = data.originId;
      if (data.originContinuityId !== undefined)
        updates.originContinuityId = data.originContinuityId;
      if (data.forkedAt !== undefined) updates.forkedAt = data.forkedAt;

      store.setRow('playerCharacterTemplates', id, {
        ...existing,
        ...updates,
      });

      log.debug('Updated player character template', id);
    },
    [store]
  );
}

/**
 * Hook to delete a player character template.
 */
export function useDeletePlayerCharacterTemplate(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      store.delRow('playerCharacterTemplates', id);
      log.debug('Deleted player character template', id);
    },
    [store]
  );
}
