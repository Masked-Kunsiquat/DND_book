/**
 * Compact stat card for dashboard metrics.
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';

export interface StatCardProps {
  /** Stat label */
  label: string;
  /** Stat value */
  value: number | string;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Called when card is pressed */
  onPress?: () => void;
  /** Additional style for the card container */
  style?: object;
}

export function StatCard({ label, value, icon, onPress, style }: StatCardProps) {
  const { theme } = useTheme();

  const cardContent = (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }, style]} mode="contained">
      <View style={styles.body}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text variant="headlineSmall" style={[styles.value, { color: theme.colors.onSurface }]}>
          {value}
        </Text>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
      </View>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.cardBorderRadius,
    flex: 1,
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    gap: spacing[1],
  },
  icon: {
    marginBottom: spacing[1],
  },
  value: {
    lineHeight: 32,
  },
  pressed: {
    opacity: 0.7,
  },
  pressable: {
    flex: 1,
  },
});
