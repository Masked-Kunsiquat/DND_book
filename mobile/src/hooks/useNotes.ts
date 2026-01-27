/**
 * React hooks for Note CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import type { Note, NoteRow, RecordId } from '../types/schema';

const log = createLogger('notes');

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
      if (note.scope === 'continuity') return true;
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
        if (note.scope === 'continuity') return true;
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
        if (note.scope === 'continuity') return true;
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

      store.setRow('notes', id, {
        id,
        title: data.title,
        content: data.content || '',
        scope,
        continuityId,
        campaignId: scope === 'campaign' ? data.campaignId || '' : '',
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

      const updates: Record<string, string> = { updated: now() };

      if (data.title !== undefined) updates.title = data.title;
      if (data.content !== undefined) updates.content = data.content;
      if (data.scope !== undefined) updates.scope = data.scope;
      if (data.continuityId !== undefined) updates.continuityId = data.continuityId;
      if (data.campaignId !== undefined) updates.campaignId = data.campaignId;
      if (data.originId !== undefined) updates.originId = data.originId;
      if (data.originContinuityId !== undefined)
        updates.originContinuityId = data.originContinuityId;
      if (data.forkedAt !== undefined) updates.forkedAt = data.forkedAt;
      if (data.locationIds !== undefined) updates.locationIds = JSON.stringify(data.locationIds);
      if (data.tagIds !== undefined) updates.tagIds = JSON.stringify(data.tagIds);

      store.setRow('notes', id, {
        ...existing,
        ...updates,
      });

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
