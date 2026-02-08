import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import ColorPicker, { Swatches } from 'reanimated-color-picker';
import { AttachStep } from 'react-native-spotlight-tour';
import {
  AppCard,
  EmptyState,
  FormModal,
  FormSelect,
  FormTextInput,
  ModalActions,
  Screen,
  TagChip,
} from '../src/components';
import { TOUR_STEP } from '../src/onboarding';
import { useTheme } from '../src/theme/ThemeProvider';
import { commonStyles, layout, spacing, tagColors } from '../src/theme';
import {
  useCreateTag,
  useCurrentCampaign,
  useLocations,
  useNotes,
  useNpcs,
  usePullToRefresh,
  useSessionLogs,
  useTags,
} from '../src/hooks';

type TagUsage = {
  notes: number;
  npcs: number;
  locations: number;
  sessions: number;
};

const EMPTY_USAGE: TagUsage = { notes: 0, npcs: 0, locations: 0, sessions: 0 };
const TAG_SWATCHES = tagColors.map((tag) => tag.bg);

function buildUsageLabel(usage: TagUsage): string {
  const parts: string[] = [];
  if (usage.notes > 0) parts.push(`${usage.notes} note${usage.notes === 1 ? '' : 's'}`);
  if (usage.npcs > 0) parts.push(`${usage.npcs} npc${usage.npcs === 1 ? '' : 's'}`);
  if (usage.locations > 0)
    parts.push(`${usage.locations} location${usage.locations === 1 ? '' : 's'}`);
  if (usage.sessions > 0)
    parts.push(`${usage.sessions} session${usage.sessions === 1 ? '' : 's'}`);
  return parts.length > 0 ? parts.join(' • ') : 'Unused tag';
}

/**
 * Displays a searchable, sorted list of tags with per-tag usage indicators and a modal to create new tags.
 *
 * Shows pull-to-refreshable tag list, a search input, empty states for no tags or no search results, and a FAB to open a creation modal.
 * The creation modal allows choosing a name, color, and scope (continuity or campaign) and enforces duplicate and scope-related validation.
 *
 * @returns A React element rendering the Tags screen with list, search, pull-to-refresh, and tag-creation UI.
 */
