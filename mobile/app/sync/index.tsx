import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { PeerList, RoomCodeDisplay, Screen, Section } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import { useSync } from '../../src/hooks';
import { isSyncSupported } from '../../src/store/sync';

export default function SyncHubScreen() {
  const { theme } = useTheme();
  const { state, inSession, leave, isLoading, error } = useSync();
  const syncSupported = isSyncSupported();

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
          <RoomCodeDisplay
            code={state.roomId}
            helperText={
              inSession ? `Room ${roomLabel}` : 'Start a session to sync your data.'
            }
          />
          <View style={styles.statusRow}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Connection: {statusLabel}
            </Text>
          </View>
          <PeerList peerCount={state.peerCount} />
        </Section>

        <Section title="Actions" icon="lightning-bolt">
          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="wifi"
              onPress={() => router.push('/sync/host')}
              disabled={!syncSupported || isLoading || inSession}
            >
              Host Session
            </Button>
            <Button
              mode="outlined"
              icon="account-multiple-plus"
              onPress={() => router.push('/sync/join')}
              disabled={!syncSupported || isLoading || inSession}
            >
              Join Session
            </Button>
            {inSession && (
              <Button
                mode="text"
                icon="exit-to-app"
                onPress={handleLeave}
                disabled={!syncSupported || isLoading}
              >
                Leave Session
              </Button>
            )}
          </View>
          {!syncSupported ? (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              P2P sync is not supported on native yet.
            </Text>
          ) : (
            error && (
              <Text
                variant="bodySmall"
                style={[styles.errorText, { color: theme.colors.error }]}
              >
                {error}
              </Text>
            )
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
