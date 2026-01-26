import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard, EmptyState, FormModal, FormTextInput, Screen, Section } from '../src/components';
import { useTheme } from '../src/theme/ThemeProvider';
import { spacing } from '../src/theme';
import { useCampaigns, useCurrentCampaign, useSetCurrentCampaign } from '../src/hooks/useCampaigns';
import { useContinuities, useCreateContinuity } from '../src/hooks/useContinuities';

const pluralize = (word: string, count: number) => (count === 1 ? word : `${word}s`);

export default function ContinuitiesScreen() {
  const { theme } = useTheme();
  const continuities = useContinuities();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const setCurrentCampaign = useSetCurrentCampaign();
  const createContinuity = useCreateContinuity();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const currentContinuityId = currentCampaign?.continuityId ?? '';

  const continuityById = useMemo(() => {
    return new Map(continuities.map((continuity) => [continuity.id, continuity]));
  }, [continuities]);

  const currentContinuity = currentContinuityId
    ? continuityById.get(currentContinuityId)
    : undefined;

  const campaignsByContinuity = useMemo(() => {
    const map = new Map<string, typeof campaigns>();
    campaigns.forEach((campaign) => {
      const list = map.get(campaign.continuityId) ?? [];
      list.push(campaign);
      map.set(campaign.continuityId, list);
    });
    return map;
  }, [campaigns]);

  const openCreateModal = () => {
    setDraftName('New Continuity');
    setDraftDescription('');
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
      setCreateError('Continuity name is required.');
      return;
    }
    setIsCreating(true);
    try {
      const id = createContinuity({ name: trimmed, description: draftDescription.trim() });
      closeCreateModal();
      router.push({ pathname: '/campaigns', params: { create: '1', continuityId: id } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create continuity.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectContinuity = (continuityId: string) => {
    const list = campaignsByContinuity.get(continuityId) ?? [];
    if (list.length === 0) {
      router.push({ pathname: '/campaigns', params: { create: '1', continuityId } });
      return;
    }
    const latest = [...list].sort((a, b) => {
      const aDate = a.updated || a.created;
      const bDate = b.updated || b.created;
      return bDate.localeCompare(aDate);
    })[0];
    if (latest) {
      setCurrentCampaign(latest.id);
    }
  };

  const createModal = (
    <FormModal
      title="New Continuity"
      visible={isCreateOpen}
      onDismiss={closeCreateModal}
      actions={
        <>
          <Button mode="text" onPress={closeCreateModal} disabled={isCreating}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleCreate} loading={isCreating} disabled={isCreating}>
            Create
          </Button>
        </>
      }
    >
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      <FormTextInput
        label="Description"
        value={draftDescription}
        onChangeText={setDraftDescription}
        multiline
        style={styles.descriptionInput}
      />
      {createError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      )}
    </FormModal>
  );

  if (continuities.length === 0) {
    return (
      <>
        <Screen>
          <Stack.Screen options={{ title: 'Continuity' }} />
          <EmptyState
            title="No continuities yet"
            description="Create a continuity to group connected campaigns."
            icon="infinity"
            action={{ label: 'Create Continuity', onPress: openCreateModal }}
          />
        </Screen>
        {createModal}
      </>
    );
  }

  return (
    <>
      <Screen>
        <Stack.Screen options={{ title: 'Continuity' }} />
        <Section title="Current Continuity" icon="infinity">
          <AppCard
            title={currentContinuity?.name || 'No continuity selected'}
            subtitle={
              currentCampaign
                ? `Campaign: ${currentCampaign.name}`
                : 'Select a campaign to set the current continuity.'
            }
            onPress={() => router.push('/campaigns')}
            right={
              currentContinuity ? (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={theme.colors.primary}
                />
              ) : undefined
            }
          />
        </Section>

        <Section title="All Continuities" icon="infinity" action={{ label: 'New', onPress: openCreateModal }}>
          {continuities.map((continuity) => {
            const list = campaignsByContinuity.get(continuity.id) ?? [];
            const isCurrent = continuity.id === currentContinuityId;
            const subtitle =
              list.length === 0
                ? 'No campaigns yet'
                : `${list.length} ${pluralize('campaign', list.length)}`;
            return (
              <AppCard
                key={continuity.id}
                title={continuity.name || 'Untitled continuity'}
                subtitle={subtitle}
                onPress={() => handleSelectContinuity(continuity.id)}
                right={
                  isCurrent ? (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={theme.colors.primary}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="swap-horizontal"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  )
                }
              />
            );
          })}
          <View style={styles.helper}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Tap a continuity to switch to its most recently updated campaign.
            </Text>
          </View>
        </Section>
      </Screen>
      {createModal}
    </>
  );
}

const styles = StyleSheet.create({
  descriptionInput: {
    minHeight: 120,
  },
  helper: {
    marginTop: spacing[1],
  },
});
