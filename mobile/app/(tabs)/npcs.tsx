import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Button, FAB, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { AttachStep } from 'react-native-spotlight-tour';
import {
  AppCard,
  FilterHeader,
  FormModal,
  FormImagePicker,
  LocationMultiSelect,
  FormMultiSelect,
  FormSelect,
  FormTextInput,
  ModalActions,
  NPCCard,
  Screen,
  TagFilterSection,
  TagInput,
  EmptyState,
} from '../../src/components';
import { TOUR_STEP } from '../../src/onboarding';
import { useTheme } from '../../src/theme/ThemeProvider';
import { commonStyles, spacing } from '../../src/theme';
import type { EntityScope, Tag } from '../../src/types/schema';
import {
  useCampaigns,
  useCreateNpc,
  useCurrentCampaign,
  useGetOrCreateTag,
  useListEmptyState,
  useLocations,
  useNotes,
  useNpcs,
  usePullToRefresh,
  useSeedData,
  useTags,
} from '../../src/hooks';

/**
 * Render the NPC management screen with search, tag and status filters, NPC list, and creation/linking modals.
 *
 * Provides controls to create NPCs (including scope, campaign/location/note/tag links), navigate to a continuity library,
 * and client-side filtering by query, tags, and shadow status.
 *
 * @returns The React element for the NPC management screen containing the list, filter controls, and modals.
 */
