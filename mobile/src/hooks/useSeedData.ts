/**
 * Hook for managing seed/demo data.
 */

import { useCallback } from 'react';
import { useStore } from '../store';
import {
  clearSeedData as clearSeedDataFn,
  hasSeedData as hasSeedDataFn,
  getSeedContinuityId,
  seedOdysseyDemo,
  SEED_CONTINUITY_ID,
} from '../seed';

export interface UseSeedDataResult {
  /** Whether seed/demo data is currently present in the store */
  hasSeedData: boolean;
  /** The continuity ID of the seed data (if present) */
  seedContinuityId: string | undefined;
  /** Loads the Odyssey demo data into the store */
  loadSeedData: () => void;
  /** Clears all seed/demo data from the store */
  clearSeedData: () => void;
  /** Checks if a given continuity ID is the seed data continuity */
  isSeedContinuity: (continuityId: string) => boolean;
}

/**
 * Hook for checking and managing seed/demo data.
 *
 * @returns Object with seed data state and management functions
 */
export function useSeedData(): UseSeedDataResult {
  const store = useStore();

  const hasSeedData = hasSeedDataFn(store);
  const seedContinuityId = getSeedContinuityId(store);

  const loadSeedData = useCallback(() => {
    seedOdysseyDemo(store);
  }, [store]);

  const clearSeedData = useCallback(() => {
    clearSeedDataFn(store);
  }, [store]);

  const isSeedContinuity = useCallback(
    (continuityId: string) => continuityId === SEED_CONTINUITY_ID,
    []
  );

  return {
    hasSeedData,
    seedContinuityId,
    loadSeedData,
    clearSeedData,
    isSeedContinuity,
  };
}
