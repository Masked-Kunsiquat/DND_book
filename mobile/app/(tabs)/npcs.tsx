import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, FAB, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  FormModal,
  FormImagePicker,
  FormMultiSelect,
  FormSelect,
  FormTextInput,
  NPCCard,
  Screen,
  TagChip,
  TagInput,
  EmptyState,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, layout, spacing } from '../../src/theme';
import type { EntityScope, Tag } from '../../src/types/schema';
import {
  useCampaigns,
  useCreateNpc,
  useCurrentCampaign,
  useGetOrCreateTag,
  useLocations,
  useNotes,
  useNpcs,
  usePullToRefresh,
  useTags,
} from '../../src/hooks';

export default function NpcsScreen() {
  const { theme } = useTheme();
  const currentCampaign = useCurrentCampaign();
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeLinkModal, setActiveLinkModal] = useState<
    'campaigns' | 'locations' | 'notes' | 'tags' | null
  >(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftRace, setDraftRace] = useState('');
  const [draftRole, setDraftRole] = useState('');
  const [draftBackground, setDraftBackground] = useState('');
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [draftScope, setDraftScope] = useState<EntityScope>('campaign');
  const [draftCampaignIds, setDraftCampaignIds] = useState<string[]>([]);
  const [draftLocationIds, setDraftLocationIds] = useState<string[]>([]);
  const [draftNoteIds, setDraftNoteIds] = useState<string[]>([]);
  const [draftTagIds, setDraftTagIds] = useState<string[]>([]);
  const createNpc = useCreateNpc();
  const getOrCreateTag = useGetOrCreateTag({
    continuityId: currentCampaign?.continuityId,
    scope: 'continuity',
  });
  const campaigns = useCampaigns();
  const locations = useLocations();
  const notes = useNotes(currentCampaign?.continuityId, currentCampaign?.id);
  const tags = useTags(currentCampaign?.continuityId, currentCampaign?.id);
  const { refreshing, onRefresh } = usePullToRefresh();
  const effectiveCampaignId = currentCampaign?.id;
  const npcs = useNpcs(effectiveCampaignId);
  const params = useLocalSearchParams<{ tagId?: string | string[] }>();
  const continuityId = currentCampaign?.continuityId ?? '';

  const tagParam = useMemo(() => {
    const raw = params.tagId;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.tagId]);

  const tagById = useMemo(() => {
    return new Map(tags.map((tag) => [tag.id, tag]));
  }, [tags]);

  const filteredNpcs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const scoped = selectedTagIds.length
      ? npcs.filter((npc) => npc.tagIds.some((id) => selectedTagIds.includes(id)))
      : npcs;
    if (!normalized) return scoped;
    return scoped.filter((npc) => {
      const name = npc.name?.toLowerCase() ?? '';
      const race = npc.race?.toLowerCase() ?? '';
      const role = npc.role?.toLowerCase() ?? '';
      return name.includes(normalized) || race.includes(normalized) || role.includes(normalized);
    });
  }, [npcs, query, selectedTagIds]);

  useEffect(() => {
    setSelectedTagIds(tagParam ? [tagParam] : []);
  }, [tagParam]);

  if (!currentCampaign) {
    return (
      <Screen>
        <EmptyState
          title="No campaign selected"
          description="Select a campaign to view NPCs."
          icon="account-group-outline"
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

  const locationOptions = useMemo(() => {
    return locations.map((location) => ({
      label: location.name || 'Unnamed location',
      value: location.id,
    }));
  }, [locations]);

  const noteOptions = useMemo(() => {
    return notes.map((note) => ({
      label: note.title || 'Untitled note',
      value: note.id,
    }));
  }, [notes]);

  const openCreateModal = () => {
    setDraftName(`New NPC ${npcs.length + 1}`);
    setDraftRace('');
    setDraftRole('');
    setDraftBackground('');
    setDraftImage(null);
    setDraftScope('campaign');
    setDraftCampaignIds(currentCampaign ? [currentCampaign.id] : []);
    setDraftLocationIds([]);
    setDraftNoteIds([]);
    setDraftTagIds([]);
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
    setActiveLinkModal(null);
  };

  const openLibrary = () => {
    if (isCreateOpen) {
      setIsCreateOpen(false);
      setCreateError(null);
    }
    router.push({
      pathname: '/library/npcs',
      params: continuityId ? { continuityId } : undefined,
    });
  };

  const handleCreate = () => {
    if (isCreating) return;
    const trimmed = draftName.trim();
    if (!trimmed) {
      setCreateError('NPC name is required.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const sharedCampaignIds =
        draftScope === 'continuity'
          ? continuityCampaigns.map((campaign) => campaign.id)
          : draftCampaignIds;
      createNpc({
        name: trimmed,
        race: draftRace,
        role: draftRole,
        background: draftBackground,
        image: draftImage ?? '',
        scope: draftScope,
        continuityId,
        campaignIds: sharedCampaignIds,
        locationIds: draftLocationIds,
        noteIds: draftNoteIds,
        tagIds: draftTagIds,
      });
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create NPC.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateTag = (name: string) => {
    const id = getOrCreateTag(name);
    return id || undefined;
  };

  const openLinkModal = (target: 'campaigns' | 'locations' | 'notes' | 'tags') => {
    setActiveLinkModal(target);
  };

  const closeLinkModal = () => setActiveLinkModal(null);

  const linkModalTitle = (() => {
    switch (activeLinkModal) {
      case 'campaigns':
        return 'Campaigns';
      case 'locations':
        return 'Locations';
      case 'notes':
        return 'Notes';
      case 'tags':
        return 'Tags';
      default:
        return '';
    }
  })();

  const linkModalBody = (() => {
    switch (activeLinkModal) {
      case 'campaigns':
        return (
          <FormMultiSelect
            label="Campaigns"
            value={draftCampaignIds}
            options={campaignOptions}
            onChange={setDraftCampaignIds}
            helperText={
              draftScope === 'continuity'
                ? 'Automatically linked to all campaigns in this continuity.'
                : undefined
            }
            disabled={draftScope === 'continuity'}
          />
        );
      case 'locations':
        return (
          <FormMultiSelect
            label="Locations"
            value={draftLocationIds}
            options={locationOptions}
            onChange={setDraftLocationIds}
          />
        );
      case 'notes':
        return (
          <FormMultiSelect
            label="Notes"
            value={draftNoteIds}
            options={noteOptions}
            onChange={setDraftNoteIds}
          />
        );
      case 'tags':
        return (
          <TagInput
            tags={tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
            selectedIds={draftTagIds}
            onChange={setDraftTagIds}
            onCreateTag={handleCreateTag}
          />
        );
      default:
        return null;
    }
  })();

  const createModal = (
    <FormModal
      title="New NPC"
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
      <Button mode="outlined" icon="book-outline" onPress={openLibrary}>
        Add from Continuity
      </Button>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Profile
      </Text>
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      <FormTextInput label="Race" value={draftRace} onChangeText={setDraftRace} />
      <FormTextInput label="Role" value={draftRole} onChangeText={setDraftRole} />
      <FormTextInput
        label="Background"
        value={draftBackground}
        onChangeText={setDraftBackground}
        multiline
        style={styles.modalContentInput}
      />
      <FormImagePicker label="Portrait" value={draftImage} onChange={setDraftImage} />
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Links
      </Text>
      <FormSelect
        label="Scope"
        value={draftScope}
        options={[
          { label: 'Campaign only', value: 'campaign' },
          { label: 'Shared in continuity', value: 'continuity' },
        ]}
        onChange={(value) => {
          const nextScope = value as EntityScope;
          setDraftScope(nextScope);
          if (nextScope === 'continuity') {
            setDraftCampaignIds(continuityCampaigns.map((campaign) => campaign.id));
          } else if (currentCampaign?.id) {
            setDraftCampaignIds([currentCampaign.id]);
          }
        }}
        helperText="Shared NPCs appear in every campaign in this continuity."
      />
      <View style={styles.linkList}>
        <AppCard
          title="Campaigns"
          subtitle={`${draftCampaignIds.length} selected`}
          onPress={() => openLinkModal('campaigns')}
          right={
            <View style={styles.editCardRight}>
              <MaterialCommunityIcons
                name="folder-outline"
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
          title="Notes"
          subtitle={`${draftNoteIds.length} selected`}
          onPress={() => openLinkModal('notes')}
          right={
            <View style={styles.editCardRight}>
              <MaterialCommunityIcons
                name="note-text-outline"
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

  if (npcs.length === 0) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No NPCs yet"
            description={
              currentCampaign
                ? 'Create your first NPC to get started.'
                : 'Create an NPC or select a campaign to filter.'
            }
            icon="account-group-outline"
            action={!isCreating ? { label: 'Create NPC', onPress: openCreateModal } : undefined}
          />
        </Screen>
        {createModal}
        {linkModal}
      </>
    );
  }

  if (filteredNpcs.length === 0) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No NPCs match your filters"
            description="Try clearing search or tag filters."
            icon="account-group-outline"
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
          data={filteredNpcs}
          keyExtractor={(npc) => npc.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                mode="outlined"
                placeholder="Search NPCs..."
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
                <View style={styles.listHeaderRow}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={18}
                    color={theme.colors.primary}
                    style={styles.listHeaderIcon}
                  />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    NPCs
                  </Text>
                </View>
                <View style={styles.listHeaderActions}>
                  <Pressable onPress={openLibrary} hitSlop={8}>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                      Library
                    </Text>
                  </Pressable>
                  <Pressable onPress={openCreateModal} hitSlop={8}>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                      New
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const resolvedTags = item.tagIds
              .map((tagId) => tagById.get(tagId))
              .filter((tag): tag is Tag => tag !== undefined);

            return (
              <View style={styles.cardWrapper}>
                <NPCCard
                  npc={item}
                  tags={resolvedTags}
                  onPress={() => router.push(`/npc/${item.id}`)}
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
          disabled={isCreating}
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
    justifyContent: 'space-between',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
  listHeaderActions: {
    flexDirection: 'row',
    gap: spacing[2],
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
