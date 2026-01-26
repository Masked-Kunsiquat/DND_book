/**
 * Compact overlapping avatar group for related entities.
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { iconSizes, spacing } from '../../theme';

export interface AvatarGroupItem {
  id: string;
  name?: string;
  image?: string | null;
}

export interface AvatarGroupProps {
  items: AvatarGroupItem[];
  size?: number;
  max?: number;
  style?: object;
}

export function AvatarGroup({
  items,
  size = spacing[8],
  max = 4,
  style,
}: AvatarGroupProps) {
  const { theme } = useTheme();
  const visibleItems = items.slice(0, max);
  const extraCount = items.length - visibleItems.length;

  return (
    <View style={[styles.row, style]}>
      {visibleItems.map((item, index) => {
        const initial = item.name?.trim().charAt(0).toUpperCase();
        return (
          <View
            key={item.id}
            style={[
              styles.avatar,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                marginLeft: index === 0 ? 0 : -spacing[2],
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : initial ? (
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {initial}
              </Text>
            ) : (
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={iconSizes.md}
                color={theme.colors.onSurfaceVariant}
              />
            )}
          </View>
        );
      })}
      {extraCount > 0 && (
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: visibleItems.length === 0 ? 0 : -spacing[2],
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            +{extraCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
