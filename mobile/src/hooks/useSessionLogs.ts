/**
 * React hooks for SessionLog CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import type { SessionLog, SessionLogRow, RecordId } from '../types/schema';

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
 * Converts a TinyBase row to a SessionLog object.
 */
function rowToSessionLog(row: SessionLogRow): SessionLog {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    summary: row.summary,
    keyDecisions: row.keyDecisions,
    outcomes: row.outcomes,
    campaignIds: parseJsonArray(row.campaignIds),
    locationIds: parseJsonArray(row.locationIds),
    npcIds: parseJsonArray(row.npcIds),
    noteIds: parseJsonArray(row.noteIds),
    playerCharacterIds: parseJsonArray(row.playerCharacterIds),
    tagIds: parseJsonArray(row.tagIds),
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all session logs, optionally filtered by campaign.
 */
export function useSessionLogs(campaignId?: string): SessionLog[] {
  const store = useStore();
  const table = store.getTable('sessionLogs');

  return useMemo(() => {
    const logs = Object.values(table).map((row) => rowToSessionLog(row as unknown as SessionLogRow));

    if (campaignId) {
      return logs.filter((log) => log.campaignIds.includes(campaignId));
    }

    return logs;
  }, [table, campaignId]);
}

/**
 * Hook to get session logs sorted by date (most recent first).
 */
export function useSessionLogsByDate(campaignId?: string): SessionLog[] {
  const logs = useSessionLogs(campaignId);

  return useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs]);
}

/**
 * Hook to get a single session log by ID.
 */
export function useSessionLog(id: string): SessionLog | null {
  const store = useStore();
  const row = store.getRow('sessionLogs', id);

  return useMemo(() => {
    if (!row || Object.keys(row).length === 0) return null;
    return rowToSessionLog(row as unknown as SessionLogRow);
  }, [row]);
}

export interface CreateSessionLogInput {
  title: string;
  date: string;
  summary?: string;
  keyDecisions?: string;
  outcomes?: string;
  campaignIds?: RecordId[];
  locationIds?: RecordId[];
  npcIds?: RecordId[];
  noteIds?: RecordId[];
  playerCharacterIds?: RecordId[];
  tagIds?: RecordId[];
}

/**
 * Hook to create a new session log.
 */
export function useCreateSessionLog(): (data: CreateSessionLogInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreateSessionLogInput) => {
      const id = generateId();
      const timestamp = now();

      store.setRow('sessionLogs', id, {
        id,
        title: data.title,
        date: data.date,
        summary: data.summary || '',
        keyDecisions: data.keyDecisions || '',
        outcomes: data.outcomes || '',
        campaignIds: JSON.stringify(data.campaignIds || []),
        locationIds: JSON.stringify(data.locationIds || []),
        npcIds: JSON.stringify(data.npcIds || []),
        noteIds: JSON.stringify(data.noteIds || []),
        playerCharacterIds: JSON.stringify(data.playerCharacterIds || []),
        tagIds: JSON.stringify(data.tagIds || []),
        created: timestamp,
        updated: timestamp,
      });

      return id;
    },
    [store]
  );
}

export interface UpdateSessionLogInput {
  title?: string;
  date?: string;
  summary?: string;
  keyDecisions?: string;
  outcomes?: string;
  campaignIds?: RecordId[];
  locationIds?: RecordId[];
  npcIds?: RecordId[];
  noteIds?: RecordId[];
  playerCharacterIds?: RecordId[];
  tagIds?: RecordId[];
}

/**
 * Hook to update an existing session log.
 */
export function useUpdateSessionLog(): (id: string, data: UpdateSessionLogInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdateSessionLogInput) => {
      const existing = store.getRow('sessionLogs', id);
      if (!existing || Object.keys(existing).length === 0) {
        throw new Error(`SessionLog ${id} not found`);
      }

      const updates: Record<string, string> = { updated: now() };

      if (data.title !== undefined) updates.title = data.title;
      if (data.date !== undefined) updates.date = data.date;
      if (data.summary !== undefined) updates.summary = data.summary;
      if (data.keyDecisions !== undefined) updates.keyDecisions = data.keyDecisions;
      if (data.outcomes !== undefined) updates.outcomes = data.outcomes;
      if (data.campaignIds !== undefined) updates.campaignIds = JSON.stringify(data.campaignIds);
      if (data.locationIds !== undefined) updates.locationIds = JSON.stringify(data.locationIds);
      if (data.npcIds !== undefined) updates.npcIds = JSON.stringify(data.npcIds);
      if (data.noteIds !== undefined) updates.noteIds = JSON.stringify(data.noteIds);
      if (data.playerCharacterIds !== undefined)
        updates.playerCharacterIds = JSON.stringify(data.playerCharacterIds);
      if (data.tagIds !== undefined) updates.tagIds = JSON.stringify(data.tagIds);

      store.setRow('sessionLogs', id, {
        ...existing,
        ...updates,
      });
    },
    [store]
  );
}

/**
 * Hook to delete a session log.
 */
export function useDeleteSessionLog(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      store.delRow('sessionLogs', id);
    },
    [store]
  );
}
