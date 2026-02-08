/**
 * Tour provider component that wraps the app with spotlight tour functionality.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text } from 'react-native-paper';
import { SpotlightTourProvider, useSpotlightTour } from 'react-native-spotlight-tour';
import { router } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme';
import { useSeedData } from '../hooks/useSeedData';
import { createTourSteps } from './steps';
import { useTour } from './useTour';
import { createLogger } from '../utils/logger';

const log = createLogger('tour');

interface TourContextValue {
  /** Start the tour from the beginning */
  startTour: () => void;
  /** Whether the tour is currently active */
  isActive: boolean;
  /** Whether the end-of-tour prompt is showing */
  showingPrompt: boolean;
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

interface TourControllerProps {
  children: React.ReactNode;
  showPrompt: boolean;
  setShowPrompt: (show: boolean) => void;
}

/**
 * Inner component that has access to useSpotlightTour.
 */
function TourController({ children, showPrompt, setShowPrompt }: TourControllerProps) {
  const { theme } = useTheme();
  const { start, stop, current } = useSpotlightTour();
  const { shouldAutoStartTour, completeTour } = useTour();
  const { hasSeedData, clearSeedData } = useSeedData();
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const isActive = current !== undefined;

  // Auto-start tour on first run
  useEffect(() => {
    log.debug('Tour auto-start check:', {
      shouldAutoStartTour,
      hasAutoStarted,
      hasSeedData,
    });
    if (shouldAutoStartTour && !hasAutoStarted) {
      log.info('Auto-starting tour...');
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        log.debug('Starting tour now');
        start();
        setHasAutoStarted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoStartTour, hasAutoStarted, start, hasSeedData]);

  // Stop the tour if seed data is cleared while tour is active
  useEffect(() => {
    if (isActive && !hasSeedData) {
      log.info('Stopping tour - seed data cleared');
      stop();
      completeTour();
    }
  }, [isActive, hasSeedData, stop, completeTour]);

  const startTour = useCallback(() => {
    log.info('Manual tour start requested');
    start();
  }, [start]);

  const handleKeepDemo = useCallback(() => {
    setShowPrompt(false);
  }, [setShowPrompt]);

  const handleStartFresh = useCallback(() => {
    setShowPrompt(false);
    clearSeedData();
    router.replace({ pathname: '/campaigns', params: { create: '1' } });
  }, [clearSeedData, setShowPrompt]);

  const contextValue = useMemo(
    () => ({
      startTour,
      isActive,
      showingPrompt: showPrompt,
    }),
    [startTour, isActive, showPrompt]
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      <Portal>
        <Modal
          visible={showPrompt}
          onDismiss={handleKeepDemo}
          contentContainerStyle={[
            styles.promptContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
            Tour Complete!
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.promptDescription, { color: theme.colors.onSurfaceVariant }]}
          >
            You've learned the basics. Would you like to keep exploring the Odyssey demo, or start
            fresh with your own campaign?
          </Text>
          <View style={styles.promptActions}>
            <Button mode="outlined" onPress={handleKeepDemo} style={styles.promptButton}>
              Keep Demo
            </Button>
            <Button mode="contained" onPress={handleStartFresh} style={styles.promptButton}>
              Start Fresh
            </Button>
          </View>
        </Modal>
      </Portal>
    </TourContext.Provider>
  );
}

/**
 * Provides spotlight tour functionality to the app.
 * Wraps children with SpotlightTourProvider and manages tour state.
 */
export function TourProvider({ children }: TourProviderProps) {
  const { isDark } = useTheme();
  const { hasSeedData } = useSeedData();
  const { completeTour } = useTour();
  const [showPrompt, setShowPrompt] = useState(false);

  const handleTourComplete = useCallback(() => {
    completeTour();
    if (hasSeedData) {
      setShowPrompt(true);
    }
  }, [completeTour, hasSeedData]);

  const steps = useMemo(() => createTourSteps(handleTourComplete), [handleTourComplete]);

  return (
    <SpotlightTourProvider
      steps={steps}
      overlayColor={isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)'}
      overlayOpacity={0.8}
      onBackdropPress="continue"
      motion="bounce"
      shape="rectangle"
    >
      <TourController showPrompt={showPrompt} setShowPrompt={setShowPrompt}>
        {children}
      </TourController>
    </SpotlightTourProvider>
  );
}

const styles = StyleSheet.create({
  promptContainer: {
    margin: spacing[4],
    padding: spacing[4],
    borderRadius: 16,
    gap: spacing[3],
  },
  promptDescription: {
    lineHeight: 22,
  },
  promptActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  promptButton: {
    flex: 1,
  },
});
