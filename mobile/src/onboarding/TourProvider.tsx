/**
 * Tour provider component that wraps the app with spotlight tour functionality.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SpotlightTourProvider, useSpotlightTour } from 'react-native-spotlight-tour';
import { useTheme } from '../theme/ThemeProvider';
import { createTourSteps } from './steps';
import { useTour } from './useTour';

interface TourContextValue {
  /** Start the tour from the beginning */
  startTour: () => void;
  /** Whether the tour is currently active */
  isActive: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

/**
 * Hook to access tour controls from anywhere in the app.
 */
export function useTourControls(): TourContextValue {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourControls must be used within TourProvider');
  }
  return context;
}

interface TourProviderProps {
  children: React.ReactNode;
}

/**
 * Inner component that has access to useSpotlightTour.
 */
function TourController({ children }: TourProviderProps) {
  const { start, stop, current } = useSpotlightTour();
  const { shouldAutoStartTour, completeTour } = useTour();
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const isActive = current !== undefined;

  // Auto-start tour on first run
  useEffect(() => {
    if (shouldAutoStartTour && !hasAutoStarted) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        start();
        setHasAutoStarted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoStartTour, hasAutoStarted, start]);

  const startTour = useCallback(() => {
    start();
  }, [start]);

  const contextValue = useMemo(
    () => ({
      startTour,
      isActive,
    }),
    [startTour, isActive]
  );

  return <TourContext.Provider value={contextValue}>{children}</TourContext.Provider>;
}

/**
 * Provides spotlight tour functionality to the app.
 * Wraps children with SpotlightTourProvider and manages tour state.
 */
export function TourProvider({ children }: TourProviderProps) {
  const { theme, isDark } = useTheme();
  const { completeTour } = useTour();

  const steps = useMemo(() => createTourSteps(completeTour), [completeTour]);

  return (
    <SpotlightTourProvider
      steps={steps}
      overlayColor={isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)'}
      overlayOpacity={0.8}
      onBackdropPress="continue"
      motion="bounce"
      shape="rectangle"
    >
      <TourController>{children}</TourController>
    </SpotlightTourProvider>
  );
}
