import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  EmptyState,
  FormModal,
  FormMultiSelect,
  FormTextInput,
  Screen,
} from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { layout, spacing } from '../../../src/theme';
import {
  useCampaign,
  useCreatePlayerCharacter,
  useDeletePlayerCharacter,
  useNotes,
  usePlayerCharacters,
  usePullToRefresh,
  useUpdatePlayerCharacter,
} from '../../../src/hooks';
import type { PlayerCharacter } from '../../../src/types/schema';

export default function CampaignPartyScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const campaignId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);
  const hasCampaignId = campaignId.trim().length > 0;
  const scopedCampaignId = hasCampaignId ? campaignId : '__missing__';

  const campaign = useCampaign(scopedCampaignId);
  const party = usePlayerCharacters(scopedCampaignId);
  const notes = useNotes(scopedCampaignId);
  const { refreshing, onRefresh } = usePullToRefresh();
  const createPlayerCharacter = useCreatePlayerCharacter();
  const updatePlayerCharacter = useUpdatePlayerCharacter();
  const deletePlayerCharacter = useDeletePlayerCharacter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<PlayerCharacter | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draftName, setDraftName] = useState('');
  const [draftPlayer, setDraftPlayer] = useState('');
  const [draftRace, setDraftRace] = useState('');
  const [draftClass, setDraftClass] = useState('');
  const [draftBackground, setDraftBackground] = useState('');
  const [draftNoteIds, setDraftNoteIds] = useState<string[]>([]);

  const noteOptions = useMemo(() => {
    return notes.map((note) => ({
      label: note.title || 'Untitled note',
      value: note.id,
    }));
  }, [notes]);

  const openCreateModal = () => {
    setDraftName(`New Character ${party.length + 1}`);
    setDraftPlayer('');
    setDraftRace('');
    setDraftClass('');
    setDraftBackground('');
    setDraftNoteIds([]);
    setEditingCharacter(null);
    setIsEditing(false);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (character: PlayerCharacter) => {
    setDraftName(character.name);
    setDraftPlayer(character.player);
    setDraftRace(character.race);
    setDraftClass(character.class);
    setDraftBackground(character.background);
    setDraftNoteIds(character.noteIds);
    setEditingCharacter(character);
    setIsEditing(true);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
    setIsEditing(false);
    setEditingCharacter(null);
  };

  const handleSave = () => {
    if (isSaving) return;
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setError('Character name is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && editingCharacter) {
        updatePlayerCharacter(editingCharacter.id, {
          name: trimmedName,
          player: draftPlayer.trim(),
          race: draftRace.trim(),
          class: draftClass.trim(),
          background: draftBackground,
          noteIds: draftNoteIds,
        });
      } else {
        createPlayerCharacter({
          name: trimmedName,
          player: draftPlayer.trim(),
          race: draftRace.trim(),
          class: draftClass.trim(),
          background: draftBackground,
          noteIds: draftNoteIds,
          campaignIds: [campaignId],
        });
      }
      setIsModalOpen(false);
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'Failed to save character.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editingCharacter || isSaving) return;
    setIsSaving(true);
    try {
      deletePlayerCharacter(editingCharacter.id);
      setIsModalOpen(false);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : 'Failed to delete character.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderSubtitle = (character: PlayerCharacter) => {
    const parts = [
      character.player ? `Player: ${character.player}` : null,
      character.race || null,
      character.class || null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' • ') : 'No details yet.';
  };

  if (!hasCampaignId) {
    return (
      <Screen>
        <EmptyState
          title="No campaign selected"
          description="Select a campaign to manage party members."
          icon="account-group-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  if (!campaign) {
    return (
      <Screen>
        <EmptyState
          title="Campaign not found"
          description="This campaign may have been deleted."
          icon="folder-open-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const modal = (
    <FormModal
      title={isEditing ? 'Edit Character' : 'New Character'}
      visible={isModalOpen}
      onDismiss={closeModal}
      actions={
        <>
          <Button mode="text" onPress={closeModal} disabled={isSaving}>
            Cancel
          </Button>
          {isEditing && (
            <Button
              mode="outlined"
              onPress={handleDelete}
              disabled={isSaving}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          )}
          <Button mode="contained" onPress={handleSave} loading={isSaving} disabled={isSaving}>
            Save
          </Button>
        </>
      }
    >
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      <FormTextInput label="Player" value={draftPlayer} onChangeText={setDraftPlayer} />
      <FormTextInput label="Race" value={draftRace} onChangeText={setDraftRace} />
      <FormTextInput label="Class" value={draftClass} onChangeText={setDraftClass} />
      <FormTextInput
        label="Background"
        value={draftBackground}
        onChangeText={setDraftBackground}
        multiline
        style={styles.backgroundInput}
      />
      <FormMultiSelect
        label="Linked notes"
        value={draftNoteIds}
        options={noteOptions}
        onChange={setDraftNoteIds}
        helperText="Optional: connect notes to this character."
      />
      {error && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {error}
        </Text>
      )}
    </FormModal>
  );

  if (party.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Party' }} />
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No party members yet"
            description="Add player characters to track your party."
            icon="account-group-outline"
            action={{ label: 'Add Character', onPress: openCreateModal }}
          />
        </Screen>
        {modal}
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Party' }} />
      <Screen scroll={false}>
        <FlatList
          data={party}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.listHeader}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={18}
                  color={theme.colors.primary}
                  style={styles.listHeaderIcon}
                />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {campaign.name ? `${campaign.name} Party` : 'Party'}
                </Text>
              </View>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {party.length} character{party.length === 1 ? '' : 's'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <AppCard
              title={item.name || 'Unnamed character'}
              subtitle={renderSubtitle(item)}
              onPress={() => openEditModal(item)}
              style={styles.card}
            />
          )}
        />
        <FAB
          icon="plus"
          onPress={openCreateModal}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
        />
      </Screen>
      {modal}
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: layout.fabSize + layout.fabMargin * 2,
  },
  header: {
    marginBottom: spacing[3],
    gap: spacing[1],
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
  card: {
    marginBottom: spacing[3],
  },
  fab: {
    position: 'absolute',
    right: layout.fabMargin,
    bottom: layout.fabMargin,
  },
  backgroundInput: {
    minHeight: 120,
  },
});
