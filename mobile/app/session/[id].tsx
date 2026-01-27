import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  AvatarGroup,
  ConfirmDialog,
  EmptyState,
  FormDateTimePicker,
  FormModal,
  FormMultiSelect,
  FormTextInput,
  LocationCard,
  NoteCard,
  NPCCard,
  Screen,
  Section,
  TagChip,
  TagInput,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import {
  useCampaigns,
  useDeleteSessionLog,
  useGetOrCreateTag,
  useLocations,
  useNotes,
  useNpcs,
  usePlayerCharacters,
  useSessionLog,
  useTags,
  useUpdateSessionLog,
} from '../../src/hooks';

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
}

function formatSessionDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleDateString();
}

function formatDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function SessionDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);

  const session = useSessionLog(sessionId);
  const campaigns = useCampaigns();
  const locations = useLocations();
  const npcs = useNpcs();
  const notes = useNotes();
  const playerCharacters = usePlayerCharacters();
  const updateSessionLog = useUpdateSessionLog();
  const deleteSessionLog = useDeleteSessionLog();

  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState('');
  const [keyDecisions, setKeyDecisions] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [campaignIds, setCampaignIds] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [npcIds, setNpcIds] = useState<string[]>([]);
  const [noteIds, setNoteIds] = useState<string[]>([]);
  const [playerCharacterIds, setPlayerCharacterIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeLinkModal, setActiveLinkModal] = useState<
    'participants' | 'campaigns' | 'locations' | 'npcs' | 'notes' | 'tags' | null
  >(null);

  const activeCampaignId = (isEditing ? campaignIds : session?.campaignIds ?? [])[0] || '';
  const continuityId = useMemo(() => {
    if (!activeCampaignId) return '';
    const campaign = campaigns.find((item) => item.id === activeCampaignId);
    return campaign?.continuityId ?? '';
  }, [activeCampaignId, campaigns]);
  const tags = useTags(continuityId, activeCampaignId);
  const getOrCreateTag = useGetOrCreateTag({
    continuityId,
    scope: 'continuity',
  });

  useEffect(() => {
    if (session && !isEditing) {
      setTitle(session.title);
      setDate(session.date);
      setSummary(session.summary);
      setKeyDecisions(session.keyDecisions);
      setOutcomes(session.outcomes);
      setCampaignIds(session.campaignIds);
      setLocationIds(session.locationIds);
      setNpcIds(session.npcIds);
      setNoteIds(session.noteIds);
      setPlayerCharacterIds(session.playerCharacterIds);
      setTagIds(session.tagIds);
    }
  }, [session, isEditing]);

  const displayCampaignIds = useMemo(
    () => (isEditing ? campaignIds : session?.campaignIds ?? []),
    [campaignIds, isEditing, session?.campaignIds]
  );
  const displayLocationIds = useMemo(
    () => (isEditing ? locationIds : session?.locationIds ?? []),
    [isEditing, locationIds, session?.locationIds]
  );
  const displayNpcIds = useMemo(
    () => (isEditing ? npcIds : session?.npcIds ?? []),
    [isEditing, npcIds, session?.npcIds]
  );
  const displayNoteIds = useMemo(
    () => (isEditing ? noteIds : session?.noteIds ?? []),
    [isEditing, noteIds, session?.noteIds]
  );
  const displayPlayerIds = useMemo(
    () => (isEditing ? playerCharacterIds : session?.playerCharacterIds ?? []),
    [isEditing, playerCharacterIds, session?.playerCharacterIds]
  );
  const displayTagIds = useMemo(
    () => (isEditing ? tagIds : session?.tagIds ?? []),
    [isEditing, session?.tagIds, tagIds]
  );

  const campaignIdSet = useMemo(
    () => new Set(displayCampaignIds),
    [displayCampaignIds]
  );

  const campaignOptions = useMemo(() => {
    return campaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [campaigns]);

  const locationOptions = useMemo(() => {
    const filtered =
      campaignIdSet.size === 0
        ? locations
        : locations.filter((location) =>
            location.campaignIds.some((id) => campaignIdSet.has(id))
          );
    return filtered.map((location) => ({
      label: location.name || 'Unnamed location',
      value: location.id,
    }));
  }, [campaignIdSet, locations]);

  const npcOptions = useMemo(() => {
    const filtered =
      campaignIdSet.size === 0
        ? npcs
        : npcs.filter((npc) => npc.campaignIds.some((id) => campaignIdSet.has(id)));
    return filtered.map((npc) => ({
      label: npc.name || 'Unnamed NPC',
      value: npc.id,
    }));
  }, [campaignIdSet, npcs]);

  const noteOptions = useMemo(() => {
    const filtered =
      campaignIdSet.size === 0
        ? notes
        : notes.filter((note) => campaignIdSet.has(note.campaignId));
    return filtered.map((note) => ({
      label: note.title || 'Untitled note',
      value: note.id,
    }));
  }, [campaignIdSet, notes]);

  const playerOptions = useMemo(() => {
    const filtered =
      campaignIdSet.size === 0
        ? playerCharacters
        : playerCharacters.filter((pc) => pc.campaignIds.some((id) => campaignIdSet.has(id)));
    return filtered.map((pc) => ({
      label: pc.name || 'Unnamed character',
      value: pc.id,
    }));
  }, [campaignIdSet, playerCharacters]);

  const linkedCampaigns = useMemo(() => {
    const ids = new Set(displayCampaignIds);
    return campaigns.filter((campaign) => ids.has(campaign.id));
  }, [campaigns, displayCampaignIds]);

  const linkedLocations = useMemo(() => {
    const ids = new Set(displayLocationIds);
    return locations.filter((location) => ids.has(location.id));
  }, [displayLocationIds, locations]);

  const linkedNpcs = useMemo(() => {
    const ids = new Set(displayNpcIds);
    return npcs.filter((npc) => ids.has(npc.id));
  }, [displayNpcIds, npcs]);

  const linkedNotes = useMemo(() => {
    const ids = new Set(displayNoteIds);
    return notes.filter((note) => ids.has(note.id));
  }, [displayNoteIds, notes]);

  const linkedPlayers = useMemo(() => {
    const ids = new Set(displayPlayerIds);
    return playerCharacters.filter((pc) => ids.has(pc.id));
  }, [displayPlayerIds, playerCharacters]);

  const resolvedTags = useMemo(() => {
    const tagById = new Map(tags.map((tag) => [tag.id, tag]));
    return displayTagIds
      .map((id) => tagById.get(id))
      .filter((tag): tag is (typeof tags)[number] => tag !== undefined);
  }, [displayTagIds, tags]);

  const handleCreateTag = (name: string) => {
    const id = getOrCreateTag(name);
    return id || undefined;
  };

  const handleCampaignChange = (value: string[]) => {
    setCampaignIds(value);
    if (value.length === 0) return;
    const allowedCampaigns = new Set(value);
    const allowedLocations = new Set(
      locations
        .filter((location) => location.campaignIds.some((id) => allowedCampaigns.has(id)))
        .map((location) => location.id)
    );
    const allowedNpcs = new Set(
      npcs
        .filter((npc) => npc.campaignIds.some((id) => allowedCampaigns.has(id)))
        .map((npc) => npc.id)
    );
    const allowedNotes = new Set(
      notes.filter((note) => allowedCampaigns.has(note.campaignId)).map((note) => note.id)
    );
    const allowedPlayers = new Set(
      playerCharacters
        .filter((pc) => pc.campaignIds.some((id) => allowedCampaigns.has(id)))
        .map((pc) => pc.id)
    );
    setLocationIds((prev) => prev.filter((id) => allowedLocations.has(id)));
    setNpcIds((prev) => prev.filter((id) => allowedNpcs.has(id)));
    setNoteIds((prev) => prev.filter((id) => allowedNotes.has(id)));
    setPlayerCharacterIds((prev) => prev.filter((id) => allowedPlayers.has(id)));
  };

  const handleEdit = () => {
    if (!session) return;
    setTitle(session.title);
    setDate(session.date);
    setSummary(session.summary);
    setKeyDecisions(session.keyDecisions);
    setOutcomes(session.outcomes);
    setCampaignIds(session.campaignIds);
    setLocationIds(session.locationIds);
    setNpcIds(session.npcIds);
    setNoteIds(session.noteIds);
    setPlayerCharacterIds(session.playerCharacterIds);
    setTagIds(session.tagIds);
    setError(null);
    setShowAdvanced(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (session) {
      setTitle(session.title);
      setDate(session.date);
      setSummary(session.summary);
      setKeyDecisions(session.keyDecisions);
      setOutcomes(session.outcomes);
      setCampaignIds(session.campaignIds);
      setLocationIds(session.locationIds);
      setNpcIds(session.npcIds);
      setNoteIds(session.noteIds);
      setPlayerCharacterIds(session.playerCharacterIds);
      setTagIds(session.tagIds);
    }
    setError(null);
    setShowAdvanced(false);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!session) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Session title is required.');
      return;
    }
    const resolvedDate = date.trim() || formatDateOnly(new Date());
    setError(null);
    try {
      updateSessionLog(session.id, {
        title: trimmedTitle,
        date: resolvedDate,
        summary: summary.trim(),
        keyDecisions: keyDecisions.trim(),
        outcomes: outcomes.trim(),
        campaignIds,
        locationIds,
        npcIds,
        noteIds,
        playerCharacterIds,
        tagIds,
      });
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update session.';
      setError(message);
    }
  };

  const handleDelete = () => {
    if (!session || isDeleting) return;
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const openLinkModal = (
    target: 'participants' | 'campaigns' | 'locations' | 'npcs' | 'notes' | 'tags'
  ) => {
    setActiveLinkModal(target);
  };

  const closeLinkModal = () => setActiveLinkModal(null);

  const linkModalTitle = (() => {
    switch (activeLinkModal) {
      case 'participants':
        return 'Participants';
      case 'campaigns':
        return 'Campaigns';
      case 'locations':
        return 'Locations';
      case 'npcs':
        return 'NPCs';
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
      case 'participants':
        return (
          <FormMultiSelect
            label="Player characters"
            value={playerCharacterIds}
            options={playerOptions}
            onChange={setPlayerCharacterIds}
            helperText="Choose who took part in this session."
          />
        );
      case 'campaigns':
        return (
          <FormMultiSelect
            label="Campaigns"
            value={campaignIds}
            options={campaignOptions}
            onChange={handleCampaignChange}
          />
        );
      case 'locations':
        return (
          <FormMultiSelect
            label="Locations"
            value={locationIds}
            options={locationOptions}
            onChange={setLocationIds}
          />
        );
      case 'npcs':
        return (
          <FormMultiSelect
            label="NPCs"
            value={npcIds}
            options={npcOptions}
            onChange={setNpcIds}
          />
        );
      case 'notes':
        return (
          <FormMultiSelect
            label="Notes"
            value={noteIds}
            options={noteOptions}
            onChange={setNoteIds}
          />
        );
      case 'tags':
        return (
          <TagInput
            tags={tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
            selectedIds={tagIds}
            onChange={setTagIds}
            onCreateTag={handleCreateTag}
          />
        );
      default:
        return null;
    }
  })();

  const confirmDelete = () => {
    if (!session || isDeleting) return;
    try {
      setIsDeleting(true);
      deleteSessionLog(session.id);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete session.';
      setError(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (!session) {
    return (
      <Screen>
        <EmptyState
          title="Session not found"
          description="This session log may have been deleted."
          icon="calendar-blank-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: session.title || 'Session' }} />
      <Screen>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {isEditing ? (
              <>
                <FormTextInput label="Title" value={title} onChangeText={setTitle} />
                <FormDateTimePicker
                  label="Date"
                  value={date}
                  onChange={setDate}
                  mode="date"
                  helperText="Pick the session date."
                />
              </>
            ) : (
              <>
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                  {session.title || 'Untitled session'}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatSessionDate(session.date)}
                </Text>
              </>
            )}
          </View>
          {!isEditing && (
            <IconButton icon="pencil" onPress={handleEdit} accessibilityLabel="Edit session" />
          )}
        </View>

        <Section title="Summary" icon="clipboard-text-outline">
          {isEditing ? (
            <>
              <FormTextInput
                label="Summary"
                value={summary}
                onChangeText={setSummary}
                multiline
                style={styles.summaryInput}
              />
              {showAdvanced ? (
                <>
                  <FormTextInput
                    label="Key decisions"
                    value={keyDecisions}
                    onChangeText={setKeyDecisions}
                    multiline
                    style={styles.summaryInput}
                  />
                  <FormTextInput
                    label="Outcomes"
                    value={outcomes}
                    onChangeText={setOutcomes}
                    multiline
                    style={styles.summaryInput}
                  />
                </>
              ) : (
                <Button mode="text" onPress={() => setShowAdvanced(true)}>
                  Add key decisions + outcomes
                </Button>
              )}
            </>
          ) : (
            <View style={styles.summaryBlock}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {session.summary?.trim() ? session.summary : 'No summary yet.'}
              </Text>
              <View style={styles.summarySection}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Key decisions
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {session.keyDecisions?.trim() ? session.keyDecisions : 'None recorded.'}
                </Text>
              </View>
              <View style={styles.summarySection}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Outcomes
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {session.outcomes?.trim() ? session.outcomes : 'None recorded.'}
                </Text>
              </View>
            </View>
          )}
        </Section>

        <Section title="Participants" icon="account-group-outline">
          {isEditing ? (
            <AppCard
              title="Manage participants"
              subtitle={`${playerCharacterIds.length} selected`}
              onPress={() => openLinkModal('participants')}
              right={
                <View style={styles.editCardRight}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
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
          ) : linkedPlayers.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No participants linked.
            </Text>
          ) : (
            <View style={styles.participantGroup}>
              <AvatarGroup
                items={linkedPlayers.map((pc) => ({
                  id: pc.id,
                  name: pc.name,
                  image: pc.image,
                }))}
              />
              {linkedPlayers.map((pc) => (
                <AppCard
                  key={pc.id}
                  title={pc.name || 'Unnamed character'}
                  subtitle={pc.player ? `Player: ${pc.player}` : 'No player listed.'}
                  onPress={() => router.push(`/player-character/${pc.id}`)}
                  style={styles.inlineCard}
                />
              ))}
            </View>
          )}
        </Section>

        <Section title="Links" icon="link-variant">
          {isEditing ? (
            <View style={styles.linkList}>
              <AppCard
                title="Campaigns"
                subtitle={`${campaignIds.length} selected`}
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
                subtitle={`${locationIds.length} selected`}
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
                title="NPCs"
                subtitle={`${npcIds.length} selected`}
                onPress={() => openLinkModal('npcs')}
                right={
                  <View style={styles.editCardRight}>
                    <MaterialCommunityIcons
                      name="account-group-outline"
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
                subtitle={`${noteIds.length} selected`}
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
                subtitle={`${tagIds.length} selected`}
                onPress={() => openLinkModal('tags')}
                right={
                  <View style={styles.editCardRight}>
                    <MaterialCommunityIcons
                      name="tag-outline"
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
            </View>
          ) : (
            <>
              {linkedCampaigns.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  No campaigns linked.
                </Text>
              ) : (
                linkedCampaigns.map((campaign) => (
                  <AppCard
                    key={campaign.id}
                    title={campaign.name || 'Untitled campaign'}
                    onPress={() => router.push(`/campaign/${campaign.id}`)}
                    style={styles.inlineCard}
                  />
                ))
              )}
              {linkedLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onPress={() => router.push(`/location/${location.id}`)}
                />
              ))}
              {linkedNpcs.map((npc) => (
                <NPCCard
                  key={npc.id}
                  npc={npc}
                  onPress={() => router.push(`/npc/${npc.id}`)}
                />
              ))}
              {linkedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPress={() => router.push(`/note/${note.id}`)}
                />
              ))}
              {resolvedTags.length > 0 && (
                <View style={styles.tagsRow}>
                  {resolvedTags.map((tag) => (
                    <TagChip
                      key={tag.id}
                      id={tag.id}
                      name={tag.name}
                      color={tag.color}
                      size="small"
                      onPress={() => router.push(`/tag/${tag.id}`)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </Section>

        <View style={styles.metaRow}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Created: {formatDate(session.created)}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Updated: {formatDate(session.updated)}
          </Text>
        </View>

        {error && (
          <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        <View style={styles.actionRow}>
          {isEditing ? (
            <>
              <Button mode="contained" onPress={handleSave} style={styles.actionButton}>
                Save
              </Button>
              <Button mode="outlined" onPress={handleCancel} style={styles.actionButton}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button mode="outlined" onPress={() => router.back()} style={styles.actionButton}>
                Back
              </Button>
              <Button
                mode="outlined"
                icon="trash-can-outline"
                onPress={handleDelete}
                style={styles.actionButton}
                textColor={theme.colors.error}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </>
          )}
        </View>
      </Screen>
      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete session?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
      {activeLinkModal && (
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
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  headerText: {
    flex: 1,
    gap: spacing[2],
  },
  summaryInput: {
    minHeight: 120,
  },
  summaryBlock: {
    gap: spacing[3],
  },
  summarySection: {
    gap: spacing[1],
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
  participantGroup: {
    gap: spacing[2],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  inlineCard: {
    marginBottom: spacing[2],
  },
  metaRow: {
    marginTop: spacing[4],
    gap: spacing[1],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    marginTop: spacing[3],
  },
});
