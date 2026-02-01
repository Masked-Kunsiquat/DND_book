import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, View } from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  FormModal,
  FormMultiSelect,
  FormSelect,
  FormTextInput,
  LocationMultiSelect,
  Screen,
  EmptyState,
  LocationRow,
  Section,
  StatCard,
  TagChip,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { commonStyles, iconSizes, layout, semanticColors, spacing } from '../../src/theme';
import {
  useCreateLocation,
  useCampaigns,
  useCurrentCampaign,
  useLocations,
  usePullToRefresh,
  useTags,
} from '../../src/hooks';
import type { EntityScope, Location, LocationType, Tag } from '../../src/types/schema';

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

const LOCATION_SCOPE_OPTIONS: { label: string; value: EntityScope }[] = [
  { label: 'Campaign only', value: 'campaign' },
  { label: 'Shared in continuity', value: 'continuity' },
];

const getAllowedParentTypes = (type: LocationType): LocationType[] => {
  const index = LOCATION_TYPE_ORDER.indexOf(type);
  if (index <= 0) return [];
  return LOCATION_TYPE_ORDER.slice(0, index);
};

const pluralize = (singular: string, count: number, plural?: string) => {
  if (count === 1) return singular;
  return plural ?? `${singular}s`;
};

const pluralizeLocationType = (type: LocationType, count: number) => {
  if (count === 1) return type;
  if (type === 'Territory') return 'Territories';
  return `${type}s`;
};

/**
 * Render the Locations screen for the current campaign, providing filtering, grouping, and creation tools.
 *
 * Shows a list of locations grouped by root, supports filtering by type, tags, and shadow status, displays
 * hierarchy and issue counts, and exposes UI to create new locations or import from continuity.
 *
 * @returns The React element for the Locations screen
 */
