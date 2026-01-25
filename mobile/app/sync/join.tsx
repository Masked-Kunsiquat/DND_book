import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Stack } from 'expo-router';
import { FormTextInput, Screen, Section } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import { useSync } from '../../src/hooks';
import { isSyncSupported } from '../../src/store/sync';

export default function SyncJoinScreen() {
  const { theme } = useTheme();
  const { state, inSession, join, leave, isLoading, error } = useSync();
  const syncSupported = isSyncSupported();
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoin = useCallback(async () => {
    if (isLoading) return;
    const trimmed = roomCode.trim();
    if (!trimmed) {
      setJoinError('Enter a room code to join.');
      return;
    }
    setJoinError(null);
    try {
      await join(trimmed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join session.';
      setJoinError(message);
    }
  }, [isLoading, join, roomCode]);

  const handleLeave = useCallback(async () => {
    if (isLoading) return;
    try {
      await leave();
    } catch {
      // useSync already captures errors for display.
    }
  }, [leave, isLoading]);

  const statusText = useMemo(() => {
    if (inSession && state.roomId) {
      return `Connected to ${state.roomId}`;
    }
    return 'Not connected yet.';
  }, [inSession, state.roomId]);

  const message = joinError ?? error;

  return (
    <>
      <Stack.Screen options={{ title: 'Join Session' }} />
      <Screen>
        <Section title="Join" icon="account-multiple-plus">
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Enter a room code shared by the host (example: ABC-123).
          </Text>
          <FormTextInput
            label="Room code"
            value={roomCode}
            onChangeText={(value) => setRoomCode(value.toUpperCase())}
            helperText={statusText}
          />
          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="login"
              onPress={handleJoin}
              disabled={!syncSupported || isLoading || inSession}
              loading={syncSupported && isLoading && !inSession}
            >
              Join Session
            </Button>
            <Button
              mode="outlined"
              icon="exit-to-app"
              onPress={handleLeave}
              disabled={!syncSupported || !inSession || isLoading}
            >
              Leave Session
            </Button>
          </View>
          {!syncSupported ? (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              P2P sync is not supported on native yet.
            </Text>
          ) : (
            message && (
              <Text
                variant="bodySmall"
                style={[styles.errorText, { color: theme.colors.error }]}
              >
                {message}
              </Text>
            )
          )}
        </Section>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing[2],
    gap: spacing[2],
  },
  errorText: {
    marginTop: spacing[2],
  },
});
