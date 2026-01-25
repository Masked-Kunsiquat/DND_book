/**
 * Display for sync room codes.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';

export interface RoomCodeDisplayProps {
  /** Room code value */
  code?: string | null;
  /** Optional helper message */
  helperText?: string;
}

export function RoomCodeDisplay({ code, helperText }: RoomCodeDisplayProps) {
  const { theme } = useTheme();
  const displayCode = useMemo(() => {
    if (!code) return '— — —';
    return code.toUpperCase();
  }, [code]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
      ]}
    >
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Room Code
      </Text>
      <Text variant="headlineMedium" style={[styles.codeText, { color: theme.colors.onSurface }]}>
        {displayCode}
      </Text>
      {helperText ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    gap: spacing[2],
  },
  codeText: {
    letterSpacing: 2,
  },
});
