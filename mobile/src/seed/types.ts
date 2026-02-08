/**
 * Types for seed data generation.
 * These mirror the Row types from schema but are used specifically for seeding.
 */

import type {
  CampaignRow,
  ContinuityRow,
  ItemRow,
  LocationRow,
  NpcRow,
  SessionLogRow,
  TagRow,
} from '../types/schema';

/**
 * Seed data collection containing all entities for a demo continuity.
 */
export interface SeedData {
  continuity: ContinuityRow;
  campaign: CampaignRow;
  tags: TagRow[];
  locations: LocationRow[];
  npcs: NpcRow[];
  items: ItemRow[];
  sessionLogs: SessionLogRow[];
}

/**
 * Constants for seed data identification.
 */
export const SEED_CONTINUITY_ID = 'odyssey-demo-continuity';
export const SEED_CAMPAIGN_ID = 'odyssey-demo-campaign';

/**
 * Tag IDs for consistent referencing across entities.
 */
export const TAG_IDS = {
  hostile: 'tag-hostile',
  ally: 'tag-ally',
  divine: 'tag-divine',
  magic: 'tag-magic',
  blinded: 'tag-blinded',
  grudge: 'tag-grudge',
  oracle: 'tag-oracle',
  home: 'tag-home',
  cursed: 'tag-cursed',
  endgame: 'tag-endgame',
} as const;

/**
 * Location IDs for consistent referencing.
 */
export const LOCATION_IDS = {
  // Planes
  mortalRealm: 'loc-mortal-realm',
  divineRealm: 'loc-divine-realm',
  // Territories
  aegeanSea: 'loc-aegean-sea',
  // Locales
  ithaca: 'loc-ithaca',
  troy: 'loc-troy',
  cyclopsIsland: 'loc-cyclops-island',
  sirensStrait: 'loc-sirens-strait',
  aeolia: 'loc-aeolia',
  aeaea: 'loc-aeaea',
  ogygia: 'loc-ogygia',
  mountOlympus: 'loc-mount-olympus',
  underworld: 'loc-underworld',
} as const;

/**
 * NPC IDs for consistent referencing.
 */
export const NPC_IDS = {
  odysseus: 'npc-odysseus',
  eurylochus: 'npc-eurylochus',
  polyphemus: 'npc-polyphemus',
  circe: 'npc-circe',
  calypso: 'npc-calypso',
  tiresias: 'npc-tiresias',
  aeolus: 'npc-aeolus',
  poseidon: 'npc-poseidon',
  athena: 'npc-athena',
  penelope: 'npc-penelope',
} as const;

/**
 * Item IDs for consistent referencing.
 */
export const ITEM_IDS = {
  bagOfWinds: 'item-bag-of-winds',
  molyHerb: 'item-moly-herb',
  bowOfOdysseus: 'item-bow-of-odysseus',
} as const;

/**
 * Session log IDs.
 */
export const SESSION_IDS = {
  cyclopsEncounter: 'session-cyclops-encounter',
} as const;
