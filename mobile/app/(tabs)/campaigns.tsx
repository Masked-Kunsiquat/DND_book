import { useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  useCampaigns,
  useCurrentCampaign,
  useSetCurrentCampaign,
  useCreateCampaign,
} from '../../src/hooks';
import { useNotes } from '../../src/hooks/useNotes';
import { useNpcs } from '../../src/hooks/useNpcs';
import { useLocations } from '../../src/hooks/useLocations';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Screen, EmptyState, CampaignCard, Section, AppCard } from '../../src/components';
import { layout, spacing } from '../../src/theme';

export default function CampaignsScreen() {
  const { theme } = useTheme();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const setCurrentCampaign = useSetCurrentCampaign();
  const createCampaign = useCreateCampaign();
  const notes = useNotes();
  const npcs = useNpcs();
  const locations = useLocations();

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

  const handleCreate = useCallback(() => {
    const name = `New Campaign ${campaigns.length + 1}`;
    const id = createCampaign({ name });
    setCurrentCampaign(id);
  }, [campaigns.length, createCampaign, setCurrentCampaign]);

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
        <Pressable onPress={handleCreate} hitSlop={8}>
          <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
            New
          </Text>
        </Pressable>
      </View>
    </View>
  );

  if (campaigns.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="No campaigns yet"
          description="Create your first campaign to get started."
          icon="folder-plus"
          action={{ label: 'Create Campaign', onPress: handleCreate }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <FlatList
        data={campaigns}
        keyExtractor={(campaign) => campaign.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
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
        onPress={handleCreate}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
      />
    </Screen>
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
