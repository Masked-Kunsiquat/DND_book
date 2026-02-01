import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  useCampaigns,
  useCurrentCampaign,
  useSetCurrentCampaign,
  useCreateCampaign,
  useEntityCounts,
  useLocations,
  useNotes,
  useNpcs,
  usePullToRefresh,
} from '../../src/hooks';
import { useContinuities } from '../../src/hooks/useContinuities';
import { useTheme } from '../../src/theme/ThemeProvider';
import {
  FormModal,
  FormSelect,
  FormTextInput,
  Screen,
  EmptyState,
  CampaignCard,
  Section,
  AppCard,
} from '../../src/components';
import { commonStyles, layout, spacing } from '../../src/theme';

/**
 * Render the Campaigns screen for browsing, filtering by continuity, setting the current campaign, and creating new campaigns.
 *
 * Renders a current-campaign section, a header with continuity-aware title and a "New" action, a list of campaigns (filtered by continuity when applicable) with counts for notes/NPCs/locations, pull-to-refresh support, and a modal + FAB for creating campaigns.
 *
 * @returns A React element displaying the campaigns UI, including the create campaign modal and floating action button.
 */
export default function CampaignsScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ create?: string | string[]; continuityId?: string | string[] }>();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const setCurrentCampaign = useSetCurrentCampaign();
  const createCampaign = useCreateCampaign();
  const continuities = useContinuities();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftContinuityId, setDraftContinuityId] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const hasOpenedFromParams = useRef(false);
  const npcs = useNpcs();
  const locations = useLocations();
  const { refreshing, onRefresh } = usePullToRefresh();

  const continuityParam = useMemo(() => {
    const raw = params.continuityId;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.continuityId]);

  const continuityId = continuityParam || currentCampaign?.continuityId || '';
  const notes = useNotes(continuityId);

  const continuityCampaigns = useMemo(() => {
    if (!continuityId) return campaigns;
    return campaigns.filter((campaign) => campaign.continuityId === continuityId);
  }, [campaigns, continuityId]);

  const getNotesCampaignIds = useCallback(
    (note: (typeof notes)[number]) =>
      note.scope === 'campaign' ? (note.campaignId ? [note.campaignId] : []) : note.campaignIds,
    []
  );
  const noteCounts = useEntityCounts(notes, getNotesCampaignIds);
  const npcCounts = useEntityCounts(npcs, useCallback((npc: (typeof npcs)[number]) => npc.campaignIds, []));
  const locationCounts = useEntityCounts(
    locations,
    useCallback((loc: (typeof locations)[number]) => loc.campaignIds, [])
  );

  const openCreateModal = useCallback(() => {
    setDraftName(`New Campaign ${continuityCampaigns.length + 1}`);
    const preferredContinuity =
      continuityParam ||
      currentCampaign?.continuityId ||
      continuities[0]?.id ||
      '';
    setDraftContinuityId(preferredContinuity);
    setCreateError(null);
    setIsCreateOpen(true);
  }, [continuityCampaigns.length, continuities, continuityParam, currentCampaign?.continuityId]);

  const closeCreateModal = useCallback(() => {
    setIsCreateOpen(false);
    setCreateError(null);
  }, []);

  const handleCreate = useCallback(() => {
    if (isCreating) return;
    const trimmed = draftName.trim();
    if (!trimmed) {
      setCreateError('Campaign name is required.');
      return;
    }
    if (!draftContinuityId) {
      setCreateError('Select a continuity.');
      return;
    }
    setIsCreating(true);
    try {
      const id = createCampaign({ name: trimmed, continuityId: draftContinuityId });
      setCurrentCampaign(id);
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create campaign.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  }, [createCampaign, draftName, draftContinuityId, isCreating, setCurrentCampaign]);

  const continuityOptions = useMemo(() => {
    return continuities.map((continuity) => ({
      label: continuity.name || 'Unnamed continuity',
      value: continuity.id,
    }));
  }, [continuities]);

  useEffect(() => {
    if (hasOpenedFromParams.current) return;
    const shouldOpen = Array.isArray(params.create) ? params.create[0] : params.create;
    if (shouldOpen) {
      hasOpenedFromParams.current = true;
      openCreateModal();
    }
  }, [openCreateModal, params.create]);

  const createModal = (
    <FormModal
      title="New Campaign"
      visible={isCreateOpen}
      onDismiss={closeCreateModal}
      actions={
        <>
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
        </>
      }
    >
      <FormTextInput
        label="Campaign name"
        value={draftName}
        onChangeText={setDraftName}
      />
      <FormSelect
        label="Continuity"
        value={draftContinuityId}
        options={continuityOptions}
        onChange={setDraftContinuityId}
        helperText="Every campaign belongs to a continuity."
      />
      {createError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      )}
    </FormModal>
  );

  const headerTitle = continuityId ? 'Continuity Campaigns' : 'All Campaigns';
  const header = (
    <View>
      <Section title="Current Campaign" icon="compass">
        {currentCampaign ? (
          <CampaignCard
            campaign={currentCampaign}
            noteCount={noteCounts.get(currentCampaign.id) || 0}
            npcCount={npcCounts.get(currentCampaign.id) || 0}
            locationCount={locationCounts.get(currentCampaign.id) || 0}
            onPress={() => router.push(`/campaign/${currentCampaign.id}`)}
            right={
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color={theme.colors.primary}
              />
            }
          />
        ) : (
          <AppCard
            title="No campaign selected"
            subtitle="Long-press a campaign to set it as current."
            right={
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            }
          />
        )}
      </Section>
      <View style={styles.listHeader}>
        <View style={commonStyles.flexRow}>
          <MaterialCommunityIcons
            name="folder"
            size={18}
            color={theme.colors.primary}
            style={styles.listHeaderIcon}
          />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {headerTitle}
          </Text>
        </View>
        <Pressable onPress={openCreateModal} hitSlop={8}>
          <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
            New
          </Text>
        </Pressable>
      </View>
    </View>
  );

  if (continuityCampaigns.length === 0) {
    const description = continuityId
      ? 'Create the first campaign in this continuity.'
      : 'Create your first campaign to get started.';
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No campaigns yet"
            description={description}
            icon="folder-plus"
            action={{ label: 'Create Campaign', onPress: openCreateModal }}
          />
        </Screen>
        {createModal}
      </>
    );
  }

  return (
    <>
      <Screen scroll={false}>
        <FlatList
          data={continuityCampaigns}
          keyExtractor={(campaign) => campaign.id}
          contentContainerStyle={commonStyles.listContent}
          ListHeaderComponent={header}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item }) => {
            const isCurrent = item.id === currentCampaign?.id;
            return (
              <View style={styles.cardWrapper}>
                <CampaignCard
                  campaign={item}
                  noteCount={noteCounts.get(item.id) || 0}
                  npcCount={npcCounts.get(item.id) || 0}
                  locationCount={locationCounts.get(item.id) || 0}
                  onPress={() => router.push(`/campaign/${item.id}`)}
                  onLongPress={() => setCurrentCampaign(item.id)}
                  right={
                    isCurrent ? (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={18}
                        color={theme.colors.primary}
                      />
                    ) : undefined
                  }
                  style={
                    isCurrent
                      ? { borderWidth: 1, borderColor: theme.colors.primary }
                      : undefined
                  }
                />
              </View>
            );
          }}
        />
        <FAB
          icon="plus"
          onPress={openCreateModal}
          style={[commonStyles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
        />
      </Screen>
      {createModal}
    </>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: spacing[3],
  },
  listHeader: {
    ...commonStyles.flexRowBetween,
    marginBottom: spacing[3],
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
});