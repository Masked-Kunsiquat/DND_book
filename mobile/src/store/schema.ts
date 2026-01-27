/**
 * TinyBase store schema definition.
 * Defines the structure of all tables for type-safe operations.
 */

import { createMergeableStore } from 'tinybase';
import type { TablesSchema, ValuesSchema } from 'tinybase';

// Schema definition for TinyBase
// Note: TinyBase stores all values as strings, numbers, or booleans
// Arrays are stored as JSON strings

export const tablesSchema = {
  continuities: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    created: { type: 'string' },
    updated: { type: 'string' },
  },
  campaigns: {
    id: { type: 'string' },
    name: { type: 'string' },
    continuityId: { type: 'string' },
    created: { type: 'string' },
    updated: { type: 'string' },
  },
  notes: {
    id: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
    scope: { type: 'string' },
    continuityId: { type: 'string' },
    campaignId: { type: 'string' },
    campaignIds: { type: 'string' }, // JSON array
    originId: { type: 'string' },
    originContinuityId: { type: 'string' },
    forkedAt: { type: 'string' },
    locationIds: { type: 'string' }, // JSON array
    tagIds: { type: 'string' }, // JSON array
    created: { type: 'string' },
    updated: { type: 'string' },
  },
  npcs: {
    id: { type: 'string' },
    name: { type: 'string' },
    race: { type: 'string' },
    role: { type: 'string' },
    background: { type: 'string' },
    image: { type: 'string' },
    scope: { type: 'string' },
    continuityId: { type: 'string' },
    originId: { type: 'string' },
    originContinuityId: { type: 'string' },
    forkedAt: { type: 'string' },
    campaignIds: { type: 'string' }, // JSON array
    locationIds: { type: 'string' },
    noteIds: { type: 'string' },
    tagIds: { type: 'string' },
    created: { type: 'string' },
    updated: { type: 'string' },
  },
  locations: {
    id: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string' },
    description: { type: 'string' },
    parentId: { type: 'string' },
    scope: { type: 'string' },
    continuityId: { type: 'string' },
    originId: { type: 'string' },
    originContinuityId: { type: 'string' },
    forkedAt: { type: 'string' },
    campaignIds: { type: 'string' }, // JSON array
    tagIds: { type: 'string' },
    map: { type: 'string' },
    images: { type: 'string' }, // JSON array
    created: { type: 'string' },
    updated: { type: 'string' },
  },
  tags: {
    id: { type: 'string' },
    name: { type: 'string' },
    color: { type: 'string' },
    scope: { type: 'string' },
    continuityId: { type: 'string' },
    campaignId: { type: 'string' },
    originId: { type: 'string' },
    originContinuityId: { type: 'string' },
    forkedAt: { type: 'string' },
    created: { type: 'string' },
    updated: { type: 'string' },
  },
  sessionLogs: {
    id: { type: 'string' },
    title: { type: 'string' },
    date: { type: 'string' },
    summary: { type: 'string' },
    keyDecisions: { type: 'string' },
    outcomes: { type: 'string' },
    campaignIds: { type: 'string' }, // JSON array
    locationIds: { type: 'string' },
    npcIds: { type: 'string' },
    noteIds: { type: 'string' },
    playerCharacterIds: { type: 'string' },
    tagIds: { type: 'string' },
    created: { type: 'string' },
    updated: { type: 'string' },
  },
  playerCharacters: {
    id: { type: 'string' },
    name: { type: 'string' },
    player: { type: 'string' },
    race: { type: 'string' },
    class: { type: 'string' },
    background: { type: 'string' },
    image: { type: 'string' },
    campaignIds: { type: 'string' }, // JSON array
    noteIds: { type: 'string' },
    created: { type: 'string' },
    updated: { type: 'string' },
  },
  playerCharacterTemplates: {
    id: { type: 'string' },
    name: { type: 'string' },
    player: { type: 'string' },
    race: { type: 'string' },
    class: { type: 'string' },
    background: { type: 'string' },
    image: { type: 'string' },
    continuityId: { type: 'string' },
    originId: { type: 'string' },
    originContinuityId: { type: 'string' },
    forkedAt: { type: 'string' },
    created: { type: 'string' },
    updated: { type: 'string' },
  },
} as const satisfies TablesSchema;

// App-level values (global state)
export const valuesSchema = {
  currentCampaignId: { type: 'string' },
  deviceId: { type: 'string' },
  lastSyncedAt: { type: 'string' },
} as const satisfies ValuesSchema;

/**
 * Creates a new TinyBase MergeableStore with the app schema.
 * MergeableStore is required for Yjs CRDT sync.
 */
export function createAppStore() {
  const store = createMergeableStore();

  store.setTablesSchema(tablesSchema);
  store.setValuesSchema(valuesSchema);

  // Set default values
  store.setValues({
    currentCampaignId: '',
    deviceId: '',
    lastSyncedAt: '',
  });

  return store;
}

export type AppStore = ReturnType<typeof createAppStore>;
