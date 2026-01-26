import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from 'react-native-paper';
import { AppCard, Screen, Section } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';

export default function AppearanceSettingsScreen() {
  const { theme } = useTheme();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Appearance' }} />
      <Section title="Theme" icon="palette-outline">
        <AppCard title="Theme Mode" subtitle="Light, dark, or system (coming soon)." />
        <View style={styles.note}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Appearance settings will live here.
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
