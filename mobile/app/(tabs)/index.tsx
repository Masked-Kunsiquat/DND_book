import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Screen, AppCard, Section, StatCard } from '../../src/components';
import { useCurrentCampaign } from '../../src/hooks/useCampaigns';
import { useNotes } from '../../src/hooks/useNotes';
import { useNpcs } from '../../src/hooks/useNpcs';
import { useLocations } from '../../src/hooks/useLocations';
import { useTags } from '../../src/hooks/useTags';
import { iconSizes, spacing, semanticColors } from '../../src/theme';

export default function Home() {
  const { theme } = useTheme();
  const currentCampaign = useCurrentCampaign();
  const notes = useNotes(currentCampaign?.id);
  const npcs = useNpcs(currentCampaign?.id);
  const locations = useLocations(currentCampaign?.id);
  const tags = useTags();

  const recentNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => (b.updated || b.created).localeCompare(a.updated || a.created))
      .slice(0, 3);
  }, [notes]);

  const handleCreateCampaign = () => {
    router.push({ pathname: '/campaigns', params: { create: '1' } });
  };

  return (
    <Screen>
      <Section title="Current Campaign" icon="compass">
        <AppCard
          title={currentCampaign?.name || 'No campaign selected'}
          subtitle={
            currentCampaign ? 'Tap to switch campaigns' : 'Create or select a campaign to start'
          }
          onPress={() => router.push('/campaigns')}
          right={
            currentCampaign ? (
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color={semanticColors.success.main}
              />
            ) : (
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            )
          }
        />
      </Section>

      <Section title="Stats" icon="chart-box-outline">
        <View style={styles.statsRow}>
          <StatCard
            label="Notes"
            value={notes.length}
            onPress={() => router.push('/notes')}
            layout="compact"
            icon={
              <MaterialCommunityIcons
                name="note-text-outline"
                size={iconSizes.md}
                color={theme.colors.primary}
              />
            }
          />
          <StatCard
            label="NPCs"
            value={npcs.length}
            onPress={() => router.push('/npcs')}
            layout="compact"
            icon={
              <MaterialCommunityIcons
                name="account-group-outline"
                size={iconSizes.md}
                color={theme.colors.primary}
              />
            }
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="Locations"
            value={locations.length}
            onPress={() => router.push('/locations')}
            layout="compact"
            icon={
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={iconSizes.md}
                color={theme.colors.primary}
              />
            }
          />
          <StatCard
            label="Tags"
            value={tags.length}
            onPress={() => router.push('/tags')}
            layout="compact"
            icon={
              <MaterialCommunityIcons
                name="tag-outline"
                size={iconSizes.md}
                color={theme.colors.primary}
              />
            }
          />
        </View>
      </Section>

      <Section
        title="Recent Notes"
        icon="clock-outline"
        action={{ label: 'See All', onPress: () => router.push('/notes') }}
      >
        {recentNotes.length === 0 ? (
          <AppCard
            title="No notes yet"
            subtitle="Create your first note to see it here."
          />
        ) : (
          recentNotes.map((note) => (
            <AppCard
              key={note.id}
              title={note.title || 'Untitled note'}
              subtitle={note.content ? note.content.slice(0, 100) : 'No content yet'}
              onPress={() => router.push('/notes')}
            />
          ))
        )}
      </Section>

      <Section title="Quick Actions" icon="lightning-bolt">
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="folder-plus"
            style={styles.actionButton}
            onPress={handleCreateCampaign}
          >
            New Campaign
          </Button>
          <Button
            mode="outlined"
            icon="account-group-outline"
            style={styles.actionButton}
            onPress={() =>
              currentCampaign
                ? router.push(`/campaign/${currentCampaign.id}/party`)
                : undefined
            }
            disabled={!currentCampaign}
          >
            Party
          </Button>
          <Button
            mode="outlined"
            icon="sync"
            style={styles.actionButton}
            onPress={() => router.push('/sync')}
          >
            Sync
          </Button>
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
  },
});
