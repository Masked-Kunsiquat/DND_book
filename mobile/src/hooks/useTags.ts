/**
 * React hooks for Tag CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import type { Tag, TagRow } from '../types/schema';

const log = createLogger('tags');

/**
 * Converts a TinyBase row to a Tag object.
 */
function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all tags.
 */
export function useTags(): Tag[] {
  const store = useStore();
  const table = useTable('tags', store);

  return useMemo(() => {
    return Object.values(table).map((row) => rowToTag(row as unknown as TagRow));
  }, [table]);
}

/**
 * Hook to get a single tag by ID.
 */
export function useTag(id: string): Tag | null {
  const store = useStore();
  const table = useTable('tags', store);
  const row = table[id] as unknown as TagRow | undefined;

  return useMemo(() => {
    if (!row || Object.keys(row).length === 0) return null;
    return rowToTag(row as unknown as TagRow);
  }, [row]);
}

/**
 * Hook to get multiple tags by their IDs.
 */
export function useTagsByIds(ids: string[]): Tag[] {
  const store = useStore();
  const table = useTable('tags', store);

  return useMemo(() => {
    return ids
      .map((id) => {
        const row = table[id] as unknown as TagRow | undefined;
        return row ? rowToTag(row) : null;
      })
      .filter((tag): tag is Tag => tag !== null);
  }, [table, ids]);
}

/**
 * Hook to find a tag by name (case-insensitive).
 */
export function useTagByName(name: string): Tag | null {
  const store = useStore();
  const table = useTable('tags', store);

  return useMemo(() => {
    const lowerName = name.toLowerCase();
    const row = Object.values(table).find(
      (r) => (r as unknown as TagRow).name.toLowerCase() === lowerName
    ) as unknown as TagRow | undefined;

    return row ? rowToTag(row) : null;
  }, [table, name]);
}

export interface CreateTagInput {
  name: string;
}

/**
 * Hook to create a new tag.
 */
export function useCreateTag(): (data: CreateTagInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreateTagInput) => {
      log.debug('Creating tag', data.name);
      const id = generateId();
      const timestamp = now();

      store.setRow('tags', id, {
        id,
        name: data.name,
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created tag', id);
      return id;
    },
    [store]
  );
}

/**
 * Hook to create a tag if it doesn't exist, or return existing one.
 * Returns the tag ID.
 */
export function useGetOrCreateTag(): (name: string) => string {
  const store = useStore();
  const table = useTable('tags', store);

  return useCallback(
    (name: string) => {
      const lowerName = name.toLowerCase();

      // Check if tag already exists
      const existing = Object.values(table).find(
        (r) => (r as unknown as TagRow).name.toLowerCase() === lowerName
      ) as unknown as TagRow | undefined;

      if (existing) {
        log.debug('Using existing tag', existing.id);
        return existing.id;
      }

      // Create new tag
      const id = generateId();
      const timestamp = now();

      store.setRow('tags', id, {
        id,
        name,
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created tag', id);
      return id;
    },
    [store, table]
  );
}

export interface UpdateTagInput {
  name?: string;
}

/**
 * Hook to update an existing tag.
 */
export function useUpdateTag(): (id: string, data: UpdateTagInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdateTagInput) => {
      const existing = store.getRow('tags', id);
      if (!existing || Object.keys(existing).length === 0) {
        log.error('Tag not found', id);
        throw new Error(`Tag ${id} not found`);
      }

      const updates: Record<string, string> = { updated: now() };
      if (data.name !== undefined) updates.name = data.name;

      store.setRow('tags', id, {
        ...existing,
        ...updates,
      });

      log.debug('Updated tag', id);
    },
    [store]
  );
}

/**
 * Hook to delete a tag.
 * Note: This does not remove the tag from entities that reference it.
 */
export function useDeleteTag(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      store.delRow('tags', id);
      log.debug('Deleted tag', id);
    },
    [store]
  );
}
