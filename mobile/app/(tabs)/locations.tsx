import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Button, FAB, Switch, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  FormModal,
  FormSelect,
  FormTextInput,
  Screen,
  EmptyState,
  LocationCard,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { layout, spacing } from '../../src/theme';
import { useCreateLocation, useCurrentCampaign, useLocations, useTags } from '../../src/hooks';
import type { Location, LocationType, Tag } from '../../src/types/schema';

const LOCATION_TYPE_OPTIONS: { label: string; value: LocationType }[] = [
  { label: 'Plane', value: 'Plane' },
  { label: 'Realm', value: 'Realm' },
  { label: 'Continent', value: 'Continent' },
  { label: 'Territory', value: 'Territory' },
  { label: 'Province', value: 'Province' },
  { label: 'Locale', value: 'Locale' },
  { label: 'Landmark', value: 'Landmark' },
];

export default function LocationsScreen() {
  const { theme } = useTheme();
  const currentCampaign = useCurrentCampaign();
  const [onlyCurrent, setOnlyCurrent] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState<LocationType>('Locale');
  const [draftParentId, setDraftParentId] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const createLocation = useCreateLocation();
  const allLocations = useLocations();
  const tags = useTags();
  const effectiveCampaignId = onlyCurrent && currentCampaign ? currentCampaign.id : undefined;
  const locations = useLocations(effectiveCampaignId);

  const { locationById, depthById } = useMemo(() => {
    const locationMap = new Map<string, Location>();
    allLocations.forEach((location) => {
      locationMap.set(location.id, location);
    });

    const depthMap = new Map<string, number>();
    const resolveDepth = (location: Location) => {
      if (depthMap.has(location.id)) {
        return depthMap.get(location.id) ?? 0;
      }
      let depth = 0;
      let currentId = location.parentId;
      const visited = new Set<string>([location.id]);

      while (currentId) {
        if (visited.has(currentId)) break;
        visited.add(currentId);
        const parent = locationMap.get(currentId);
        if (!parent) break;
        depth += 1;
        currentId = parent.parentId;
      }

      depthMap.set(location.id, depth);
      return depth;
    };

    allLocations.forEach((location) => resolveDepth(location));

    return { locationById: locationMap, depthById: depthMap };
  }, [allLocations]);

  const tagById = useMemo(() => {
    return new Map(tags.map((tag) => [tag.id, tag]));
  }, [tags]);

  const sections = useMemo(() => {
    const grouped = new Map<LocationType, Location[]>();
    locations.forEach((location) => {
      const list = grouped.get(location.type) ?? [];
      list.push(location);
      grouped.set(location.type, list);
    });

    const typeOrder: LocationType[] = [
      'Plane',
      'Realm',
      'Continent',
      'Territory',
      'Province',
      'Locale',
      'Landmark',
    ];

    return typeOrder
      .filter((type) => grouped.has(type))
      .map((type) => {
        const data = grouped.get(type) ?? [];
        const sorted = [...data].sort((a, b) => {
          const depthA = depthById.get(a.id) ?? 0;
          const depthB = depthById.get(b.id) ?? 0;
          if (depthA !== depthB) return depthA - depthB;
          return (a.name || '').localeCompare(b.name || '');
        });

        return { title: type, data: sorted };
      });
  }, [locations, depthById]);

  const parentOptions = useMemo(() => {
    return [
      { label: 'No parent', value: '' },
      ...allLocations.map((location) => ({
        label: location.name || 'Untitled location',
        value: location.id,
      })),
    ];
  }, [allLocations]);

  const openCreateModal = () => {
    setDraftName(`New Location ${allLocations.length + 1}`);
    setDraftType('Locale');
    setDraftParentId('');
    setDraftDescription('');
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
  };

  const handleCreate = async () => {
    if (isCreating) return;
    const trimmed = draftName.trim();
    if (!trimmed) {
      setCreateError('Location name is required.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      await Promise.resolve(
        createLocation({
          name: trimmed,
          type: draftType,
          description: draftDescription,
          parentId: draftParentId || '',
          campaignIds: currentCampaign ? [currentCampaign.id] : [],
        })
      );
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create location.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const createModal = (
    <FormModal
      title="New Location"
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
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      <FormSelect
        label="Type"
        value={draftType}
        options={LOCATION_TYPE_OPTIONS}
        onChange={(value) => setDraftType(value as LocationType)}
      />
      <FormSelect
        label="Parent location"
        value={draftParentId}
        options={parentOptions}
        onChange={setDraftParentId}
      />
      <FormTextInput
        label="Description"
        value={draftDescription}
        onChangeText={setDraftDescription}
        multiline
        style={styles.modalContentInput}
      />
      {createError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      )}
    </FormModal>
  );

  if (locations.length === 0) {
    return (
      <>
        <Screen>
          <EmptyState
            title="No locations yet"
            description={
              currentCampaign
                ? 'Create your first location to get started.'
                : 'Create a location or select a campaign to filter.'
            }
            icon="map-marker-outline"
            action={!isCreating ? { label: 'Create Location', onPress: openCreateModal } : undefined}
          />
        </Screen>
        {createModal}
      </>
    );
  }

  return (
    <>
      <Screen scroll={false}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.filterHeader}>
                <View style={styles.filterTitle}>
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={18}
                    color={theme.colors.primary}
                    style={styles.filterIcon}
                  />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    Filters
                  </Text>
                </View>
                <View style={styles.filterRow}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Current campaign only
                  </Text>
                  <Switch
                    value={onlyCurrent && !!currentCampaign}
                    onValueChange={setOnlyCurrent}
                    disabled={!currentCampaign}
                  />
                </View>
              </View>
              <View style={styles.listHeader}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color={theme.colors.primary}
                  style={styles.listHeaderIcon}
                />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  Locations
                </Text>
              </View>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                {section.title}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {section.data.length}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const parentName = item.parentId ? locationById.get(item.parentId)?.name : undefined;
            const resolvedTags = item.tagIds
              .map((tagId) => tagById.get(tagId))
              .filter((tag): tag is Tag => tag !== undefined);
            const depth = depthById.get(item.id) ?? 0;
            const indent = depth * spacing[3];

            return (
              <View style={[styles.cardWrapper, indent ? { marginLeft: indent } : null]}>
                <LocationCard
                  location={item}
                  parentName={parentName}
                  tags={resolvedTags}
                  onPress={() => router.push(`/location/${item.id}`)}
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
          disabled={isCreating}
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
  header: {
    marginBottom: spacing[3],
  },
  filterHeader: {
    marginBottom: spacing[3],
  },
  filterTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  filterIcon: {
    marginRight: spacing[2],
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  cardWrapper: {
    marginBottom: spacing[3],
  },
  fab: {
    position: 'absolute',
    right: layout.fabMargin,
    bottom: layout.fabMargin,
  },
  modalContentInput: {
    minHeight: 120,
  },
});
