/**
 * React hooks for Note CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { buildUpdates, type FieldSchema } from '../utils/entityHelpers';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import { parseJsonArray } from '../utils/parsing';
import type { Note, NoteRow, RecordId } from '../types/schema';

/** Field schema for Note updates */
const NOTE_UPDATE_SCHEMA: FieldSchema = {
  title: 'string',
  content: 'string',
  scope: 'string',
  continuityId: 'string',
  campaignId: 'string',
  campaignIds: 'array',
  originId: 'string',
  originContinuityId: 'string',
  forkedAt: 'string',
  locationIds: 'array',
  tagIds: 'array',
};

const log = createLogger('notes');

/**
 * Converts a TinyBase row to a Note object.
 */
function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    scope: (row.scope as Note['scope']) || 'campaign',
    continuityId: row.continuityId || '',
    campaignId: row.campaignId,
    campaignIds: parseJsonArray(row.campaignIds),
    originId: row.originId || '',
    originContinuityId: row.originContinuityId || '',
    forkedAt: row.forkedAt || '',
    locationIds: parseJsonArray(row.locationIds),
    tagIds: parseJsonArray(row.tagIds),
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all notes, optionally filtered by campaign.
 */
export function useNotes(continuityId?: string, campaignId?: string): Note[] {
  const store = useStore();
  const table = useTable('notes', store);

  return useMemo(() => {
    const notes = Object.values(table).map((row) => rowToNote(row as unknown as NoteRow));

    if (!continuityId) {
      if (campaignId) {
        return notes.filter((note) => note.campaignId === campaignId);
      }
      return notes;
    }

    if (!campaignId) {
      return notes.filter((note) => note.continuityId === continuityId);
    }

    return notes.filter((note) => {
      if (note.continuityId !== continuityId) return false;
      if (note.scope === 'continuity') {
        return note.campaignIds.includes(campaignId);
      }
      if (note.scope === 'campaign') {
        return note.campaignId === campaignId;
      }
      return false;
    });
  }, [table, continuityId, campaignId]);
}

/**
 * Hook to get notes by location.
 */
export function useNotesByLocation(
  locationId: string,
  continuityId?: string,
  campaignId?: string
): Note[] {
  const store = useStore();
  const table = useTable('notes', store);

  return useMemo(() => {
    return Object.values(table)
      .map((row) => rowToNote(row as unknown as NoteRow))
      .filter((note) => {
        if (!note.locationIds.includes(locationId)) return false;
        if (!continuityId) return true;
        if (note.continuityId !== continuityId) return false;
        if (!campaignId) return true;
        if (note.scope === 'continuity') {
          return note.campaignIds.includes(campaignId);
        }
        if (note.scope === 'campaign') {
          return note.campaignId === campaignId;
        }
        return false;
      });
  }, [table, locationId, continuityId, campaignId]);
}

/**
 * Hook to get notes by tag.
 */
export function useNotesByTag(
  tagId: string,
  continuityId?: string,
  campaignId?: string
): Note[] {
  const store = useStore();
  const table = useTable('notes', store);

  return useMemo(() => {
    return Object.values(table)
      .map((row) => rowToNote(row as unknown as NoteRow))
      .filter((note) => {
        if (!note.tagIds.includes(tagId)) return false;
        if (!continuityId) return true;
        if (note.continuityId !== continuityId) return false;
        if (!campaignId) return true;
        if (note.scope === 'continuity') {
          return note.campaignIds.includes(campaignId);
        }
        if (note.scope === 'campaign') {
          return note.campaignId === campaignId;
        }
        return false;
      });
  }, [table, tagId, continuityId, campaignId]);
}

/**
 * Hook to get a single note by ID.
 */
export function useNote(id: string): Note | null {
  const store = useStore();
  const row = useRow('notes', id, store);

  return useMemo(() => {
    if (!row || Object.keys(row).length === 0) return null;
    return rowToNote(row as unknown as NoteRow);
  }, [row]);
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  scope?: Note['scope'];
  continuityId?: string;
  campaignId?: string;
  campaignIds?: RecordId[];
  originId?: string;
  originContinuityId?: string;
  forkedAt?: string;
  locationIds?: RecordId[];
  tagIds?: RecordId[];
}

/**
 * Hook to create a new note.
 */
export function useCreateNote(): (data: CreateNoteInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreateNoteInput) => {
      log.debug('Creating note', data.title);
      const id = generateId();
      const timestamp = now();

      const scope = data.scope || 'campaign';
      const continuityId = data.continuityId || '';
      const campaignId = data.campaignId || '';
      const campaignIds =
        data.campaignIds ||
        (scope === 'campaign' && campaignId ? [campaignId] : []);

      store.setRow('notes', id, {
        id,
        title: data.title,
        content: data.content || '',
        scope,
        continuityId,
        campaignId: scope === 'campaign' ? campaignId : '',
        campaignIds: JSON.stringify(campaignIds),
        originId: data.originId || '',
        originContinuityId: data.originContinuityId || '',
        forkedAt: data.forkedAt || '',
        locationIds: JSON.stringify(data.locationIds || []),
        tagIds: JSON.stringify(data.tagIds || []),
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created note', id);
      return id;
    },
    [store]
  );
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  scope?: Note['scope'];
  continuityId?: string;
  campaignId?: string;
  campaignIds?: RecordId[];
  originId?: string;
  originContinuityId?: string;
  forkedAt?: string;
  locationIds?: RecordId[];
  tagIds?: RecordId[];
}

/**
 * Hook to update an existing note.
 */
export function useUpdateNote(): (id: string, data: UpdateNoteInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdateNoteInput) => {
      const existing = store.getRow('notes', id);
      if (!existing || Object.keys(existing).length === 0) {
        log.error('Note not found', id);
        throw new Error(`Note ${id} not found`);
      }

      const updates = buildUpdates(data, NOTE_UPDATE_SCHEMA);
      store.setRow('notes', id, { ...existing, ...updates });
      log.debug('Updated note', id);
    },
    [store]
  );
}

/**
 * Hook to delete a note.
 */
export function useDeleteNote(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      store.delRow('notes', id);
      log.debug('Deleted note', id);
    },
    [store]
  );
}
