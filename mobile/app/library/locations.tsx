import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard, EmptyState, FormTextInput, Screen, Section } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, layout, spacing } from '../../src/theme';
import { useCurrentCampaign, useLocations, useUpdateLocation } from '../../src/hooks';
import type { Location } from '../../src/types/schema';

export default function LocationLibraryScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ continuityId?: string | string[] }>();
  const currentCampaign = useCurrentCampaign();
  const allLocations = useLocations();
  const updateLocation = useUpdateLocation();

  const continuityId = useMemo(() => {
    const raw = params.continuityId;
    const paramValue = Array.isArray(raw) ? raw[0] : raw ?? '';
    return paramValue || currentCampaign?.continuityId || '';
  }, [currentCampaign?.continuityId, params.continuityId]);

  const [search, setSearch] = useState('');
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const continuityLocations = useMemo(() => {
    if (!continuityId) return [];
    return allLocations.filter(
      (location) => location.scope === 'continuity' && location.continuityId === continuityId
    );
  }, [allLocations, continuityId]);

  const locationById = useMemo(() => {
    return new Map(continuityLocations.map((location) => [location.id, location]));
  }, [continuityLocations]);

  const pathById = useMemo(() => {
    const map = new Map<string, string>();

    const buildPath = (location: Location) => {
      if (map.has(location.id)) return;
      const segments: string[] = [];
      let currentId = location.parentId;
      const visited = new Set<string>([location.id]);
      while (currentId) {
        if (visited.has(currentId)) break;
        visited.add(currentId);
        const parent = locationById.get(currentId);
        if (!parent) break;
        segments.unshift(parent.name || parent.type || 'Unnamed');
        currentId = parent.parentId;
      }
      map.set(location.id, segments.length ? segments.join(' • ') : 'Top level');
    };

    continuityLocations.forEach((location) => buildPath(location));
    return map;
  }, [continuityLocations, locationById]);

  const visibleLocations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return continuityLocations;
    return continuityLocations.filter((location) => {
      const name = location.name?.toLowerCase() ?? '';
      const type = location.type?.toLowerCase() ?? '';
      const path = pathById.get(location.id)?.toLowerCase() ?? '';
      return name.includes(query) || type.includes(query) || path.includes(query);
    });
  }, [continuityLocations, pathById, search]);

  const toggleLink = (location: Location) => {
    if (!currentCampaign) return;
    if (isUpdatingId) return;
    setIsUpdatingId(location.id);
    setError(null);
    const ids = new Set(location.campaignIds);
    if (ids.has(currentCampaign.id)) {
      ids.delete(currentCampaign.id);
    } else {
      ids.add(currentCampaign.id);
    }
    try {
      updateLocation(location.id, { campaignIds: [...ids] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update location.';
      setError(message);
    } finally {
      setIsUpdatingId(null);
    }
  };

  if (!continuityId) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Locations Library' }} />
        <EmptyState
          title="No continuity selected"
          description="Select a campaign or continuity to view shared locations."
          icon="map-marker-outline"
          action={{ label: 'Choose campaign', onPress: () => router.push('/campaigns') }}
        />
      </Screen>
    );
  }

  if (continuityLocations.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Locations Library' }} />
        <EmptyState
          title="No shared locations yet"
          description="Share a location to your continuity to see it here."
          icon="map-marker-outline"
          action={{ label: 'View Locations', onPress: () => router.push('/locations') }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: 'Locations Library' }} />
      <FlatList
        data={visibleLocations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Section title="Continuity Library" icon="book-outline">
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {continuityLocations.length} shared location
                {continuityLocations.length === 1 ? '' : 's'}
              </Text>
            </Section>
            <FormTextInput
              label="Search"
              value={search}
              onChangeText={setSearch}
              placeholder="Search shared locations"
            />
          </View>
        }
        renderItem={({ item }) => {
          const path = pathById.get(item.id);
          const isLinked = currentCampaign
            ? item.campaignIds.includes(currentCampaign.id)
            : false;
          const actionLabel = isLinked ? 'Remove' : 'Add';
          const actionIcon = isLinked ? 'link-off' : 'link-plus';

          return (
            <View style={styles.cardWrapper}>
              <AppCard
                title={item.name || 'Unnamed location'}
                subtitle={`${item.type} • ${path || 'Top level'}`}
                onPress={() => router.push(`/location/${item.id}`)}
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
                      Select a campaign to link shared locations.
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
            icon="map-search-outline"
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
