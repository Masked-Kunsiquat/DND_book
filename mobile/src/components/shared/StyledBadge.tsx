/**
 * Reusable badge component with multiple style variants.
 */

import React from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';

export type BadgeVariant = 'default' | 'primary' | 'shadow' | 'count';
export type BadgeSize = 'small' | 'medium';

export interface StyledBadgeProps {
  /** Text label to display */
  label: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Numeric value (only used with 'count' variant) */
  value?: number;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
}

/**
 * A themed badge component with multiple visual variants.
 *
 * Variants:
 * - `default`: Neutral background with solid border (surfaceVariant colors)
 * - `primary`: Primary-colored background with primary border (primaryContainer colors)
 * - `shadow`: Neutral background with dashed border (indicates incomplete/shadow status)
 * - `count`: Larger badge with numeric value above label (for stats display)
 */
export function StyledBadge({
  label,
  variant = 'default',
  size = 'small',
  value,
  style,
}: StyledBadgeProps) {
  const { theme } = useTheme();

  const isPrimary = variant === 'primary';
  const isShadow = variant === 'shadow';
  const isCount = variant === 'count';

  const backgroundColor = isPrimary
    ? theme.colors.primaryContainer
    : theme.colors.surfaceVariant;

  const borderColor = isPrimary
    ? theme.colors.primary
    : theme.colors.outlineVariant;

  const textColor = isPrimary
    ? theme.colors.onPrimaryContainer
    : theme.colors.onSurfaceVariant;

  const valueColor = theme.colors.onSurface;

  const sizeStyle = size === 'medium' ? styles.sizeMedium : styles.sizeSmall;

  if (isCount) {
    return (
      <View
        style={[
          styles.countBadge,
          { backgroundColor, borderColor },
          style,
        ]}
      >
        <Text variant="labelLarge" style={[styles.countValue, { color: valueColor }]}>
          {value ?? 0}
        </Text>
        <Text variant="labelSmall" style={{ color: textColor }}>
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        sizeStyle,
        { backgroundColor, borderColor },
        isShadow && styles.dashedBorder,
        style,
      ]}
    >
      <Text variant="labelSmall" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
  },
  sizeSmall: {
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
  },
  sizeMedium: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
  },
  dashedBorder: {
    borderStyle: 'dashed',
  },
  countBadge: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing[12],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
  },
  countValue: {
    marginBottom: spacing[0.5],
  },
});
