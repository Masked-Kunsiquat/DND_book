/**
 * Floating sync status pill.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';
import { useSync } from '../../hooks';

export interface SyncStatusProps {
  /** Optional press handler */
  onPress?: () => void;
  /** Optional container style */
  style?: object;
}

export function SyncStatus({ onPress, style }: SyncStatusProps) {
  const { theme } = useTheme();
  const { state, inSession, isLoading } = useSync();

  const status = inSession
    ? state.isConnected
      ? 'Synced'
      : 'Connecting'
    : 'Sync Off';
  const subtitle = inSession ? `${state.peerCount} peer${state.peerCount === 1 ? '' : 's'}` : '';
  const icon = inSession ? 'sync' : 'sync-off';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={inSession ? theme.colors.primary : theme.colors.onSurfaceVariant}
      />
      <View style={styles.textStack}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurface }}>
          {isLoading ? 'Syncing…' : status}
        </Text>
        {subtitle ? (
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[1.5],
    paddingHorizontal: spacing[2],
    borderRadius: 999,
    borderWidth: 1,
    position: 'absolute',
    right: spacing[3],
    bottom: spacing[6],
    zIndex: 10,
  },
  textStack: {
    gap: spacing[0.5],
  },
  pressed: {
    opacity: 0.8,
  },
});
