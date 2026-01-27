/**
 * TinyBase store schema definition.
 * Defines the structure of all tables for type-safe operations.
 */

import { createMergeableStore } from 'tinybase';
import type { TablesSchema, ValuesSchema } from 'tinybase';
import { DEFAULT_MENTION_SETTINGS } from '../utils/mentions';

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
    status: { type: 'string' },
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
    status: { type: 'string' },
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
  items: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string' },
    scope: { type: 'string' },
    continuityId: { type: 'string' },
    campaignIds: { type: 'string' }, // JSON array
    ownerId: { type: 'string' },
    ownerType: { type: 'string' },
    locationId: { type: 'string' },
    value: { type: 'string' },
    tagIds: { type: 'string' }, // JSON array
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
    content: { type: 'string' },
    mentions: { type: 'string' },
    summary: { type: 'string' },
    keyDecisions: { type: 'string' },
    outcomes: { type: 'string' },
    campaignIds: { type: 'string' }, // JSON array
    locationIds: { type: 'string' },
    npcIds: { type: 'string' },
    noteIds: { type: 'string' },
    playerCharacterIds: { type: 'string' },
    itemIds: { type: 'string' },
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
  mentionSettings: { type: 'string' },
} as const satisfies ValuesSchema;

/**
 * Create and configure the app's TinyBase MergeableStore.
 *
 * Configures the store with the app's tables and values schemas and initializes default app values (including serialized mention settings). The returned store is a MergeableStore suitable for Yjs CRDT synchronization.
 *
 * @returns The configured MergeableStore instance
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
    mentionSettings: JSON.stringify(DEFAULT_MENTION_SETTINGS),
  });

  return store;
}

export type AppStore = ReturnType<typeof createAppStore>;