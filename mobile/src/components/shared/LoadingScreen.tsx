/**
 * Full-screen loading indicator.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

interface LoadingScreenProps {
  /** Optional message to display */
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && (
        <Text
          variant="bodyMedium"
          style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: spacing[4],
  },
});
