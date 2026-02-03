/**
 * Collapsible filter container with toggle header.
 * Used for filter sections in list screens.
 */

import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { commonStyles, iconSizes, layout, spacing } from '../../theme';

export interface FilterHeaderProps {
  /** Whether filters are expanded */
  expanded: boolean;
  /** Toggle expansion state */
  onToggle: () => void;
  /** Filter content to show when expanded */
  children: ReactNode;
  /** Optional additional style for the container */
  style?: object;
}

/**
 * Renders a collapsible filter container with a "Filters" header and chevron toggle.
 * When expanded, displays the provided children content.
 */
export function FilterHeader({
  expanded,
  onToggle,
  children,
  style,
}: FilterHeaderProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
        style,
      ]}
    >
      <View style={commonStyles.flexRowBetween}>
        <Pressable onPress={onToggle} style={commonStyles.flexRow}>
          <MaterialCommunityIcons
            name="tune-variant"
            size={18}
            color={theme.colors.primary}
            style={styles.filterIcon}
          />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Filters
          </Text>
        </Pressable>
        <Pressable onPress={onToggle} hitSlop={6}>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={iconSizes.md}
            color={theme.colors.onSurfaceVariant}
          />
        </Pressable>
      </View>
      {expanded && children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    padding: spacing[3],
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  filterIcon: {
    marginRight: spacing[2],
  },
});
