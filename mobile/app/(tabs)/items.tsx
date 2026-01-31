import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  AppCard,
  EmptyState,
  FormModal,
  FormMultiSelect,
  FormSelect,
  FormTextInput,
  Screen,
  Section,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, layout, spacing } from '../../src/theme';
import {
  useCampaigns,
  useCreateItem,
  useCurrentCampaign,
  useItems,
  usePullToRefresh,
} from '../../src/hooks';
import type { EntityScope, Item } from '../../src/types/schema';

/**
 * Builds a user-facing subtitle for an item based on its status, value, and description.
 *
 * @param item - The item to generate a subtitle for.
 * @returns A subtitle string: includes "Shadow item" if the item's status is `shadow`, "Value: {trimmed value}" if a non-empty value exists, or the trimmed description if neither is present; parts are joined with " • ". Returns "No details yet." when no detail is available.
 */
function buildSubtitle(item: Item): string {
  const parts: string[] = [];
  if (item.status === 'shadow') {
    parts.push('Shadow item');
  }
  if (item.value?.trim()) {
    parts.push(`Value: ${item.value.trim()}`);
  }
  if (parts.length === 0 && item.description?.trim()) {
    parts.push(item.description.trim());
  }
  return parts.length > 0 ? parts.join(' • ') : 'No details yet.';
}

/**
 * Screen that displays and manages items for the currently selected campaign.
 *
 * Renders a searchable, refreshable list of items, supports creating new items
 * (campaign-scoped or continuity-shared via a modal), and navigates to item details.
 *
 * @returns The rendered Items screen component.
 */
export default function ItemsScreen() {
  const { theme } = useTheme();
  const currentCampaign = useCurrentCampaign();
  const campaigns = useCampaigns();
  const continuityId = currentCampaign?.continuityId ?? '';
  const items = useItems(currentCampaign?.id);
  const createItem = useCreateItem();
  const { refreshing, onRefresh } = usePullToRefresh();

  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftValue, setDraftValue] = useState('');
  const [draftScope, setDraftScope] = useState<EntityScope>('campaign');
  const [draftCampaignIds, setDraftCampaignIds] = useState<string[]>([]);

  const continuityCampaigns = useMemo(() => {
    if (!continuityId) return campaigns;
    return campaigns.filter((campaign) => campaign.continuityId === continuityId);
  }, [campaigns, continuityId]);

  const campaignOptions = useMemo(() => {
    return continuityCampaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [continuityCampaigns]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const scoped = normalized
      ? items.filter((item) => {
          const name = item.name?.toLowerCase() ?? '';
          const description = item.description?.toLowerCase() ?? '';
          return name.includes(normalized) || description.includes(normalized);
        })
      : items;
    return [...scoped].sort((a, b) => {
      const aDate = a.updated || a.created;
      const bDate = b.updated || b.created;
      return bDate.localeCompare(aDate);
    });
  }, [items, query]);

  const openCreateModal = () => {
    setDraftName(`New Item ${items.length + 1}`);
    setDraftDescription('');
    setDraftValue('');
    setDraftScope('campaign');
    setDraftCampaignIds(currentCampaign?.id ? [currentCampaign.id] : []);
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
  };

  const handleCreate = async () => {
    if (!currentCampaign || isCreating) return;
    const trimmed = draftName.trim();
    if (!trimmed) {
      setCreateError('Item name is required.');
      return;
    }
    if (draftScope === 'continuity' && !continuityId) {
      setCreateError('Select a continuity before creating a shared item.');
      return;
    }
    if (draftScope === 'continuity' && draftCampaignIds.length === 0) {
      setCreateError('Select at least one campaign for this shared item.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const sharedCampaignIds =
        draftScope === 'continuity' ? draftCampaignIds : [currentCampaign.id];
      const id = createItem({
        name: trimmed,
        description: draftDescription.trim(),
        value: draftValue.trim(),
        scope: draftScope,
        continuityId,
        campaignIds: sharedCampaignIds,
        status: 'complete',
      });
      setIsCreateOpen(false);
      router.push(`/item/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create item.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentCampaign) {
    return (
      <Screen>
        <EmptyState
          title="No campaign selected"
          description="Select a campaign to view items."
          icon="treasure-chest-outline"
          action={{ label: 'Choose campaign', onPress: () => router.push('/campaigns') }}
        />
      </Screen>
    );
  }

  const createModal = (
    <FormModal
      title="New Item"
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
      <FormSelect
        label="Scope"
        value={draftScope}
        options={[
          { label: 'Campaign item', value: 'campaign' },
          { label: 'Shared in continuity', value: 'continuity' },
        ]}
        onChange={(value) => {
          const nextScope = value as EntityScope;
          setDraftScope(nextScope);
          if (nextScope === 'campaign') {
            setDraftCampaignIds(currentCampaign?.id ? [currentCampaign.id] : []);
          } else if (draftCampaignIds.length === 0) {
            setDraftCampaignIds(currentCampaign?.id ? [currentCampaign.id] : []);
          }
        }}
        helperText="Shared items live in the continuity and can be linked to multiple campaigns."
      />
      {draftScope === 'continuity' && (
        <FormMultiSelect
          label="Visible in campaigns"
          value={draftCampaignIds}
          options={campaignOptions}
          onChange={setDraftCampaignIds}
          helperText="Select which campaigns should see this item."
        />
      )}
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      <FormTextInput
        label="Description"
        value={draftDescription}
        onChangeText={setDraftDescription}
        multiline
        style={styles.modalContentInput}
      />
      <FormTextInput label="Value" value={draftValue} onChangeText={setDraftValue} />
      {createError ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      ) : null}
    </FormModal>
  );

  if (items.length === 0) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <EmptyState
            title="No items yet"
            description="Create your first item to get started."
            icon="treasure-chest-outline"
            action={!isCreating ? { label: 'Create Item', onPress: openCreateModal } : undefined}
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
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <Section title="Items" icon="treasure-chest-outline">
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {items.length} item{items.length === 1 ? '' : 's'}
                </Text>
              </Section>
              <FormTextInput
                label="Search"
                value={query}
                onChangeText={setQuery}
                placeholder="Search items"
              />
            </View>
          }
          renderItem={({ item }) => (
            <AppCard
              title={item.name || 'Untitled item'}
              subtitle={buildSubtitle(item)}
              onPress={() => router.push(`/item/${item.id}`)}
              right={
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={iconSizes.md}
                  color={theme.colors.onSurfaceVariant}
                />
              }
              style={styles.card}
            />
          )}
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
  card: {
    marginBottom: spacing[2],
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
