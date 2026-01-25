import { useMemo, useState } from 'react';
import { ScrollView, SectionList, StyleSheet, View } from 'react-native';
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
  Section,
  StatCard,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, layout, semanticColors, spacing } from '../../src/theme';
import {
  useCreateLocation,
  useCurrentCampaign,
  useLocations,
  usePullToRefresh,
  useTags,
} from '../../src/hooks';
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
const LOCATION_TYPE_ORDER = LOCATION_TYPE_OPTIONS.map((option) => option.value);

const getAllowedParentTypes = (type: LocationType): LocationType[] => {
  const index = LOCATION_TYPE_ORDER.indexOf(type);
  if (index <= 0) return [];
  return LOCATION_TYPE_ORDER.slice(0, index);
};

export default function LocationsScreen() {
  const { theme } = useTheme();
  const currentCampaign = useCurrentCampaign();
  const [onlyCurrent, setOnlyCurrent] = useState(true);
  const [typeFilter, setTypeFilter] = useState<LocationType | 'all'>('all');
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
  const { refreshing, onRefresh } = usePullToRefresh();
  const effectiveCampaignId = onlyCurrent && currentCampaign ? currentCampaign.id : undefined;
  const locations = useLocations(effectiveCampaignId);

  const visibleLocations = useMemo(() => {
    if (typeFilter === 'all') return locations;
    return locations.filter((location) => location.type === typeFilter);
  }, [locations, typeFilter]);

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
    visibleLocations.forEach((location) => {
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
  }, [visibleLocations, depthById]);

  const allowedParentTypes = useMemo(() => getAllowedParentTypes(draftType), [draftType]);
  const allowedParentIds = useMemo(() => {
    const allowed = new Set(allowedParentTypes);
    return new Set(
      allLocations.filter((location) => allowed.has(location.type)).map((location) => location.id)
    );
  }, [allLocations, allowedParentTypes]);

  const parentOptions = useMemo(() => {
    const allowed = new Set(allowedParentTypes);
    return [
      { label: 'No parent', value: '' },
      ...allLocations
        .filter((location) => allowed.has(location.type))
        .map((location) => ({
          label: location.name || 'Untitled location',
          value: location.id,
        })),
    ];
  }, [allLocations, allowedParentTypes]);

  const parentHelper = useMemo(() => {
    if (allowedParentTypes.length === 0) {
      return 'This level cannot have a parent.';
    }
    return `Parent must be higher in the hierarchy (${allowedParentTypes.join(' • ')}).`;
  }, [allowedParentTypes]);

  const typeCounts = useMemo(() => {
    const counts = new Map<LocationType, number>();
    locations.forEach((location) => {
      counts.set(location.type, (counts.get(location.type) || 0) + 1);
    });
    return counts;
  }, [locations]);

  const hierarchyIssues = useMemo(() => {
    let missingParent = 0;
    let mismatch = 0;
    locations.forEach((location) => {
      if (!location.parentId) return;
      const parent = locationById.get(location.parentId);
      if (!parent) {
        missingParent += 1;
        return;
      }
      const allowedParents = new Set(getAllowedParentTypes(location.type));
      if (!allowedParents.has(parent.type)) {
        mismatch += 1;
      }
    });
    return { missingParent, mismatch, total: missingParent + mismatch };
  }, [locationById, locations]);

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

  const handleDraftTypeChange = (value: string) => {
    const nextType = value as LocationType;
    setDraftType(nextType);
    if (!draftParentId) return;
    const parent = allLocations.find((location) => location.id === draftParentId);
    const allowed = new Set(getAllowedParentTypes(nextType));
    if (!parent || !allowed.has(parent.type)) {
      setDraftParentId('');
    }
  };

  const handleCreate = async () => {
    if (isCreating) return;
    const trimmed = draftName.trim();
    if (!trimmed) {
      setCreateError('Location name is required.');
      return;
    }
    if (draftParentId && !allowedParentIds.has(draftParentId)) {
      setCreateError('Parent must be higher in the location hierarchy.');
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

  const listTitle =
    typeFilter === 'all' ? 'Locations' : `${typeFilter} Locations`;
  const listCountLabel = `${visibleLocations.length} location${visibleLocations.length === 1 ? '' : 's'}`;

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
        onChange={handleDraftTypeChange}
      />
      <FormSelect
        label="Parent location"
        value={draftParentId}
        options={parentOptions}
        onChange={setDraftParentId}
        helperText={parentHelper}
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
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
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

  if (visibleLocations.length === 0) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No locations found"
            description="Try clearing the type filter."
            icon="map-marker-outline"
            action={{ label: 'Clear Filter', onPress: () => setTypeFilter('all') }}
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
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <Section title="Overview" icon="chart-box-outline">
                <View style={styles.statsRow}>
                  <StatCard
                    label="Total"
                    value={locations.length}
                    icon={
                      <MaterialCommunityIcons
                        name="map-marker-multiple-outline"
                        size={iconSizes.md}
                        color={theme.colors.primary}
                      />
                    }
                    onPress={() => setTypeFilter('all')}
                  />
                  <StatCard
                    label="Roots"
                    value={locations.filter((location) => !location.parentId).length}
                    icon={
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={iconSizes.md}
                        color={theme.colors.primary}
                      />
                    }
                  />
                </View>
                <View style={styles.statsRow}>
                  <StatCard
                    label="Issues"
                    value={hierarchyIssues.total}
                    icon={
                      <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={iconSizes.md}
                        color={semanticColors.warning.main}
                      />
                    }
                  />
                  <StatCard
                    label="Types"
                    value={typeCounts.size}
                    icon={
                      <MaterialCommunityIcons
                        name="shape-outline"
                        size={iconSizes.md}
                        color={theme.colors.primary}
                      />
                    }
                  />
                </View>
              </Section>

              <Section
                title="Type Focus"
                icon="map-marker-outline"
                action={
                  typeFilter !== 'all'
                    ? { label: 'Clear', onPress: () => setTypeFilter('all') }
                    : undefined
                }
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.typeScroll}
                >
                  <View style={styles.typeCard}>
                    <StatCard
                      label="All"
                      value={locations.length}
                      onPress={() => setTypeFilter('all')}
                      icon={
                        <MaterialCommunityIcons
                          name="earth"
                          size={iconSizes.md}
                          color={theme.colors.primary}
                        />
                      }
                    />
                  </View>
                  {LOCATION_TYPE_ORDER.map((type) => (
                    <View key={type} style={styles.typeCard}>
                      <StatCard
                        label={type}
                        value={typeCounts.get(type) || 0}
                        onPress={() => setTypeFilter(type)}
                        icon={
                          <MaterialCommunityIcons
                            name="compass-rose"
                            size={iconSizes.md}
                            color={theme.colors.primary}
                          />
                        }
                      />
                    </View>
                  ))}
                </ScrollView>
              </Section>

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
                <View style={styles.listHeaderRow}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color={theme.colors.primary}
                    style={styles.listHeaderIcon}
                  />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    {listTitle}
                  </Text>
                </View>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {listCountLabel}
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
            const parent = item.parentId ? locationById.get(item.parentId) : undefined;
            const parentName = parent?.name;
            const resolvedTags = item.tagIds
              .map((tagId) => tagById.get(tagId))
              .filter((tag): tag is Tag => tag !== undefined);
            const depth = depthById.get(item.id) ?? 0;
            const indent = depth * spacing[3];
            let statusLabel: string | undefined;

            if (item.parentId && !parent) {
              statusLabel = 'Parent missing';
            } else if (parent) {
              const allowedParents = new Set(getAllowedParentTypes(item.type));
              if (!allowedParents.has(parent.type)) {
                statusLabel = 'Hierarchy mismatch';
              }
            }

            return (
              <View style={[styles.cardWrapper, indent ? { marginLeft: indent } : null]}>
                <LocationCard
                  location={item}
                  parentName={parentName}
                  tags={resolvedTags}
                  statusLabel={statusLabel}
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
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
    justifyContent: 'space-between',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
  typeScroll: {
    paddingRight: spacing[2],
    gap: spacing[2],
  },
  typeCard: {
    width: 132,
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