export default function LocationsScreen() {
  const { theme } = useTheme();
  const currentCampaign = useCurrentCampaign();
  const campaigns = useCampaigns();
  const [typeFilter, setTypeFilter] = useState<LocationType | 'all'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showShadowOnly, setShowShadowOnly] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState<LocationType>('Locale');
  const [draftScope, setDraftScope] = useState<EntityScope>('campaign');
  const [draftCampaignIds, setDraftCampaignIds] = useState<string[]>([]);
  const [draftParentId, setDraftParentId] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const createLocation = useCreateLocation();
  const allLocations = useLocations();
  const tags = useTags(currentCampaign?.continuityId, currentCampaign?.id);
  const { refreshing, onRefresh } = usePullToRefresh();
  const effectiveCampaignId = currentCampaign?.id;
  const locations = useLocations(effectiveCampaignId);
  const params = useLocalSearchParams<{ tagId?: string | string[] }>();
  const continuityId = currentCampaign?.continuityId ?? '';

  const continuityLocations = useMemo(() => {
    if (!currentCampaign) return [];
    return allLocations.filter(
      (location) => location.continuityId === currentCampaign.continuityId
    );
  }, [allLocations, currentCampaign]);

  const continuityCampaigns = useMemo(() => {
    if (!continuityId) return [];
    return campaigns.filter((campaign) => campaign.continuityId === continuityId);
  }, [campaigns, continuityId]);

  const campaignOptions = useMemo(() => {
    return continuityCampaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [continuityCampaigns]);

  const tagParam = useMemo(() => {
    const raw = params.tagId;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.tagId]);

  const visibleLocations = useMemo(() => {
    const scoped = selectedTagIds.length
      ? locations.filter((location) => location.tagIds.some((id) => selectedTagIds.includes(id)))
      : locations;
    const shadowFiltered = showShadowOnly
      ? scoped.filter((location) => location.status === 'shadow')
      : scoped;
    if (typeFilter === 'all') return shadowFiltered;
    return shadowFiltered.filter((location) => location.type === typeFilter);
  }, [locations, selectedTagIds, showShadowOnly, typeFilter]);

  const { locationById, depthById } = useMemo(() => {
    const locationMap = new Map<string, Location>();
    continuityLocations.forEach((location) => {
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

    continuityLocations.forEach((location) => resolveDepth(location));

    return { locationById: locationMap, depthById: depthMap };
  }, [continuityLocations]);

  const tagById = useMemo(() => {
    return new Map(tags.map((tag) => [tag.id, tag]));
  }, [tags]);

  const visibleIdSet = useMemo(() => {
    return new Set(visibleLocations.map((location) => location.id));
  }, [visibleLocations]);

  const { rootById, pathById } = useMemo(() => {
    const rootMap = new Map<string, Location>();
    const pathMap = new Map<string, string>();

    const resolve = (location: Location) => {
      if (rootMap.has(location.id)) return;
      const segments: string[] = [];
      let root = location;
      let currentId = location.parentId;
      const visited = new Set<string>([location.id]);

      while (currentId) {
        if (visited.has(currentId)) break;
        visited.add(currentId);
        const parent = locationById.get(currentId);
        if (!parent) break;
        root = parent;
        segments.unshift(parent.name || parent.type || 'Unnamed');
        currentId = parent.parentId;
      }

      rootMap.set(location.id, root);
      pathMap.set(location.id, segments.join(' • '));
    };

    visibleLocations.forEach((location) => resolve(location));

    return { rootById: rootMap, pathById: pathMap };
  }, [visibleLocations, locationById]);

  const sections = useMemo(() => {
    const grouped = new Map<string, { root: Location; data: Location[] }>();

    visibleLocations.forEach((location) => {
      const root = rootById.get(location.id) ?? location;
      const entry = grouped.get(root.id) ?? { root, data: [] };
      if (location.id !== root.id) {
        entry.data.push(location);
      }
      grouped.set(root.id, entry);
    });

    const sortedSections = [...grouped.values()].sort((a, b) => {
      const typeIndexA = LOCATION_TYPE_ORDER.indexOf(a.root.type);
      const typeIndexB = LOCATION_TYPE_ORDER.indexOf(b.root.type);
      if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
      return (a.root.name || '').localeCompare(b.root.name || '');
    });

    return sortedSections.map((section) => {
      const data = [...section.data].sort((a, b) => {
        const depthA = depthById.get(a.id) ?? 0;
        const depthB = depthById.get(b.id) ?? 0;
        if (depthA !== depthB) return depthA - depthB;
        return (a.name || '').localeCompare(b.name || '');
      });
      const count = data.length + (visibleIdSet.has(section.root.id) ? 1 : 0);
      const isRootVisible = visibleIdSet.has(section.root.id);

      return {
        title: section.root.name || 'Unnamed location',
        root: section.root,
        data,
        count,
        isRootVisible,
      };
    });
  }, [visibleLocations, rootById, depthById, visibleIdSet]);

  const allowedParentTypes = useMemo(() => getAllowedParentTypes(draftType), [draftType]);
  const allowedParentIds = useMemo(() => {
    const allowed = new Set(allowedParentTypes);
    return new Set(
      continuityLocations
        .filter((location) => allowed.has(location.type))
        .map((location) => location.id)
    );
  }, [continuityLocations, allowedParentTypes]);

  const parentCandidates = useMemo(() => {
    const allowed = new Set(allowedParentTypes);
    return continuityLocations.filter((location) => allowed.has(location.type));
  }, [continuityLocations, allowedParentTypes]);

  const parentHelper = useMemo(() => {
    if (allowedParentTypes.length === 0) {
      return 'This level cannot have a parent.';
    }
    return `Parent must be higher in the hierarchy (${allowedParentTypes.join(' • ')}).`;
  }, [allowedParentTypes]);

  const typeCounts = useMemo(() => {
    const counts = new Map<LocationType, number>();
    const scoped = selectedTagIds.length
      ? locations.filter((location) => location.tagIds.some((id) => selectedTagIds.includes(id)))
      : locations;
    scoped.forEach((location) => {
      counts.set(location.type, (counts.get(location.type) || 0) + 1);
    });
    return counts;
  }, [locations, selectedTagIds]);

  const rootCount = useMemo(() => {
    return locations.filter((location) => !location.parentId).length;
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

  const getTypeFocusStyle = (isActive: boolean) => ({
    borderWidth: 1,
    borderColor: isActive ? theme.colors.primary : theme.colors.outlineVariant,
    backgroundColor: isActive ? theme.colors.primaryContainer : theme.colors.surface,
  });

  const getTypeFocusIconColor = (isActive: boolean) =>
    isActive ? theme.colors.onPrimaryContainer : theme.colors.primary;

  useEffect(() => {
    setSelectedTagIds(tagParam ? [tagParam] : []);
  }, [tagParam]);

  if (!currentCampaign) {
    return (
      <Screen>
        <EmptyState
          title="No campaign selected"
          description="Select a campaign to view locations."
          icon="map-marker-outline"
          action={{ label: 'Choose campaign', onPress: () => router.push('/campaigns') }}
        />
      </Screen>
    );
  }

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    );
  };

  const openCreateModal = () => {
    setDraftName(`New Location ${continuityLocations.length + 1}`);
    setDraftType('Locale');
    setDraftScope('campaign');
    setDraftCampaignIds(currentCampaign?.id ? [currentCampaign.id] : []);
    setDraftParentId('');
    setDraftDescription('');
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const openLibrary = () => {
    if (isCreateOpen) {
      setIsCreateOpen(false);
      setCreateError(null);
    }
    router.push({
      pathname: '/library/locations',
      params: continuityId ? { continuityId } : undefined,
    });
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
  };

  const handleDraftTypeChange = (value: string) => {
    const nextType = value as LocationType;
    setDraftType(nextType);
    if (!draftParentId) return;
    const parent = continuityLocations.find((location) => location.id === draftParentId);
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
    if (draftScope === 'continuity' && draftCampaignIds.length === 0) {
      setCreateError('Select at least one campaign for this shared location.');
      return;
    }
    if (draftParentId && !allowedParentIds.has(draftParentId)) {
      setCreateError('Parent must be higher in the location hierarchy.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const continuityId = currentCampaign?.continuityId ?? '';
      const sharedCampaignIds =
        draftScope === 'continuity'
          ? draftCampaignIds
          : currentCampaign
            ? [currentCampaign.id]
            : [];
      await Promise.resolve(
        createLocation({
          name: trimmed,
          type: draftType,
          description: draftDescription,
          parentId: draftParentId || '',
          scope: draftScope,
          continuityId,
          campaignIds: sharedCampaignIds,
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
      <Button mode="outlined" icon="book-outline" onPress={openLibrary}>
        Add from Continuity
      </Button>
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      <FormSelect
        label="Type"
        value={draftType}
        options={LOCATION_TYPE_OPTIONS}
        onChange={handleDraftTypeChange}
      />
      <FormSelect
        label="Scope"
        value={draftScope}
        options={LOCATION_SCOPE_OPTIONS}
        onChange={(value) => {
          const nextScope = value as EntityScope;
          setDraftScope(nextScope);
          if (nextScope === 'campaign') {
            setDraftCampaignIds(currentCampaign?.id ? [currentCampaign.id] : []);
          }
        }}
        helperText="Shared locations live in the continuity and can be linked to multiple campaigns."
      />
      {draftScope === 'continuity' && (
        <FormMultiSelect
          label="Visible in campaigns"
          value={draftCampaignIds}
          options={campaignOptions}
          onChange={setDraftCampaignIds}
          helperText="Select which campaigns should see this location."
        />
      )}
      <LocationMultiSelect
        locations={parentCandidates}
        value={draftParentId ? [draftParentId] : []}
        onChange={(next) => setDraftParentId(next[next.length - 1] ?? '')}
        helperText={parentHelper}
        disabled={parentCandidates.length === 0}
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
            description="Try clearing the type or tag filters."
            icon="map-marker-outline"
            action={{
              label: 'Clear Filters',
              onPress: () => {
                setTypeFilter('all');
                setSelectedTagIds([]);
                setShowShadowOnly(false);
              },
            }}
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
          contentContainerStyle={commonStyles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <Section title="Overview" icon="chart-box-outline">
                <View style={styles.statsRow}>
                  <StatCard
                    label={pluralize('Location', locations.length)}
                    value={locations.length}
                    layout="compact"
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
                    label={pluralize('Root', rootCount)}
                    value={rootCount}
                    layout="compact"
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
                    label={pluralize('Issue', hierarchyIssues.total)}
                    value={hierarchyIssues.total}
                    layout="compact"
                    icon={
                      <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={iconSizes.md}
                        color={semanticColors.warning.main}
                      />
                    }
                  />
                  <StatCard
                    label={pluralize('Type', typeCounts.size)}
                    value={typeCounts.size}
                    layout="compact"
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

              <View
                style={[
                  styles.filtersContainer,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.outlineVariant,
                  },
                ]}
              >
                <View style={commonStyles.flexRowBetween}>
                  <Pressable
                    onPress={() => setFiltersOpen((prev) => !prev)}
                    style={commonStyles.flexRow}
                  >
                    <MaterialCommunityIcons
                      name="tune-variant"
                      size={18}
                      color={theme.colors.primary}
                      style={styles.filterIcon}
                    />
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                      Filters
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setFiltersOpen((prev) => !prev)} hitSlop={6}>
                    <MaterialCommunityIcons
                      name={filtersOpen ? 'chevron-up' : 'chevron-down'}
                      size={iconSizes.md}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </Pressable>
                </View>
                {filtersOpen && (
                  <>
                    <View style={commonStyles.flexRowBetween}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Type focus
                      </Text>
                      {typeFilter !== 'all' && (
                        <Pressable onPress={() => setTypeFilter('all')} hitSlop={6}>
                          <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                            Clear
                          </Text>
                        </Pressable>
                      )}
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.typeScroll}
                    >
                      <View style={styles.typeCard}>
                        <StatCard
                          label={pluralize('Location', locations.length)}
                          value={locations.length}
                          layout="compact"
                          style={getTypeFocusStyle(typeFilter === 'all')}
                          onPress={() => setTypeFilter('all')}
                          icon={
                            <MaterialCommunityIcons
                              name="earth"
                              size={iconSizes.md}
                              color={getTypeFocusIconColor(typeFilter === 'all')}
                            />
                          }
                        />
                      </View>
                      {LOCATION_TYPE_ORDER.map((type) => {
                        const count = typeCounts.get(type) || 0;
                        const isActive = typeFilter === type;
                        return (
                          <View key={type} style={styles.typeCard}>
                            <StatCard
                              label={pluralizeLocationType(type, count)}
                              value={count}
                              layout="compact"
                              style={getTypeFocusStyle(isActive)}
                              onPress={() => setTypeFilter(type)}
                              icon={
                                <MaterialCommunityIcons
                                  name="compass-rose"
                                  size={iconSizes.md}
                                  color={getTypeFocusIconColor(isActive)}
                                />
                              }
                            />
                          </View>
                        );
                      })}
                    </ScrollView>
                    <View style={commonStyles.flexRowBetween}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Tags
                      </Text>
                      {selectedTagIds.length > 0 && (
                        <Button mode="text" onPress={() => setSelectedTagIds([])} compact>
                          Clear
                        </Button>
                      )}
                    </View>
                    {tags.length > 0 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tagScroll}
                      >
                        {tags.map((tag) => (
                          <TagChip
                            key={tag.id}
                            id={tag.id}
                            name={tag.name}
                            color={tag.color}
                            size="small"
                            selected={selectedTagIds.includes(tag.id)}
                            onPress={() => toggleTag(tag.id)}
                          />
                        ))}
                      </ScrollView>
                    ) : (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        No tags yet.
                      </Text>
                    )}
                    <View style={commonStyles.flexRowBetween}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Status
                      </Text>
                      {showShadowOnly && (
                        <Button mode="text" onPress={() => setShowShadowOnly(false)} compact>
                          Clear
                        </Button>
                      )}
                    </View>
                    <View style={styles.statusRow}>
                      <Button
                        mode={showShadowOnly ? 'contained' : 'outlined'}
                        onPress={() => setShowShadowOnly((prev) => !prev)}
                        icon="circle-outline"
                        compact
                      >
                        Shadow only
                      </Button>
                    </View>
                  </>
                )}
              </View>
              <View style={commonStyles.flexRowBetween}>
                <View style={commonStyles.flexRow}>
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
                <View style={styles.listHeaderMeta}>
                  <View style={commonStyles.flexRow}>
                    <Pressable onPress={openLibrary} hitSlop={8}>
                      <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                        Library
                      </Text>
                    </Pressable>
                    <Pressable onPress={openCreateModal} hitSlop={8}>
                      <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                        New
                      </Text>
                    </Pressable>
                  </View>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {listCountLabel}
                  </Text>
                </View>
              </View>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Pressable
              onPress={() => router.push(`/location/${section.root.id}`)}
              style={[
                styles.rootHeader,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outlineVariant,
                },
                !section.isRootVisible && styles.rootHeaderDimmed,
              ]}
            >
              <View style={styles.rootHeaderText}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }} numberOfLines={1}>
                  {section.title}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {section.root.type} root
                </Text>
              </View>
              <View style={styles.rootHeaderMeta}>
                {!section.isRootVisible && (
                  <View
                    style={[
                      styles.rootFilteredPill,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outlineVariant,
                      },
                    ]}
                  >
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Filtered
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.rootCountPill,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
                  ]}
                >
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurface }}>
                    {section.count} {pluralize('location', section.count)}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={iconSizes.md}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
            </Pressable>
          )}
          renderItem={({ item }) => {
            const parent = item.parentId ? locationById.get(item.parentId) : undefined;
            const resolvedTags = item.tagIds
              .map((tagId) => tagById.get(tagId))
              .filter((tag): tag is Tag => tag !== undefined);
            let statusLabel: string | undefined;

            if (item.parentId && !parent) {
              statusLabel = 'Parent missing';
            } else if (parent) {
              const allowedParents = new Set(getAllowedParentTypes(item.type));
              if (!allowedParents.has(parent.type)) {
                statusLabel = 'Hierarchy mismatch';
              }
            }

            const pathLabel = pathById.get(item.id);

            return (
              <View style={styles.cardWrapper}>
                <LocationRow
                  location={item}
                  pathLabel={pathLabel}
                  tags={resolvedTags}
                  statusLabel={statusLabel}
                  onPress={() => router.push(`/location/${item.id}`)}
                  onTagPress={(tagId) => router.push(`/tag/${tagId}`)}
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
          disabled={isCreating}
        />
      </Screen>
      {createModal}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing[3],
  },
  filtersContainer: {
    marginBottom: spacing[3],
    borderWidth: 1,
    borderRadius: layout.cardBorderRadius,
    padding: spacing[3],
    gap: spacing[3],
  },
  statsRow: {
    ...commonStyles.flexRow,
    gap: spacing[3],
  },
  filterIcon: {
    marginRight: spacing[2],
  },
  statusRow: {
    ...commonStyles.flexRow,
    gap: spacing[2],
  },
  tagScroll: {
    paddingBottom: spacing[2],
    gap: spacing[2],
  },
  listHeaderMeta: {
    alignItems: 'flex-end',
    gap: spacing[0.5],
  },
  listHeaderActions: {
    ...commonStyles.flexRow,
    gap: spacing[2],
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
  rootHeader: {
    ...commonStyles.flexRowBetween,
    marginTop: spacing[3],
    marginBottom: spacing[1.5],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
  },
  rootHeaderText: {
    flex: 1,
    gap: spacing[1],
    marginRight: spacing[2],
  },
  rootHeaderDimmed: {
    opacity: 0.7,
  },
  rootHeaderMeta: {
    ...commonStyles.flexRow,
    gap: spacing[2],
  },
  rootFilteredPill: {
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
  },
  rootCountPill: {
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
  },
  cardWrapper: {
    marginBottom: spacing[1.5],
  },
  modalContentInput: {
    minHeight: 120,
  },
});