export default function TagsScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ continuityId?: string | string[] }>();
  const currentCampaign = useCurrentCampaign();
  const continuityId = useMemo(() => {
    const raw = params.continuityId;
    const paramValue = Array.isArray(raw) ? raw[0] : raw ?? '';
    return paramValue || currentCampaign?.continuityId || '';
  }, [currentCampaign?.continuityId, params.continuityId]);
  const tags = useTags(continuityId, currentCampaign?.id);
  const notes = useNotes(continuityId, currentCampaign?.id);
  const npcs = useNpcs(currentCampaign?.id);
  const locations = useLocations(currentCampaign?.id);
  const sessionLogs = useSessionLogs(currentCampaign?.id);
  const createTag = useCreateTag();
  const { refreshing, onRefresh } = usePullToRefresh();
  const [query, setQuery] = useState('');
  const defaultTagColor = TAG_SWATCHES[0] ?? theme.colors.primary;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState<string>(defaultTagColor);
  const [draftScope, setDraftScope] = useState<'continuity' | 'campaign'>('continuity');

  const tagUsage = useMemo(() => {
    const map = new Map<string, TagUsage>();
    const ensure = (id: string) => {
      if (!map.has(id)) {
        map.set(id, { ...EMPTY_USAGE });
      }
      return map.get(id)!;
    };
    const add = (ids: string[], key: keyof TagUsage) => {
      ids.forEach((id) => {
        const entry = ensure(id);
        entry[key] += 1;
      });
    };

    notes.forEach((note) => add(note.tagIds, 'notes'));
    npcs.forEach((npc) => add(npc.tagIds, 'npcs'));
    locations.forEach((location) => add(location.tagIds, 'locations'));
    sessionLogs.forEach((log) => add(log.tagIds, 'sessions'));
    return map;
  }, [notes, npcs, locations, sessionLogs]);

  const filteredTags = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = normalized
      ? tags.filter((tag) => tag.name.toLowerCase().includes(normalized))
      : tags;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [tags, query]);

  const tagNameSet = useMemo(() => {
    return new Set(tags.map((tag) => tag.name.toLowerCase()));
  }, [tags]);

  const openCreateModal = () => {
    setDraftName('');
    setDraftColor(defaultTagColor);
    setDraftScope('continuity');
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
      setCreateError('Tag name is required.');
      return;
    }
    if (tagNameSet.has(trimmed.toLowerCase())) {
      setCreateError('A tag with this name already exists.');
      return;
    }
    if (!continuityId) {
      setCreateError('Select a campaign or continuity first.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const scope = draftScope;
      const campaignId = scope === 'campaign' ? currentCampaign?.id ?? '' : '';
      if (scope === 'campaign' && !campaignId) {
        setCreateError('Select a campaign to create a campaign-only tag.');
        setIsCreating(false);
        return;
      }
      createTag({
        name: trimmed,
        color: draftColor,
        scope,
        continuityId,
        campaignId,
      });
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create tag.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const createModal = (
    <FormModal
      title="New Tag"
      visible={isCreateOpen}
      onDismiss={closeCreateModal}
      actions={
        <ModalActions
          onCancel={closeCreateModal}
          onConfirm={handleCreate}
          confirmLabel="Create"
          loading={isCreating}
          disabled={isCreating}
        />
      }
    >
      <FormTextInput label="Name" value={draftName} onChangeText={setDraftName} />
      <FormSelect
        label="Scope"
        value={draftScope}
        options={[
          { label: 'Shared in continuity', value: 'continuity' },
          { label: 'Campaign only', value: 'campaign' },
        ]}
        onChange={(value) => setDraftScope(value as 'continuity' | 'campaign')}
        helperText="Shared tags are available to every campaign in this continuity."
      />
      <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
        Color
      </Text>
      <View style={styles.colorPreviewRow}>
        <TagChip
          id="preview"
          name={draftName.trim() || 'New tag'}
          color={draftColor}
          size="small"
        />
      </View>
      <ColorPicker value={draftColor} onChangeJS={(color) => setDraftColor(color.hex)}>
        <Swatches
          colors={TAG_SWATCHES}
          style={styles.swatches}
          swatchStyle={styles.swatch}
        />
      </ColorPicker>
      {createError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      )}
    </FormModal>
  );

  if (tags.length === 0) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <Stack.Screen options={{ title: 'Tags' }} />
          <EmptyState
            title="No tags yet"
            description="Create a tag to start organizing your content."
            icon="tag-outline"
            action={!isCreating ? { label: 'Create Tag', onPress: openCreateModal } : undefined}
          />
        </Screen>
        {createModal}
      </>
    );
  }

  if (filteredTags.length === 0) {
    return (
      <>
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <Stack.Screen options={{ title: 'Tags' }} />
          <EmptyState
            title="No tags match your search"
            description="Try clearing the search query."
            icon="tag-outline"
            action={{ label: 'Clear Search', onPress: () => setQuery('') }}
          />
        </Screen>
        {createModal}
      </>
    );
  }

  return (
    <>
      <Screen scroll={false}>
        <Stack.Screen options={{ title: 'Tags' }} />
        <FlatList
          data={filteredTags}
          keyExtractor={(tag) => tag.id}
          contentContainerStyle={commonStyles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <AttachStep index={TOUR_STEP.TAGS_USAGE}>
              <View style={styles.header}>
                <View style={commonStyles.flexRow}>
                  <MaterialCommunityIcons
                    name="tag-outline"
                    size={18}
                    color={theme.colors.primary}
                    style={styles.listHeaderIcon}
                  />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    Tags
                  </Text>
                </View>
                <TextInput
                  mode="outlined"
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search tags..."
                />
              </View>
            </AttachStep>
          }
          renderItem={({ item }) => {
            const usage = tagUsage.get(item.id) ?? EMPTY_USAGE;
            return (
              <View style={styles.cardWrapper}>
                <AppCard
                  title={item.name}
                  subtitle={buildUsageLabel(usage)}
                  onPress={() => router.push(`/tag/${item.id}`)}
                  right={
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  }
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
    gap: spacing[2],
  },
  listHeaderIcon: {
    marginRight: spacing[2],
  },
  cardWrapper: {
    marginBottom: spacing[3],
  },
  colorPreviewRow: {
    alignItems: 'flex-start',
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  swatch: {
    width: '24%',
    aspectRatio: 1,
    marginHorizontal: 0,
    marginBottom: spacing[2],
    borderRadius: 999,
  },
});
