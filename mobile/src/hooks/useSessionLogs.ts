/**
 * React hooks for SessionLog CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { sortByDateDesc } from '../utils/date';
import { buildUpdates, type FieldSchema } from '../utils/entityHelpers';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import { parseJsonArray } from '../utils/parsing';
import type { Mention, RecordId, SessionLog, SessionLogRow } from '../types/schema';

const log = createLogger('session-logs');

/** Field schema for SessionLog updates */
const SESSION_LOG_UPDATE_SCHEMA: FieldSchema = {
  title: 'string',
  date: 'string',
  content: 'string',
  mentions: 'json',
  summary: 'string',
  keyDecisions: 'string',
  outcomes: 'string',
  campaignIds: 'array',
  locationIds: 'array',
  npcIds: 'array',
  noteIds: 'array',
  playerCharacterIds: 'array',
  itemIds: 'array',
  tagIds: 'array',
};

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
    return [...logs].sort(sortByDateDesc((s) => s.date));
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

      const updates = buildUpdates(data, SESSION_LOG_UPDATE_SCHEMA);
      store.setRow('sessionLogs', id, { ...existing, ...updates });
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