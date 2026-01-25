/**
 * Location card with type badge, parent label, and tags.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AppCard } from './AppCard';
import { TagChip } from '../chips/TagChip';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';
import type { Location, Tag } from '../../types/schema';

export interface LocationCardProps {
  /** Location data */
  location: Location;
  /** Optional resolved parent location name */
  parentName?: string;
  /** Optional resolved tag objects */
  tags?: Tag[];
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
  onPress,
  style,
}: LocationCardProps) {
  const subtitle = parentName ? `Parent: ${parentName}` : undefined;

  return (
    <AppCard
      title={location.name || 'Unnamed location'}
      subtitle={subtitle}
      right={<TypeBadge label={location.type} />}
      onPress={onPress}
      style={style}
    >
      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <TagChip key={tag.id} id={tag.id} name={tag.name} size="small" />
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
  typeBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
