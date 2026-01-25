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
  usePullToRefresh,
} from '../../src/hooks';
import { useNotes } from '../../src/hooks/useNotes';
import { useNpcs } from '../../src/hooks/useNpcs';
import { useLocations } from '../../src/hooks/useLocations';
import { useTheme } from '../../src/theme/ThemeProvider';
import {
  FormModal,
  FormTextInput,
  Screen,
  EmptyState,
  CampaignCard,
  Section,
  AppCard,
} from '../../src/components';
import { layout, spacing } from '../../src/theme';

export default function CampaignsScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ create?: string | string[] }>();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const setCurrentCampaign = useSetCurrentCampaign();
  const createCampaign = useCreateCampaign();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const hasOpenedFromParams = useRef(false);
  const notes = useNotes();
  const npcs = useNpcs();
  const locations = useLocations();
  const { refreshing, onRefresh } = usePullToRefresh();

  const noteCounts = useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach((note) => {
      if (!note.campaignId) return;
      counts.set(note.campaignId, (counts.get(note.campaignId) || 0) + 1);
    });
    return counts;
  }, [notes]);

  const npcCounts = useMemo(() => {
    const counts = new Map<string, number>();
    npcs.forEach((npc) => {
      npc.campaignIds.forEach((id) => {
        counts.set(id, (counts.get(id) || 0) + 1);
      });
    });
    return counts;
  }, [npcs]);

  const locationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    locations.forEach((location) => {
      location.campaignIds.forEach((id) => {
        counts.set(id, (counts.get(id) || 0) + 1);
      });
    });
    return counts;
  }, [locations]);

  const openCreateModal = useCallback(() => {
    setDraftName(`New Campaign ${campaigns.length + 1}`);
    setCreateError(null);
    setIsCreateOpen(true);
  }, [campaigns.length]);

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
    setIsCreating(true);
    try {
      const id = createCampaign({ name: trimmed });
      setCurrentCampaign(id);
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create campaign.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  }, [createCampaign, draftName, isCreating, setCurrentCampaign]);

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
      {createError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      )}
    </FormModal>
  );

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
        <View style={styles.listHeaderRow}>
          <MaterialCommunityIcons
            name="folder"
            size={18}
            color={theme.colors.primary}
            style={styles.listHeaderIcon}
          />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            All Campaigns
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

  if (campaigns.length === 0) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No campaigns yet"
            description="Create your first campaign to get started."
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
          data={campaigns}
          keyExtractor={(campaign) => campaign.id}
          contentContainerStyle={styles.listContent}
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
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
        />
      </Screen>
      {createModal}
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: layout.fabSize + layout.fabMargin * 2,
  },
  cardWrapper: {
    marginBottom: spacing[3],
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
  fab: {
    position: 'absolute',
    right: layout.fabMargin,
    bottom: layout.fabMargin,
  },
});
