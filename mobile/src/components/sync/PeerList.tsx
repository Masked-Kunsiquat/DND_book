/**
 * Peer count display for sync sessions.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

export interface PeerListProps {
  /** Number of connected peers */
  peerCount: number;
}

export function PeerList({ peerCount }: PeerListProps) {
  const { theme } = useTheme();
  const capped = Math.max(0, peerCount);
  const iconCount = useMemo(() => Math.min(capped, 4), [capped]);
  const extra = capped > iconCount ? capped - iconCount : 0;

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <View style={[styles.avatar, { borderColor: theme.colors.outlineVariant }]}>
          <MaterialCommunityIcons
            name="account"
            size={14}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
        {Array.from({ length: iconCount }).map((_, index) => (
          <View
            key={`peer-${index}`}
            style={[
              styles.avatar,
              { borderColor: theme.colors.outlineVariant, marginLeft: -spacing[1] },
            ]}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        ))}
        {extra > 0 && (
          <View
            style={[
              styles.avatar,
              styles.extraBadge,
              { borderColor: theme.colors.outlineVariant },
            ]}
          >
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              +{extra}
            </Text>
          </View>
        )}
      </View>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        You + {capped} peer{capped === 1 ? '' : 's'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: spacing[4],
    height: spacing[4],
    borderRadius: spacing[4] / 2,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraBadge: {
    backgroundColor: 'transparent',
  },
});
