import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { EmptyState, FormModal, FormTextInput, Screen, Section, StatCard, TagChip } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import {
  useDeleteTag,
  useLocationsByTag,
  useNotesByTag,
  useNpcsByTag,
  useSessionLogs,
  useTag,
  useTags,
  useUpdateTag,
} from '../../src/hooks';

export default function TagDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const tagId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);
  const tag = useTag(tagId);
  const tags = useTags();
  const notes = useNotesByTag(tagId);
  const npcs = useNpcsByTag(tagId);
  const locations = useLocationsByTag(tagId);
  const sessionLogs = useSessionLogs();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const sessionsForTag = useMemo(() => {
    if (!tagId) return [];
    return sessionLogs.filter((log) => log.tagIds.includes(tagId));
  }, [sessionLogs, tagId]);

  const openEditModal = () => {
    if (!tag) return;
    setDraftName(tag.name);
    setEditError(null);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditError(null);
  };

  const handleSave = () => {
    if (!tag) return;
    const trimmed = draftName.trim();
    if (!trimmed) {
      setEditError('Tag name is required.');
      return;
    }
    const duplicate = tags.find(
      (item) => item.id !== tag.id && item.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setEditError('A tag with this name already exists.');
      return;
    }
    setIsSaving(true);
    setEditError(null);
    try {
      updateTag(tag.id, { name: trimmed });
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tag.';
      setEditError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!tag) return;
    Alert.alert('Delete tag', 'This tag will be removed from all linked content.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          try {
            deleteTag(tag.id);
            router.back();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete tag.';
            setEditError(message);
          }
        },
      },
    ]);
  };

  const editModal = (
    <FormModal
      title="Rename Tag"
      visible={isEditOpen}
      onDismiss={closeEditModal}
      actions={
        <>
          <Button mode="text" onPress={closeEditModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSave} loading={isSaving} disabled={isSaving}>
            Save
          </Button>
        </>
      }
    >
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      {editError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {editError}
        </Text>
      )}
    </FormModal>
  );

  if (!tag) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Tag' }} />
        <EmptyState
          title="Tag not found"
          description="This tag may have been deleted."
          icon="tag-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <>
      <Screen>
        <Stack.Screen options={{ title: tag.name || 'Tag' }} />
        <Section title="Tag" icon="tag-outline">
          <View style={styles.tagRow}>
            <TagChip id={tag.id} name={tag.name} />
          </View>
        </Section>

        <Section title="Usage" icon="chart-box-outline">
          <View style={styles.statsRow}>
            <StatCard
              label="Notes"
              value={notes.length}
              layout="compact"
              onPress={
                notes.length > 0
                  ? () => router.push({ pathname: '/notes', params: { tagId: tag.id } })
                  : undefined
              }
            />
            <StatCard
              label="NPCs"
              value={npcs.length}
              layout="compact"
              onPress={
                npcs.length > 0
                  ? () => router.push({ pathname: '/npcs', params: { tagId: tag.id } })
                  : undefined
              }
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Locations"
              value={locations.length}
              layout="compact"
              onPress={
                locations.length > 0
                  ? () => router.push({ pathname: '/locations', params: { tagId: tag.id } })
                  : undefined
              }
            />
            <StatCard label="Sessions" value={sessionsForTag.length} layout="compact" />
          </View>
        </Section>

        <Section title="Actions" icon="wrench-outline">
          <View style={styles.actionRow}>
            <Button mode="contained" icon="pencil" onPress={openEditModal}>
              Rename
            </Button>
            <Button mode="outlined" icon="delete" onPress={handleDelete} textColor={theme.colors.error}>
              Delete
            </Button>
          </View>
          {editError && (
            <Text variant="bodySmall" style={{ color: theme.colors.error }}>
              {editError}
            </Text>
          )}
        </Section>
      </Screen>
      {editModal}
    </>
  );
}

const styles = StyleSheet.create({
  tagRow: {
    alignItems: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
});
