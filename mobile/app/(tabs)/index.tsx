import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Screen, AppCard, Section } from '../../src/components';
import { spacing, semanticColors } from '../../src/theme';

export default function Home() {
  const store = useStore();
  const { theme } = useTheme();
  const deviceId = store.getValue('deviceId') as string;

  return (
    <Screen>
      <View style={styles.hero}>
        <MaterialCommunityIcons
          name="book-open-page-variant"
          size={64}
          color={theme.colors.primary}
        />
        <Text variant="displaySmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          DND Book
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Campaign Management
        </Text>
      </View>

      <Section title="Status" icon="check-circle">
        <AppCard
          title="Phase 4.1 Complete"
          subtitle="Theme system and base components ready"
        >
          <View style={styles.statusRow}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color={semanticColors.success.main}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              React Native Paper integrated
            </Text>
          </View>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color={semanticColors.success.main}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Centralized theme with dark/light modes
            </Text>
          </View>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color={semanticColors.success.main}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Base UI components created
            </Text>
          </View>
        </AppCard>
      </Section>

      <Section title="Quick Actions" icon="lightning-bolt">
        <View style={styles.actions}>
          <Button mode="contained" icon="folder-plus" style={styles.actionButton}>
            New Campaign
          </Button>
          <Button mode="outlined" icon="sync" style={styles.actionButton}>
            Sync Session
          </Button>
        </View>
      </Section>

      <View style={styles.footer}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Device ID: {deviceId?.slice(0, 8)}...
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  title: {
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
});
