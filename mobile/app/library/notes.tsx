import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';
import { EmptyState, FormTextInput, NoteCard, Screen, Section } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { layout, spacing } from '../../src/theme';
import { useCurrentCampaign, useNotes } from '../../src/hooks';

export default function NotesLibraryScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ continuityId?: string | string[] }>();
  const currentCampaign = useCurrentCampaign();
  const allNotes = useNotes();

  const continuityId = useMemo(() => {
    const raw = params.continuityId;
    const paramValue = Array.isArray(raw) ? raw[0] : raw ?? '';
    return paramValue || currentCampaign?.continuityId || '';
  }, [currentCampaign?.continuityId, params.continuityId]);

  const [search, setSearch] = useState('');

  const continuityNotes = useMemo(() => {
    if (!continuityId) return [];
    return allNotes.filter(
      (note) => note.scope === 'continuity' && note.continuityId === continuityId
    );
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
            <NoteCard
              note={item}
              onPress={() => router.push(`/note/${item.id}`)}
            />
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
});
