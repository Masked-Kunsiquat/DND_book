import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  Breadcrumb,
  ConfirmDialog,
  EmptyState,
  FormModal,
  FormImageGallery,
  FormImagePicker,
  LocationMultiSelect,
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
  useCurrentCampaign,
  useCreateLocation,
  useDeleteLocation,
  useGetOrCreateTag,
  useLocation,
  useLocationPath,
  useLocations,
  useTags,
  useUpdateLocation,
} from '../../src/hooks';
import { now } from '../../src/utils/id';
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
const LOCATION_TYPE_ORDER = LOCATION_TYPE_OPTIONS.map((option) => option.value);

const getAllowedParentTypes = (type: LocationType): LocationType[] => {
  const index = LOCATION_TYPE_ORDER.indexOf(type);
  if (index <= 0) return [];
  return LOCATION_TYPE_ORDER.slice(0, index);
};

const getAllowedChildTypes = (type: LocationType): LocationType[] => {
  const index = LOCATION_TYPE_ORDER.indexOf(type);
  if (index < 0) return [];
  return LOCATION_TYPE_ORDER.slice(index + 1);
};

const ALLOWED_LOCATION_TYPES = new Set<LocationType>(
  LOCATION_TYPE_OPTIONS.map((option) => option.value)
);

/**
 * Display the detail screen for a single location, including viewing, editing, moving, sharing, tagging, media, and child-management flows.
 *
 * Loads location, campaign, tag, and related data; enforces parent/child type constraints; and provides UI and handlers to create, update, move, share, fork, remove from campaign, and delete a location with confirmation dialogs and inline validation.
 *
 * @returns The React element for the Location detail screen
 */
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
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const allLocations = useLocations();
  const childLocations = useChildLocations(scopedLocationId);
  const path = useLocationPath(scopedLocationId);
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const tagContinuityId = location?.continuityId || currentCampaign?.continuityId;
  const tags = useTags(tagContinuityId, currentCampaign?.id);
  const getOrCreateTag = useGetOrCreateTag({
    continuityId: tagContinuityId,
    scope: 'continuity',
  });

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
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [moveParentId, setMoveParentId] = useState('');
  const [moveError, setMoveError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [activeLinkModal, setActiveLinkModal] = useState<'campaigns' | 'tags' | null>(null);

  const normalizeCampaignIds = (ids: string[]) => (ids.length > 0 ? [ids[0]] : []);
  const resolveEditableCampaignIds = (ids: string[], scope?: string) =>
    scope === 'continuity' ? ids : normalizeCampaignIds(ids);

  const linkedCampaigns = useMemo(() => {
    if (!location) return [];
    const ids = new Set(resolveEditableCampaignIds(location.campaignIds, location.scope));
    return campaigns.filter((campaign) => ids.has(campaign.id));
  }, [campaigns, location]);

  const continuityId = location?.continuityId || currentCampaign?.continuityId || '';

  const continuityLocations = useMemo(() => {
    if (!continuityId) return allLocations;
    return allLocations.filter((item) => item.continuityId === continuityId);
  }, [allLocations, continuityId]);

  const canRemoveFromCampaign =
    location?.scope === 'continuity' &&
    currentCampaign &&
    location.campaignIds.includes(currentCampaign.id);
  const showShareActions =
    location?.scope === 'campaign' ||
    (location?.scope === 'continuity' && Boolean(currentCampaign));

  const continuityCampaignOptions = useMemo(() => {
    if (!continuityId) return campaigns;
    return campaigns.filter((campaign) => campaign.continuityId === continuityId);
  }, [campaigns, continuityId]);

  const parentCandidates = useMemo(() => {
    const effectiveType =
      (isEditing ? (type as LocationType) : location?.type) ?? 'Locale';
    const allowed = new Set(getAllowedParentTypes(effectiveType));
    return continuityLocations.filter(
      (item) => item.id !== locationId && allowed.has(item.type)
    );
  }, [continuityLocations, isEditing, location?.type, locationId, type]);

  const moveParentCandidates = useMemo(() => {
    if (!location) return [];
    const allowed = new Set(getAllowedParentTypes(location.type));
    return continuityLocations.filter(
      (item) => item.id !== locationId && allowed.has(item.type)
    );
  }, [continuityLocations, location, locationId]);

  const parentHelper = useMemo(() => {
    const effectiveType =
      (isEditing ? (type as LocationType) : location?.type) ?? 'Locale';
    const allowed = getAllowedParentTypes(effectiveType);
    if (allowed.length === 0) {
      return 'This level cannot have a parent.';
    }
    return `Parent must be higher in the hierarchy (${allowed.join(' • ')}).`;
  }, [isEditing, location?.type, type]);

  const campaignOptions = useMemo(() => {
    return continuityCampaignOptions.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [continuityCampaignOptions]);

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

  const handleTypeChange = (value: string) => {
    const nextType = value as LocationType;
    setType(nextType);
    if (!parentId) return;
    const parent = continuityLocations.find((item) => item.id === parentId);
    const allowed = new Set(getAllowedParentTypes(nextType));
    if (!parent || !allowed.has(parent.type)) {
      setParentId('');
    }
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
      setCampaignIds(resolveEditableCampaignIds(location.campaignIds, location.scope));
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
    setCampaignIds(resolveEditableCampaignIds(location.campaignIds, location.scope));
    setTagIds(location.tagIds);
    setMapImage(location.map || null);
    setGalleryImages(location.images);
    setError(null);
    setIsEditing(true);
  };

  const openLinkModal = (target: 'campaigns' | 'tags') => {
    setActiveLinkModal(target);
  };

  const closeLinkModal = () => setActiveLinkModal(null);

  const linkModalTitle =
    activeLinkModal === 'tags'
      ? 'Tags'
      : location?.scope === 'continuity'
        ? 'Visible in campaigns'
        : 'Campaign';
  const campaignSectionTitle =
    location?.scope === 'continuity' ? 'Campaign visibility' : 'Campaign';

  const linkModalBody =
    activeLinkModal === 'tags' ? (
      <TagInput
        tags={tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
        selectedIds={tagIds}
        onChange={setTagIds}
        onCreateTag={handleCreateTag}
      />
    ) : (
      <FormMultiSelect
        label={location?.scope === 'continuity' ? 'Visible in campaigns' : 'Campaign'}
        value={campaignIds}
        options={campaignOptions}
        onChange={(value) =>
          setCampaignIds(
            location?.scope === 'continuity'
              ? value
              : value.length > 0
                ? [value[value.length - 1]]
                : []
          )
        }
      />
    );

  const handleCancel = () => {
    if (location) {
      setName(location.name);
      setType(location.type);
      setDescription(location.description);
      setParentId(location.parentId || '');
      setCampaignIds(resolveEditableCampaignIds(location.campaignIds, location.scope));
      setTagIds(location.tagIds);
      setMapImage(location.map || null);
      setGalleryImages(location.images);
    }
    setError(null);
    setIsEditing(false);
  };

  const openMoveModal = () => {
    if (!location) return;
    setMoveParentId(location.parentId || '');
    setMoveError(null);
    setIsMoveOpen(true);
  };

  const closeMoveModal = () => {
    setIsMoveOpen(false);
    setMoveError(null);
  };

  const handleMove = () => {
    if (!location || isMoving) return;
    setMoveError(null);
    if (moveParentId && moveParentId === location.id) {
      setMoveError('Location cannot be its own parent.');
      return;
    }
    if (moveParentId) {
      const parent = continuityLocations.find((item) => item.id === moveParentId);
      const allowed = new Set(getAllowedParentTypes(location.type));
      if (!parent || !allowed.has(parent.type)) {
        setMoveError('Parent must be higher in the location hierarchy.');
        return;
      }
    }

    setIsMoving(true);
    try {
      updateLocation(location.id, {
        parentId: moveParentId || '',
      });
      setIsMoveOpen(false);
    } catch (moveErr) {
      const message =
        moveErr instanceof Error ? moveErr.message : 'Failed to move location.';
      setMoveError(message);
    } finally {
      setIsMoving(false);
    }
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
      const hasParent = continuityLocations.some((item) => item.id === parentId);
      if (!hasParent) {
        setError('Select a valid parent location.');
        return;
      }
      const parent = continuityLocations.find((item) => item.id === parentId);
      const allowed = new Set(getAllowedParentTypes(type as LocationType));
      if (!parent || !allowed.has(parent.type)) {
        setError('Parent must be higher in the location hierarchy.');
        return;
      }
    }
    if (type !== location.type && childLocations.length > 0) {
      const allowedChildren = new Set(getAllowedChildTypes(type as LocationType));
      const invalidChild = childLocations.find((child) => !allowedChildren.has(child.type));
      if (invalidChild) {
        setError('Update or move child locations before changing this level.');
        return;
      }
    }
    try {
      updateLocation(location.id, {
        name,
        type: type as LocationType,
        description,
        parentId: parentId || '',
        status: location.status === 'shadow' ? 'complete' : location.status,
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

  const handleMarkComplete = async () => {
    if (!location) return;
    setError(null);
    try {
      await updateLocation(location.id, { status: 'complete' });
    } catch (err) {
      const context = `location ${location.id} to status complete`;
      const message =
        err instanceof Error
          ? `${err.message} (while marking ${context})`
          : `Failed to mark ${context}.`;
      setError(message);
    }
  };

  const handleDelete = () => {
    if (!location || isDeleting) return;
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const handleRemove = () => {
    if (!location || !currentCampaign || isRemoving) return;
    setIsRemoveOpen(true);
  };

  const closeRemoveDialog = () => {
    setIsRemoveOpen(false);
  };

  const confirmRemove = () => {
    if (!location || !currentCampaign || isRemoving) return;
    try {
      setIsRemoving(true);
      updateLocation(location.id, {
        campaignIds: location.campaignIds.filter((id) => id !== currentCampaign.id),
      });
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove location.';
      setError(message);
    } finally {
      setIsRemoving(false);
      setIsRemoveOpen(false);
    }
  };

  const confirmDelete = () => {
    if (!location || isDeleting) return;
    try {
      setIsDeleting(true);
      deleteLocation(location.id);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete location.';
      setError(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleShare = () => {
    if (!location || isSharing) return;
    setIsShareOpen(true);
  };

  const closeShareDialog = () => {
    setIsShareOpen(false);
  };

  const confirmShare = () => {
    if (!location || isSharing) return;
    if (!continuityId) {
      setError('Missing continuity information for this location.');
      setIsShareOpen(false);
      return;
    }

    if (location.parentId) {
      const parent = continuityLocations.find((item) => item.id === location.parentId);
      if (parent && parent.scope !== 'continuity') {
        setError('Share the parent location before sharing this one.');
        setIsShareOpen(false);
        return;
      }
    }

    setIsSharing(true);
    try {
      const sharedCampaignIds =
        location.campaignIds.length > 0
          ? location.campaignIds
          : currentCampaign
            ? [currentCampaign.id]
            : [];
      updateLocation(location.id, {
        scope: 'continuity',
        continuityId,
        campaignIds: sharedCampaignIds,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to share location.';
      setError(message);
    } finally {
      setIsSharing(false);
      setIsShareOpen(false);
    }
  };

  const handleFork = () => {
    if (!location || !currentCampaign || isForking) return;
    setIsForking(true);
    try {
      const forkedId = createLocation({
        name: location.name,
        type: location.type,
        description: location.description,
        parentId: location.parentId || '',
        scope: 'campaign',
        continuityId: location.continuityId,
        originId: location.id,
        originContinuityId: location.continuityId,
        forkedAt: now(),
        campaignIds: [currentCampaign.id],
        tagIds: location.tagIds,
        map: location.map,
        images: location.images,
      });
      router.push(`/location/${forkedId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fork location.';
      setError(message);
    } finally {
      setIsForking(false);
    }
  };

  const moveModal = (
    <FormModal
      title="Move Location"
      visible={isMoveOpen}
      onDismiss={closeMoveModal}
      actions={
        <>
          <Button mode="text" onPress={closeMoveModal} disabled={isMoving}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleMove} loading={isMoving} disabled={isMoving}>
            Move
          </Button>
        </>
      }
    >
      <LocationMultiSelect
        locations={moveParentCandidates}
        value={moveParentId ? [moveParentId] : []}
        onChange={(next) => setMoveParentId(next[next.length - 1] ?? '')}
        helperText={parentHelper}
        disabled={moveParentCandidates.length === 0}
      />
      {moveError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {moveError}
        </Text>
      )}
    </FormModal>
  );

  const linkModal = (
    <FormModal
      title={linkModalTitle}
      visible={Boolean(activeLinkModal)}
      onDismiss={closeLinkModal}
      actions={
        <Button mode="contained" onPress={closeLinkModal}>
          Done
        </Button>
      }
    >
      {linkModalBody}
    </FormModal>
  );

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
              {!isEditing && location.scope === 'continuity' && (
                <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                  Shared in continuity
                </Text>
              )}
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

        {!isEditing && location.status === 'shadow' && (
          <AppCard
            title="Shadow location"
            subtitle="Created from a mention. Fill in details to complete."
            style={styles.shadowCard}
          >
            <Button mode="contained" onPress={handleMarkComplete}>
              Mark Complete
            </Button>
          </AppCard>
        )}

        <Section title="Details" icon="map-marker-outline">
            {isEditing ? (
              <>
                <FormSelect
                  label="Type"
                  value={type}
                  options={LOCATION_TYPE_OPTIONS}
                  onChange={handleTypeChange}
                  containerStyle={styles.fieldInput}
                />
                <LocationMultiSelect
                  locations={parentCandidates}
                  value={parentId ? [parentId] : []}
                  onChange={(next) => setParentId(next[next.length - 1] ?? '')}
                  helperText={parentHelper}
                  disabled={parentCandidates.length === 0}
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
                {location.scope === 'continuity' && (
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Editing shared locations affects every campaign this location is linked to.
                  </Text>
                )}
                <View style={styles.metaRow}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Created: {formatDate(location.created)}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Updated: {formatDate(location.updated)}
                  </Text>
                </View>
                <View style={styles.moveRow}>
                  <Button mode="outlined" icon="swap-vertical" onPress={openMoveModal}>
                    Move
                  </Button>
                </View>
                {showShareActions && (
                  <View style={styles.shareRow}>
                    {location.scope === 'campaign' && (
                      <Button
                        mode="outlined"
                        icon="share-variant"
                        onPress={handleShare}
                        disabled={isSharing}
                      >
                        Share to Continuity
                      </Button>
                    )}
                    {location.scope === 'continuity' && currentCampaign && (
                      <Button
                        mode="outlined"
                        icon="source-fork"
                        onPress={handleFork}
                        disabled={isForking}
                      >
                        Fork to Campaign
                      </Button>
                    )}
                  </View>
                )}
              </>
            )}
          </Section>

        <Section title={campaignSectionTitle} icon="folder-outline">
          {isEditing ? (
            <AppCard
              title={location?.scope === 'continuity' ? 'Visible in campaigns' : 'Campaign'}
              subtitle={
                location?.scope === 'continuity'
                  ? `${campaignIds.length} selected`
                  : campaignIds.length > 0
                    ? '1 selected'
                    : 'Not linked'
              }
              onPress={() => openLinkModal('campaigns')}
              right={
                <View style={styles.editCardRight}>
                  <MaterialCommunityIcons
                    name="folder-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
              }
              style={styles.editCard}
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
            <AppCard
              title="Tags"
              subtitle={`${tagIds.length} selected`}
              onPress={() => openLinkModal('tags')}
              right={
                <View style={styles.editCardRight}>
                  <MaterialCommunityIcons name="tag-outline" size={18} color={theme.colors.primary} />
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
              }
              style={styles.editCard}
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
                    <TagChip
                      key={tag.id}
                      id={tag.id}
                      name={tag.name}
                      color={tag.color}
                      size="small"
                      onPress={() => router.push(`/tag/${tag.id}`)}
                    />
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
              {canRemoveFromCampaign && (
                <Button
                  mode="outlined"
                  icon="link-off"
                  onPress={handleRemove}
                  style={styles.actionButton}
                >
                  Remove
                </Button>
              )}
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
      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete location?"
        description={
          location?.scope === 'continuity'
            ? 'This deletes the shared location for any campaign it is linked to.'
            : 'This will remove the location and leave any children orphaned.'
        }
        confirmLabel="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
      <ConfirmDialog
        visible={isRemoveOpen}
        title="Remove from campaign?"
        description="This will remove the location from this campaign only."
        confirmLabel="Remove"
        onCancel={closeRemoveDialog}
        onConfirm={confirmRemove}
        confirmLoading={isRemoving}
      />
      <ConfirmDialog
        visible={isShareOpen}
        title="Share to continuity?"
        description="Shared locations live in the continuity and can be linked to multiple campaigns."
        confirmLabel="Share"
        onCancel={closeShareDialog}
        onConfirm={confirmShare}
        confirmLoading={isSharing}
      />
      {moveModal}
      {linkModal}
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
  shadowCard: {
    marginBottom: spacing[3],
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
  editCard: {
    paddingVertical: spacing[1],
  },
  editCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaRow: {
    marginTop: spacing[3],
    gap: spacing[1],
  },
  moveRow: {
    marginTop: spacing[3],
    alignSelf: 'flex-start',
  },
  shareRow: {
    marginTop: spacing[2],
    gap: spacing[2],
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