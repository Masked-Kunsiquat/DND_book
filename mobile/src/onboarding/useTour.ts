/**
 * Hook for managing tour state.
 */

import { useCallback, useEffect } from 'react';
import { useValue } from 'tinybase/ui-react';
import { useStore } from '../store';
import { createLogger } from '../utils/logger';

const log = createLogger('tour');

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

  // Use reactive hooks for store values
  const tourCompletedValue = useValue('tourCompleted', store) as string | undefined;
  const hasSeedDataValue = useValue('hasSeedData', store) as string | undefined;

  const hasCompletedTour = tourCompletedValue === 'true';
  const hasSeedData = hasSeedDataValue === 'true';

  // Auto-start if we have seed data but haven't completed the tour
  const shouldAutoStartTour = hasSeedData && !hasCompletedTour;

  const completeTour = useCallback(() => {
    log.info('Marking tour as completed');
    store.setValue('tourCompleted', 'true');
  }, [store]);

  const resetTour = useCallback(() => {
    log.info('Resetting tour state');
    store.delValue('tourCompleted');
  }, [store]);

  // Log state on mount and changes
  useEffect(() => {
    log.debug('Tour state:', {
      hasCompletedTour,
      hasSeedData,
      shouldAutoStartTour,
      tourCompletedValue,
      hasSeedDataValue,
    });
  }, [hasCompletedTour, hasSeedData, shouldAutoStartTour, tourCompletedValue, hasSeedDataValue]);

  return {
    hasCompletedTour,
    shouldAutoStartTour,
    completeTour,
    resetTour,
  };
}
