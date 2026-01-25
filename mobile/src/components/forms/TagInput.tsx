/**
 * Tag input with suggestions and inline creation.
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { TagChip } from '../chips/TagChip';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

export interface TagOption {
  id: string;
  name: string;
}

export interface TagInputProps {
  /** Optional label */
  label?: string;
  /** All available tags */
  tags: TagOption[];
  /** Selected tag ids */
  selectedIds: string[];
  /** Change handler */
  onChange: (value: string[]) => void;
  /** Optional create handler returns new tag id */
  onCreateTag?: (name: string) => string | undefined;
  /** Optional placeholder */
  placeholder?: string;
  /** Optional helper message */
  helperText?: string;
  /** Optional error message */
  error?: string;
  /** Optional container style */
  containerStyle?: object;
}

export function TagInput({
  label = 'Tags',
  tags,
  selectedIds,
  onChange,
  onCreateTag,
  placeholder = 'Search tags...',
  helperText,
  error,
  containerStyle,
}: TagInputProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const hasError = Boolean(error);
  const message = error ?? helperText;

  const tagById = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);
  const selectedTags = useMemo(
    () => selectedIds.map((id) => tagById.get(id)).filter(Boolean) as TagOption[],
    [selectedIds, tagById]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTags = useMemo(() => {
    if (!normalizedQuery) return [];
    return tags.filter(
      (tag) =>
        !selectedIds.includes(tag.id) &&
        tag.name.toLowerCase().includes(normalizedQuery)
    );
  }, [tags, selectedIds, normalizedQuery]);

  const canCreate =
    Boolean(onCreateTag) &&
    normalizedQuery.length > 0 &&
    !tags.some((tag) => tag.name.toLowerCase() === normalizedQuery);

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((value) => value !== id));
  };

  const handleAdd = (id: string) => {
    if (!selectedIds.includes(id)) {
      onChange([...selectedIds, id]);
      setQuery('');
    }
  };

  const handleCreate = () => {
    if (!onCreateTag) return;
    const trimmed = query.trim();
    if (!trimmed) return;
    const createdId = onCreateTag(trimmed);
    if (createdId) {
      onChange([...selectedIds, createdId]);
      setQuery('');
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
        {label}
      </Text>
      <TextInput
        mode="outlined"
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
      />
      {selectedTags.length > 0 && (
        <View style={styles.chipRow}>
          {selectedTags.map((tag) => (
            <TagChip
              key={tag.id}
              id={tag.id}
              name={tag.name}
              size="small"
              onClose={() => handleRemove(tag.id)}
            />
          ))}
        </View>
      )}
      {filteredTags.length > 0 && (
        <View style={styles.suggestions}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Suggestions
          </Text>
          <View style={styles.chipRow}>
            {filteredTags.map((tag) => (
              <TagChip
                key={tag.id}
                id={tag.id}
                name={tag.name}
                size="small"
                onPress={() => handleAdd(tag.id)}
              />
            ))}
          </View>
        </View>
      )}
      {canCreate && (
        <Button mode="outlined" onPress={handleCreate} icon="plus">
          Create "{query.trim()}"
        </Button>
      )}
      {message ? (
        <Text
          variant="bodySmall"
          style={[
            styles.helperText,
            { color: hasError ? theme.colors.error : theme.colors.onSurfaceVariant },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  suggestions: {
    gap: spacing[1],
  },
  helperText: {
    marginLeft: spacing[1],
  },
});
