import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  ConfirmDialog,
  EmptyState,
  FormMultiSelect,
  FormSelect,
  FormTextInput,
  Screen,
  Section,
  TagChip,
  TagInput,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import {
  useCampaign,
  useCampaigns,
  useCurrentCampaign,
  useCreateNote,
  useDeleteNote,
  useGetOrCreateTag,
  useLocations,
  useNote,
  useTags,
  useUpdateNote,
} from '../../src/hooks';
import { now } from '../../src/utils/id';

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
}

export default function NoteDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const noteId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);

  const note = useNote(noteId);
  const campaign = useCampaign(note?.campaignId ?? '');
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const locations = useLocations();
  const continuityId =
    note?.continuityId || campaign?.continuityId || currentCampaign?.continuityId || '';
  const tags = useTags(continuityId, currentCampaign?.id);
  const updateNote = useUpdateNote();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const getOrCreateTag = useGetOrCreateTag({
    continuityId,
    scope: 'continuity',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isForking, setIsForking] = useState(false);

  useEffect(() => {
    if (note && !isEditing) {
      setTitle(note.title);
      setContent(note.content);
      setCampaignId(note.campaignId);
      setLocationIds(note.locationIds);
      setTagIds(note.tagIds);
    }
  }, [note, isEditing]);

  const continuityCampaigns = useMemo(() => {
    if (!continuityId) return campaigns;
    return campaigns.filter((item) => item.continuityId === continuityId);
  }, [campaigns, continuityId]);

  const continuityLocations = useMemo(() => {
    if (!continuityId) return [];
    return locations.filter(
      (location) => location.scope === 'continuity' && location.continuityId === continuityId
    );
  }, [continuityId, locations]);

  const campaignOptions = useMemo(() => {
    return continuityCampaigns.map((item) => ({
      label: item.name || 'Untitled campaign',
      value: item.id,
    }));
  }, [continuityCampaigns]);

  const locationOptions = useMemo(() => {
    if (note?.scope === 'continuity') {
      return continuityLocations.map((location) => ({
        label: location.name || 'Unnamed location',
        value: location.id,
      }));
    }
    const filtered = campaignId
      ? locations.filter((location) => location.campaignIds.includes(campaignId))
      : locations;
    return filtered.map((location) => ({
      label: location.name || 'Unnamed location',
      value: location.id,
    }));
  }, [campaignId, continuityLocations, locations, note?.scope]);

  const availableTags = useMemo(() => {
    if (note?.scope === 'continuity') {
      return tags.filter((tag) => tag.scope === 'continuity');
    }
    return tags;
  }, [note?.scope, tags]);

  const displayLocationIds = useMemo(() => {
    if (isEditing) return locationIds;
    return note?.locationIds ?? [];
  }, [isEditing, locationIds, note?.locationIds]);

  const displayTagIds = useMemo(() => {
    if (isEditing) return tagIds;
    return note?.tagIds ?? [];
  }, [isEditing, note?.tagIds, tagIds]);

  const linkedLocations = useMemo(() => {
    const ids = new Set(displayLocationIds);
    return locations.filter((location) => ids.has(location.id));
  }, [displayLocationIds, locations]);

  const resolvedTags = useMemo(() => {
    const tagById = new Map(tags.map((tag) => [tag.id, tag]));
    return displayTagIds
      .map((id) => tagById.get(id))
      .filter((tag): tag is (typeof tags)[number] => tag !== undefined);
  }, [displayTagIds, tags]);

  const showShareActions =
    note?.scope === 'campaign' || (note?.scope === 'continuity' && Boolean(currentCampaign));

  const handleCampaignChange = (value: string) => {
    if (note?.scope === 'continuity') return;
    setCampaignId(value);
    if (!value) {
      setLocationIds([]);
      return;
    }
    const allowed = new Set(
      locations
        .filter((location) => location.campaignIds.includes(value))
        .map((location) => location.id)
    );
    setLocationIds((prev) => prev.filter((id) => allowed.has(id)));
  };

  const handleCreateTag = (tagName: string) => {
    const id = getOrCreateTag(tagName);
    return id || undefined;
  };

  const handleEdit = () => {
    if (!note) return;
    setTitle(note.title);
    setContent(note.content);
    setCampaignId(note.campaignId);
    setLocationIds(note.locationIds);
    setTagIds(note.tagIds);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCampaignId(note.campaignId);
      setLocationIds(note.locationIds);
      setTagIds(note.tagIds);
    }
    setError(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!note) return;
    if (note.scope === 'campaign' && !campaignId) {
      setError('Select a campaign before saving.');
      return;
    }
    setError(null);
    try {
      updateNote(note.id, {
        title,
        content,
        campaignId: note.scope === 'campaign' ? campaignId : '',
        campaignIds:
          note.scope === 'campaign'
            ? campaignId
              ? [campaignId]
              : []
            : note.campaignIds,
        locationIds,
        tagIds,
      });
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update note.';
      setError(message);
    }
  };

  const handleDelete = () => {
    if (!note || isDeleting) return;
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (!note || isDeleting) return;
    try {
      setIsDeleting(true);
      await Promise.resolve(deleteNote(note.id));
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete note.';
      setError(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleShare = () => {
    if (!note || isSharing) return;
    setIsShareOpen(true);
  };

  const closeShareDialog = () => {
    setIsShareOpen(false);
  };

  const confirmShare = () => {
    if (!note || isSharing) return;
    if (!continuityId) {
      setError('Select a continuity before sharing this note.');
      setIsShareOpen(false);
      return;
    }
    setIsSharing(true);
    try {
      updateNote(note.id, {
        scope: 'continuity',
        continuityId,
        campaignId: '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to share note.';
      setError(message);
    } finally {
      setIsSharing(false);
      setIsShareOpen(false);
    }
  };

  const handleFork = () => {
    if (!note || !currentCampaign || isForking) return;
    setIsForking(true);
    try {
      const id = createNote({
        title: note.title || 'Untitled note',
        content: note.content,
        scope: 'campaign',
        continuityId,
        campaignId: currentCampaign.id,
        campaignIds: [currentCampaign.id],
        originId: note.id,
        originContinuityId: continuityId,
        forkedAt: now(),
        locationIds: note.locationIds,
        tagIds: note.tagIds,
      });
      router.push(`/note/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fork note.';
      setError(message);
    } finally {
      setIsForking(false);
    }
  };

  if (!note) {
    return (
      <Screen>
        <EmptyState
          title="Note not found"
          description="This note may have been deleted."
          icon="note-text-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: note.title || 'Note' }} />
      <Screen>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {isEditing ? (
              <FormTextInput
                label="Title"
                value={title}
                onChangeText={setTitle}
                style={styles.titleInput}
              />
            ) : (
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                {note.title || 'Untitled note'}
              </Text>
            )}
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {note.scope === 'continuity'
                ? 'Shared in continuity'
                : campaign?.name ?? 'No campaign'}
            </Text>
          </View>
          {!isEditing && (
            <IconButton
              icon="pencil"
              onPress={handleEdit}
              accessibilityLabel="Edit note"
            />
          )}
        </View>

        <Section title="Content" icon="note-text-outline">
          {isEditing ? (
            <FormTextInput
              label="Content"
              value={content}
              onChangeText={setContent}
              multiline
              style={styles.contentInput}
            />
          ) : (
            <>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {note.content?.trim() ? note.content : 'No content yet.'}
              </Text>
              {note.scope === 'continuity' && (
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Editing shared notes affects all campaigns in this continuity.
                </Text>
              )}
            </>
          )}
        </Section>

        <Section title="Links" icon="link-variant">
          {isEditing ? (
            <>
              {note.scope === 'campaign' ? (
                <FormSelect
                  label="Campaign"
                  value={campaignId}
                  options={campaignOptions}
                  onChange={handleCampaignChange}
                />
              ) : (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Shared notes are available to every campaign in this continuity.
                </Text>
              )}
              <FormMultiSelect
                label="Locations"
                value={locationIds}
                options={locationOptions}
                onChange={setLocationIds}
                helperText="Optional: link this note to locations."
              />
              <TagInput
                tags={availableTags.map((tag) => ({
                  id: tag.id,
                  name: tag.name,
                  color: tag.color,
                }))}
                selectedIds={tagIds}
                onChange={setTagIds}
                onCreateTag={handleCreateTag}
              />
            </>
          ) : (
            <>
              {linkedLocations.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  No locations linked.
                </Text>
              ) : (
                linkedLocations.map((location) => (
                  <AppCard
                    key={location.id}
                    title={location.name || 'Unnamed location'}
                    onPress={() => router.push(`/location/${location.id}`)}
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

        <View style={styles.metaRow}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Created: {formatDate(note.created)}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Updated: {formatDate(note.updated)}
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
        {!isEditing && showShareActions && (
          <View style={styles.shareRow}>
            {note.scope === 'campaign' && (
              <Button
                mode="outlined"
                icon="share-variant"
                onPress={handleShare}
                disabled={isSharing}
              >
                Share to Continuity
              </Button>
            )}
            {note.scope === 'continuity' && currentCampaign && (
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
        title="Delete note?"
        description={
          note.scope === 'continuity'
            ? 'This note will be removed from all campaigns in this continuity.'
            : 'This action cannot be undone.'
        }
        confirmLabel="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
      <ConfirmDialog
        visible={isShareOpen}
        title="Share to continuity?"
        description="Shared notes are visible to every campaign in this continuity."
        confirmLabel="Share"
        onCancel={closeShareDialog}
        onConfirm={confirmShare}
        confirmLoading={isSharing}
      />
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
  contentInput: {
    minHeight: 180,
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
  shareRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    marginTop: spacing[3],
  },
});
