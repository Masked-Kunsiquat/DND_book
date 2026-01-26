/**
 * Chip component for displaying tags with consistent colors.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { getTagColor, spacing } from '../../theme';
import { useTheme } from '../../theme/ThemeProvider';

export interface TagChipProps {
  /** Tag ID (used to determine color) */
  id: string;
  /** Tag name to display */
  name: string;
  /** Optional custom color (hex) */
  color?: string;
  /** Called when chip is pressed */
  onPress?: () => void;
  /** Called when close icon is pressed (shows close icon if provided) */
  onClose?: () => void;
  /** Whether the chip is selected */
  selected?: boolean;
  /** Size of the chip */
  size?: 'small' | 'medium';
}

function getLuminance(color: string): number | null {
  const normalized = color.replace('#', '');
  const hex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;
  if (hex.length !== 6) return null;
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getReadableTextColor(color: string): string {
  const luminance = getLuminance(color);
  if (luminance === null) return '#ffffff';
  return luminance > 0.6 ? '#000000' : '#ffffff';
}

export function TagChip({
  id,
  name,
  color,
  onPress,
  onClose,
  selected,
  size = 'medium',
}: TagChipProps) {
  const colors = getTagColor(id);
  const { theme } = useTheme();
  const customColor = color?.trim();
  const hasCustomColor = Boolean(customColor);
  const resolvedColor = customColor ?? colors.bg;
  const luminance = getLuminance(resolvedColor);
  const unselectedTextColor = hasCustomColor
    ? luminance !== null && luminance < 0.3
      ? theme.colors.onSurface
      : resolvedColor
    : colors.text;
  const textColor = selected
    ? hasCustomColor
      ? getReadableTextColor(resolvedColor)
      : colors.text
    : unselectedTextColor;

  return (
    <Chip
      mode={selected ? 'flat' : 'outlined'}
      onPress={onPress}
      onClose={onClose}
      style={[
        styles.chip,
        size === 'small' && styles.chipSmall,
        selected && { backgroundColor: resolvedColor },
        { borderColor: resolvedColor },
      ]}
      textStyle={[styles.text, size === 'small' && styles.textSmall, { color: textColor }]}
      closeIconAccessibilityLabel="Remove tag"
    >
      {name}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 16,
  },
  chipSmall: {
    minHeight: 24,
    paddingVertical: spacing[0.5],
  },
  text: {
    fontSize: 14,
    lineHeight: 18,
  },
  textSmall: {
    fontSize: 12,
    lineHeight: 16,
  },
});
