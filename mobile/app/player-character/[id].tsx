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
  FormMultiSelect,
  FormTextInput,
  NoteCard,
  Screen,
  Section,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, spacing } from '../../src/theme';
import {
  useCampaigns,
  useCreatePlayerCharacterTemplate,
  useCurrentCampaign,
  useDeletePlayerCharacter,
  useNotes,
  usePlayerCharacter,
  useSessionLogsByDate,
  useUpdatePlayerCharacter,
} from '../../src/hooks';

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
}

/**
 * Screen component that displays a player character's details and provides UI for editing,
 * linking to campaigns and notes, viewing related sessions, saving the character as a template,
 * and deleting the character.
 *
 * The component loads required data via hooks, manages local form and modal state for edits,
 * enforces a single-linked campaign when editing, and handles save/delete/template actions.
 *
 * @returns The rendered React element for the player character detail screen.
 */
export default function PlayerCharacterDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const characterId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);

  const character = usePlayerCharacter(characterId);
  const updatePlayerCharacter = useUpdatePlayerCharacter();
  const deletePlayerCharacter = useDeletePlayerCharacter();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const createTemplate = useCreatePlayerCharacterTemplate();
  const notes = useNotes();
  const sessions = useSessionLogsByDate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [player, setPlayer] = useState('');
  const [race, setRace] = useState('');
  const [className, setClassName] = useState('');
  const [background, setBackground] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [campaignIds, setCampaignIds] = useState<string[]>([]);
  const [noteIds, setNoteIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isTemplateSaving, setIsTemplateSaving] = useState(false);
  const [activeLinkModal, setActiveLinkModal] = useState<'campaigns' | 'notes' | null>(null);

  const normalizeCampaignIds = (ids: string[]) => (ids.length > 0 ? [ids[0]] : []);

  useEffect(() => {
    if (character && !isEditing) {
      setName(character.name);
      setPlayer(character.player);
      setRace(character.race);
      setClassName(character.class);
      setBackground(character.background);
      setImage(character.image || null);
      setCampaignIds(normalizeCampaignIds(character.campaignIds));
      setNoteIds(character.noteIds);
    }
  }, [character, isEditing]);

  const displayCampaignIds = useMemo(
    () =>
      isEditing
        ? campaignIds
        : normalizeCampaignIds(character?.campaignIds ?? []),
    [campaignIds, character?.campaignIds, isEditing]
  );
  const displayNoteIds = useMemo(
    () => (isEditing ? noteIds : character?.noteIds ?? []),
    [character?.noteIds, isEditing, noteIds]
  );

  const campaignIdSet = useMemo(() => new Set(displayCampaignIds), [displayCampaignIds]);
  const continuityId = useMemo(() => {
    if (currentCampaign && displayCampaignIds.includes(currentCampaign.id)) {
      return currentCampaign.continuityId;
    }
    const firstCampaignId = displayCampaignIds[0];
    return campaigns.find((campaign) => campaign.id === firstCampaignId)?.continuityId || '';
  }, [campaigns, currentCampaign, displayCampaignIds]);

  const campaignOptions = useMemo(() => {
    return campaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [campaigns]);

  const noteOptions = useMemo(() => {
    const filtered =
      campaignIdSet.size === 0
        ? notes
        : notes.filter((note) => {
            if (note.scope === 'campaign') {
              return campaignIdSet.has(note.campaignId);
            }
            if (note.scope === 'continuity') {
              return note.campaignIds.some((id) => campaignIdSet.has(id));
            }
            return false;
          });
    return filtered.map((note) => ({
      label: note.title || 'Untitled note',
      value: note.id,
    }));
  }, [campaignIdSet, notes]);

  const linkedCampaigns = useMemo(() => {
    const ids = new Set(displayCampaignIds);
    return campaigns.filter((campaign) => ids.has(campaign.id));
  }, [campaigns, displayCampaignIds]);

  const linkedNotes = useMemo(() => {
    const ids = new Set(displayNoteIds);
    return notes.filter((note) => ids.has(note.id));
  }, [displayNoteIds, notes]);

  const linkedSessions = useMemo(() => {
    if (!character) return [];
    return sessions.filter((session) => session.playerCharacterIds.includes(character.id));
  }, [character, sessions]);

  const openTemplateDialog = () => {
    if (!character || isTemplateSaving) return;
    setIsTemplateOpen(true);
  };

  const closeTemplateDialog = () => {
    setIsTemplateOpen(false);
  };

  const confirmTemplate = () => {
    if (!character || isTemplateSaving) return;
    if (!continuityId) {
      setError('Select a continuity before saving this template.');
      setIsTemplateOpen(false);
      return;
    }
    setIsTemplateSaving(true);
    try {
      createTemplate({
        name: character.name,
        player: character.player,
        race: character.race,
        class: character.class,
        background: character.background,
        image: character.image,
        continuityId,
        originId: character.id,
        originContinuityId: continuityId,
        forkedAt: '',
      });
    } catch (templateError) {
      const message =
        templateError instanceof Error
          ? templateError.message
          : 'Failed to save template.';
      setError(message);
    } finally {
      setIsTemplateSaving(false);
      setIsTemplateOpen(false);
    }
  };

  const handleCampaignChange = (value: string[]) => {
    const nextCampaignIds = value.length > 0 ? [value[value.length - 1]] : [];
    setCampaignIds(nextCampaignIds);
    if (nextCampaignIds.length === 0) return;
    const allowed = new Set(nextCampaignIds);
    const allowedNotes = new Set(
      notes
        .filter((note) => {
          if (note.scope === 'campaign') {
            return allowed.has(note.campaignId);
          }
          if (note.scope === 'continuity') {
            return note.campaignIds.some((id) => allowed.has(id));
          }
          return false;
        })
        .map((note) => note.id)
    );
    setNoteIds((prev) => prev.filter((id) => allowedNotes.has(id)));
  };

  const handleEdit = () => {
    if (!character) return;
    setName(character.name);
    setPlayer(character.player);
    setRace(character.race);
    setClassName(character.class);
    setBackground(character.background);
    setImage(character.image || null);
    setCampaignIds(normalizeCampaignIds(character.campaignIds));
    setNoteIds(character.noteIds);
    setError(null);
    setIsEditing(true);
  };

  const openLinkModal = (target: 'campaigns' | 'notes') => {
    setActiveLinkModal(target);
  };

  const closeLinkModal = () => setActiveLinkModal(null);

  const linkModalTitle = activeLinkModal === 'notes' ? 'Notes' : 'Campaign';

  const linkModalBody =
    activeLinkModal === 'notes' ? (
      <FormMultiSelect
        label="Linked notes"
        value={noteIds}
        options={noteOptions}
        onChange={setNoteIds}
      />
    ) : (
      <FormMultiSelect
        label="Campaign"
        value={campaignIds}
        options={campaignOptions}
        onChange={handleCampaignChange}
      />
    );

  const handleCancel = () => {
    if (character) {
      setName(character.name);
      setPlayer(character.player);
      setRace(character.race);
      setClassName(character.class);
      setBackground(character.background);
      setImage(character.image || null);
      setCampaignIds(normalizeCampaignIds(character.campaignIds));
      setNoteIds(character.noteIds);
    }
    setError(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!character) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Character name is required.');
      return;
    }
    setError(null);
    try {
      updatePlayerCharacter(character.id, {
        name: trimmedName,
        player: player.trim(),
        race: race.trim(),
        class: className.trim(),
        background,
        image: image ?? '',
        campaignIds,
        noteIds,
      });
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update character.';
      setError(message);
    }
  };

  const handleDelete = () => {
    if (!character || isDeleting) return;
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const confirmDelete = () => {
    if (!character || isDeleting) return;
    try {
      setIsDeleting(true);
      deletePlayerCharacter(character.id);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete character.';
      setError(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (!character) {
    return (
      <Screen>
        <EmptyState
          title="Character not found"
          description="This character may have been deleted."
          icon="account-group-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: character.name || 'Character' }} />
      <Screen>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {isEditing ? (
              <FormTextInput label="Name" value={name} onChangeText={setName} />
            ) : (
              <>
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                  {character.name || 'Unnamed character'}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {player.trim() ? `Player: ${player}` : 'Player not set'}
                </Text>
              </>
            )}
          </View>
          {!isEditing && (
            <IconButton
              icon="pencil"
              onPress={handleEdit}
              accessibilityLabel="Edit character"
            />
          )}
        </View>

        <Section title="Profile" icon="account-circle-outline">
          {isEditing ? (
            <>
              <FormImagePicker label="Portrait" value={image} onChange={setImage} />
              <FormTextInput label="Player" value={player} onChangeText={setPlayer} />
              <FormTextInput label="Race" value={race} onChangeText={setRace} />
              <FormTextInput label="Class" value={className} onChangeText={setClassName} />
              <FormTextInput
                label="Background"
                value={background}
                onChangeText={setBackground}
                multiline
                style={styles.backgroundInput}
              />
            </>
          ) : (
            <>
              <View style={styles.avatarRow}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.outlineVariant,
                    },
                  ]}
                >
                  {character.image ? (
                    <Image source={{ uri: character.image }} style={styles.avatarImage} />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle-outline"
                      size={iconSizes.xl}
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                </View>
                <View style={styles.profileDetails}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {race.trim() ? `Race: ${race}` : 'Race not set'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {className.trim() ? `Class: ${className}` : 'Class not set'}
                  </Text>
                </View>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {background.trim() ? background : 'No background notes yet.'}
              </Text>
            </>
          )}
        </Section>

        <Section title="Links" icon="link-variant">
          {isEditing ? (
            <View style={styles.linkList}>
              <AppCard
                title="Campaign"
                subtitle={campaignIds.length > 0 ? '1 selected' : 'Not linked'}
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
              {linkedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPress={() => router.push(`/note/${note.id}`)}
                />
              ))}
            </>
          )}
        </Section>

        {!isEditing && (
          <Section title="Sessions" icon="calendar-blank-outline">
            {linkedSessions.length === 0 ? (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                No sessions linked yet.
              </Text>
            ) : (
              linkedSessions.map((session) => (
                <AppCard
                  key={session.id}
                  title={session.title || 'Untitled session'}
                  subtitle={session.summary?.trim() ? session.summary : formatDate(session.date)}
                  onPress={() => router.push(`/session/${session.id}`)}
                />
              ))
            )}
          </Section>
        )}

        <View style={styles.metaRow}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Created: {formatDate(character.created)}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Updated: {formatDate(character.updated)}
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
        {!isEditing && (
          <View style={styles.templateRow}>
            <Button
              mode="outlined"
              icon="content-save-outline"
              onPress={openTemplateDialog}
              disabled={isTemplateSaving}
            >
              Save as Template
            </Button>
          </View>
        )}
      </Screen>
      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete character?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
      <ConfirmDialog
        visible={isTemplateOpen}
        title="Save as template?"
        description="This template can be reused across campaigns in the same continuity."
        confirmLabel="Save"
        onCancel={closeTemplateDialog}
        onConfirm={confirmTemplate}
        confirmLoading={isTemplateSaving}
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
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
  backgroundInput: {
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
  templateRow: {
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