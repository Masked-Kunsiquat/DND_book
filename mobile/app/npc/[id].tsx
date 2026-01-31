import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  ConfirmDialog,
  EmptyState,
  FormImagePicker,
  FormModal,
  LocationMultiSelect,
  FormMultiSelect,
  FormTextInput,
  Screen,
  Section,
  TagChip,
  TagInput,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, spacing } from '../../src/theme';
import type { Tag } from '../../src/types/schema';
import {
  useCampaigns,
  useCurrentCampaign,
  useCreateNpc,
  useDeleteNpc,
  useGetOrCreateTag,
  useLocations,
  useNotes,
  useNpc,
  useTags,
  useUpdateNpc,
} from '../../src/hooks';
import { now } from '../../src/utils/id';

/**
 * Convert a date/time string into a localized, human-readable date and time.
 *
 * @param value - The date/time string to format; if omitted or not a valid date, it is treated as unknown.
 * @returns The localized date and time string, or `'Unknown'` if `value` is missing or cannot be parsed.
 */
function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
}

/**
 * Render the NPC detail screen and provide UI for viewing, editing, linking, sharing, forking, removing, deleting, and completing shadow NPCs.
 *
 * Presents NPC profile and linked resources, manages edit form state and modals, and performs CRUD and sharing/forking actions via injected hooks.
 *
 * @returns The React element that renders the NPC detail screen
 */
