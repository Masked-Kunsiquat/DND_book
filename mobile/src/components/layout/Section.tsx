/**
 * Section component for grouping related content with a header.
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, iconSizes } from '../../theme';

export interface SectionProps {
  /** Section title */
  title: string;
  /** Optional right action (e.g., "See All") */
  action?: {
    label: string;
    onPress: () => void;
  };
  /** Section content */
  children: React.ReactNode;
  /** Icon name from MaterialCommunityIcons */
  icon?: string;
  /** Additional style */
  style?: object;
}

export function Section({ title, action, children, icon, style }: SectionProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {icon && (
            <MaterialCommunityIcons
              name={icon as any}
              size={iconSizes.md}
              color={theme.colors.primary}
              style={styles.icon}
            />
          )}
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {title}
          </Text>
        </View>
        {action && (
          <Pressable onPress={action.onPress} hitSlop={8}>
            <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
              {action.label}
            </Text>
          </Pressable>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing[2],
  },
  content: {
    gap: spacing[3],
  },
});
