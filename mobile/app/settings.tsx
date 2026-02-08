import { StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button, Text } from 'react-native-paper';
import { AppCard, ComingSoonBadge, Screen, Section } from '../src/components';
import { useTheme } from '../src/theme/ThemeProvider';
import { spacing } from '../src/theme';
import { useTour, useTourControls } from '../src/onboarding';
import { useSeedData } from '../src/hooks';

const SETTINGS_ITEMS = [
  {
    title: 'Appearance',
    subtitle: 'Theme and display preferences.',
    route: '/settings/appearance',
  },
  {
    title: 'Mentions',
    subtitle: 'Trigger characters for inline references.',
    route: '/settings/mentions',
  },
  {
    title: 'Sync',
    subtitle: 'Session sync and sharing options.',
  },
  {
    title: 'Data',
    subtitle: 'Backups, export, and storage controls.',
  },
];

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { resetTour, hasCompletedTour } = useTour();
  const { startTour } = useTourControls();
  const { hasSeedData, loadSeedData, clearSeedData } = useSeedData();

  const handleRestartTour = () => {
    resetTour();
    router.back();
    // Small delay to ensure navigation completes before starting tour
    setTimeout(() => {
      startTour();
    }, 300);
  };

  const handleLoadDemoData = () => {
    loadSeedData();
    resetTour();
    router.replace('/');
    // Small delay to ensure navigation completes before starting tour
    setTimeout(() => {
      startTour();
    }, 300);
  };

  const handleClearDemoData = () => {
    clearSeedData();
    router.replace('/');
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Settings' }} />
      <Section title="General" icon="cog-outline">
        {SETTINGS_ITEMS.map((item) => (
          <AppCard
            key={item.title}
            title={item.title}
            subtitle={item.subtitle}
            onPress={item.route ? () => router.push(item.route) : undefined}
            right={item.route ? undefined : <ComingSoonBadge />}
          />
        ))}
        <View style={styles.note}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            More settings are coming soon.
          </Text>
        </View>
      </Section>

      <Section title="Onboarding" icon="school-outline">
        <AppCard
          title="Restart Tour"
          subtitle="Walk through the app features again."
          onPress={handleRestartTour}
        />
        {hasSeedData ? (
          <AppCard
            title="Clear Demo Data"
            subtitle="Remove the Odyssey demo campaign and start fresh."
            onPress={handleClearDemoData}
          />
        ) : (
          <AppCard
            title="Load Demo Data"
            subtitle="Load the Odyssey demo campaign and restart the tour."
            onPress={handleLoadDemoData}
          />
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    marginTop: spacing[1],
  },
});
