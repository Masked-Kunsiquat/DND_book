import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  AppCard,
  ConfirmDialog,
  EmptyState,
  FormModal,
  FormTextInput,
  Screen,
  Section,
} from '../src/components';
import { useTheme } from '../src/theme/ThemeProvider';
import { spacing } from '../src/theme';
import { useCampaigns, useCurrentCampaign, useSetCurrentCampaign } from '../src/hooks/useCampaigns';
import {
  useContinuities,
  useCreateContinuity,
  useDeleteContinuity,
  useUpdateContinuity,
} from '../src/hooks/useContinuities';

const pluralize = (word: string, count: number) => (count === 1 ? word : `${word}s`);

export default function ContinuitiesScreen() {
  const { theme } = useTheme();
  const continuities = useContinuities();
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const setCurrentCampaign = useSetCurrentCampaign();
  const createContinuity = useCreateContinuity();
  const updateContinuity = useUpdateContinuity();
  const deleteContinuity = useDeleteContinuity();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingContinuityId, setEditingContinuityId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentContinuityId = currentCampaign?.continuityId ?? '';

  const continuityById = useMemo(() => {
    return new Map(continuities.map((continuity) => [continuity.id, continuity]));
  }, [continuities]);

  const currentContinuity = currentContinuityId
    ? continuityById.get(currentContinuityId)
    : undefined;

  const campaignsByContinuity = useMemo(() => {
    const map = new Map<string, typeof campaigns>();
    campaigns.forEach((campaign) => {
      const list = map.get(campaign.continuityId) ?? [];
      list.push(campaign);
      map.set(campaign.continuityId, list);
    });
    return map;
  }, [campaigns]);

  const openCreateModal = () => {
    setDraftName('New Continuity');
    setDraftDescription('');
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
  };

  const handleCreate = () => {
    if (isCreating) return;
    const trimmed = draftName.trim();
    if (!trimmed) {
      setCreateError('Continuity name is required.');
      return;
    }
    setIsCreating(true);
    try {
      const id = createContinuity({ name: trimmed, description: draftDescription.trim() });
      closeCreateModal();
      router.push({ pathname: '/campaigns', params: { create: '1', continuityId: id } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create continuity.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectContinuity = (continuityId: string) => {
    const list = campaignsByContinuity.get(continuityId) ?? [];
    if (list.length === 0) {
      router.push({ pathname: '/campaigns', params: { create: '1', continuityId } });
      return;
    }
    const latest = [...list].sort((a, b) => {
      const aDate = a.updated || a.created;
      const bDate = b.updated || b.created;
      return bDate.localeCompare(aDate);
    })[0];
    if (latest) {
      setCurrentCampaign(latest.id);
    }
  };

  const openEditModal = (continuityId: string) => {
    const continuity = continuityById.get(continuityId);
    if (!continuity) return;
    setEditingContinuityId(continuityId);
    setEditName(continuity.name);
    setEditDescription(continuity.description);
    setEditError(null);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditError(null);
  };

  const editingContinuity = editingContinuityId
    ? continuityById.get(editingContinuityId)
    : undefined;

  const editingCampaignCount = editingContinuityId
    ? (campaignsByContinuity.get(editingContinuityId) ?? []).length
    : 0;

  const handleSaveEdit = () => {
    if (!editingContinuity || isSaving) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('Continuity name is required.');
      return;
    }
    setIsSaving(true);
    try {
      updateContinuity(editingContinuity.id, {
        name: trimmed,
        description: editDescription.trim(),
      });
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update continuity.';
      setEditError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteDialog = () => {
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const confirmDelete = () => {
    if (!editingContinuity || isDeleting) return;
    setIsDeleting(true);
    try {
      deleteContinuity(editingContinuity.id);
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete continuity.';
      setEditError(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const createModal = (
    <FormModal
      title="New Continuity"
      visible={isCreateOpen}
      onDismiss={closeCreateModal}
      actions={
        <>
          <Button mode="text" onPress={closeCreateModal} disabled={isCreating}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleCreate} loading={isCreating} disabled={isCreating}>
            Create
          </Button>
        </>
      }
    >
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      <FormTextInput
        label="Description"
        value={draftDescription}
        onChangeText={setDraftDescription}
        multiline
        style={styles.descriptionInput}
      />
      {createError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      )}
    </FormModal>
  );

  const editModal = (
    <FormModal
      title="Edit Continuity"
      visible={isEditOpen}
      onDismiss={closeEditModal}
      actions={
        <>
          <Button mode="text" onPress={closeEditModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSaveEdit} loading={isSaving} disabled={isSaving}>
            Save
          </Button>
        </>
      }
    >
      <FormTextInput label="Name" value={editName} onChangeText={setEditName} />
      <FormTextInput
        label="Description"
        value={editDescription}
        onChangeText={setEditDescription}
        multiline
        style={styles.descriptionInput}
      />
      {editingCampaignCount > 0 ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Remove all campaigns before deleting this continuity.
        </Text>
      ) : (
        <Button
          mode="text"
          onPress={openDeleteDialog}
          textColor={theme.colors.error}
          disabled={isDeleting}
        >
          Delete continuity
        </Button>
      )}
      {editError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {editError}
        </Text>
      )}
    </FormModal>
  );

  if (continuities.length === 0) {
    return (
      <>
        <Screen>
          <Stack.Screen options={{ title: 'Continuity' }} />
          <EmptyState
            title="No continuities yet"
            description="Create a continuity to group connected campaigns."
            icon="infinity"
            action={{ label: 'Create Continuity', onPress: openCreateModal }}
          />
        </Screen>
        {createModal}
      </>
    );
  }

  return (
    <>
      <Screen>
        <Stack.Screen options={{ title: 'Continuity' }} />
        <Section title="Current Continuity" icon="infinity">
          <AppCard
            title={currentContinuity?.name || 'No continuity selected'}
            subtitle={
              currentCampaign
                ? `Campaign: ${currentCampaign.name}`
                : 'Select a campaign to set the current continuity.'
            }
            onPress={() => router.push('/campaigns')}
            right={
              currentContinuity ? (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={theme.colors.primary}
                />
              ) : undefined
            }
          />
        </Section>

        <Section title="Library" icon="book-outline">
          <AppCard
            title="Locations Library"
            subtitle={
              currentContinuity
                ? `Shared locations in ${currentContinuity.name || 'this continuity'}`
                : 'Select a continuity to view shared locations.'
            }
            onPress={
              currentContinuity
                ? () =>
                    router.push({
                      pathname: '/library/locations',
                      params: { continuityId: currentContinuity.id },
                    })
                : undefined
            }
            right={
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            }
          />
          <AppCard
            title="NPC Library"
            subtitle={
              currentContinuity
                ? `Shared NPCs in ${currentContinuity.name || 'this continuity'}`
                : 'Select a continuity to view shared NPCs.'
            }
            onPress={
              currentContinuity
                ? () =>
                    router.push({
                      pathname: '/library/npcs',
                      params: { continuityId: currentContinuity.id },
                    })
                : undefined
            }
            right={
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            }
          />
        </Section>

        <Section title="All Continuities" icon="infinity" action={{ label: 'New', onPress: openCreateModal }}>
        {continuities.map((continuity) => {
          const list = campaignsByContinuity.get(continuity.id) ?? [];
          const isCurrent = continuity.id === currentContinuityId;
          const subtitle =
            list.length === 0
              ? 'No campaigns yet'
              : `${list.length} ${pluralize('campaign', list.length)}`;
          return (
            <AppCard
              key={continuity.id}
              title={continuity.name || 'Untitled continuity'}
              subtitle={subtitle}
              onPress={() => handleSelectContinuity(continuity.id)}
              right={
                <View style={styles.cardActions}>
                  {isCurrent ? (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={theme.colors.primary}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="swap-horizontal"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                  <IconButton
                    icon="pencil"
                    size={18}
                    onPress={() => openEditModal(continuity.id)}
                  />
                </View>
              }
            />
          );
        })}
        <View style={styles.helper}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Tap a continuity to switch to its most recently updated campaign.
            </Text>
          </View>
        </Section>
      </Screen>
      {createModal}
      {editModal}
      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete continuity?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
    </>
  );
}

const styles = StyleSheet.create({
  descriptionInput: {
    minHeight: 120,
  },
  helper: {
    marginTop: spacing[1],
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
});
