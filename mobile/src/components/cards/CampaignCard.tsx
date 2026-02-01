/**
 * Campaign card with summary counts.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppCard } from './AppCard';
import { StyledBadge } from '../shared/StyledBadge';
import { spacing } from '../../theme';
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
        <StyledBadge label="Notes" variant="count" value={noteCount} />
        <StyledBadge label="NPCs" variant="count" value={npcCount} />
        <StyledBadge label="Locations" variant="count" value={locationCount} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
});
