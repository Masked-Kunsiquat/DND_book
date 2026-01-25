import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { AppCard, Screen, Section } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import { useSync } from '../../src/hooks';

export default function SyncHubScreen() {
  const { theme } = useTheme();
  const { state, inSession, leave, isLoading, error } = useSync();

  const handleLeave = useCallback(async () => {
    if (isLoading) return;
    try {
      await leave();
    } catch {
      // useSync already captures errors for display.
    }
  }, [leave, isLoading]);

  const statusLabel = state.isConnected ? 'Connected' : 'Disconnected';
  const roomLabel = state.roomId ?? '—';

  return (
    <>
      <Stack.Screen options={{ title: 'Sync' }} />
      <Screen>
        <Section title="Status" icon="sync">
          <AppCard
            title={inSession ? 'Active session' : 'No active session'}
            subtitle={inSession ? `Room ${roomLabel}` : 'Start a session to sync your data.'}
          >
            <View style={styles.statusRow}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Connection: {statusLabel}
              </Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Peers: {state.peerCount}
              </Text>
            </View>
          </AppCard>
        </Section>

        <Section title="Actions" icon="lightning-bolt">
          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="wifi"
              onPress={() => router.push('/sync/host')}
              disabled={isLoading || inSession}
            >
              Host Session
            </Button>
            <Button
              mode="outlined"
              icon="account-multiple-plus"
              onPress={() => router.push('/sync/join')}
              disabled={isLoading || inSession}
            >
              Join Session
            </Button>
            {inSession && (
              <Button
                mode="text"
                icon="exit-to-app"
                onPress={handleLeave}
                disabled={isLoading}
              >
                Leave Session
              </Button>
            )}
          </View>
          {error && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}
        </Section>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    marginTop: spacing[2],
    gap: spacing[1],
  },
  actions: {
    gap: spacing[2],
  },
  errorText: {
    marginTop: spacing[2],
  },
});
