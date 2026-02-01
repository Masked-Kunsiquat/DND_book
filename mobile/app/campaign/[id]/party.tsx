import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  EmptyState,
  FormModal,
  FormTextInput,
  ModalActions,
  Screen,
} from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { commonStyles, layout, spacing } from '../../../src/theme';
import {
  useCampaign,
  useCreatePlayerCharacter,
  usePlayerCharacters,
  usePullToRefresh,
} from '../../../src/hooks';
import type { PlayerCharacter } from '../../../src/types/schema';

/**
 * Screen for viewing and managing a campaign's party (player characters).
 *
 * Renders the party list for the current campaign, empty-state UI when no campaign or no party members exist,
 * a modal to create new player characters, and controls to browse character templates tied to the campaign continuity.
 *
 * @returns The React element that renders the campaign party screen.
 */
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
  const continuityId = campaign?.continuityId || '';
  const party = usePlayerCharacters(scopedCampaignId);
  const { refreshing, onRefresh } = usePullToRefresh();
  const createPlayerCharacter = useCreatePlayerCharacter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draftName, setDraftName] = useState('');
  const [draftPlayer, setDraftPlayer] = useState('');
  const [draftRace, setDraftRace] = useState('');
  const [draftClass, setDraftClass] = useState('');
  const [draftBackground, setDraftBackground] = useState('');

  const openCreateModal = () => {
    setDraftName(`New Character ${party.length + 1}`);
    setDraftPlayer('');
    setDraftRace('');
    setDraftClass('');
    setDraftBackground('');
    setError(null);
    setIsModalOpen(true);
  };

  const openTemplates = () => {
    if (!continuityId) return;
    router.push({ pathname: '/library/player-characters', params: { continuityId } });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
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
      const createdId = createPlayerCharacter({
        name: trimmedName,
        player: draftPlayer.trim(),
        race: draftRace.trim(),
        class: draftClass.trim(),
        background: draftBackground,
        campaignIds: [campaignId],
      });
      setIsModalOpen(false);
      router.push(`/player-character/${createdId}`);
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'Failed to save character.';
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
      title="New Character"
      visible={isModalOpen}
      onDismiss={closeModal}
      actions={
        <ModalActions
          onCancel={closeModal}
          onConfirm={handleSave}
          confirmLabel="Save"
          loading={isSaving}
          disabled={isSaving}
        />
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
          <Button
            mode="outlined"
            icon="account-multiple-plus"
            onPress={openTemplates}
            style={styles.secondaryAction}
            disabled={!continuityId}
          >
            Browse Templates
          </Button>
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
          contentContainerStyle={commonStyles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={commonStyles.flexRow}>
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
              <View style={styles.headerActions}>
                <Button
                  mode="outlined"
                  icon="account-multiple-plus"
                  onPress={openTemplates}
                  disabled={!continuityId}
                >
                  Templates
                </Button>
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
              onPress={() => router.push(`/player-character/${item.id}`)}
              style={styles.card}
            />
          )}
        />
        <FAB
          icon="plus"
          onPress={openCreateModal}
          style={[commonStyles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
        />
      </Screen>
      {modal}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing[3],
    gap: spacing[1],
  },
  headerActions: {
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
  secondaryAction: {
    marginTop: spacing[3],
    alignSelf: 'center',
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
  card: {
    marginBottom: spacing[3],
  },
  backgroundInput: {
    minHeight: 120,
  },
});
