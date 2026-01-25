/**
 * Breadcrumb navigation component with optional controls.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { iconSizes, layout, spacing } from '../../theme';

export interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
  icon?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: 'default' | 'solid';
  containerStyle?: object;
  onBack?: () => void;
  onForward?: () => void;
}

export function Breadcrumb({
  items,
  variant = 'default',
  containerStyle,
  onBack,
  onForward,
}: BreadcrumbProps) {
  const { theme } = useTheme();
  const hasControls = Boolean(onBack || onForward);

  return (
    <View
      style={[
        styles.container,
        variant === 'solid' && {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
        containerStyle,
      ]}
    >
      {hasControls && (
        <View style={styles.controls}>
          <Pressable
            onPress={onBack}
            disabled={!onBack}
            style={({ pressed }) => [
              styles.controlButton,
              styles.controlLeft,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outlineVariant,
                opacity: onBack ? (pressed ? 0.7 : 1) : 0.4,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={iconSizes.md}
              color={theme.colors.onSurface}
            />
          </Pressable>
          <Pressable
            onPress={onForward}
            disabled={!onForward}
            style={({ pressed }) => [
              styles.controlButton,
              styles.controlRight,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outlineVariant,
                opacity: onForward ? (pressed ? 0.7 : 1) : 0.4,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={iconSizes.md}
              color={theme.colors.onSurface}
            />
          </Pressable>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = (
            <>
              {item.icon && (
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={iconSizes.sm}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.itemIcon}
                />
              )}
              <Text
                numberOfLines={1}
                variant="labelMedium"
                style={[
                  styles.itemText,
                  { color: isLast ? theme.colors.onSurfaceVariant : theme.colors.onSurface },
                ]}
              >
                {item.label}
              </Text>
            </>
          );

          return (
            <View key={`${item.label}-${index}`} style={styles.item}>
              {item.onPress && !isLast ? (
                <Pressable onPress={item.onPress} hitSlop={6}>
                  <View style={styles.itemRow}>{content}</View>
                </Pressable>
              ) : (
                <View style={styles.itemRow}>{content}</View>
              )}
              {!isLast && (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={iconSizes.sm}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.separator}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  controls: {
    flexDirection: 'row',
    marginRight: spacing[2],
  },
  controlButton: {
    width: spacing[8],
    height: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  controlLeft: {
    borderTopLeftRadius: layout.cardBorderRadius,
    borderBottomLeftRadius: layout.cardBorderRadius,
  },
  controlRight: {
    borderTopRightRadius: layout.cardBorderRadius,
    borderBottomRightRadius: layout.cardBorderRadius,
    marginLeft: -1,
  },
  scrollContent: {
    alignItems: 'center',
    gap: spacing[2],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  itemIcon: {
    marginRight: spacing[1],
  },
  itemText: {
    maxWidth: 180,
  },
  separator: {
    marginLeft: spacing[2],
  },
});
