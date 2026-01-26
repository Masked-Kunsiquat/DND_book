import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import ColorPicker, { Swatches } from 'reanimated-color-picker';
import {
  ConfirmDialog,
  EmptyState,
  FormModal,
  FormTextInput,
  Screen,
  Section,
  StatCard,
  TagChip,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing, tagColors } from '../../src/theme';
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const defaultTagColor: string = tagColors[0]?.bg ?? '#3b82f6';
  const [draftColor, setDraftColor] = useState(defaultTagColor);

  const sessionsForTag = useMemo(() => {
    if (!tagId) return [];
    return sessionLogs.filter((log) => log.tagIds.includes(tagId));
  }, [sessionLogs, tagId]);

  const openEditModal = () => {
    if (!tag) return;
    setDraftName(tag.name);
    setDraftColor(tag.color || defaultTagColor);
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
      updateTag(tag.id, { name: trimmed, color: draftColor });
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tag.';
      setEditError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!tag || isDeleting) return;
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (!tag || isDeleting) return;
    setIsDeleting(true);
    try {
      await Promise.resolve(deleteTag(tag.id));
      setIsDeleteOpen(false);
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tag.';
      setEditError(message);
      setIsDeleting(false);
    }
  };

  const editModal = (
    <FormModal
      title="Edit Tag"
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
      <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
        Color
      </Text>
      <View style={styles.colorPreviewRow}>
        <TagChip id="preview" name={draftName.trim() || 'Tag'} color={draftColor} size="small" />
      </View>
      <ColorPicker value={draftColor} onChangeJS={(color) => setDraftColor(color.hex)}>
        <Swatches
          colors={tagColors.map((tag) => tag.bg)}
          style={styles.swatches}
          swatchStyle={styles.swatch}
        />
      </ColorPicker>
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
            <TagChip id={tag.id} name={tag.name} color={tag.color} />
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
              Edit
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
      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete tag?"
        description="This tag will be removed from all linked content."
        confirmLabel="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
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
  colorPreviewRow: {
    alignItems: 'flex-start',
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  swatch: {
    width: '24%',
    aspectRatio: 1,
    marginHorizontal: 0,
    marginBottom: spacing[2],
    borderRadius: 999,
  },
});
