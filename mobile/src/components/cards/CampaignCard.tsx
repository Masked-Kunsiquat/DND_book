/**
 * Campaign card with summary counts.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AppCard } from './AppCard';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';
import { formatShortDate } from '../../utils/date';
import type { Campaign } from '../../types/schema';

export interface CampaignCardProps {
  /** Campaign data */
  campaign: Campaign;
  /** Related note count */
  noteCount?: number;
  /** Related NPC count */
  npcCount?: number;
  /** Related location count */
  locationCount?: number;
  /** Optional right-side content */
  right?: React.ReactNode;
  /** Called when card is pressed */
  onPress?: () => void;
  /** Called when card is long pressed */
  onLongPress?: () => void;
  /** Additional style for the card container */
  style?: object;
}

interface CountBadgeProps {
  label: string;
  value: number;
}

function CountBadge({ label, value }: CountBadgeProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <Text variant="labelLarge" style={[styles.badgeValue, { color: theme.colors.onSurface }]}>
        {value}
      </Text>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}

export function CampaignCard({
  campaign,
  noteCount = 0,
  npcCount = 0,
  locationCount = 0,
  right,
  onPress,
  onLongPress,
  style,
}: CampaignCardProps) {
  return (
    <AppCard
      title={campaign.name}
      subtitle={`Created ${formatShortDate(campaign.created)}`}
      onPress={onPress}
      onLongPress={onLongPress}
      right={right}
      style={style}
    >
      <View style={styles.badgeRow}>
        <CountBadge label="Notes" value={noteCount} />
        <CountBadge label="NPCs" value={npcCount} />
        <CountBadge label="Locations" value={locationCount} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  badge: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing[12],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
  },
  badgeValue: {
    marginBottom: spacing[0.5],
  },
});
