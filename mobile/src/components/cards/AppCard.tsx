/**
 * Themed card component for displaying content.
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';

export interface AppCardProps {
  /** Card title */
  title?: string;
  /** Card subtitle or description */
  subtitle?: string;
  /** Content to render inside the card */
  children?: React.ReactNode;
  /** Right content (e.g., icons, badges) */
  right?: React.ReactNode;
  /** Called when card is pressed */
  onPress?: () => void;
  /** Called when card is long pressed */
  onLongPress?: () => void;
  /** Additional style for the card container */
  style?: object;
}

export function AppCard({
  title,
  subtitle,
  children,
  right,
  onPress,
  onLongPress,
  style,
}: AppCardProps) {
  const { theme } = useTheme();

  const cardContent = (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }, style]} mode="contained">
      {(title || subtitle || right) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && (
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface }}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {right && <View style={styles.right}>{right}</View>}
        </View>
      )}
      {children && <View style={styles.content}>{children}</View>}
    </Card>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.cardBorderRadius,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: layout.cardPadding,
    gap: spacing[3],
  },
  headerText: {
    flex: 1,
    gap: spacing[1],
  },
  right: {
    flexShrink: 0,
  },
  content: {
    paddingHorizontal: layout.cardPadding,
    paddingBottom: layout.cardPadding,
  },
  pressed: {
    opacity: 0.7,
  },
});
