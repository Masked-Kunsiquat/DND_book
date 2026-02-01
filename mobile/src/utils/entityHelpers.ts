/**
 * Shared utilities for entity CRUD operations.
 *
 * These helpers reduce boilerplate in entity hooks by providing
 * common patterns for building update objects.
 */

import { now } from './id';

/**
 * Field configuration for building update objects.
 * - 'string': Copy value as-is (for string/enum fields)
 * - 'array': JSON.stringify the value (for array fields)
 * - 'json': JSON.stringify the value (alias for complex objects)
 */
export type FieldType = 'string' | 'array' | 'json';

/**
 * Schema defining which fields are arrays vs strings.
 * Keys are field names, values indicate if the field should be JSON.stringified.
 */
export type FieldSchema = Record<string, FieldType>;

/**
 * Builds an update object from partial input data.
 *
 * Takes an input object with optional fields and a schema defining field types.
 * Returns a Record<string, string> suitable for TinyBase, with:
 * - `updated` timestamp always set
 * - Only defined fields included
 * - Array fields JSON.stringified
 *
 * @param data - Partial input data with optional fields
 * @param schema - Schema defining field types ('string' | 'array' | 'json')
 * @returns Update object ready for store.setRow()
 *
 * @example
 * const updates = buildUpdates(
 *   { name: 'New Name', tagIds: ['tag1', 'tag2'] },
 *   { name: 'string', tagIds: 'array' }
 * );
 * // => { updated: '2024-...', name: 'New Name', tagIds: '["tag1","tag2"]' }
 */
export function buildUpdates(
  data: object,
  schema: FieldSchema
): Record<string, string> {
  const updates: Record<string, string> = { updated: now() };
  const dataRecord = data as Record<string, unknown>;

  for (const [key, type] of Object.entries(schema)) {
    const value = dataRecord[key];
    if (value === undefined) continue;

    if (type === 'array' || type === 'json') {
      updates[key] = JSON.stringify(value);
    } else {
      // Handle null for ownerType-like fields that can be null
      updates[key] = value === null ? '' : String(value);
    }
  }

  return updates;
}

/**
 * Common field schemas for reuse across hooks.
 * These define the standard fields shared by multiple entity types.
 */
export const COMMON_FIELDS = {
  /** Fields for scope/continuity tracking */
  scope: {
    scope: 'string',
    continuityId: 'string',
  },
  /** Fields for fork/origin tracking */
  origin: {
    originId: 'string',
    originContinuityId: 'string',
    forkedAt: 'string',
  },
  /** Common array fields */
  arrays: {
    campaignIds: 'array',
    tagIds: 'array',
    locationIds: 'array',
  },
} as const satisfies Record<string, FieldSchema>;
