import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  EmptyState,
  FormImagePicker,
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
  useDeleteNpc,
  useGetOrCreateTag,
  useLocations,
  useNotes,
  useNpc,
  useTags,
  useUpdateNpc,
} from '../../src/hooks';

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
}

export default function NpcDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const npcId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);

  const npc = useNpc(npcId);
  const updateNpc = useUpdateNpc();
  const deleteNpc = useDeleteNpc();
  const getOrCreateTag = useGetOrCreateTag();
  const campaigns = useCampaigns();
  const locations = useLocations();
  const notes = useNotes();
  const tags = useTags();

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

  useEffect(() => {
    if (npc && !isEditing) {
      setName(npc.name);
      setRace(npc.race);
      setRole(npc.role);
      setBackground(npc.background);
      setImage(npc.image || null);
      setCampaignIds(npc.campaignIds);
      setLocationIds(npc.locationIds);
      setNoteIds(npc.noteIds);
      setTagIds(npc.tagIds);
    }
  }, [npc, isEditing]);

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

  const linkedCampaigns = useMemo(() => {
    const ids = new Set(campaignIds);
    return campaigns.filter((campaign) => ids.has(campaign.id));
  }, [campaignIds, campaigns]);

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
    setCampaignIds(npc.campaignIds);
    setLocationIds(npc.locationIds);
    setNoteIds(npc.noteIds);
    setTagIds(npc.tagIds);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (npc) {
      setName(npc.name);
      setRace(npc.race);
      setRole(npc.role);
      setBackground(npc.background);
      setImage(npc.image || null);
      setCampaignIds(npc.campaignIds);
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
    Alert.alert(
      'Delete NPC?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              deleteNpc(npc.id);
              router.back();
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Failed to delete NPC.';
              setError(message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
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
          </View>
          {!isEditing && (
            <IconButton
              icon="pencil"
              onPress={handleEdit}
              accessibilityLabel="Edit NPC"
            />
          )}
        </View>

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
            </>
          )}
        </Section>

        <Section title="Links" icon="link-variant">
          {isEditing ? (
            <>
              <FormMultiSelect
                label="Campaigns"
                value={campaignIds}
                options={campaignOptions}
                onChange={setCampaignIds}
              />
              <FormMultiSelect
                label="Locations"
                value={locationIds}
                options={locationOptions}
                onChange={setLocationIds}
              />
              <FormMultiSelect
                label="Notes"
                value={noteIds}
                options={noteOptions}
                onChange={setNoteIds}
              />
              <TagInput
                tags={tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
                selectedIds={tagIds}
                onChange={setTagIds}
                onCreateTag={handleCreateTag}
              />
            </>
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
    minHeight: 140,
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
  errorText: {
    marginTop: spacing[3],
  },
});
