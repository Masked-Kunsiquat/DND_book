import { useMemo, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Button, FAB, Modal, Portal, Switch, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FormSelect, FormTextInput, Screen, EmptyState, NoteCard } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { layout, spacing } from '../../src/theme';
import { router } from 'expo-router';
import {
  useCampaigns,
  useCreateNote,
  useCurrentCampaign,
  useNotes,
  useTags,
} from '../../src/hooks';

export default function NotesScreen() {
  const { theme } = useTheme();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const [query, setQuery] = useState('');
  const [onlyCurrent, setOnlyCurrent] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftCampaignId, setDraftCampaignId] = useState('');
  const createNote = useCreateNote();
  const tags = useTags();

  const effectiveCampaignId = onlyCurrent && currentCampaign ? currentCampaign.id : undefined;
  const notes = useNotes(effectiveCampaignId);

  const tagById = useMemo(() => {
    return new Map(tags.map((tag) => [tag.id, tag]));
  }, [tags]);

  const campaignById = useMemo(() => {
    return new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  }, [campaigns]);

  const campaignOptions = useMemo(() => {
    return campaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [campaigns]);

  const filteredNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return notes;
    return notes.filter((note) => {
      const title = note.title?.toLowerCase() ?? '';
      const content = note.content?.toLowerCase() ?? '';
      return title.includes(normalized) || content.includes(normalized);
    });
  }, [notes, query]);

  const openCreateModal = () => {
    setDraftTitle(`New Note ${notes.length + 1}`);
    setDraftContent('');
    setDraftCampaignId(currentCampaign?.id ?? campaigns[0]?.id ?? '');
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
  };

  const handleCreate = () => {
    if (isCreating) return;
    const trimmedTitle = draftTitle.trim();
    if (!draftCampaignId) {
      setCreateError('Select a campaign before creating a note.');
      return;
    }
    if (!trimmedTitle) {
      setCreateError('Note title is required.');
      return;
    }
    setIsCreating(true);
    try {
      createNote({
        title: trimmedTitle,
        content: draftContent,
        campaignId: draftCampaignId,
      });
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create note.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  if (filteredNotes.length === 0) {
    return (
      <>
        <Screen>
          <EmptyState
            title="No notes yet"
            description={
              currentCampaign
                ? 'Create your first note to get started.'
                : 'Select a campaign to start adding notes.'
            }
            icon="note-text-outline"
            action={
              campaigns.length > 0 && !isCreating
                ? { label: 'Create Note', onPress: openCreateModal }
                : undefined
            }
          />
        </Screen>
        <Portal>
          <Modal
            visible={isCreateOpen}
            onDismiss={closeCreateModal}
            contentContainerStyle={[
              styles.modal,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              New Note
            </Text>
            <FormSelect
              label="Campaign"
              value={draftCampaignId}
              options={campaignOptions}
              onChange={setDraftCampaignId}
            />
            <FormTextInput
              label="Title"
              value={draftTitle}
              onChangeText={setDraftTitle}
            />
            <FormTextInput
              label="Content"
              value={draftContent}
              onChangeText={setDraftContent}
              multiline
              style={styles.modalContentInput}
            />
            {createError && (
              <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                {createError}
              </Text>
            )}
            <View style={styles.modalActions}>
              <Button mode="text" onPress={closeCreateModal} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreate}
                loading={isCreating}
                disabled={isCreating}
              >
                Create
              </Button>
            </View>
          </Modal>
        </Portal>
      </>
    );
  }

  return (
    <>
      <Screen scroll={false}>
        <FlatList
          data={filteredNotes}
          keyExtractor={(note) => note.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.filterHeader}>
                <View style={styles.filterTitle}>
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={18}
                    color={theme.colors.primary}
                    style={styles.filterIcon}
                  />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    Filters
                  </Text>
                </View>
                <View style={styles.filterRow}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Current campaign only
                  </Text>
                  <Switch
                    value={onlyCurrent && !!currentCampaign}
                    onValueChange={setOnlyCurrent}
                    disabled={!currentCampaign}
                  />
                </View>
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                mode="outlined"
                placeholder="Search notes..."
                style={styles.searchInput}
              />
              <View style={styles.listHeader}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={18}
                  color={theme.colors.primary}
                  style={styles.listHeaderIcon}
                />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  Notes
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const campaignName = item.campaignId
              ? campaignById.get(item.campaignId)?.name
              : undefined;
            const resolvedTags = item.tagIds
              .map((tagId) => tagById.get(tagId))
              .filter(Boolean);

            return (
              <View style={styles.cardWrapper}>
                <NoteCard
                  note={item}
                  tags={resolvedTags}
                  campaignName={campaignName}
                  onPress={() => router.push(`/note/${item.id}`)}
                />
              </View>
            );
          }}
        />
        <FAB
          icon="plus"
          onPress={openCreateModal}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          disabled={campaigns.length === 0 || isCreating}
        />
      </Screen>
      <Portal>
        <Modal
          visible={isCreateOpen}
          onDismiss={closeCreateModal}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            New Note
          </Text>
          <FormSelect
            label="Campaign"
            value={draftCampaignId}
            options={campaignOptions}
            onChange={setDraftCampaignId}
          />
          <FormTextInput
            label="Title"
            value={draftTitle}
            onChangeText={setDraftTitle}
          />
          <FormTextInput
            label="Content"
            value={draftContent}
            onChangeText={setDraftContent}
            multiline
            style={styles.modalContentInput}
          />
          {createError && (
            <Text variant="bodySmall" style={{ color: theme.colors.error }}>
              {createError}
            </Text>
          )}
          <View style={styles.modalActions}>
            <Button mode="text" onPress={closeCreateModal} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreate}
              loading={isCreating}
              disabled={isCreating}
            >
              Create
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: layout.fabSize + layout.fabMargin * 2,
  },
  header: {
    marginBottom: spacing[3],
  },
  filterHeader: {
    marginBottom: spacing[3],
  },
  filterTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  filterIcon: {
    marginRight: spacing[2],
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    marginBottom: spacing[3],
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
  cardWrapper: {
    marginBottom: spacing[3],
  },
  fab: {
    position: 'absolute',
    right: layout.fabMargin,
    bottom: layout.fabMargin,
  },
  modal: {
    margin: spacing[4],
    padding: spacing[4],
    borderRadius: layout.cardBorderRadius,
    gap: spacing[3],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  modalContentInput: {
    minHeight: 120,
  },
});
