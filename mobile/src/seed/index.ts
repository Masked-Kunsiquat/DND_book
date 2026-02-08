/**
 * Seed data utilities for populating the app with demo content.
 */

import type { MergeableStore, Row } from 'tinybase';
import { createLogger } from '../utils/logger';
import { SEED_CAMPAIGN_ID, SEED_CONTINUITY_ID, NPC_IDS, LOCATION_IDS, ITEM_IDS } from './types';
import {
  seedContinuity,
  seedCampaign,
  seedTags,
  seedLocations,
  seedNpcs,
  seedItems,
  seedSessionLogs,
  getNpcImageUris,
  getLocationImageUris,
  getItemImageUris,
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
    // Resolve image URIs at runtime
    const npcImages = getNpcImageUris();
    const locationImages = getLocationImageUris();
    const itemImages = getItemImageUris();

    // Map NPC IDs to their image keys
    const npcImageMap: Record<string, string> = {
      [NPC_IDS.odysseus]: npcImages.odysseus,
      [NPC_IDS.eurylochus]: npcImages.eurylochus,
      [NPC_IDS.polyphemus]: npcImages.polyphemus,
      [NPC_IDS.circe]: npcImages.circe,
      [NPC_IDS.calypso]: npcImages.calypso,
      [NPC_IDS.tiresias]: npcImages.tiresias,
      [NPC_IDS.aeolus]: npcImages.aeolus,
      [NPC_IDS.poseidon]: npcImages.poseidon,
      [NPC_IDS.athena]: npcImages.athena,
      [NPC_IDS.penelope]: npcImages.penelope,
    };

    // Map location IDs to their image keys
    const locationImageMap: Record<string, string> = {
      [LOCATION_IDS.aegeanSea]: locationImages.aegeanSea,
      [LOCATION_IDS.ithaca]: locationImages.ithaca,
      [LOCATION_IDS.troy]: locationImages.troy,
      [LOCATION_IDS.cyclopsIsland]: locationImages.cyclopsIsland,
      [LOCATION_IDS.sirensStrait]: locationImages.sirensStrait,
      [LOCATION_IDS.aeolia]: locationImages.aeolia,
      [LOCATION_IDS.aeaea]: locationImages.aeaea,
      [LOCATION_IDS.ogygia]: locationImages.ogygia,
      [LOCATION_IDS.mountOlympus]: locationImages.mountOlympus,
      [LOCATION_IDS.underworld]: locationImages.underworld,
    };

    // Map item IDs to their image keys
    const itemImageMap: Record<string, string> = {
      [ITEM_IDS.bagOfWinds]: itemImages.bagOfWinds,
      [ITEM_IDS.molyHerb]: itemImages.molyHerb,
      [ITEM_IDS.bowOfOdysseus]: itemImages.bowOfOdysseus,
    };

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

    // Seed locations with images
    for (const location of seedLocations) {
      const imageUri = locationImageMap[location.id];
      const locationWithImage = {
        ...location,
        images: imageUri ? JSON.stringify([imageUri]) : '[]',
      };
      store.setRow('locations', location.id, locationWithImage as unknown as Row);
    }
    log.debug(`Seeded ${seedLocations.length} locations`);

    // Seed NPCs with images
    for (const npc of seedNpcs) {
      const npcWithImage = {
        ...npc,
        image: npcImageMap[npc.id] || '',
      };
      store.setRow('npcs', npc.id, npcWithImage as unknown as Row);
    }
    log.debug(`Seeded ${seedNpcs.length} NPCs`);

    // Seed items with images
    for (const item of seedItems) {
      const itemWithImage = {
        ...item,
        image: itemImageMap[item.id] || '',
      };
      store.setRow('items', item.id, itemWithImage as unknown as Row);
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
      let campaignIds: string[] = [];
      try {
        campaignIds = JSON.parse((row.campaignIds as string) || '[]');
      } catch {
        // Malformed JSON, skip this row
        log.warn('Skipping sessionLog with malformed campaignIds:', row.campaignIds);
        return false;
      }
      return Array.isArray(campaignIds) && campaignIds.includes(SEED_CAMPAIGN_ID);
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
