import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from 'react-native-paper';
import { AppCard, Screen, Section } from '../src/components';
import { useTheme } from '../src/theme/ThemeProvider';
import { spacing } from '../src/theme';

const SETTINGS_ITEMS = [
  {
    title: 'Appearance',
    subtitle: 'Theme and display preferences.',
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

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Settings' }} />
      <Section title="General" icon="cog-outline">
        {SETTINGS_ITEMS.map((item) => (
          <AppCard key={item.title} title={item.title} subtitle={item.subtitle} />
        ))}
        <View style={styles.note}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            More settings are coming soon.
          </Text>
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    marginTop: spacing[1],
  },
});
