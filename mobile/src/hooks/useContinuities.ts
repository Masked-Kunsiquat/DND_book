/**
 * React hooks for Continuity CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import type { Continuity, ContinuityRow } from '../types/schema';

const log = createLogger('continuities');

function rowToContinuity(row: ContinuityRow): Continuity {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    created: row.created,
    updated: row.updated,
  };
}

export function useContinuities(): Continuity[] {
  const store = useStore();
  const table = useTable('continuities', store);

  return useMemo(() => {
    return Object.values(table).map((row) => rowToContinuity(row as unknown as ContinuityRow));
  }, [table]);
}

export function useContinuity(id: string): Continuity | null {
  const store = useStore();
  const row = useRow('continuities', id, store);

  return useMemo(() => {
    if (!id || !row || Object.keys(row).length === 0) return null;
    return rowToContinuity(row as unknown as ContinuityRow);
  }, [id, row]);
}

export interface CreateContinuityInput {
  name: string;
  description?: string;
}

export function useCreateContinuity(): (data: CreateContinuityInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreateContinuityInput) => {
      log.debug('Creating continuity', data.name);
      const id = generateId();
      const timestamp = now();

      store.setRow('continuities', id, {
        id,
        name: data.name,
        description: data.description || '',
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created continuity', id);
      return id;
    },
    [store]
  );
}

export interface UpdateContinuityInput {
  name?: string;
  description?: string;
}

export function useUpdateContinuity(): (id: string, data: UpdateContinuityInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdateContinuityInput) => {
      const existing = store.getRow('continuities', id);
      if (!existing || Object.keys(existing).length === 0) {
        log.error('Continuity not found', id);
        throw new Error(`Continuity ${id} not found`);
      }

      const updates: Record<string, string> = { updated: now() };
      if (data.name !== undefined) updates.name = data.name;
      if (data.description !== undefined) updates.description = data.description;

      store.setRow('continuities', id, { ...existing, ...updates });
      log.debug('Updated continuity', id);
    },
    [store]
  );
}

export function useDeleteContinuity(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      store.delRow('continuities', id);
      log.debug('Deleted continuity', id);
    },
    [store]
  );
}
