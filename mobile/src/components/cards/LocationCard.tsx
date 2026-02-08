/**
 * Location card with type badge, parent label, and tags.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from './AppCard';
import { TagChip } from '../chips/TagChip';
import { DemoBadge } from '../chips/DemoBadge';
import { StyledBadge } from '../shared/StyledBadge';
import { iconSizes, semanticColors, spacing } from '../../theme';
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
  /** Whether this entity is demo data */
  isDemo?: boolean;
  /** Additional style for the card container */
  style?: object;
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
  isDemo,
  style,
}: LocationCardProps) {
  const subtitle = parentName ? `Parent: ${parentName}` : undefined;
  const statusColor =
    statusTone === 'error' ? semanticColors.error.main : semanticColors.warning.main;
  const rightContent = (
    <View style={styles.rightBadges}>
      {location.status === 'shadow' && <StyledBadge label="Shadow" variant="shadow" size="medium" />}
      <StyledBadge label={location.type} size="medium" />
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
      {isDemo && (
        <View style={styles.statusRow}>
          <DemoBadge />
        </View>
      )}
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
  rightBadges: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
});