import { useMemo, useState, type ReactNode } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  AppCard,
  ConfirmDialog,
  EmptyState,
  FormModal,
  FormTextInput,
  ModalActions,
  Screen,
  Section,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { commonStyles, iconSizes, layout, spacing } from '../../src/theme';
import {
  useCreatePlayerCharacter,
  useCreatePlayerCharacterTemplate,
  useCurrentCampaign,
  useDeletePlayerCharacterTemplate,
  usePlayerCharacterTemplates,
  useUpdatePlayerCharacterTemplate,
} from '../../src/hooks';
import type { PlayerCharacterTemplate } from '../../src/types/schema';

function renderSubtitle(template: PlayerCharacterTemplate): string {
  const parts = [
    template.player ? `Player: ${template.player}` : null,
    template.race || null,
    template.class || null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' • ') : 'No details yet.';
}

/**
 * Screen for browsing and managing player character templates within a continuity/campaign.
 *
 * Renders a searchable list of templates and provides UI for creating, editing, deleting,
 * and applying templates to create new characters tied to the current campaign.
 *
 * @returns The React element for the Player Character Templates screen.
 */
export default function PlayerCharacterTemplatesScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ continuityId?: string | string[] }>();
  const currentCampaign = useCurrentCampaign();
  const continuityId = useMemo(() => {
    const raw = params.continuityId;
    const paramValue = Array.isArray(raw) ? raw[0] : raw ?? '';
    return paramValue || currentCampaign?.continuityId || '';
  }, [currentCampaign?.continuityId, params.continuityId]);

  const templates = usePlayerCharacterTemplates(continuityId);
  const createTemplate = useCreatePlayerCharacterTemplate();
  const updateTemplate = useUpdatePlayerCharacterTemplate();
  const deleteTemplate = useDeletePlayerCharacterTemplate();
  const createCharacter = useCreatePlayerCharacter();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftPlayer, setDraftPlayer] = useState('');
  const [draftRace, setDraftRace] = useState('');
  const [draftClass, setDraftClass] = useState('');
  const [draftBackground, setDraftBackground] = useState('');

  const editingTemplate = editingTemplateId
    ? templates.find((template) => template.id === editingTemplateId)
    : undefined;

  const visibleTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return templates;
    return templates.filter((template) => {
      const name = template.name?.toLowerCase() ?? '';
      const player = template.player?.toLowerCase() ?? '';
      const race = template.race?.toLowerCase() ?? '';
      return name.includes(query) || player.includes(query) || race.includes(query);
    });
  }, [search, templates]);

  const openCreateModal = () => {
    setDraftName(`New Template ${templates.length + 1}`);
    setDraftPlayer('');
    setDraftRace('');
    setDraftClass('');
    setDraftBackground('');
    setEditingTemplateId(null);
    setError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (template: PlayerCharacterTemplate) => {
    setEditingTemplateId(template.id);
    setDraftName(template.name);
    setDraftPlayer(template.player);
    setDraftRace(template.race);
    setDraftClass(template.class);
    setDraftBackground(template.background);
    setError(null);
    setIsEditOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setError(null);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setError(null);
  };

  const handleSave = (isEdit: boolean) => {
    if (isSaving) return;
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setError('Template name is required.');
      return;
    }
    if (!continuityId) {
      setError('Select a continuity before saving templates.');
      return;
    }
    setIsSaving(true);
    try {
      if (isEdit && editingTemplate) {
        updateTemplate(editingTemplate.id, {
          name: trimmedName,
          player: draftPlayer.trim(),
          race: draftRace.trim(),
          class: draftClass.trim(),
          background: draftBackground.trim(),
        });
        setIsEditOpen(false);
      } else {
        createTemplate({
          name: trimmedName,
          player: draftPlayer.trim(),
          race: draftRace.trim(),
          class: draftClass.trim(),
          background: draftBackground.trim(),
          continuityId,
        });
        setIsCreateOpen(false);
      }
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'Failed to save template.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!editingTemplate || isDeleting) return;
    setIsDeleting(true);
    try {
      deleteTemplate(editingTemplate.id);
      setIsEditOpen(false);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : 'Failed to delete template.';
      setError(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleUseTemplate = (template: PlayerCharacterTemplate) => {
    if (!currentCampaign) return;
    try {
      const id = createCharacter({
        name: template.name,
        player: template.player,
        race: template.race,
        class: template.class,
        background: template.background,
        image: template.image,
        campaignIds: [currentCampaign.id],
      });
      router.push(`/player-character/${id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add character to campaign.';
      setError(message);
    }
  };

  if (!continuityId) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Character Templates' }} />
        <EmptyState
          title="No continuity selected"
          description="Select a campaign or continuity to view templates."
          icon="account-group-outline"
          action={{ label: 'Choose campaign', onPress: () => router.push('/campaigns') }}
        />
      </Screen>
    );
  }

  if (templates.length === 0) {
    return (
      <>
        <Screen>
          <Stack.Screen options={{ title: 'Character Templates' }} />
          <EmptyState
            title="No templates yet"
            description="Create a template to speed up new party members."
            icon="account-group-outline"
            action={{ label: 'Create Template', onPress: openCreateModal }}
          />
          <Button
            mode="outlined"
            icon="account-multiple-plus"
            onPress={() =>
              currentCampaign ? router.push(`/campaign/${currentCampaign.id}/party`) : undefined
            }
            style={styles.secondaryAction}
            disabled={!currentCampaign}
          >
            View Party
          </Button>
        </Screen>
        {renderFormModal({
          title: 'New Template',
          visible: isCreateOpen,
          onDismiss: closeCreateModal,
          onSave: () => handleSave(false),
          isSaving,
          theme,
          draftName,
          setDraftName,
          draftPlayer,
          setDraftPlayer,
          draftRace,
          setDraftRace,
          draftClass,
          setDraftClass,
          draftBackground,
          setDraftBackground,
          error,
        })}
      </>
    );
  }

  return (
    <>
      <Screen scroll={false}>
        <Stack.Screen options={{ title: 'Character Templates' }} />
        <FlatList
          data={visibleTemplates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={commonStyles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <Section title="Continuity Library" icon="book-outline">
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {templates.length} template{templates.length === 1 ? '' : 's'}
                </Text>
              </Section>
              <FormTextInput
                label="Search"
                value={search}
                onChangeText={setSearch}
                placeholder="Search templates"
              />
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <AppCard
                title={item.name || 'Unnamed character'}
                subtitle={renderSubtitle(item)}
                onPress={() => openEditModal(item)}
                right={
                  <Button
                    mode="text"
                    icon="account-multiple-plus"
                    compact
                    disabled={!currentCampaign}
                    onPress={() => handleUseTemplate(item)}
                  >
                    Add
                  </Button>
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No results"
              description="Try a different search term."
              icon="account-search-outline"
            />
          }
        />
        <Button
          mode="contained"
          icon="plus"
          onPress={openCreateModal}
          style={styles.fabButton}
        >
          New Template
        </Button>
        {error && (
          <View style={[commonStyles.flexRow, styles.errorRow]}>
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
      {renderFormModal({
        title: 'New Template',
        visible: isCreateOpen,
        onDismiss: closeCreateModal,
        onSave: () => handleSave(false),
        isSaving,
        theme,
        draftName,
        setDraftName,
        draftPlayer,
        setDraftPlayer,
        draftRace,
        setDraftRace,
        draftClass,
        setDraftClass,
        draftBackground,
        setDraftBackground,
        error,
      })}
      {renderFormModal({
        title: 'Edit Template',
        visible: isEditOpen,
        onDismiss: closeEditModal,
        onSave: () => handleSave(true),
        isSaving,
        theme,
        draftName,
        setDraftName,
        draftPlayer,
        setDraftPlayer,
        draftRace,
        setDraftRace,
        draftClass,
        setDraftClass,
        draftBackground,
        setDraftBackground,
        error,
        extraActions: (
          <Button
            mode="text"
            icon="delete"
            textColor={theme.colors.error}
            onPress={() => setIsDeleteOpen(true)}
            disabled={isSaving}
          >
            Delete
          </Button>
        ),
      })}
      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete template?"
        description="This will not affect characters already created from it."
        confirmLabel="Delete"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
    </>
  );
}

type FormModalProps = {
  title: string;
  visible: boolean;
  onDismiss: () => void;
  onSave: () => void;
  isSaving: boolean;
  theme: { colors: { error: string } };
  draftName: string;
  setDraftName: (value: string) => void;
  draftPlayer: string;
  setDraftPlayer: (value: string) => void;
  draftRace: string;
  setDraftRace: (value: string) => void;
  draftClass: string;
  setDraftClass: (value: string) => void;
  draftBackground: string;
  setDraftBackground: (value: string) => void;
  error: string | null;
  extraActions?: ReactNode;
};

/**
 * Render a form modal used to create or edit a player character template.
 *
 * @param extraActions - Optional additional action buttons to include in the modal's action bar.
 * @param error - Optional error message to display below the inputs (styled with the provided theme).
 * @returns The FormModal element containing inputs for Name, Player, Race, Class, Background and the action buttons.
 */
function renderFormModal({
  title,
  visible,
  onDismiss,
  onSave,
  isSaving,
  theme,
  draftName,
  setDraftName,
  draftPlayer,
  setDraftPlayer,
  draftRace,
  setDraftRace,
  draftClass,
  setDraftClass,
  draftBackground,
  setDraftBackground,
  error,
  extraActions,
}: FormModalProps) {
  return (
    <FormModal
      title={title}
      visible={visible}
      onDismiss={onDismiss}
      actions={
        <>
          {extraActions}
          <ModalActions
            onCancel={onDismiss}
            onConfirm={onSave}
            confirmLabel="Save"
            loading={isSaving}
            disabled={isSaving}
          />
        </>
      }
    >
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      <FormTextInput label="Player" value={draftPlayer} onChangeText={setDraftPlayer} />
      <FormTextInput label="Race" value={draftRace} onChangeText={setDraftRace} />
      <FormTextInput label="Class" value={draftClass} onChangeText={setDraftClass} />
      <FormTextInput
        label="Background"
        value={draftBackground}
        onChangeText={setDraftBackground}
        multiline
        style={styles.backgroundInput}
      />
      {error && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {error}
        </Text>
      )}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing[3],
  },
  cardWrapper: {
    marginBottom: spacing[2],
  },
  backgroundInput: {
    minHeight: 120,
  },
  errorRow: {
    gap: spacing[2],
    marginTop: spacing[2],
  },
  fabButton: {
    marginTop: spacing[3],
  },
  secondaryAction: {
    marginTop: spacing[3],
    alignSelf: 'center',
  },
});
