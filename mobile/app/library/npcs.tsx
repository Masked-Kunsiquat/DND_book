import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard, EmptyState, FormTextInput, Screen, Section } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, layout, spacing } from '../../src/theme';
import { useCurrentCampaign, useNpcs, useUpdateNpc } from '../../src/hooks';
import type { Npc } from '../../src/types/schema';

function buildSubtitle(npc: Npc): string {
  const details = [npc.race, npc.role].filter(Boolean);
  return details.length ? details.join(' • ') : 'No details yet.';
}

export default function NpcLibraryScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ continuityId?: string | string[] }>();
  const currentCampaign = useCurrentCampaign();
  const allNpcs = useNpcs();
  const updateNpc = useUpdateNpc();

  const continuityId = useMemo(() => {
    const raw = params.continuityId;
    const paramValue = Array.isArray(raw) ? raw[0] : raw ?? '';
    return paramValue || currentCampaign?.continuityId || '';
  }, [currentCampaign?.continuityId, params.continuityId]);

  const [search, setSearch] = useState('');
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const continuityNpcs = useMemo(() => {
    if (!continuityId) return [];
    return allNpcs.filter((npc) => npc.scope === 'continuity' && npc.continuityId === continuityId);
  }, [allNpcs, continuityId]);

  const visibleNpcs = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return continuityNpcs;
    return continuityNpcs.filter((npc) => {
      const name = npc.name?.toLowerCase() ?? '';
      const race = npc.race?.toLowerCase() ?? '';
      const role = npc.role?.toLowerCase() ?? '';
      return name.includes(normalized) || race.includes(normalized) || role.includes(normalized);
    });
  }, [continuityNpcs, search]);

  const toggleLink = (npc: Npc) => {
    if (!currentCampaign) return;
    if (isUpdatingId) return;
    setIsUpdatingId(npc.id);
    setError(null);
    const ids = new Set(npc.campaignIds);
    if (ids.has(currentCampaign.id)) {
      ids.delete(currentCampaign.id);
    } else {
      ids.add(currentCampaign.id);
    }
    try {
      updateNpc(npc.id, { campaignIds: [...ids] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update NPC.';
      setError(message);
    } finally {
      setIsUpdatingId(null);
    }
  };

  if (!continuityId) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'NPC Library' }} />
        <EmptyState
          title="No continuity selected"
          description="Select a campaign or continuity to view shared NPCs."
          icon="account-group-outline"
          action={{ label: 'Choose campaign', onPress: () => router.push('/campaigns') }}
        />
      </Screen>
    );
  }

  if (continuityNpcs.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'NPC Library' }} />
        <EmptyState
          title="No shared NPCs yet"
          description="Share an NPC to your continuity to see it here."
          icon="account-group-outline"
          action={{ label: 'View NPCs', onPress: () => router.push('/npcs') }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: 'NPC Library' }} />
      <FlatList
        data={visibleNpcs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Section title="Continuity Library" icon="book-outline">
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {continuityNpcs.length} shared NPC{continuityNpcs.length === 1 ? '' : 's'}
              </Text>
            </Section>
            <FormTextInput
              label="Search"
              value={search}
              onChangeText={setSearch}
              placeholder="Search shared NPCs"
            />
          </View>
        }
        renderItem={({ item }) => {
          const isLinked = currentCampaign
            ? item.campaignIds.includes(currentCampaign.id)
            : false;
          const actionLabel = isLinked ? 'Remove' : 'Add';
          const actionIcon = isLinked ? 'link-off' : 'link-plus';

          return (
            <View style={styles.cardWrapper}>
              <AppCard
                title={item.name || 'Unnamed NPC'}
                subtitle={buildSubtitle(item)}
                onPress={() => router.push(`/npc/${item.id}`)}
                right={
                  <Button
                    mode="text"
                    icon={actionIcon}
                    compact
                    disabled={!currentCampaign || isUpdatingId === item.id}
                    onPress={() => toggleLink(item)}
                  >
                    {actionLabel}
                  </Button>
                }
              >
                {!currentCampaign && (
                  <View style={styles.noticeRow}>
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={iconSizes.sm}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Select a campaign to link shared NPCs.
                    </Text>
                  </View>
                )}
              </AppCard>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No results"
            description="Try a different search term."
            icon="account-search-outline"
          />
        }
      />
      {error && (
        <View style={styles.errorRow}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={iconSizes.sm}
            color={theme.colors.error}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            {error}
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: layout.fabSize,
  },
  header: {
    marginBottom: spacing[3],
  },
  cardWrapper: {
    marginBottom: spacing[2],
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
  },
  errorRow: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    flexDirection: 'row',
    gap: spacing[1],
  },
});
