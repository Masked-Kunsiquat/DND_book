import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, FAB, Modal, Portal, Switch, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  FormImagePicker,
  FormMultiSelect,
  FormTextInput,
  NPCCard,
  Screen,
  TagInput,
  EmptyState,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { layout, spacing } from '../../src/theme';
import {
  useCampaigns,
  useCreateNpc,
  useCurrentCampaign,
  useGetOrCreateTag,
  useLocations,
  useNotes,
  useNpcs,
  useTags,
} from '../../src/hooks';

export default function NpcsScreen() {
  const { theme } = useTheme();
  const currentCampaign = useCurrentCampaign();
  const [query, setQuery] = useState('');
  const [onlyCurrent, setOnlyCurrent] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftRace, setDraftRace] = useState('');
  const [draftRole, setDraftRole] = useState('');
  const [draftBackground, setDraftBackground] = useState('');
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [draftCampaignIds, setDraftCampaignIds] = useState<string[]>([]);
  const [draftLocationIds, setDraftLocationIds] = useState<string[]>([]);
  const [draftNoteIds, setDraftNoteIds] = useState<string[]>([]);
  const [draftTagIds, setDraftTagIds] = useState<string[]>([]);
  const createNpc = useCreateNpc();
  const getOrCreateTag = useGetOrCreateTag();
  const campaigns = useCampaigns();
  const locations = useLocations();
  const notes = useNotes();
  const tags = useTags();
  const effectiveCampaignId = onlyCurrent && currentCampaign ? currentCampaign.id : undefined;
  const npcs = useNpcs(effectiveCampaignId);

  const tagById = useMemo(() => {
    return new Map(tags.map((tag) => [tag.id, tag]));
  }, [tags]);

  const filteredNpcs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return npcs;
    return npcs.filter((npc) => {
      const name = npc.name?.toLowerCase() ?? '';
      const race = npc.race?.toLowerCase() ?? '';
      const role = npc.role?.toLowerCase() ?? '';
      return name.includes(normalized) || race.includes(normalized) || role.includes(normalized);
    });
  }, [npcs, query]);

  const campaignOptions = useMemo(() => {
    return campaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [campaigns]);

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
      createNpc({
        name: trimmed,
        race: draftRace,
        role: draftRole,
        background: draftBackground,
        image: draftImage ?? '',
        campaignIds: draftCampaignIds,
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

  if (filteredNpcs.length === 0) {
    return (
      <>
        <Screen>
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
              New NPC
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
            <FormMultiSelect
              label="Campaigns"
              value={draftCampaignIds}
              options={campaignOptions}
              onChange={setDraftCampaignIds}
            />
            <FormMultiSelect
              label="Locations"
              value={draftLocationIds}
              options={locationOptions}
              onChange={setDraftLocationIds}
            />
            <FormMultiSelect
              label="Notes"
              value={draftNoteIds}
              options={noteOptions}
              onChange={setDraftNoteIds}
            />
            <TagInput
              tags={tags.map((tag) => ({ id: tag.id, name: tag.name }))}
              selectedIds={draftTagIds}
              onChange={setDraftTagIds}
              onCreateTag={handleCreateTag}
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
          data={filteredNpcs}
          keyExtractor={(npc) => npc.id}
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
                placeholder="Search NPCs..."
                style={styles.searchInput}
              />
              <View style={styles.listHeader}>
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
            </View>
          }
          renderItem={({ item }) => {
            const resolvedTags = item.tagIds
              .map((tagId) => tagById.get(tagId))
              .filter(Boolean);

            return (
              <View style={styles.cardWrapper}>
                <NPCCard
                  npc={item}
                  tags={resolvedTags}
                  onPress={() => router.push(`/npc/${item.id}`)}
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
            New NPC
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
          <FormMultiSelect
            label="Campaigns"
            value={draftCampaignIds}
            options={campaignOptions}
            onChange={setDraftCampaignIds}
          />
          <FormMultiSelect
            label="Locations"
            value={draftLocationIds}
            options={locationOptions}
            onChange={setDraftLocationIds}
          />
          <FormMultiSelect
            label="Notes"
            value={draftNoteIds}
            options={noteOptions}
            onChange={setDraftNoteIds}
          />
          <TagInput
            tags={tags.map((tag) => ({ id: tag.id, name: tag.name }))}
            selectedIds={draftTagIds}
            onChange={setDraftTagIds}
            onCreateTag={handleCreateTag}
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
