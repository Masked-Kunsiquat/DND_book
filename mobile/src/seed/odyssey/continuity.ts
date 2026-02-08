/**
 * Odyssey demo continuity and campaign seed data.
 */

import type { CampaignRow, ContinuityRow } from '../../types/schema';
import { SEED_CAMPAIGN_ID, SEED_CONTINUITY_ID } from '../types';

const SEED_TIMESTAMP = '2024-01-01T00:00:00.000Z';

export const seedContinuity: ContinuityRow = {
  id: SEED_CONTINUITY_ID,
  name: '🏺 The Wine-Dark Sea (Demo)',
  description:
    'A demo continuity based on Homer\'s Odyssey. Explore this pre-built campaign to learn how the app works, then clear it when you\'re ready to start your own adventures.',
  created: SEED_TIMESTAMP,
  updated: SEED_TIMESTAMP,
};

export const seedCampaign: CampaignRow = {
  id: SEED_CAMPAIGN_ID,
  name: 'The Long Way Home',
  continuityId: SEED_CONTINUITY_ID,
  created: SEED_TIMESTAMP,
  updated: SEED_TIMESTAMP,
};
