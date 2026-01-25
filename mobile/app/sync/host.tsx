import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Stack } from 'expo-router';
import { PeerList, RoomCodeDisplay, Screen, Section } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import { useSync } from '../../src/hooks';

export default function SyncHostScreen() {
  const { theme } = useTheme();
  const { state, inSession, host, leave, isLoading, error } = useSync();

  const handleHost = useCallback(async () => {
    if (isLoading) return;
    try {
      await host();
    } catch {
      // useSync already captures errors for display.
    }
  }, [host, isLoading]);

  const handleLeave = useCallback(async () => {
    if (isLoading) return;
    try {
      await leave();
    } catch {
      // useSync already captures errors for display.
    }
  }, [leave, isLoading]);

  const statusLabel = state.isConnected ? 'Connected' : 'Disconnected';
  const roomCode = state.roomId ?? '';
  const helperText = useMemo(() => {
    if (inSession) {
      return 'Share this room code with other players to sync.';
    }
    return 'Start hosting to generate a room code.';
  }, [inSession]);

  return (
    <>
      <Stack.Screen options={{ title: 'Host Session' }} />
      <Screen>
        <Section title="Room Code" icon="wifi">
          <RoomCodeDisplay code={roomCode} helperText={helperText} />
          <View style={styles.roomMeta}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Status: {statusLabel}
            </Text>
          </View>
          <PeerList peerCount={state.peerCount} />
        </Section>

        <Section title="Controls" icon="toggle-switch">
          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="wifi"
              onPress={handleHost}
              disabled={isLoading || inSession}
              loading={isLoading && !inSession}
            >
              Start Hosting
            </Button>
            <Button
              mode="outlined"
              icon="stop"
              onPress={handleLeave}
              disabled={!inSession || isLoading}
            >
              Stop Hosting
            </Button>
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
  roomMeta: {
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
