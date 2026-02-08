/**
 * Odyssey demo item seed data.
 */

import type { ItemRow } from '../../types/schema';
import {
  ITEM_IDS,
  LOCATION_IDS,
  NPC_IDS,
  SEED_CAMPAIGN_ID,
  SEED_CONTINUITY_ID,
  TAG_IDS,
} from '../types';

const SEED_TIMESTAMP = '2024-01-01T00:00:00.000Z';

const campaignIds = JSON.stringify([SEED_CAMPAIGN_ID]);

export const seedItems: ItemRow[] = [
  {
    id: ITEM_IDS.bagOfWinds,
    name: 'Bag of Winds',
    description:
      'A leather bag given by Aeolus, containing all the winds contrary to Odysseus\'s course home. With only the West Wind free to blow, the ship could reach Ithaca in days. But the crew, thinking it held treasure, opened it within sight of home—and the escaping winds blew them back across the sea.',
    status: 'complete',
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignIds,
    ownerId: NPC_IDS.aeolus,
    ownerType: 'npc',
    locationId: LOCATION_IDS.aeolia,
    value: 'Priceless (divine gift)',
    tagIds: JSON.stringify([TAG_IDS.magic, TAG_IDS.divine, TAG_IDS.cursed]),
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: ITEM_IDS.molyHerb,
    name: 'Moly',
    description:
      'A magical herb with a black root and white flower, given to Odysseus by Hermes. It protects against Circe\'s transformation magic, allowing him to resist her enchantments and force her to restore his crew from their pig forms.',
    status: 'complete',
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignIds,
    ownerId: NPC_IDS.odysseus,
    ownerType: 'npc',
    locationId: LOCATION_IDS.aeaea,
    value: 'Divine (gift from Hermes)',
    tagIds: JSON.stringify([TAG_IDS.magic, TAG_IDS.divine]),
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: ITEM_IDS.bowOfOdysseus,
    name: 'Bow of Odysseus',
    description:
      'The great bow of Odysseus, left behind in Ithaca when he sailed for Troy. No suitor can string it. In the final contest, Odysseus—disguised as a beggar—strings the bow with ease and uses it to slaughter the suitors who have plagued his house.',
    status: 'complete',
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignIds,
    ownerId: NPC_IDS.odysseus,
    ownerType: 'npc',
    locationId: LOCATION_IDS.ithaca,
    value: 'Heirloom (irreplaceable)',
    tagIds: JSON.stringify([TAG_IDS.endgame, TAG_IDS.home]),
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
];
