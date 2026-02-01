/**
 * Note card with preview, tags, and optional campaign badge.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppCard } from './AppCard';
import { TagChip } from '../chips/TagChip';
import { StyledBadge } from '../shared/StyledBadge';
import { spacing } from '../../theme';
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

/**
 * Render a card summarizing a note with optional tags and a campaign or shared badge.
 *
 * Renders the note title (or "Untitled note"), a trimmed content preview, an optional badge
 * (campaignName takes precedence; otherwise "Shared" when note.scope === 'continuity'), and
 * a row of tag chips if any tags are provided.
 *
 * @param note - The note data to display
 * @param tags - Resolved tag objects to render as chips; defaults to an empty array
 * @param campaignName - Optional label to show in the badge; when omitted and the note's scope is 'continuity', a "Shared" badge is shown
 * @param onTagPress - Optional callback invoked with the tag id when a tag chip is pressed
 * @param onPress - Optional callback invoked when the card is pressed
 * @param style - Optional additional style applied to the card container
 * @returns The rendered note card element
 */
export function NoteCard({
  note,
  tags = [],
  campaignName,
  onTagPress,
  onPress,
  style,
}: NoteCardProps) {
  const badgeLabel = campaignName ?? (note.scope === 'continuity' ? 'Shared' : undefined);

  return (
    <AppCard
      title={note.title || 'Untitled note'}
      subtitle={buildPreview(note.content || '')}
      onPress={onPress}
      right={badgeLabel ? <StyledBadge label={badgeLabel} size="medium" /> : undefined}
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
});