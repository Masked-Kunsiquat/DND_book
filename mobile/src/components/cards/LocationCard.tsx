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

/**
 * Render a small themed badge that displays a location type label.
 *
 * @param label - The text displayed inside the badge
 * @returns A themed View containing the label styled as a compact type badge
 */
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

/**
 * Renders a themed badge labeled "Shadow".
 *
 * The badge uses theme colors for its dashed border, background, and text to indicate a shadowed location.
 *
 * @returns A React element displaying a small "Shadow" badge
 */
function ShadowBadge() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.shadowBadge,
        {
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surfaceVariant,
        },
      ]}
    >
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Shadow
      </Text>
    </View>
  );
}

/**
 * Render a card summarizing a location with optional parent, status indicator, type badge, and tag chips.
 *
 * @param location - Location data to display (name, type, status, etc.)
 * @param parentName - Optional resolved parent location name to show as a subtitle
 * @param tags - Optional list of tags to render as clickable chips
 * @param statusLabel - Optional status message shown beneath the title
 * @param statusTone - Tone for the status label; `'error'` selects error color, otherwise warning color
 * @param onTagPress - Optional callback invoked with a tag id when a tag chip is pressed
 * @param onPress - Optional callback invoked when the card is pressed
 * @param style - Optional container style applied to the card
 * @returns A React element displaying the location card with its badges, status, and tags
 */
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
  const rightContent = (
    <View style={styles.rightBadges}>
      {location.status === 'shadow' && <ShadowBadge />}
      <TypeBadge label={location.type} />
    </View>
  );

  return (
    <AppCard
      title={location.name || 'Unnamed location'}
      subtitle={subtitle}
      right={rightContent}
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
  shadowBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  rightBadges: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
});