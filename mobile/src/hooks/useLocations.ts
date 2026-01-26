/**
 * React hooks for Location CRUD operations.
 */

import { useCallback, useMemo } from 'react';
import { useRow, useTable } from 'tinybase/ui-react';
import { useStore } from '../store';
import { generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import { removeManagedImage } from '../utils/files';
import type { Location, LocationRow, LocationType, RecordId } from '../types/schema';

const log = createLogger('locations');

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
 * Converts a TinyBase row to a Location object.
 */
function rowToLocation(row: LocationRow): Location {
  return {
    id: row.id,
    name: row.name,
    type: (row.type as LocationType) || 'Locale',
    description: row.description,
    parentId: row.parentId,
    campaignIds: parseJsonArray(row.campaignIds),
    tagIds: parseJsonArray(row.tagIds),
    map: row.map,
    images: parseJsonArray(row.images),
    created: row.created,
    updated: row.updated,
  };
}

/**
 * Hook to get all locations, optionally filtered by campaign.
 */
export function useLocations(campaignId?: string): Location[] {
  const store = useStore();
  const table = useTable('locations', store);

  return useMemo(() => {
    const locations = Object.values(table).map((row) => rowToLocation(row as unknown as LocationRow));

    if (campaignId) {
      return locations.filter((loc) => loc.campaignIds.includes(campaignId));
    }

    return locations;
  }, [table, campaignId]);
}

/**
 * Hook to get child locations of a parent.
 */
export function useChildLocations(parentId: string): Location[] {
  const store = useStore();
  const table = useTable('locations', store);

  return useMemo(() => {
    return Object.values(table)
      .map((row) => rowToLocation(row as unknown as LocationRow))
      .filter((loc) => loc.parentId === parentId);
  }, [table, parentId]);
}

/**
 * Hook to get root locations (no parent).
 */
export function useRootLocations(campaignId?: string): Location[] {
  const store = useStore();
  const table = useTable('locations', store);

  return useMemo(() => {
    const locations = Object.values(table)
      .map((row) => rowToLocation(row as unknown as LocationRow))
      .filter((loc) => !loc.parentId);

    if (campaignId) {
      return locations.filter((loc) => loc.campaignIds.includes(campaignId));
    }

    return locations;
  }, [table, campaignId]);
}

/**
 * Hook to get locations by tag.
 */
export function useLocationsByTag(tagId: string): Location[] {
  const store = useStore();
  const table = useTable('locations', store);

  return useMemo(() => {
    return Object.values(table)
      .map((row) => rowToLocation(row as unknown as LocationRow))
      .filter((loc) => loc.tagIds.includes(tagId));
  }, [table, tagId]);
}

/**
 * Hook to get a single location by ID.
 */
export function useLocation(id: string): Location | null {
  const store = useStore();
  const row = useRow('locations', id, store);

  return useMemo(() => {
    if (!row || Object.keys(row).length === 0) return null;
    return rowToLocation(row as unknown as LocationRow);
  }, [row]);
}

/**
 * Hook to get the full ancestry path of a location.
 */
export function useLocationPath(id: string): Location[] {
  const store = useStore();
  const table = useTable('locations', store);

  return useMemo(() => {
    const path: Location[] = [];
    let currentId = id;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) {
        log.error('Detected location cycle', currentId);
        break;
      }
      visited.add(currentId);

      const row = table[currentId] as unknown as LocationRow | undefined;
      if (!row) break;

      const location = rowToLocation(row);
      path.unshift(location);
      currentId = location.parentId || '';
    }

    return path;
  }, [table, id]);
}

export interface CreateLocationInput {
  name: string;
  type?: LocationType;
  description?: string;
  parentId?: RecordId;
  campaignIds?: RecordId[];
  tagIds?: RecordId[];
  map?: string;
  images?: string[];
}

/**
 * Hook to create a new location.
 */
export function useCreateLocation(): (data: CreateLocationInput) => string {
  const store = useStore();

  return useCallback(
    (data: CreateLocationInput) => {
      log.debug('Creating location', data.name);
      const id = generateId();
      const timestamp = now();

      store.setRow('locations', id, {
        id,
        name: data.name,
        type: data.type || 'Locale',
        description: data.description || '',
        parentId: data.parentId || '',
        campaignIds: JSON.stringify(data.campaignIds || []),
        tagIds: JSON.stringify(data.tagIds || []),
        map: data.map || '',
        images: JSON.stringify(data.images || []),
        created: timestamp,
        updated: timestamp,
      });

      log.debug('Created location', id);
      return id;
    },
    [store]
  );
}

export interface UpdateLocationInput {
  name?: string;
  type?: LocationType;
  description?: string;
  parentId?: RecordId;
  campaignIds?: RecordId[];
  tagIds?: RecordId[];
  map?: string;
  images?: string[];
}

/**
 * Hook to update an existing location.
 */
export function useUpdateLocation(): (id: string, data: UpdateLocationInput) => void {
  const store = useStore();

  return useCallback(
    (id: string, data: UpdateLocationInput) => {
      const existing = store.getRow('locations', id);
      if (!existing || Object.keys(existing).length === 0) {
        log.error('Location not found', id);
        throw new Error(`Location ${id} not found`);
      }

      const updates: Record<string, string> = { updated: now() };

      if (data.name !== undefined) updates.name = data.name;
      if (data.type !== undefined) updates.type = data.type;
      if (data.description !== undefined) updates.description = data.description;
      if (data.parentId !== undefined) updates.parentId = data.parentId;
      if (data.campaignIds !== undefined) updates.campaignIds = JSON.stringify(data.campaignIds);
      if (data.tagIds !== undefined) updates.tagIds = JSON.stringify(data.tagIds);
      if (data.map !== undefined) updates.map = data.map;
      if (data.images !== undefined) updates.images = JSON.stringify(data.images);

      store.setRow('locations', id, {
        ...existing,
        ...updates,
      });

      log.debug('Updated location', id);
    },
    [store]
  );
}

/**
 * Hook to delete a location.
 * Note: Does not cascade delete children - consider orphaning or reparenting.
 */
export function useDeleteLocation(): (id: string) => void {
  const store = useStore();

  return useCallback(
    (id: string) => {
      const row = store.getRow('locations', id) as LocationRow | undefined;
      store.delRow('locations', id);
      if (row) {
        if (row.map) {
          void removeManagedImage(row.map);
        }
        const images = parseJsonArray(row.images);
        images.forEach((uri) => {
          void removeManagedImage(uri);
        });
      }
      log.debug('Deleted location', id);
    },
    [store]
  );
}
