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


/**
 * Render a card summarizing a campaign with count badges for notes, NPCs, and locations.
 *
 * @param campaign - Campaign data to display (used for title and creation date)
 * @param noteCount - Number of notes associated with the campaign (defaults to 0)
 * @param npcCount - Number of NPCs associated with the campaign (defaults to 0)
 * @param locationCount - Number of locations associated with the campaign (defaults to 0)
 * @param right - Optional content to render on the right side of the card
 * @param onPress - Optional handler invoked when the card is pressed
 * @param onLongPress - Optional handler invoked when the card is long-pressed
 * @param style - Optional style object applied to the card container
 * @returns A React element rendering the campaign card with title, created date subtitle, and three count badges
 */
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