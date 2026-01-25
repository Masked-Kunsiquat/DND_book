/**
 * Empty state component for when lists have no items.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, iconSizes } from '../../theme';

export interface EmptyStateProps {
  /** Main message */
  title: string;
  /** Optional description */
  description?: string;
  /** Icon name from MaterialCommunityIcons */
  icon?: string;
  /** Optional action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ title, description, icon = 'folder-open-outline', action }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon as any}
        size={iconSizes['2xl']}
        color={theme.colors.onSurfaceVariant}
        style={styles.icon}
      />
      <Text
        variant="titleMedium"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        {title}
      </Text>
      {description && (
        <Text
          variant="bodyMedium"
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {description}
        </Text>
      )}
      {action && (
        <Button
          mode="contained"
          onPress={action.onPress}
          style={styles.button}
        >
          {action.label}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  icon: {
    marginBottom: spacing[4],
    opacity: 0.6,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  button: {
    marginTop: spacing[2],
  },
});
