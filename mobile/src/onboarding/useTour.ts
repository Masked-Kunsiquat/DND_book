/**
 * Hook for managing tour state.
 */

import { useCallback } from 'react';
import { useStore } from '../store';

export interface UseTourResult {
  /** Whether the tour has been completed at least once */
  hasCompletedTour: boolean;
  /** Whether this is the first app launch (tour should auto-start) */
  shouldAutoStartTour: boolean;
  /** Mark the tour as completed */
  completeTour: () => void;
  /** Reset tour state (for "restart tour" feature) */
  resetTour: () => void;
}

/**
 * Hook for managing onboarding tour state.
 *
 * Tour auto-starts on first run when:
 * 1. Seed data is present (hasSeedData === 'true')
 * 2. Tour has not been completed (tourCompleted !== 'true')
 */
export function useTour(): UseTourResult {
  const store = useStore();

  const hasCompletedTour = store.getValue('tourCompleted') === 'true';
  const hasSeedData = store.getValue('hasSeedData') === 'true';

  // Auto-start if we have seed data but haven't completed the tour
  const shouldAutoStartTour = hasSeedData && !hasCompletedTour;

  const completeTour = useCallback(() => {
    store.setValue('tourCompleted', 'true');
  }, [store]);

  const resetTour = useCallback(() => {
    store.delValue('tourCompleted');
  }, [store]);

  return {
    hasCompletedTour,
    shouldAutoStartTour,
    completeTour,
    resetTour,
  };
}
