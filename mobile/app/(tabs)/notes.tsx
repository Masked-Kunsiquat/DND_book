import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, FAB, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  AppCard,
  FormModal,
  LocationMultiSelect,
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
import type { EntityScope, Tag } from '../../src/types/schema';
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
  const continuityId = currentCampaign?.continuityId ?? '';
  const locations = useLocations();
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeLinkModal, setActiveLinkModal] = useState<'locations' | 'tags' | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftScope, setDraftScope] = useState<EntityScope>('campaign');
  const [draftCampaignId, setDraftCampaignId] = useState('');
  const [draftCampaignIds, setDraftCampaignIds] = useState<string[]>([]);
  const [draftLocationIds, setDraftLocationIds] = useState<string[]>([]);
  const [draftTagIds, setDraftTagIds] = useState<string[]>([]);
  const createNote = useCreateNote();
  const tags = useTags(continuityId, currentCampaign?.id);
  const getOrCreateTag = useGetOrCreateTag({
    continuityId: currentCampaign?.continuityId,
    scope: 'continuity',
  });
  const { refreshing, onRefresh } = usePullToRefresh();

  const effectiveCampaignId = currentCampaign?.id;
  const notes = useNotes(continuityId, effectiveCampaignId);
  const params = useLocalSearchParams<{ tagId?: string | string[] }>();

  const tagParam = useMemo(() => {
    const raw = params.tagId;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.tagId]);

  const tagById = useMemo(() => {
    return new Map(tags.map((tag) => [tag.id, tag]));
  }, [tags]);

  const availableTags = useMemo(() => {
    if (draftScope === 'continuity') {
      return tags.filter((tag) => tag.scope === 'continuity');
    }
    return tags;
  }, [draftScope, tags]);

  const campaignById = useMemo(() => {
    return new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  }, [campaigns]);

  const continuityCampaigns = useMemo(() => {
    if (!continuityId) return campaigns;
    return campaigns.filter((campaign) => campaign.continuityId === continuityId);
  }, [campaigns, continuityId]);

  const campaignOptions = useMemo(() => {
    return continuityCampaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [continuityCampaigns]);

  const continuityLocations = useMemo(() => {
    if (!continuityId) return [];
    return locations.filter(
      (location) => location.scope === 'continuity' && location.continuityId === continuityId
    );
  }, [continuityId, locations]);

  const selectableLocations = useMemo(() => {
    if (draftScope === 'continuity') {
      return continuityLocations;
    }
    return draftCampaignId
      ? locations.filter((location) => location.campaignIds.includes(draftCampaignId))
      : locations;
  }, [continuityLocations, draftCampaignId, draftScope, locations]);

  const filteredNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const scoped = selectedTagIds.length
      ? notes.filter((note) => note.tagIds.some((id) => selectedTagIds.includes(id)))
      : notes;
    const filtered = normalized
      ? scoped.filter((note) => {
          const title = note.title?.toLowerCase() ?? '';
          const content = note.content?.toLowerCase() ?? '';
          return title.includes(normalized) || content.includes(normalized);
        })
      : scoped;
    return [...filtered].sort((a, b) => {
      const aDate = a.updated || a.created;
      const bDate = b.updated || b.created;
      return bDate.localeCompare(aDate);
    });
  }, [notes, query, selectedTagIds]);

  const appendDraftContent = (snippet: string) => {
    setDraftContent((prev) => {
      const trimmed = prev.trimEnd();
      return trimmed ? `${trimmed}\n\n${snippet}` : snippet;
    });
  };

  const buildDateHeading = () => {
    const label = new Date().toLocaleDateString();
    return `### Session Date — ${label}\n- `;
  };

  const quickInserts = [
    { label: 'Date Heading', content: buildDateHeading() },
    { label: 'Chronological Log', content: '### Session Log\n- ' },
    { label: 'Leads / Questions', content: '### Leads & Questions\n- ' },
    { label: 'NPCs', content: '### NPCs\n- ' },
    { label: 'Locations', content: '### Locations\n- ' },
    { label: 'Items / Loot', content: '### Items & Loot\n- ' },
    { label: 'Highlights', content: '### Highlights\n- ' },
  ];

  useEffect(() => {
    setSelectedTagIds(tagParam ? [tagParam] : []);
  }, [tagParam]);

  if (!currentCampaign) {
    return (
      <Screen>
        <EmptyState
          title="No campaign selected"
          description="Select a campaign to view notes."
          icon="note-text-outline"
          action={{ label: 'Choose campaign', onPress: () => router.push('/campaigns') }}
        />
      </Screen>
    );
  }

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    );
  };

  const openCreateModal = () => {
    setDraftTitle(`New Note ${notes.length + 1}`);
    setDraftContent('');
    setDraftScope('campaign');
    setDraftCampaignId(currentCampaign?.id ?? campaigns[0]?.id ?? '');
    setDraftCampaignIds(currentCampaign?.id ? [currentCampaign.id] : []);
    setDraftLocationIds([]);
    setDraftTagIds([]);
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
    setActiveLinkModal(null);
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

  const handleScopeChange = (value: EntityScope) => {
    setDraftScope(value);
    setDraftLocationIds([]);
    setDraftTagIds([]);
    if (value === 'campaign') {
      setDraftCampaignId(currentCampaign?.id ?? campaigns[0]?.id ?? '');
      setDraftCampaignIds([]);
      return;
    }
    setDraftCampaignId('');
    setDraftCampaignIds(currentCampaign?.id ? [currentCampaign.id] : []);
  };

  const handleCreateTag = (tagName: string) => {
    const id = getOrCreateTag(tagName);
    return id || undefined;
  };

  const openLinkModal = (target: 'locations' | 'tags') => setActiveLinkModal(target);
  const closeLinkModal = () => setActiveLinkModal(null);

  const linkModalTitle = activeLinkModal === 'tags' ? 'Tags' : 'Locations';

  const linkModalBody =
    activeLinkModal === 'tags' ? (
      <TagInput
        tags={availableTags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
        selectedIds={draftTagIds}
        onChange={setDraftTagIds}
        onCreateTag={handleCreateTag}
      />
    ) : (
      <LocationMultiSelect
        locations={selectableLocations}
        value={draftLocationIds}
        onChange={setDraftLocationIds}
        helperText={
          draftScope === 'continuity'
            ? 'Optional: link this note to shared locations.'
            : 'Optional: link this note to locations.'
        }
      />
    );

  const handleCreate = () => {
    if (isCreating) return;
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      setCreateError('Note title is required.');
      return;
    }
    if (draftScope === 'campaign' && !draftCampaignId) {
      setCreateError('Select a campaign before creating a note.');
      return;
    }
    if (draftScope === 'continuity' && !continuityId) {
      setCreateError('Select a continuity before creating a shared note.');
      return;
    }
    if (draftScope === 'continuity' && draftCampaignIds.length === 0) {
      setCreateError('Select at least one campaign for this shared note.');
      return;
    }
    setIsCreating(true);
    try {
      createNote({
        title: trimmedTitle,
        content: draftContent,
        scope: draftScope,
        continuityId,
        campaignId: draftScope === 'campaign' ? draftCampaignId : '',
        campaignIds:
          draftScope === 'campaign'
            ? draftCampaignId
              ? [draftCampaignId]
              : []
            : draftCampaignIds,
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
        label="Scope"
        value={draftScope}
        options={[
          { label: 'Campaign note', value: 'campaign' },
          { label: 'Shared in continuity', value: 'continuity' },
        ]}
        onChange={(value) => handleScopeChange(value as EntityScope)}
        helperText="Shared notes live in the continuity and can be linked to multiple campaigns."
      />
      {draftScope === 'campaign' && (
        <FormSelect
          label="Campaign"
          value={draftCampaignId}
          options={campaignOptions}
          onChange={handleCampaignChange}
        />
      )}
      {draftScope === 'continuity' && (
        <FormMultiSelect
          label="Visible in campaigns"
          value={draftCampaignIds}
          options={campaignOptions}
          onChange={setDraftCampaignIds}
          helperText="Select which campaigns should see this note."
        />
      )}
      <FormTextInput label="Title" value={draftTitle} onChangeText={setDraftTitle} />
      <FormTextInput
        label="Content"
        value={draftContent}
        onChangeText={setDraftContent}
        multiline
        style={styles.modalContentInput}
      />
      <View style={styles.quickInsertRow}>
        {quickInserts.map((insert) => (
          <Button
            key={insert.label}
            mode="outlined"
            compact
            onPress={() => appendDraftContent(insert.content)}
          >
            {insert.label}
          </Button>
        ))}
      </View>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Tip: use @Name for people/places and #tags to make details easier to scan later.
      </Text>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Links
      </Text>
      <View style={styles.linkList}>
        <AppCard
          title="Locations"
          subtitle={`${draftLocationIds.length} selected`}
          onPress={() => openLinkModal('locations')}
          right={
            <View style={styles.editCardRight}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={18}
                color={theme.colors.primary}
              />
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          }
          style={styles.editCard}
        />
        <AppCard
          title="Tags"
          subtitle={`${draftTagIds.length} selected`}
          onPress={() => openLinkModal('tags')}
          right={
            <View style={styles.editCardRight}>
              <MaterialCommunityIcons name="tag-outline" size={18} color={theme.colors.primary} />
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          }
          style={styles.editCard}
        />
      </View>
      {createError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      )}
    </FormModal>
  );

  const linkModal = (
    <FormModal
      title={linkModalTitle}
      visible={Boolean(activeLinkModal)}
      onDismiss={closeLinkModal}
      actions={
        <Button mode="contained" onPress={closeLinkModal}>
          Done
        </Button>
      }
    >
      {linkModalBody}
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
        {linkModal}
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
        {linkModal}
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
            const campaignName =
              item.scope === 'continuity'
                ? 'Shared'
                : item.campaignId
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
      {linkModal}
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
  quickInsertRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  linkList: {
    gap: spacing[2],
  },
  editCard: {
    paddingVertical: spacing[1],
  },
  editCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
});
