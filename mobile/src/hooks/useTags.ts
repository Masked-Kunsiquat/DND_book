/**
 * React hooks for Tag CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import { parseJsonArray } from '../utils/parsing';
import { getTagColor } from '../theme';
import type { Tag, TagRow } from '../types/schema';

const log = createLogger('tags');

/**
 * Converts a TinyBase row to a Tag object.
 */
function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color || getTagColor(row.id).bg,
    scope: (row.scope as Tag['scope']) || 'continuity',
    continuityId: row.continuityId || '',
    campaignId: row.campaignId || '',
    originId: row.originId || '',
    originContinuityId: row.originContinuityId || '',
    forkedAt: row.forkedAt || '',
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all tags.
 */
export function useTags(continuityId?: string, campaignId?: string): Tag[] {
  const store = useStore();
  const table = useTable('tags', store);

  return useMemo(() => {
    const tags = Object.values(table).map((row) => rowToTag(row as unknown as TagRow));
    if (!continuityId) return tags;
    return tags.filter((tag) => {
      if (tag.continuityId !== continuityId) return false;
      if (tag.scope === 'continuity') return true;
      if (tag.scope === 'campaign') {
        return Boolean(campaignId) && tag.campaignId === campaignId;
      }
      return false;
    });
  }, [table, continuityId, campaignId]);
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
  color?: string;
  scope?: Tag['scope'];
  continuityId?: string;
  campaignId?: string;
  originId?: string;
  originContinuityId?: string;
  forkedAt?: string;
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
      const color = data.color || getTagColor(id).bg;

      store.setRow('tags', id, {
        id,
        name: data.name,
        color,
        scope: data.scope || 'continuity',
        continuityId: data.continuityId || '',
        campaignId: data.campaignId || '',
        originId: data.originId || '',
        originContinuityId: data.originContinuityId || '',
        forkedAt: data.forkedAt || '',
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
export interface TagScopeOptions {
  continuityId?: string;
  campaignId?: string;
  scope?: Tag['scope'];
}

export function useGetOrCreateTag(options?: TagScopeOptions): (name: string) => string {
  const store = useStore();

  return useCallback(
    (name: string) => {
      const lowerName = name.toLowerCase();
      let resolvedId = '';
      let didCreate = false;
      const continuityId = options?.continuityId || '';
      const campaignId = options?.campaignId || '';
      const scope = options?.scope || 'continuity';

      store.transaction(() => {
        const table = store.getTable('tags');

        const existing = Object.values(table).find((r) => {
          const row = r as unknown as TagRow;
          if (row.name.toLowerCase() !== lowerName) return false;
          if (continuityId && row.continuityId !== continuityId) return false;
          if (scope === 'campaign') {
            return row.scope === 'campaign' && row.campaignId === campaignId;
          }
          return row.scope === 'continuity';
        }) as unknown as TagRow | undefined;

        if (existing) {
          resolvedId = existing.id;
          return;
        }

        const id = generateId();
        const timestamp = now();
        const color = getTagColor(id).bg;

        store.setRow('tags', id, {
          id,
          name,
          color,
          scope,
          continuityId,
          campaignId: scope === 'campaign' ? campaignId : '',
          originId: '',
          originContinuityId: '',
          forkedAt: '',
          created: timestamp,
          updated: timestamp,
        });

        resolvedId = id;
        didCreate = true;
      });

      if (resolvedId) {
        log.debug(didCreate ? 'Created tag' : 'Using existing tag', resolvedId);
      } else {
        log.error('Failed to resolve tag id after transaction', name);
      }

      return resolvedId;
    },
    [store]
  );
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
  scope?: Tag['scope'];
  continuityId?: string;
  campaignId?: string;
  originId?: string;
  originContinuityId?: string;
  forkedAt?: string;
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
      if (data.color !== undefined) updates.color = data.color;
      if (data.scope !== undefined) updates.scope = data.scope;
      if (data.continuityId !== undefined) updates.continuityId = data.continuityId;
      if (data.campaignId !== undefined) updates.campaignId = data.campaignId;
      if (data.originId !== undefined) updates.originId = data.originId;
      if (data.originContinuityId !== undefined)
        updates.originContinuityId = data.originContinuityId;
      if (data.forkedAt !== undefined) updates.forkedAt = data.forkedAt;

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
 * Also removes the tag from entities that reference it.
 */
export function useDeleteTag(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      store.transaction(() => {
        const tables: Array<{ tableId: string; field: string }> = [
          { tableId: 'notes', field: 'tagIds' },
          { tableId: 'npcs', field: 'tagIds' },
          { tableId: 'locations', field: 'tagIds' },
          { tableId: 'sessionLogs', field: 'tagIds' },
        ];

        tables.forEach(({ tableId, field }) => {
          const table = store.getTable(tableId);
          Object.entries(table).forEach(([rowId, row]) => {
            const raw = (row as Record<string, string>)[field] ?? '';
            const tags = parseJsonArray(raw);
            if (!tags.includes(id)) return;
            const nextTags = tags.filter((tagId) => tagId !== id);
            store.setRow(tableId, rowId, {
              ...row,
              [field]: JSON.stringify(nextTags),
            });
          });
        });

        store.delRow('tags', id);
      });
      log.debug('Deleted tag', id);
    },
    [store]
  );
}
