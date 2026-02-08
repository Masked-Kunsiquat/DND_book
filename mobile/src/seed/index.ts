/**
 * Seed data utilities for populating the app with demo content.
 */

import type { MergeableStore, Row } from 'tinybase';
import { createLogger } from '../utils/logger';
import { SEED_CAMPAIGN_ID, SEED_CONTINUITY_ID } from './types';
import {
  seedContinuity,
  seedCampaign,
  seedTags,
  seedLocations,
  seedNpcs,
  seedItems,
  seedSessionLogs,
} from './odyssey';

const log = createLogger('seed');

/**
 * Seeds the Odyssey demo data into the store.
 * This populates the app with a complete demo campaign based on Homer's Odyssey.
 *
 * @param store - The TinyBase store to populate
 */
export function seedOdysseyDemo(store: MergeableStore): void {
  log.info('Seeding Odyssey demo data...');

  try {
    // Seed continuity
    store.setRow('continuities', seedContinuity.id, seedContinuity as unknown as Row);
    log.debug('Seeded continuity:', seedContinuity.name);

    // Seed campaign
    store.setRow('campaigns', seedCampaign.id, seedCampaign as unknown as Row);
    log.debug('Seeded campaign:', seedCampaign.name);

    // Seed tags
    for (const tag of seedTags) {
      store.setRow('tags', tag.id, tag as unknown as Row);
    }
    log.debug(`Seeded ${seedTags.length} tags`);

    // Seed locations
    for (const location of seedLocations) {
      store.setRow('locations', location.id, location as unknown as Row);
    }
    log.debug(`Seeded ${seedLocations.length} locations`);

    // Seed NPCs
    for (const npc of seedNpcs) {
      store.setRow('npcs', npc.id, npc as unknown as Row);
    }
    log.debug(`Seeded ${seedNpcs.length} NPCs`);

    // Seed items
    for (const item of seedItems) {
      store.setRow('items', item.id, item as unknown as Row);
    }
    log.debug(`Seeded ${seedItems.length} items`);

    // Seed session logs
    for (const sessionLog of seedSessionLogs) {
      store.setRow('sessionLogs', sessionLog.id, sessionLog as unknown as Row);
    }
    log.debug(`Seeded ${seedSessionLogs.length} session logs`);

    // Set seed data flags
    store.setValue('hasSeedData', 'true');
    store.setValue('seedDataContinuityId', SEED_CONTINUITY_ID);
    store.setValue('currentCampaignId', SEED_CAMPAIGN_ID);

    log.info('Odyssey demo data seeded successfully');
  } catch (error) {
    log.error('Failed to seed Odyssey demo data', error);
    throw error;
  }
}

/**
 * Clears all seed/demo data from the store.
 * This removes the Odyssey continuity and all associated entities.
 *
 * @param store - The TinyBase store to clear
 */
export function clearSeedData(store: MergeableStore): void {
  const seedContinuityId = store.getValue('seedDataContinuityId');

  if (!seedContinuityId) {
    log.debug('No seed data to clear');
    return;
  }

  log.info('Clearing seed data...');

  try {
    // Helper to delete rows matching continuityId
    const deleteMatchingRows = (
      tableName: string,
      matchFn: (row: Record<string, unknown>) => boolean
    ) => {
      const table = store.getTable(tableName);
      let count = 0;
      for (const rowId of Object.keys(table)) {
        const row = table[rowId] as Record<string, unknown>;
        if (matchFn(row)) {
          store.delRow(tableName, rowId);
          count++;
        }
      }
      return count;
    };

    // Delete session logs
    const sessionLogsDeleted = deleteMatchingRows('sessionLogs', (row) => {
      const campaignIds = JSON.parse((row.campaignIds as string) || '[]');
      return campaignIds.includes(SEED_CAMPAIGN_ID);
    });
    log.debug(`Deleted ${sessionLogsDeleted} session logs`);

    // Delete items
    const itemsDeleted = deleteMatchingRows(
      'items',
      (row) => row.continuityId === seedContinuityId
    );
    log.debug(`Deleted ${itemsDeleted} items`);

    // Delete NPCs
    const npcsDeleted = deleteMatchingRows(
      'npcs',
      (row) => row.continuityId === seedContinuityId
    );
    log.debug(`Deleted ${npcsDeleted} NPCs`);

    // Delete locations
    const locationsDeleted = deleteMatchingRows(
      'locations',
      (row) => row.continuityId === seedContinuityId
    );
    log.debug(`Deleted ${locationsDeleted} locations`);

    // Delete tags
    const tagsDeleted = deleteMatchingRows(
      'tags',
      (row) => row.continuityId === seedContinuityId
    );
    log.debug(`Deleted ${tagsDeleted} tags`);

    // Delete notes (if any were created)
    const notesDeleted = deleteMatchingRows(
      'notes',
      (row) => row.continuityId === seedContinuityId
    );
    log.debug(`Deleted ${notesDeleted} notes`);

    // Delete campaign
    store.delRow('campaigns', SEED_CAMPAIGN_ID);
    log.debug('Deleted seed campaign');

    // Delete continuity
    store.delRow('continuities', seedContinuityId as string);
    log.debug('Deleted seed continuity');

    // Clear seed data flags
    store.delValue('hasSeedData');
    store.delValue('seedDataContinuityId');

    // Clear current campaign if it was the seed campaign
    const currentCampaignId = store.getValue('currentCampaignId');
    if (currentCampaignId === SEED_CAMPAIGN_ID) {
      store.delValue('currentCampaignId');
    }

    log.info('Seed data cleared successfully');
  } catch (error) {
    log.error('Failed to clear seed data', error);
    throw error;
  }
}

/**
 * Checks if the store currently has seed data loaded.
 *
 * @param store - The TinyBase store to check
 * @returns True if seed data is present
 */
export function hasSeedData(store: MergeableStore): boolean {
  return store.getValue('hasSeedData') === 'true';
}

/**
 * Gets the seed continuity ID if seed data is present.
 *
 * @param store - The TinyBase store to check
 * @returns The seed continuity ID or undefined
 */
export function getSeedContinuityId(store: MergeableStore): string | undefined {
  const id = store.getValue('seedDataContinuityId');
  return typeof id === 'string' ? id : undefined;
}

// Re-export types and constants
export { SEED_CONTINUITY_ID, SEED_CAMPAIGN_ID } from './types';
