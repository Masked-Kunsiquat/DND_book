import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, List, Modal, Portal, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AttachStep } from 'react-native-spotlight-tour';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Screen, AppCard, Section, StatCard } from '../../src/components';
import { useCurrentCampaign } from '../../src/hooks/useCampaigns';
import { useNotes } from '../../src/hooks/useNotes';
import { useNpcs } from '../../src/hooks/useNpcs';
import { useLocations } from '../../src/hooks/useLocations';
import { useItems } from '../../src/hooks/useItems';
import { useTags } from '../../src/hooks/useTags';
import { iconSizes, spacing, semanticColors } from '../../src/theme';
import { TOUR_STEP, useTourControls } from '../../src/onboarding';

/**
 * Renders the Home dashboard screen for the app.
 *
 * Displays the current campaign status, aggregate statistics (Notes, NPCs, Locations, Items, Tags),
 * up to three recent notes, quick action buttons (create new campaign/session, party, sync), and
 * a modal menu for creating new campaigns or sessions. Navigation is triggered by the various
 * cards and action buttons; the "New Session" action is disabled when no campaign is selected.
 *
 * @returns The React element for the Home screen.
 */
export default function Home() {
  const { theme } = useTheme();
  const { isActive: isTourActive } = useTourControls();
  const currentCampaign = useCurrentCampaign();
  const notes = useNotes(currentCampaign?.continuityId, currentCampaign?.id);
  const npcs = useNpcs(currentCampaign?.id);
  const locations = useLocations(currentCampaign?.id);
  const items = useItems(currentCampaign?.id);
  const tags = useTags(currentCampaign?.continuityId, currentCampaign?.id);

  const recentNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => (b.updated || b.created).localeCompare(a.updated || a.created))
      .slice(0, 3);
  }, [notes]);

  const [newMenuVisible, setNewMenuVisible] = useState(false);

  const handleCreateCampaign = () => {
    router.push({ pathname: '/campaigns', params: { create: '1' } });
  };

  const openNewMenu = () => {
    setTimeout(() => setNewMenuVisible(true), 0);
  };

  const toggleNewMenu = () => {
    if (newMenuVisible) {
      setNewMenuVisible(false);
      return;
    }
    openNewMenu();
  };

  const closeNewMenu = () => setNewMenuVisible(false);

  const handleNewCampaign = () => {
    closeNewMenu();
    handleCreateCampaign();
  };

  const handleNewSession = () => {
    if (!currentCampaign) return;
    closeNewMenu();
    router.push({ pathname: '/sessions', params: { create: '1' } });
  };

  return (
    <Screen tourScrollKey="dashboard">
      <AttachStep index={TOUR_STEP.DASHBOARD_WELCOME} fill>
        <View style={styles.welcomeSection}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
            Welcome
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Your campaign dashboard at a glance
          </Text>
        </View>
      </AttachStep>

      {isTourActive && (
        <AttachStep index={TOUR_STEP.TOUR_COMPLETE} fill>
          <View style={styles.tourCompleteSection}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              Ready to Go!
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              You've learned the basics of DND Book
            </Text>
          </View>
        </AttachStep>
      )}

      <AttachStep index={TOUR_STEP.DASHBOARD_CAMPAIGN_CARD} fill>
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
      </AttachStep>

      <AttachStep index={TOUR_STEP.DASHBOARD_STATS} fill>
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
              label="Items"
              value={items.length}
              onPress={() => router.push('/items')}
              layout="compact"
              icon={
                <MaterialCommunityIcons
                  name="treasure-chest-outline"
                  size={iconSizes.md}
                  color={theme.colors.primary}
                />
              }
            />
          </View>
          <View style={styles.statsRow}>
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
      </AttachStep>

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
              onPress={() => router.push(`/note/${note.id}`)}
            />
          ))
        )}
      </Section>

      <Section title="Quick Actions" icon="lightning-bolt">
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="plus"
            style={styles.actionButton}
            onPress={toggleNewMenu}
          >
            New...
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

      <Portal>
        <Modal
          visible={newMenuVisible}
          onDismiss={closeNewMenu}
          contentContainerStyle={[
            styles.menuSurface,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
          ]}
        >
          <List.Item
            title="New Campaign"
            left={(props) => <List.Icon {...props} icon="folder-plus-outline" />}
            onPress={handleNewCampaign}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <List.Item
            title="New Session"
            description={!currentCampaign ? 'Select a campaign first' : undefined}
            left={(props) => <List.Icon {...props} icon="calendar-plus" />}
            onPress={handleNewSession}
            disabled={!currentCampaign}
            titleStyle={{
              color: currentCampaign ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
            }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </Modal>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    marginBottom: spacing[4],
  },
  tourCompleteSection: {
    marginBottom: spacing[4],
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
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
  menuSurface: {
    marginHorizontal: spacing[4],
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: spacing[1],
    minWidth: 220,
    alignSelf: 'center',
  },
});