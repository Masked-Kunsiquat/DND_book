/**
 * Custom tooltip component for the spotlight tour.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, layout } from '../theme';

interface TourTooltipProps {
  /** Title of the current step */
  title: string;
  /** Description/body text */
  description: string;
  /** Current step number (1-indexed for display) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Callback to go to next step */
  onNext: () => void;
  /** Callback to go to previous step */
  onPrevious: () => void;
  /** Callback to stop the tour */
  onStop: () => void;
  /** Whether this is the first step */
  isFirst: boolean;
  /** Whether this is the last step */
  isLast: boolean;
}

/**
 * Renders a themed tooltip for spotlight tour steps.
 */
export function TourTooltip({
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onStop,
  isFirst,
  isLast,
}: TourTooltipProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      <View style={styles.header}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {currentStep} of {totalSteps}
        </Text>
      </View>

      <Text
        variant="bodyMedium"
        style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
      >
        {description}
      </Text>

      <View style={styles.actions}>
        {!isFirst && (
          <Button mode="text" onPress={onPrevious} compact>
            Back
          </Button>
        )}
        <View style={styles.spacer} />
        <Button mode="text" onPress={onStop} compact textColor={theme.colors.onSurfaceVariant}>
          Skip
        </Button>
        <Button mode="contained" onPress={onNext} compact>
          {isLast ? 'Done' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 2,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  description: {
    marginBottom: spacing[4],
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  spacer: {
    flex: 1,
  },
});
