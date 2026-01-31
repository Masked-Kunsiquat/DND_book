import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, Text } from 'react-native-paper';
import {
  AppCard,
  EmptyState,
  FormTextInput,
  Screen,
  Section,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, layout, spacing } from '../../src/theme';
import { useCurrentCampaign, useNotes, useUpdateNote } from '../../src/hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Render the Notes Library screen for a continuity, allowing browsing, searching, and linking notes to the current campaign.
 *
 * Shows an empty state when no continuity is selected or when there are no shared continuity notes; otherwise displays a searchable list of continuity-scoped notes with controls to add or remove the current campaign from a note's linked campaigns.
 *
 * @returns The Notes Library screen as a React element.
 */
export default function NotesLibraryScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ continuityId?: string | string[] }>();
  const currentCampaign = useCurrentCampaign();
  const updateNote = useUpdateNote();

  const continuityId = useMemo(() => {
    const raw = params.continuityId;
    const paramValue = Array.isArray(raw) ? raw[0] : raw ?? '';
    return paramValue || currentCampaign?.continuityId || '';
  }, [currentCampaign?.continuityId, params.continuityId]);
  const allNotes = useNotes(continuityId);

  const [search, setSearch] = useState('');
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continuityNotes = useMemo(() => {
    if (!continuityId) return [];
    return allNotes.filter((note) => note.scope === 'continuity');
  }, [allNotes, continuityId]);

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return continuityNotes;
    return continuityNotes.filter((note) => {
      const title = note.title?.toLowerCase() ?? '';
      const content = note.content?.toLowerCase() ?? '';
      return title.includes(query) || content.includes(query);
    });
  }, [continuityNotes, search]);

  const toggleLink = (noteId: string, linkedCampaignIds: string[]) => {
    if (!currentCampaign) return;
    if (isUpdating) return;
    setIsUpdatingId(noteId);
    setIsUpdating(true);
    setError(null);
    try {
      const ids = new Set(linkedCampaignIds);
      if (ids.has(currentCampaign.id)) {
        ids.delete(currentCampaign.id);
      } else {
        ids.add(currentCampaign.id);
      }
      const nextCampaignIds = [...ids];
      updateNote(noteId, { campaignIds: nextCampaignIds });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update note.';
      setError(message);
    } finally {
      setIsUpdatingId(null);
      setIsUpdating(false);
    }
  };

  if (!continuityId) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Notes Library' }} />
        <EmptyState
          title="No continuity selected"
          description="Select a campaign or continuity to view shared notes."
          icon="note-text-outline"
          action={{ label: 'Choose campaign', onPress: () => router.push('/campaigns') }}
        />
      </Screen>
    );
  }

  if (continuityNotes.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Notes Library' }} />
        <EmptyState
          title="No shared notes yet"
          description="Share a note to your continuity to see it here."
          icon="note-text-outline"
          action={{ label: 'View Notes', onPress: () => router.push('/notes') }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ title: 'Notes Library' }} />
      <FlatList
        data={visibleNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Section title="Continuity Library" icon="book-outline">
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {continuityNotes.length} shared note{continuityNotes.length === 1 ? '' : 's'}
              </Text>
            </Section>
            <FormTextInput
              label="Search"
              value={search}
              onChangeText={setSearch}
              placeholder="Search shared notes"
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <AppCard
              title={item.title || 'Untitled note'}
              subtitle={item.content?.trim() ? item.content.slice(0, 80) : 'No content yet.'}
              onPress={() => router.push(`/note/${item.id}`)}
              right={
                <Button
                  mode="text"
                  icon={
                    currentCampaign && item.campaignIds.includes(currentCampaign.id)
                      ? 'link-off'
                      : 'link-plus'
                  }
                  compact
                  disabled={!currentCampaign || isUpdating}
                  onPress={() => toggleLink(item.id, item.campaignIds)}
                >
                  {currentCampaign && item.campaignIds.includes(currentCampaign.id)
                    ? 'Remove'
                    : 'Add'}
                </Button>
              }
            />
            {!currentCampaign && (
              <View style={styles.noticeRow}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={iconSizes.sm}
                    color={theme.colors.onSurfaceVariant}
                  />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Select a campaign to link shared notes.
                </Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No results"
            description="Try a different search term."
            icon="note-search-outline"
          />
        }
      />
      {error && (
        <View style={styles.errorRow}>
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
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: layout.fabSize,
  },
  header: {
    marginBottom: spacing[3],
  },
  cardWrapper: {
    marginBottom: spacing[2],
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
});
