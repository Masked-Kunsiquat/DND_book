/**
 * Tag filter section with horizontal scrolling tag chips.
 * Used inside FilterHeader for tag-based filtering.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { TagChip } from '../chips/TagChip';
import { useTheme } from '../../theme/ThemeProvider';
import { commonStyles, spacing } from '../../theme';
import type { Tag } from '../../types/schema';

export interface TagFilterSectionProps {
  /** Available tags to display */
  tags: Tag[];
  /** Currently selected tag IDs */
  selectedIds: string[];
  /** Called when a tag is toggled */
  onToggle: (tagId: string) => void;
  /** Called when clear button is pressed */
  onClear: () => void;
  /** Optional header style override */
  headerStyle?: object;
}

/**
 * Renders a tag filter section with a "Tags" header, optional clear button,
 * and a horizontal scrolling list of tag chips.
 */
export function TagFilterSection({
  tags,
  selectedIds,
  onToggle,
  onClear,
  headerStyle,
}: TagFilterSectionProps) {
  const { theme } = useTheme();

  return (
    <>
      <View style={[commonStyles.flexRowBetween, headerStyle]}>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Tags
        </Text>
        {selectedIds.length > 0 && (
          <Button mode="text" onPress={onClear} compact>
            Clear
          </Button>
        )}
      </View>
      {tags.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagScroll}
        >
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              id={tag.id}
              name={tag.name}
              color={tag.color}
              size="small"
              selected={selectedIds.includes(tag.id)}
              onPress={() => onToggle(tag.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          No tags yet.
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tagScroll: {
    paddingBottom: spacing[2],
    gap: spacing[2],
  },
});