export default function NpcsScreen() {
  const { theme } = useTheme();
  const currentCampaign = useCurrentCampaign();
  const { isSeedContinuity } = useSeedData();
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showShadowOnly, setShowShadowOnly] = useState(false);
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
    const shadowFiltered = showShadowOnly ? scoped.filter((npc) => npc.status === 'shadow') : scoped;
    if (!normalized) return shadowFiltered;
    return shadowFiltered.filter((npc) => {
      const name = npc.name?.toLowerCase() ?? '';
      const race = npc.race?.toLowerCase() ?? '';
      const role = npc.role?.toLowerCase() ?? '';
      return name.includes(normalized) || race.includes(normalized) || role.includes(normalized);
    });
  }, [npcs, query, selectedTagIds, showShadowOnly]);

  const hasActiveFilters = query.trim().length > 0 || selectedTagIds.length > 0 || showShadowOnly;
  const { showNoCampaign, showNoResults, showFilteredEmpty } = useListEmptyState({
    hasCampaign: Boolean(currentCampaign),
    totalCount: npcs.length,
    filteredCount: filteredNpcs.length,
    hasActiveFilters,
  });

  const clearFilters = () => {
    setQuery('');
    setSelectedTagIds([]);
    setShowShadowOnly(false);
  };

  useEffect(() => {
    setSelectedTagIds(tagParam ? [tagParam] : []);
  }, [tagParam]);

  const noteOptions = useMemo(() => {
    return notes.map((note) => ({
      label: note.title || 'Untitled note',
      value: note.id,
    }));
  }, [notes]);

  const selectableLocations = useMemo(() => {
    if (!continuityId) return [];
    return locations.filter((location) => {
      if (location.continuityId !== continuityId) return false;
      if (draftScope === 'continuity') return true;
      if (draftCampaignIds.length === 0) {
        return location.scope === 'continuity';
      }
      if (location.scope === 'continuity') return true;
      return location.campaignIds.some((id) => draftCampaignIds.includes(id));
    });
  }, [continuityId, draftCampaignIds, draftScope, locations]);

  if (showNoCampaign) {
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
    if (draftScope === 'continuity' && draftCampaignIds.length === 0) {
      setCreateError('Select at least one campaign for this shared NPC.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const sharedCampaignIds =
        draftScope === 'continuity'
          ? draftCampaignIds
          : currentCampaign
            ? [currentCampaign.id]
            : [];
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
        return draftScope === 'continuity' ? 'Visible in campaigns' : 'Campaign';
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
            label={draftScope === 'continuity' ? 'Visible in campaigns' : 'Campaign'}
            value={draftCampaignIds}
            options={campaignOptions}
            onChange={(value) =>
              setDraftCampaignIds(
                draftScope === 'continuity'
                  ? value
                  : value.length > 0
                    ? [value[value.length - 1]]
                    : []
              )
            }
            helperText={
              draftScope === 'continuity'
                ? 'Select which campaigns should see this NPC.'
                : undefined
            }
          />
        );
      case 'locations':
        return (
          <LocationMultiSelect
            locations={selectableLocations}
            value={draftLocationIds}
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
        <ModalActions
          onCancel={closeCreateModal}
          onConfirm={handleCreate}
          confirmLabel="Create"
          loading={isCreating}
          disabled={isCreating}
        />
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
          if (nextScope === 'campaign' && currentCampaign?.id) {
            setDraftCampaignIds([currentCampaign.id]);
          } else if (nextScope === 'continuity' && draftCampaignIds.length === 0) {
            setDraftCampaignIds(currentCampaign?.id ? [currentCampaign.id] : []);
          }
        }}
        helperText="Shared NPCs live in the continuity and can be linked to multiple campaigns."
      />
      <View style={styles.linkList}>
        <AppCard
          title={draftScope === 'continuity' ? 'Visible in campaigns' : 'Campaign'}
          subtitle={
            draftScope === 'continuity'
              ? `${draftCampaignIds.length} selected`
              : draftCampaignIds.length > 0
                ? '1 selected'
                : 'Not linked'
          }
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

  if (showNoResults) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No NPCs yet"
            description="Create your first NPC to get started."
            icon="account-group-outline"
            action={!isCreating ? { label: 'Create NPC', onPress: openCreateModal } : undefined}
          />
        </Screen>
        {createModal}
        {linkModal}
      </>
    );
  }

  if (showFilteredEmpty) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No NPCs match your filters"
            description="Try clearing search or tag filters."
            icon="account-group-outline"
            action={{ label: 'Clear Filters', onPress: clearFilters }}
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
          contentContainerStyle={commonStyles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <AttachStep index={TOUR_STEP.NPCS_TAB}>
              <View style={styles.header}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  mode="outlined"
                  placeholder="Search NPCs..."
                  style={styles.searchInput}
                />
                <FilterHeader
                  expanded={filtersOpen}
                  onToggle={() => setFiltersOpen((prev) => !prev)}
                >
                  <TagFilterSection
                    tags={tags}
                    selectedIds={selectedTagIds}
                    onToggle={toggleTag}
                    onClear={() => setSelectedTagIds([])}
                    headerStyle={styles.tagHeader}
                  />
                  <View style={[commonStyles.flexRowBetween, styles.statusHeader]}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Status
                    </Text>
                    {showShadowOnly && (
                      <Button mode="text" onPress={() => setShowShadowOnly(false)} compact>
                        Clear
                      </Button>
                    )}
                  </View>
                  <View style={[commonStyles.flexRow, styles.statusRow]}>
                    <Button
                      mode={showShadowOnly ? 'contained' : 'outlined'}
                      onPress={() => setShowShadowOnly((prev) => !prev)}
                      icon="circle-outline"
                      compact
                    >
                      Shadow only
                    </Button>
                  </View>
                </FilterHeader>
                <View style={commonStyles.flexRowBetween}>
                  <View style={commonStyles.flexRow}>
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
                  <View style={commonStyles.flexRow}>
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
            </AttachStep>
          }
          renderItem={({ item, index }) => {
            const resolvedTags = item.tagIds
              .map((tagId) => tagById.get(tagId))
              .filter((tag): tag is Tag => tag !== undefined);

            const card = (
              <View style={styles.cardWrapper}>
                <NPCCard
                  npc={item}
                  tags={resolvedTags}
                  onPress={() => router.push(`/npc/${item.id}`)}
                  onTagPress={(tagId) => router.push(`/tag/${tagId}`)}
                  isDemo={isSeedContinuity(item.continuityId)}
                />
              </View>
            );

            // Wrap first NPC card for tour highlight
            if (index === 0) {
              return <AttachStep index={TOUR_STEP.NPC_CARD}>{card}</AttachStep>;
            }
            return card;
          }}
        />
        <FAB
          icon="plus"
          onPress={openCreateModal}
          style={[commonStyles.fab, { backgroundColor: theme.colors.primary }]}
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
  header: {
    marginBottom: spacing[3],
  },
  searchInput: {
    marginBottom: spacing[3],
  },
  tagHeader: {
    marginBottom: spacing[1],
  },
  statusHeader: {
    marginBottom: spacing[1],
    marginTop: spacing[2],
  },
  statusRow: {
    gap: spacing[2],
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
  listHeaderActions: {
    gap: spacing[2],
  },
  cardWrapper: {
    marginBottom: spacing[3],
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