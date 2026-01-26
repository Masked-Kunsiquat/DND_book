/**
 * Badge for marking placeholder items as coming soon.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

export interface ComingSoonBadgeProps {
  /** Optional label override */
  label?: string;
  /** Optional style override */
  style?: object;
}

export function ComingSoonBadge({ label = 'Coming Soon', style }: ComingSoonBadgeProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
        style,
      ]}
    >
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
