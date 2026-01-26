import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, FAB, Switch, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  FormModal,
  FormMultiSelect,
  FormSelect,
  FormTextInput,
  Screen,
  EmptyState,
  NoteCard,
  TagChip,
  TagInput,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, layout, spacing } from '../../src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import type { Tag } from '../../src/types/schema';
import {
  useCampaigns,
  useCreateNote,
  useCurrentCampaign,
  useGetOrCreateTag,
  useLocations,
  useNotes,
  usePullToRefresh,
  useTags,
} from '../../src/hooks';

export default function NotesScreen() {
  const { theme } = useTheme();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const locations = useLocations();
  const [query, setQuery] = useState('');
  const [onlyCurrent, setOnlyCurrent] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftCampaignId, setDraftCampaignId] = useState('');
  const [draftLocationIds, setDraftLocationIds] = useState<string[]>([]);
  const [draftTagIds, setDraftTagIds] = useState<string[]>([]);
  const createNote = useCreateNote();
  const tags = useTags();
  const getOrCreateTag = useGetOrCreateTag();
  const { refreshing, onRefresh } = usePullToRefresh();

  const effectiveCampaignId = onlyCurrent && currentCampaign ? currentCampaign.id : undefined;
  const notes = useNotes(effectiveCampaignId);
  const params = useLocalSearchParams<{ tagId?: string | string[] }>();

  const tagParam = useMemo(() => {
    const raw = params.tagId;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.tagId]);

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

  const locationOptions = useMemo(() => {
    const filtered = draftCampaignId
      ? locations.filter((location) => location.campaignIds.includes(draftCampaignId))
      : locations;
    return filtered.map((location) => ({
      label: location.name || 'Unnamed location',
      value: location.id,
    }));
  }, [draftCampaignId, locations]);

  const filteredNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const scoped = selectedTagIds.length
      ? notes.filter((note) => note.tagIds.some((id) => selectedTagIds.includes(id)))
      : notes;
    if (!normalized) return scoped;
    return scoped.filter((note) => {
      const title = note.title?.toLowerCase() ?? '';
      const content = note.content?.toLowerCase() ?? '';
      return title.includes(normalized) || content.includes(normalized);
    });
  }, [notes, query, selectedTagIds]);

  useEffect(() => {
    if (tagParam) {
      setSelectedTagIds([tagParam]);
    }
  }, [tagParam]);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    );
  };

  const openCreateModal = () => {
    setDraftTitle(`New Note ${notes.length + 1}`);
    setDraftContent('');
    setDraftCampaignId(currentCampaign?.id ?? campaigns[0]?.id ?? '');
    setDraftLocationIds([]);
    setDraftTagIds([]);
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
  };

  const handleCampaignChange = (value: string) => {
    setDraftCampaignId(value);
    if (!value) {
      setDraftLocationIds([]);
      return;
    }
    const allowed = new Set(
      locations
        .filter((location) => location.campaignIds.includes(value))
        .map((location) => location.id)
    );
    setDraftLocationIds((prev) => prev.filter((id) => allowed.has(id)));
  };

  const handleCreateTag = (tagName: string) => {
    const id = getOrCreateTag(tagName);
    return id || undefined;
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
        locationIds: draftLocationIds,
        tagIds: draftTagIds,
      });
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create note.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const createModal = (
    <FormModal
      title="New Note"
      visible={isCreateOpen}
      onDismiss={closeCreateModal}
      actions={
        <>
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
        </>
      }
    >
      <FormSelect
        label="Campaign"
        value={draftCampaignId}
        options={campaignOptions}
        onChange={handleCampaignChange}
      />
      <FormTextInput label="Title" value={draftTitle} onChangeText={setDraftTitle} />
      <FormTextInput
        label="Content"
        value={draftContent}
        onChangeText={setDraftContent}
        multiline
        style={styles.modalContentInput}
      />
      <FormMultiSelect
        label="Locations"
        value={draftLocationIds}
        options={locationOptions}
        onChange={setDraftLocationIds}
        helperText="Optional: link this note to locations."
      />
      <TagInput
        tags={tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
        selectedIds={draftTagIds}
        onChange={setDraftTagIds}
        onCreateTag={handleCreateTag}
      />
      {createError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      )}
    </FormModal>
  );

  if (notes.length === 0) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
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
        {createModal}
      </>
    );
  }

  if (filteredNotes.length === 0) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No notes match your filters"
            description="Try clearing search or tag filters."
            icon="note-text-outline"
            action={{
              label: 'Clear Filters',
              onPress: () => {
                setQuery('');
                setSelectedTagIds([]);
              },
            }}
          />
        </Screen>
        {createModal}
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
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                mode="outlined"
                placeholder="Search notes..."
                style={styles.searchInput}
              />
              <View
                style={[
                  styles.filtersContainer,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.outlineVariant,
                  },
                ]}
              >
                <View style={styles.filterHeader}>
                  <Pressable
                    onPress={() => setFiltersOpen((prev) => !prev)}
                    style={styles.filterTitle}
                  >
                    <MaterialCommunityIcons
                      name="tune-variant"
                      size={18}
                      color={theme.colors.primary}
                      style={styles.filterIcon}
                    />
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                      Filters
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setFiltersOpen((prev) => !prev)} hitSlop={6}>
                    <MaterialCommunityIcons
                      name={filtersOpen ? 'chevron-up' : 'chevron-down'}
                      size={iconSizes.md}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </Pressable>
                </View>
                {filtersOpen && (
                  <>
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
                    <View style={styles.tagHeader}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Tags
                      </Text>
                      {selectedTagIds.length > 0 && (
                        <Button mode="text" onPress={() => setSelectedTagIds([])} compact>
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
                            selected={selectedTagIds.includes(tag.id)}
                            onPress={() => toggleTag(tag.id)}
                          />
                        ))}
                      </ScrollView>
                    ) : (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        No tags yet.
                      </Text>
                    )}
                  </>
                )}
              </View>
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
              .filter((tag): tag is Tag => tag !== undefined);

            return (
              <View style={styles.cardWrapper}>
                <NoteCard
                  note={item}
                  tags={resolvedTags}
                  campaignName={campaignName}
                  onPress={() => router.push(`/note/${item.id}`)}
                  onTagPress={(tagId) => router.push(`/tag/${tagId}`)}
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
      {createModal}
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
  filtersContainer: {
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    padding: spacing[3],
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterTitle: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  tagScroll: {
    paddingBottom: spacing[2],
    gap: spacing[2],
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
  modalContentInput: {
    minHeight: 120,
  },
});
