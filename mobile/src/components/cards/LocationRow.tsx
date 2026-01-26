/**
 * Compact location list row with path context.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { TagChip } from '../chips/TagChip';
import { useTheme } from '../../theme/ThemeProvider';
import { iconSizes, layout, semanticColors, spacing } from '../../theme';
import type { Location, Tag } from '../../types/schema';

export interface LocationRowProps {
  /** Location data */
  location: Location;
  /** Optional hierarchy path label */
  pathLabel?: string;
  /** Optional resolved tag objects */
  tags?: Tag[];
  /** Optional status message */
  statusLabel?: string;
  /** Optional status tone */
  statusTone?: 'warning' | 'error';
  /** Called when a tag is pressed */
  onTagPress?: (tagId: string) => void;
  /** Called when row is pressed */
  onPress?: () => void;
  /** Additional style for the row container */
  style?: object;
}

interface TypeBadgeProps {
  label: string;
}

function TypeBadge({ label }: TypeBadgeProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.typeBadge,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}

const MAX_TAGS = 2;

export function LocationRow({
  location,
  pathLabel,
  tags = [],
  statusLabel,
  statusTone = 'warning',
  onTagPress,
  onPress,
  style,
}: LocationRowProps) {
  const { theme } = useTheme();
  const statusColor =
    statusTone === 'error' ? semanticColors.error.main : semanticColors.warning.main;
  const visibleTags = tags.slice(0, MAX_TAGS);
  const extraCount = tags.length - visibleTags.length;
  const pathText = pathLabel && pathLabel.length > 0 ? pathLabel : 'Top level';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }} numberOfLines={1}>
            {location.name || 'Unnamed location'}
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={1}
          >
            {pathText}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TypeBadge label={location.type} />
          <MaterialCommunityIcons
            name="chevron-right"
            size={iconSizes.md}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>
      {statusLabel && (
        <View style={styles.statusRow}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={iconSizes.sm}
            color={statusColor}
          />
          <Text variant="labelSmall" style={{ color: statusColor }}>
            {statusLabel}
          </Text>
        </View>
      )}
      {visibleTags.length > 0 && (
        <View style={styles.tagsRow}>
          {visibleTags.map((tag) => (
            <TagChip
              key={tag.id}
              id={tag.id}
              name={tag.name}
              color={tag.color}
              size="small"
              onPress={onTagPress ? () => onTagPress(tag.id) : undefined}
            />
          ))}
          {extraCount > 0 && (
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              +{extraCount}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    padding: spacing[2],
    gap: spacing[1.5],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  headerText: {
    flex: 1,
    gap: spacing[0.5],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  typeBadge: {
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
