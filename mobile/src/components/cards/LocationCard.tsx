/**
 * Location card with type badge, parent label, and tags.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from './AppCard';
import { TagChip } from '../chips/TagChip';
import { useTheme } from '../../theme/ThemeProvider';
import { iconSizes, layout, semanticColors, spacing } from '../../theme';
import type { Location, Tag } from '../../types/schema';

export interface LocationCardProps {
  /** Location data */
  location: Location;
  /** Optional resolved parent location name */
  parentName?: string;
  /** Optional resolved tag objects */
  tags?: Tag[];
  /** Optional status message */
  statusLabel?: string;
  /** Optional status tone */
  statusTone?: 'warning' | 'error';
  /** Called when a tag is pressed */
  onTagPress?: (tagId: string) => void;
  /** Called when card is pressed */
  onPress?: () => void;
  /** Additional style for the card container */
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

export function LocationCard({
  location,
  parentName,
  tags = [],
  statusLabel,
  statusTone = 'warning',
  onTagPress,
  onPress,
  style,
}: LocationCardProps) {
  const subtitle = parentName ? `Parent: ${parentName}` : undefined;
  const statusColor =
    statusTone === 'error' ? semanticColors.error.main : semanticColors.warning.main;

  return (
    <AppCard
      title={location.name || 'Unnamed location'}
      subtitle={subtitle}
      right={<TypeBadge label={location.type} />}
      onPress={onPress}
      style={style}
    >
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
      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              id={tag.id}
              name={tag.name}
              color={tag.color}
              size="small"
              onPress={onTagPress ? () => onTagPress(tag.id) : undefined}
            />
          ))}
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[2],
  },
  typeBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