export default function NpcDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const npcId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);

  const npc = useNpc(npcId);
  const createNpc = useCreateNpc();
  const updateNpc = useUpdateNpc();
  const deleteNpc = useDeleteNpc();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const continuityId =
    npc?.continuityId ??
    campaigns.find((campaign) => campaign.id === npc?.campaignIds[0])?.continuityId ??
    currentCampaign?.continuityId ??
    '';
  const locations = useLocations();
  const notes = useNotes(continuityId, currentCampaign?.id);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [race, setRace] = useState('');
  const [role, setRole] = useState('');
  const [background, setBackground] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [campaignIds, setCampaignIds] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [noteIds, setNoteIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [activeLinkModal, setActiveLinkModal] = useState<
    'campaigns' | 'locations' | 'notes' | 'tags' | null
  >(null);

  const normalizeCampaignIds = (ids: string[]) => (ids.length > 0 ? [ids[0]] : []);
  const resolveEditableCampaignIds = (ids: string[], scope?: string) =>
    scope === 'continuity' ? ids : normalizeCampaignIds(ids);

  useEffect(() => {
    if (npc && !isEditing) {
      setName(npc.name);
      setRace(npc.race);
      setRole(npc.role);
      setBackground(npc.background);
      setImage(npc.image || null);
      setCampaignIds(resolveEditableCampaignIds(npc.campaignIds, npc.scope));
      setLocationIds(npc.locationIds);
      setNoteIds(npc.noteIds);
      setTagIds(npc.tagIds);
    }
  }, [npc, isEditing]);

  const continuityCampaigns = useMemo(() => {
    if (!continuityId) return campaigns;
    return campaigns.filter((campaign) => campaign.continuityId === continuityId);
  }, [campaigns, continuityId]);

  const tags = useTags(continuityId, currentCampaign?.id);
  const getOrCreateTag = useGetOrCreateTag({
    continuityId,
    scope: 'continuity',
  });

  const canRemoveFromCampaign =
    npc?.scope === 'continuity' &&
    currentCampaign &&
    npc.campaignIds.includes(currentCampaign.id);

  const showShareActions =
    npc?.scope === 'campaign' ||
    (npc?.scope === 'continuity' && Boolean(currentCampaign));

  const campaignOptions = useMemo(() => {
    return continuityCampaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [continuityCampaigns]);

  const noteOptions = useMemo(() => {
    return notes.map((note) => ({
      label: note.title || 'Untitled note',
      value: note.id,
    }));
  }, [notes]);

  const selectableLocations = useMemo(() => {
    if (!continuityId) return [];
    return locations.filter((location) => location.continuityId === continuityId);
  }, [continuityId, locations]);

  const linkedCampaigns = useMemo(() => {
    const ids = new Set(resolveEditableCampaignIds(campaignIds, npc?.scope));
    return continuityCampaigns.filter((campaign) => ids.has(campaign.id));
  }, [campaignIds, continuityCampaigns, npc?.scope]);

  const linkedLocations = useMemo(() => {
    const ids = new Set(locationIds);
    return locations.filter((location) => ids.has(location.id));
  }, [locationIds, locations]);

  const linkedNotes = useMemo(() => {
    const ids = new Set(noteIds);
    return notes.filter((note) => ids.has(note.id));
  }, [noteIds, notes]);

  const resolvedTags = useMemo(() => {
    const tagById = new Map(tags.map((tag) => [tag.id, tag]));
    return tagIds.map((id) => tagById.get(id)).filter((tag): tag is Tag => tag !== undefined);
  }, [tagIds, tags]);

  const handleCreateTag = (tagName: string) => {
    const id = getOrCreateTag(tagName);
    return id || undefined;
  };

  const handleEdit = () => {
    if (!npc) return;
    setName(npc.name);
    setRace(npc.race);
    setRole(npc.role);
    setBackground(npc.background);
    setImage(npc.image || null);
    setCampaignIds(resolveEditableCampaignIds(npc.campaignIds, npc.scope));
    setLocationIds(npc.locationIds);
    setNoteIds(npc.noteIds);
    setTagIds(npc.tagIds);
    setError(null);
    setIsEditing(true);
  };

  const handleMarkComplete = () => {
    if (!npc) return;
    setError(null);
    try {
      updateNpc(npc.id, { status: 'complete' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark NPC complete.';
      setError(message);
    }
  };

  const openLinkModal = (target: 'campaigns' | 'locations' | 'notes' | 'tags') => {
    setActiveLinkModal(target);
  };

  const closeLinkModal = () => setActiveLinkModal(null);

  const linkModalTitle = (() => {
    switch (activeLinkModal) {
      case 'campaigns':
        return npc?.scope === 'continuity' ? 'Visible in campaigns' : 'Campaign';
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
            label={npc?.scope === 'continuity' ? 'Visible in campaigns' : 'Campaign'}
            value={campaignIds}
            options={campaignOptions}
            onChange={(value) =>
              setCampaignIds(
                npc?.scope === 'continuity'
                  ? value
                  : value.length > 0
                    ? [value[value.length - 1]]
                    : []
              )
            }
          />
        );
      case 'locations':
        return (
          <LocationMultiSelect
            locations={selectableLocations}
            value={locationIds}
            onChange={setLocationIds}
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

  const handleCancel = () => {
    if (npc) {
      setName(npc.name);
      setRace(npc.race);
      setRole(npc.role);
      setBackground(npc.background);
      setImage(npc.image || null);
      setCampaignIds(resolveEditableCampaignIds(npc.campaignIds, npc.scope));
      setLocationIds(npc.locationIds);
      setNoteIds(npc.noteIds);
      setTagIds(npc.tagIds);
    }
    setError(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!npc) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError('NPC name is required.');
      return;
    }
    setError(null);
    try {
      updateNpc(npc.id, {
        name: trimmed,
        race,
        role,
        background,
        image: image ?? '',
        status: npc.status === 'shadow' ? 'complete' : npc.status,
        campaignIds,
        locationIds,
        noteIds,
        tagIds,
      });
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update NPC.';
      setError(message);
    }
  };

  const handleDelete = () => {
    if (!npc || isDeleting) return;
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const confirmDelete = () => {
    if (!npc || isDeleting) return;
    try {
      setIsDeleting(true);
      deleteNpc(npc.id);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete NPC.';
      setError(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleRemove = () => {
    if (!npc || !currentCampaign || isRemoving) return;
    setIsRemoveOpen(true);
  };

  const closeRemoveDialog = () => {
    setIsRemoveOpen(false);
  };

  const confirmRemove = () => {
    if (!npc || !currentCampaign || isRemoving) return;
    try {
      setIsRemoving(true);
      updateNpc(npc.id, {
        campaignIds: npc.campaignIds.filter((id) => id !== currentCampaign.id),
      });
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove NPC.';
      setError(message);
    } finally {
      setIsRemoving(false);
      setIsRemoveOpen(false);
    }
  };

  const handleShare = () => {
    if (!npc || isSharing) return;
    setIsShareOpen(true);
  };

  const closeShareDialog = () => {
    setIsShareOpen(false);
  };

  const confirmShare = () => {
    if (!npc || isSharing) return;
    if (!continuityId) {
      setError('Select a continuity before sharing this NPC.');
      setIsShareOpen(false);
      return;
    }
    setIsSharing(true);
    try {
      const sharedCampaignIds =
        npc.campaignIds.length > 0
          ? npc.campaignIds
          : currentCampaign
            ? [currentCampaign.id]
            : [];
      updateNpc(npc.id, {
        scope: 'continuity',
        continuityId,
        campaignIds: sharedCampaignIds,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to share NPC.';
      setError(message);
    } finally {
      setIsSharing(false);
      setIsShareOpen(false);
    }
  };

  const handleFork = () => {
    if (!npc || !currentCampaign || isForking) return;
    setIsForking(true);
    try {
      const id = createNpc({
        name: npc.name,
        race: npc.race,
        role: npc.role,
        background: npc.background,
        image: npc.image,
        scope: 'campaign',
        continuityId: npc.continuityId,
        originId: npc.id,
        originContinuityId: npc.continuityId,
        forkedAt: now(),
        campaignIds: [currentCampaign.id],
        locationIds: npc.locationIds,
        noteIds: npc.noteIds,
        tagIds: npc.tagIds,
      });
      router.push(`/npc/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fork NPC.';
      setError(message);
    } finally {
      setIsForking(false);
    }
  };

  if (!npc) {
    return (
      <Screen>
        <EmptyState
          title="NPC not found"
          description="This NPC may have been deleted."
          icon="account-group-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: npc.name || 'NPC' }} />
      <Screen>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {isEditing ? (
              <FormTextInput
                label="Name"
                value={name}
                onChangeText={setName}
                style={styles.titleInput}
              />
            ) : (
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                {npc.name || 'Unnamed NPC'}
              </Text>
            )}
            {!isEditing && (
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {[npc.race, npc.role].filter(Boolean).join(' • ') || 'No details yet.'}
              </Text>
            )}
            {!isEditing && npc.scope === 'continuity' && (
              <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                Shared in continuity
              </Text>
            )}
          </View>
        {!isEditing && (
          <IconButton
            icon="pencil"
            onPress={handleEdit}
            accessibilityLabel="Edit NPC"
          />
        )}
      </View>

      {!isEditing && npc.status === 'shadow' && (
        <AppCard
          title="Shadow NPC"
          subtitle="Created from a mention. Fill in details to complete."
          style={styles.shadowCard}
        >
          <Button mode="contained" onPress={handleMarkComplete}>
            Mark Complete
          </Button>
        </AppCard>
      )}

      <Section title="Profile" icon="account-outline">
          {isEditing ? (
            <>
              <FormImagePicker label="Portrait" value={image} onChange={setImage} />
              <FormTextInput label="Race" value={race} onChangeText={setRace} />
              <FormTextInput label="Role" value={role} onChangeText={setRole} />
              <FormTextInput
                label="Background"
                value={background}
                onChangeText={setBackground}
                multiline
                style={styles.contentInput}
              />
            </>
          ) : (
            <>
              <View style={styles.imageRow}>
                <View style={[styles.avatar, { borderColor: theme.colors.outlineVariant }]}>
                  {npc.image ? (
                    <Image source={{ uri: npc.image }} style={styles.avatarImage} />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle-outline"
                      size={iconSizes['2xl']}
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                </View>
                <View style={styles.profileDetails}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Race: {npc.race || 'Unknown'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Role: {npc.role || 'Unknown'}
                  </Text>
                </View>
              </View>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {npc.background?.trim() || 'No background yet.'}
              </Text>
              {npc.scope === 'continuity' && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Editing shared NPCs affects every campaign linked to this continuity.
                </Text>
              )}
            </>
          )}
        </Section>

        <Section title="Links" icon="link-variant">
          {isEditing ? (
            <View style={styles.linkList}>
              <AppCard
                title={npc?.scope === 'continuity' ? 'Visible in campaigns' : 'Campaign'}
                subtitle={
                  npc?.scope === 'continuity'
                    ? `${campaignIds.length} selected`
                    : campaignIds.length > 0
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
                    title={campaign.name}
                    onPress={() => router.push(`/campaign/${campaign.id}`)}
                    style={styles.inlineCard}
                  />
                ))
              )}
              {linkedLocations.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  No locations linked.
                </Text>
              ) : (
                linkedLocations.map((location) => (
                  <AppCard
                    key={location.id}
                    title={location.name}
                    onPress={() => router.push(`/location/${location.id}`)}
                    style={styles.inlineCard}
                  />
                ))
              )}
              {linkedNotes.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  No notes linked.
                </Text>
              ) : (
                linkedNotes.map((note) => (
                  <AppCard
                    key={note.id}
                    title={note.title || 'Untitled note'}
                    onPress={() => router.push(`/note/${note.id}`)}
                    style={styles.inlineCard}
                  />
                ))
              )}
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

        {!isEditing && (
          <Section title="Meta" icon="calendar-clock">
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Created: {formatDate(npc.created)}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Updated: {formatDate(npc.updated)}
            </Text>
          </Section>
        )}

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
              {canRemoveFromCampaign && (
                <Button
                  mode="outlined"
                  icon="link-off"
                  onPress={handleRemove}
                  style={styles.actionButton}
                >
                  Remove
                </Button>
              )}
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
        {!isEditing && showShareActions && (
          <View style={styles.shareRow}>
            {npc.scope === 'campaign' && (
              <Button
                mode="outlined"
                icon="share-variant"
                onPress={handleShare}
                disabled={isSharing}
              >
                Share to Continuity
              </Button>
            )}
            {npc.scope === 'continuity' && currentCampaign && (
              <Button
                mode="outlined"
                icon="source-fork"
                onPress={handleFork}
                disabled={isForking}
              >
                Fork to Campaign
              </Button>
            )}
          </View>
        )}
      </Screen>
      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete NPC?"
        description={
          npc?.scope === 'continuity'
            ? 'This deletes the shared NPC for any campaign linked to this continuity.'
            : 'This action cannot be undone.'
        }
        confirmLabel="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
      <ConfirmDialog
        visible={isRemoveOpen}
        title="Remove from campaign?"
        description="This will remove the NPC from this campaign only."
        confirmLabel="Remove"
        onCancel={closeRemoveDialog}
        onConfirm={confirmRemove}
        confirmLoading={isRemoving}
      />
      <ConfirmDialog
        visible={isShareOpen}
        title="Share to continuity?"
        description="Shared NPCs live in the continuity and can be linked to multiple campaigns."
        confirmLabel="Share"
        onCancel={closeShareDialog}
        onConfirm={confirmShare}
        confirmLoading={isSharing}
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
    gap: spacing[1],
  },
  titleInput: {
    marginBottom: spacing[1],
  },
  shadowCard: {
    marginBottom: spacing[3],
  },
  contentInput: {
    minHeight: 140,
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
  imageRow: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatar: {
    width: spacing[12],
    height: spacing[12],
    borderRadius: spacing[12] / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileDetails: {
    gap: spacing[1],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  inlineCard: {
    marginBottom: spacing[2],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
  },
  actionButton: {
    flex: 1,
  },
  shareRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[3],
  },
  errorText: {
    marginTop: spacing[3],
  },
});