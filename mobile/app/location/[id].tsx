import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  Breadcrumb,
  EmptyState,
  FormImageGallery,
  FormImagePicker,
  FormMultiSelect,
  FormSelect,
  FormTextInput,
  LocationCard,
  Screen,
  Section,
  TagChip,
  TagInput,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, layout, spacing } from '../../src/theme';
import {
  useCampaigns,
  useChildLocations,
  useDeleteLocation,
  useGetOrCreateTag,
  useLocation,
  useLocationPath,
  useLocations,
  useTags,
  useUpdateLocation,
} from '../../src/hooks';
import type { LocationType } from '../../src/types/schema';

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
}

const LOCATION_TYPE_OPTIONS: { label: string; value: LocationType }[] = [
  { label: 'Plane', value: 'Plane' },
  { label: 'Realm', value: 'Realm' },
  { label: 'Continent', value: 'Continent' },
  { label: 'Territory', value: 'Territory' },
  { label: 'Province', value: 'Province' },
  { label: 'Locale', value: 'Locale' },
  { label: 'Landmark', value: 'Landmark' },
];

const ALLOWED_LOCATION_TYPES = new Set<LocationType>(
  LOCATION_TYPE_OPTIONS.map((option) => option.value)
);

export default function LocationDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const locationId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);
  const hasLocationId = locationId.trim().length > 0;
  const scopedLocationId = hasLocationId ? locationId : '__missing__';

  const location = useLocation(scopedLocationId);
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const allLocations = useLocations();
  const childLocations = useChildLocations(scopedLocationId);
  const path = useLocationPath(scopedLocationId);
  const tags = useTags();
  const getOrCreateTag = useGetOrCreateTag();
  const campaigns = useCampaigns();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType | string>('Locale');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [campaignIds, setCampaignIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [showFullPath, setShowFullPath] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const linkedCampaigns = useMemo(() => {
    if (!location) return [];
    const ids = new Set(location.campaignIds);
    return campaigns.filter((campaign) => ids.has(campaign.id));
  }, [campaigns, location]);

  const parentOptions = useMemo(() => {
    const options = [
      { label: 'No parent', value: '' },
      ...allLocations
        .filter((item) => item.id !== locationId)
        .map((item) => ({ label: item.name || 'Untitled location', value: item.id })),
    ];
    return options;
  }, [allLocations, locationId]);

  const campaignOptions = useMemo(() => {
    return campaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [campaigns]);

  const displayTagIds = useMemo(() => {
    if (isEditing) return tagIds;
    return location?.tagIds ?? [];
  }, [isEditing, location?.tagIds, tagIds]);

  const resolvedTags = useMemo(() => {
    const tagById = new Map(tags.map((tag) => [tag.id, tag]));
    return displayTagIds
      .map((id) => tagById.get(id))
      .filter((tag): tag is (typeof tags)[number] => tag !== undefined);
  }, [displayTagIds, tags]);

  const parentName = useMemo(() => {
    if (!location?.parentId) return undefined;
    return path.find((item) => item.id === location.parentId)?.name;
  }, [location?.parentId, path]);

  const showBreadcrumb = path.length > 1;
  const canCollapsePath = path.length > 4;

  const breadcrumbItems = useMemo(() => {
    if (!showFullPath && canCollapsePath) {
      const first = path[0];
      const tail = path.slice(-2);
      return [
        {
          label: first?.name || 'Untitled',
          icon: 'map-marker-outline',
          onPress: () => router.push(`/location/${first.id}`),
        },
        {
          label: '...',
          onPress: () => setShowFullPath(true),
        },
        ...tail.map((item, index) => ({
          label: item.name || 'Untitled',
          onPress:
            index < tail.length - 1 ? () => router.push(`/location/${item.id}`) : undefined,
        })),
      ];
    }

    return path.map((item, index) => ({
      label: item.name || 'Untitled',
      icon: index === 0 ? 'map-marker-outline' : undefined,
      onPress: index < path.length - 1 ? () => router.push(`/location/${item.id}`) : undefined,
    }));
  }, [canCollapsePath, path, router, showFullPath]);

  const handleCreateTag = (tagName: string) => {
    const id = getOrCreateTag(tagName);
    return id || undefined;
  };

  useEffect(() => {
    setShowFullPath(false);
  }, [locationId]);

  useEffect(() => {
    if (location && !isEditing) {
      setName(location.name);
      setType(location.type);
      setDescription(location.description);
      setParentId(location.parentId || '');
      setCampaignIds(location.campaignIds);
      setTagIds(location.tagIds);
      setMapImage(location.map || null);
      setGalleryImages(location.images);
    }
  }, [location, isEditing]);

  const handleEdit = () => {
    if (!location) return;
    setName(location.name);
    setType(location.type);
    setDescription(location.description);
    setParentId(location.parentId || '');
    setCampaignIds(location.campaignIds);
    setTagIds(location.tagIds);
    setMapImage(location.map || null);
    setGalleryImages(location.images);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (location) {
      setName(location.name);
      setType(location.type);
      setDescription(location.description);
      setParentId(location.parentId || '');
      setCampaignIds(location.campaignIds);
      setTagIds(location.tagIds);
      setMapImage(location.map || null);
      setGalleryImages(location.images);
    }
    setError(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!location) return;
    setError(null);
    if (!ALLOWED_LOCATION_TYPES.has(type as LocationType)) {
      setError('Select a valid location type.');
      return;
    }
    if (parentId) {
      if (parentId === location.id) {
        setError('Location cannot be its own parent.');
        return;
      }
      const hasParent = allLocations.some((item) => item.id === parentId);
      if (!hasParent) {
        setError('Select a valid parent location.');
        return;
      }
    }
    try {
      updateLocation(location.id, {
        name,
        type: type as LocationType,
        description,
        parentId: parentId || '',
        campaignIds,
        tagIds,
        map: mapImage ?? '',
        images: galleryImages,
      });
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update location.';
      setError(message);
    }
  };

  const handleDelete = () => {
    if (!location || isDeleting) return;
    Alert.alert(
      'Delete location?',
      'This will remove the location and leave any children orphaned.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              setIsDeleting(true);
              deleteLocation(location.id);
              router.back();
            } catch (err) {
              const message =
                err instanceof Error ? err.message : 'Failed to delete location.';
              setError(message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!hasLocationId) {
    return (
      <Screen>
        <EmptyState
          title="No location selected"
          description="Select a location to view its details."
          icon="map-marker-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  if (!location) {
    return (
      <Screen>
        <EmptyState
          title="Location not found"
          description="This location may have been deleted."
          icon="map-marker-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: location.name || 'Location' }} />
      <Screen stickyHeaderIndices={showBreadcrumb ? [0] : undefined}>
        {showBreadcrumb && (
          <View
            style={[
              styles.breadcrumbHeader,
              { backgroundColor: theme.colors.background, borderColor: theme.colors.outlineVariant },
            ]}
          >
            <View style={styles.breadcrumbRow}>
              <Breadcrumb items={breadcrumbItems} variant="solid" />
              {canCollapsePath && showFullPath && (
                <Pressable
                  onPress={() => setShowFullPath(false)}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.breadcrumbToggle,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                    Collapse
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              {isEditing ? (
                <FormTextInput
                  label="Location name"
                  value={name}
                  onChangeText={setName}
                  style={styles.titleInput}
                />
              ) : (
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                  {location.name || 'Untitled location'}
                </Text>
              )}
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Type: {isEditing ? type : location.type}
              </Text>
              {!isEditing && parentName && location.parentId && (
                <Pressable
                  onPress={() => router.push(`/location/${location.parentId}`)}
                  style={({ pressed }) => [
                    styles.parentChip,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.outlineVariant,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="arrow-up"
                    size={iconSizes.sm}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Parent: {parentName}
                  </Text>
                </Pressable>
              )}
            </View>
            {!isEditing && (
              <IconButton
                icon="pencil"
                onPress={handleEdit}
                accessibilityLabel="Edit location"
              />
            )}
          </View>

        <Section title="Details" icon="map-marker-outline">
          {isEditing ? (
            <>
              <FormSelect
                label="Type"
                value={type}
                options={LOCATION_TYPE_OPTIONS}
                onChange={setType}
                containerStyle={styles.fieldInput}
              />
              <FormSelect
                label="Parent location"
                value={parentId}
                options={parentOptions}
                onChange={setParentId}
                containerStyle={styles.fieldInput}
              />
              <FormTextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                style={styles.descriptionInput}
              />
            </>
          ) : (
            <>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {location.description?.trim() || 'No description yet.'}
              </Text>
              <View style={styles.metaRow}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Created: {formatDate(location.created)}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Updated: {formatDate(location.updated)}
                </Text>
              </View>
            </>
          )}
        </Section>

        <Section title="Campaigns" icon="folder-outline">
          {isEditing ? (
            <FormMultiSelect
              label="Campaigns"
              value={campaignIds}
              options={campaignOptions}
              onChange={setCampaignIds}
            />
          ) : linkedCampaigns.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No campaigns linked yet.
            </Text>
          ) : (
            linkedCampaigns.map((campaign) => (
              <AppCard key={campaign.id} title={campaign.name} style={styles.inlineCard} />
            ))
          )}
        </Section>

        {isEditing ? (
          <Section title="Tags" icon="tag-outline">
            <TagInput
              tags={tags.map((tag) => ({ id: tag.id, name: tag.name }))}
              selectedIds={tagIds}
              onChange={setTagIds}
              onCreateTag={handleCreateTag}
            />
          </Section>
        ) : (
          <Section title="Tags" icon="tag-outline">
            {resolvedTags.length === 0 ? (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                No tags yet.
              </Text>
            ) : (
              <View style={styles.tagsRow}>
                {resolvedTags.map((tag) => (
                  <TagChip key={tag.id} id={tag.id} name={tag.name} size="small" />
                ))}
              </View>
            )}
          </Section>
        )}

        <Section title="Media" icon="image-multiple-outline">
          {isEditing ? (
            <>
              <FormImagePicker label="Map image" value={mapImage} onChange={setMapImage} />
              <FormImageGallery
                label="Gallery images"
                values={galleryImages}
                onChange={setGalleryImages}
              />
            </>
          ) : (
            <>
              {location.map ? (
                <Image source={{ uri: location.map }} style={styles.mapPreview} />
              ) : (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  No map uploaded.
                </Text>
              )}
              {location.images.length > 0 ? (
                <View style={styles.galleryRow}>
                  {location.images.map((uri, index) => (
                    <Image
                      key={`${uri}-${index}`}
                      source={{ uri }}
                      style={styles.galleryImage}
                    />
                  ))}
                </View>
              ) : (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  No gallery images.
                </Text>
              )}
            </>
          )}
        </Section>

        <Section title="Child Locations" icon="map-marker-radius-outline">
          {childLocations.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No child locations yet.
            </Text>
          ) : (
            childLocations.map((child) => (
              <LocationCard
                key={child.id}
                location={child}
                onPress={() => router.push(`/location/${child.id}`)}
                style={styles.inlineCard}
              />
            ))
          )}
        </Section>

        {error && (
          <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        <View style={styles.actionRow}>
          {isEditing ? (
            <>
              <Button mode="contained" onPress={handleSave} style={styles.actionButton}>
                Save
              </Button>
              <Button mode="outlined" onPress={handleCancel} style={styles.actionButton}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button mode="outlined" onPress={() => router.back()} style={styles.actionButton}>
                Back
              </Button>
              <Button
                mode="outlined"
                icon="trash-can-outline"
                onPress={handleDelete}
                style={styles.actionButton}
                textColor={theme.colors.error}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </>
          )}
        </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  headerText: {
    flex: 1,
    gap: spacing[1],
  },
  parentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    gap: spacing[1],
  },
  titleInput: {
    marginBottom: spacing[1],
  },
  breadcrumbHeader: {
    paddingBottom: spacing[3],
    marginBottom: spacing[4],
    borderBottomWidth: 1,
  },
  breadcrumbRow: {
    gap: spacing[2],
    alignItems: 'flex-start',
  },
  breadcrumbToggle: {
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
  },
  fieldInput: {
    marginBottom: spacing[2],
  },
  descriptionInput: {
    minHeight: 160,
  },
  metaRow: {
    marginTop: spacing[3],
    gap: spacing[1],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  mapPreview: {
    width: '100%',
    height: spacing[48],
    borderRadius: layout.cardBorderRadius,
  },
  galleryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  galleryImage: {
    width: spacing[16],
    height: spacing[16],
    borderRadius: layout.cardBorderRadius,
  },
  inlineCard: {
    marginBottom: spacing[2],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    marginTop: spacing[3],
  },
});
