/**
 * Odyssey demo tag seed data.
 */

import type { TagRow } from '../../types/schema';
import { SEED_CONTINUITY_ID, TAG_IDS } from '../types';

const SEED_TIMESTAMP = '2024-01-01T00:00:00.000Z';

export const seedTags: TagRow[] = [
  {
    id: TAG_IDS.hostile,
    name: 'Hostile',
    color: '#ef4444', // red
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: TAG_IDS.ally,
    name: 'Ally',
    color: '#22c55e', // green
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: TAG_IDS.divine,
    name: 'Divine',
    color: '#a855f7', // purple
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: TAG_IDS.magic,
    name: 'Magic',
    color: '#3b82f6', // blue
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: TAG_IDS.blinded,
    name: 'Blinded',
    color: '#6b7280', // gray
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: TAG_IDS.grudge,
    name: 'Grudge',
    color: '#f97316', // orange
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: TAG_IDS.oracle,
    name: 'Oracle',
    color: '#06b6d4', // cyan
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: TAG_IDS.home,
    name: 'Home',
    color: '#eab308', // yellow
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: TAG_IDS.cursed,
    name: 'Cursed',
    color: '#7c3aed', // violet
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
  {
    id: TAG_IDS.endgame,
    name: 'Endgame',
    color: '#dc2626', // dark red
    scope: 'continuity',
    continuityId: SEED_CONTINUITY_ID,
    campaignId: '',
    originId: '',
    originContinuityId: '',
    forkedAt: '',
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
];
