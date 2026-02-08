/**
 * Badge for marking entities as demo/sample data.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { iconSizes, spacing } from '../../theme';

export interface DemoBadgeProps {
  /** Optional style override */
  style?: object;
}

/**
 * A small badge indicating an entity is demo/sample data.
 * Uses a subtle terracotta/pottery color to match the Odyssey theme.
 */
export function DemoBadge({ style }: DemoBadgeProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: 'rgba(198, 108, 68, 0.15)',
          borderColor: 'rgba(198, 108, 68, 0.4)',
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name="pot-outline"
        size={iconSizes.xs}
        color="rgb(198, 108, 68)"
      />
      <Text variant="labelSmall" style={styles.text}>
        Demo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: spacing[1],
  },
  text: {
    color: 'rgb(198, 108, 68)',
  },
});
