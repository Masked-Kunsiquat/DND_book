import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  ConfirmDialog,
  EmptyState,
  FormMultiSelect,
  FormTextInput,
  Screen,
  Section,
  TagChip,
  TagInput,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import type { Tag } from '../../src/types/schema';
import {
  useCampaigns,
  useCurrentCampaign,
  useDeleteItem,
  useGetOrCreateTag,
  useItem,
  useTags,
  useUpdateItem,
} from '../../src/hooks';

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
}

/**
 * Display and manage an item's details.
 */
export default function ItemDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const itemId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);

  const item = useItem(itemId);
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const continuityId =
    item?.continuityId ||
    campaigns.find((campaign) => campaign.id === item?.campaignIds?.[0])?.continuityId ||
    currentCampaign?.continuityId ||
    '';

  const tagCampaignId = item?.campaignIds?.[0] || currentCampaign?.id;
  const tags = useTags(continuityId, tagCampaignId);
  const getOrCreateTag = useGetOrCreateTag({
    continuityId,
    campaignId: tagCampaignId,
    scope: item?.scope,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [campaignIds, setCampaignIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (item && !isEditing) {
      setName(item.name);
      setDescription(item.description);
      setValue(item.value);
      setCampaignIds(item.campaignIds);
      setTagIds(item.tagIds);
    }
  }, [item, isEditing]);

  const campaignOptions = useMemo(() => {
    return campaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [campaigns]);

  const linkedCampaigns = useMemo(() => {
    const ids = new Set(campaignIds);
    return campaigns.filter((campaign) => ids.has(campaign.id));
  }, [campaignIds, campaigns]);

  const resolvedTags = useMemo(() => {
    const tagById = new Map(tags.map((tag) => [tag.id, tag]));
    return tagIds.map((id) => tagById.get(id)).filter((tag): tag is Tag => tag !== undefined);
  }, [tagIds, tags]);

  const handleCreateTag = (tagName: string) => {
    if (!continuityId) return undefined;
    const id = getOrCreateTag(tagName);
    return id || undefined;
  };

  const handleEdit = () => {
    if (!item) return;
    setName(item.name);
    setDescription(item.description);
    setValue(item.value);
    setCampaignIds(item.campaignIds);
    setTagIds(item.tagIds);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!item) return;
    setName(item.name);
    setDescription(item.description);
    setValue(item.value);
    setCampaignIds(item.campaignIds);
    setTagIds(item.tagIds);
    setError(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!item) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Item name is required.');
      return;
    }
    setError(null);
    try {
      updateItem(item.id, {
        name: trimmedName,
        description: description.trim(),
        value: value.trim(),
        campaignIds,
        tagIds,
      });
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item.';
      setError(message);
    }
  };

  const handleMarkComplete = async () => {
    if (!item) return;
    setError(null);
    try {
      await updateItem(item.id, { status: 'complete' });
    } catch (err) {
      const message =
        err instanceof Error
          ? `${err.message} (while marking item ${item.id} complete)`
          : `Failed to mark item ${item.id} complete.`;
      setError(message);
    }
  };

  const handleDelete = () => {
    if (!item || isDeleting) return;
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (!item || isDeleting) return;
    setIsDeleting(true);
    try {
      await Promise.resolve(deleteItem(item.id));
      setIsDeleteOpen(false);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item.';
      setError(message);
      setIsDeleting(false);
    }
  };

  if (!item) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Item' }} />
        <EmptyState title="Item not found" subtitle="This item may have been removed." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: item.name || 'Item' }} />
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
            {item.name || 'Untitled item'}
          </Text>
          {item.scope === 'continuity' && (
            <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
              Shared in continuity
            </Text>
          )}
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Updated {formatDate(item.updated)}
          </Text>
        </View>
        {!isEditing && (
          <IconButton icon="pencil" onPress={handleEdit} accessibilityLabel="Edit item" />
        )}
      </View>

      {!isEditing && item.status === 'shadow' && (
        <AppCard
          title="Shadow item"
          subtitle="Created from a mention. Fill in details to complete."
          style={styles.shadowCard}
        >
          <Button mode="contained" onPress={handleMarkComplete}>
            Mark Complete
          </Button>
        </AppCard>
      )}

      <Section title="Details" icon="treasure-chest-outline">
        {isEditing ? (
          <View style={styles.formStack}>
            <FormTextInput label="Name" value={name} onChangeText={setName} />
            <FormTextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.descriptionInput}
            />
            <FormTextInput label="Value" value={value} onChangeText={setValue} />
          </View>
        ) : (
          <View style={styles.detailStack}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              {item.description?.trim() ? item.description : 'No description yet.'}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Value: {item.value?.trim() ? item.value : 'Unspecified'}
            </Text>
          </View>
        )}
      </Section>

      <Section title="Links" icon="link-variant">
        {isEditing ? (
          <View style={styles.formStack}>
            <FormMultiSelect
              label="Campaigns"
              value={campaignIds}
              options={campaignOptions}
              onChange={setCampaignIds}
              helperText="Assign this item to one or more campaigns."
            />
            {continuityId ? (
              <TagInput
                tags={tags}
                selectedIds={tagIds}
                onChange={setTagIds}
                onCreateTag={handleCreateTag}
              />
            ) : (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Select a campaign to add tags.
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.detailStack}>
            {linkedCampaigns.length === 0 ? (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                No campaigns linked.
              </Text>
            ) : (
              linkedCampaigns.map((campaign) => (
                <AppCard
                  key={campaign.id}
                  title={campaign.name || 'Untitled campaign'}
                  onPress={() => router.push(`/campaign/${campaign.id}`)}
                  style={styles.inlineCard}
                />
              ))
            )}
            {resolvedTags.length === 0 ? (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                No tags linked.
              </Text>
            ) : (
              <View style={styles.tagRow}>
                {resolvedTags.map((tag) => (
                  <TagChip key={tag.id} id={tag.id} name={tag.name} color={tag.color} />
                ))}
              </View>
            )}
          </View>
        )}
      </Section>

      {error ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {error}
        </Text>
      ) : null}

      {isEditing ? (
        <View style={styles.actionRow}>
          <Button mode="text" onPress={handleCancel}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSave}>
            Save
          </Button>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <Button mode="text" onPress={handleDelete} textColor={theme.colors.error}>
            Delete Item
          </Button>
        </View>
      )}

      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete item?"
        message="This will remove the item from your library."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
        isLoading={isDeleting}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  titleBlock: {
    flex: 1,
    gap: spacing[1],
  },
  shadowCard: {
    marginTop: spacing[2],
  },
  formStack: {
    gap: spacing[3],
  },
  detailStack: {
    gap: spacing[2],
  },
  descriptionInput: {
    minHeight: 120,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  inlineCard: {
    marginBottom: spacing[2],
  },
});
