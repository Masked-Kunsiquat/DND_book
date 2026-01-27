/**
 * React hooks for SessionLog CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import type { Mention, RecordId, SessionLog, SessionLogRow } from '../types/schema';

const log = createLogger('session-logs');

/**
 * Parse a JSON string into an array, returning an empty array for missing or invalid input.
 *
 * @param value - JSON string expected to represent an array
 * @returns The parsed array as `T[]`, or an empty array if `value` is missing, invalid JSON, or does not represent an array
 */
function parseJsonArray<T = string>(value?: string): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Create a SessionLog object from a TinyBase session log row.
 *
 * The returned object maps fields directly from the row, defaults `content` to an empty string when missing,
 * and parses JSON-encoded array fields (mentions, campaignIds, locationIds, npcIds, noteIds, playerCharacterIds,
 * itemIds, tagIds) into their corresponding arrays.
 *
 * @param row - The TinyBase row representing a session log
 * @returns A SessionLog with parsed array fields and normalized `content`
 */
function rowToSessionLog(row: SessionLogRow): SessionLog {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    content: row.content || '',
    mentions: parseJsonArray<Mention>(row.mentions),
    summary: row.summary,
    keyDecisions: row.keyDecisions,
    outcomes: row.outcomes,
    campaignIds: parseJsonArray(row.campaignIds),
    locationIds: parseJsonArray(row.locationIds),
    npcIds: parseJsonArray(row.npcIds),
    noteIds: parseJsonArray(row.noteIds),
    playerCharacterIds: parseJsonArray(row.playerCharacterIds),
    itemIds: parseJsonArray(row.itemIds),
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
  const table = useTable('sessionLogs', store);

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
    return [...logs].sort((a, b) => {
      const bTime = Date.parse(b.date);
      const aTime = Date.parse(a.date);
      const safeB = Number.isNaN(bTime) ? 0 : bTime;
      const safeA = Number.isNaN(aTime) ? 0 : aTime;
      return safeB - safeA;
    });
  }, [logs]);
}

/**
 * Hook to get a single session log by ID.
 */
export function useSessionLog(id: string): SessionLog | null {
  const store = useStore();
  const row = useRow('sessionLogs', id, store);

  return useMemo(() => {
    if (!row || Object.keys(row).length === 0) return null;
    return rowToSessionLog(row as unknown as SessionLogRow);
  }, [row]);
}

export interface CreateSessionLogInput {
  title: string;
  date: string;
  content?: string;
  mentions?: Mention[];
  summary?: string;
  keyDecisions?: string;
  outcomes?: string;
  campaignIds?: RecordId[];
  locationIds?: RecordId[];
  npcIds?: RecordId[];
  noteIds?: RecordId[];
  playerCharacterIds?: RecordId[];
  itemIds?: RecordId[];
  tagIds?: RecordId[];
}

/**
 * Provides a stable callback that creates a new session log record in the store.
 *
 * @returns A function that accepts a `CreateSessionLogInput` and returns the new session log's id
 */
export function useCreateSessionLog(): (data: CreateSessionLogInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreateSessionLogInput) => {
      log.debug('Creating session log', data.title);
      const id = generateId();
      const timestamp = now();

      store.setRow('sessionLogs', id, {
        id,
        title: data.title,
        date: data.date,
        content: data.content || '',
        mentions: JSON.stringify(data.mentions || []),
        summary: data.summary || '',
        keyDecisions: data.keyDecisions || '',
        outcomes: data.outcomes || '',
        campaignIds: JSON.stringify(data.campaignIds || []),
        locationIds: JSON.stringify(data.locationIds || []),
        npcIds: JSON.stringify(data.npcIds || []),
        noteIds: JSON.stringify(data.noteIds || []),
        playerCharacterIds: JSON.stringify(data.playerCharacterIds || []),
        itemIds: JSON.stringify(data.itemIds || []),
        tagIds: JSON.stringify(data.tagIds || []),
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created session log', id);
      return id;
    },
    [store]
  );
}

export interface UpdateSessionLogInput {
  title?: string;
  date?: string;
  content?: string;
  mentions?: Mention[];
  summary?: string;
  keyDecisions?: string;
  outcomes?: string;
  campaignIds?: RecordId[];
  locationIds?: RecordId[];
  npcIds?: RecordId[];
  noteIds?: RecordId[];
  playerCharacterIds?: RecordId[];
  itemIds?: RecordId[];
  tagIds?: RecordId[];
}

/**
 * Returns a callback that updates an existing session log row in the store.
 *
 * The returned function accepts an `id` and a partial update `data` object; any provided array or structured fields
 * (for example `mentions`, `campaignIds`, `itemIds`, etc.) are serialized to JSON before persisting.
 *
 * @returns A function that updates the session log identified by `id` with the supplied fields (no value is changed when its property is omitted).
 * @throws Error if no session log exists with the given `id`.
 */
export function useUpdateSessionLog(): (id: string, data: UpdateSessionLogInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdateSessionLogInput) => {
      const existing = store.getRow('sessionLogs', id);
      if (!existing || Object.keys(existing).length === 0) {
        log.error('Session log not found', id);
        throw new Error(`SessionLog ${id} not found`);
      }

      const updates: Record<string, string> = { updated: now() };

      if (data.title !== undefined) updates.title = data.title;
      if (data.date !== undefined) updates.date = data.date;
      if (data.content !== undefined) updates.content = data.content;
      if (data.mentions !== undefined) updates.mentions = JSON.stringify(data.mentions);
      if (data.summary !== undefined) updates.summary = data.summary;
      if (data.keyDecisions !== undefined) updates.keyDecisions = data.keyDecisions;
      if (data.outcomes !== undefined) updates.outcomes = data.outcomes;
      if (data.campaignIds !== undefined) updates.campaignIds = JSON.stringify(data.campaignIds);
      if (data.locationIds !== undefined) updates.locationIds = JSON.stringify(data.locationIds);
      if (data.npcIds !== undefined) updates.npcIds = JSON.stringify(data.npcIds);
      if (data.noteIds !== undefined) updates.noteIds = JSON.stringify(data.noteIds);
      if (data.playerCharacterIds !== undefined)
        updates.playerCharacterIds = JSON.stringify(data.playerCharacterIds);
      if (data.itemIds !== undefined) updates.itemIds = JSON.stringify(data.itemIds);
      if (data.tagIds !== undefined) updates.tagIds = JSON.stringify(data.tagIds);

      store.setRow('sessionLogs', id, {
        ...existing,
        ...updates,
      });

      log.debug('Updated session log', id);
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
      log.debug('Deleted session log', id);
    },
    [store]
  );
}