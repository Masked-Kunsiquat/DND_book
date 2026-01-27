/**
 * Note card with preview, tags, and optional campaign badge.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AppCard } from './AppCard';
import { TagChip } from '../chips/TagChip';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';
import type { Note, Tag } from '../../types/schema';

export interface NoteCardProps {
  /** Note data */
  note: Note;
  /** Optional resolved tag objects */
  tags?: Tag[];
  /** Optional campaign label */
  campaignName?: string;
  /** Called when a tag is pressed */
  onTagPress?: (tagId: string) => void;
  /** Called when card is pressed */
  onPress?: () => void;
  /** Additional style for the card container */
  style?: object;
}

const PREVIEW_LENGTH = 100;

function buildPreview(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return 'No content yet.';
  if (trimmed.length <= PREVIEW_LENGTH) return trimmed;
  return `${trimmed.slice(0, PREVIEW_LENGTH)}...`;
}

export function NoteCard({
  note,
  tags = [],
  campaignName,
  onTagPress,
  onPress,
  style,
}: NoteCardProps) {
  const { theme } = useTheme();

  const badgeLabel = campaignName ?? (note.scope === 'continuity' ? 'Shared' : undefined);
  const campaignBadge = badgeLabel ? (
    <View
      style={[
        styles.campaignBadge,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {badgeLabel}
      </Text>
    </View>
  ) : undefined;

  return (
    <AppCard
      title={note.title || 'Untitled note'}
      subtitle={buildPreview(note.content || '')}
      onPress={onPress}
      right={campaignBadge}
      style={style}
    >
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
  campaignBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
