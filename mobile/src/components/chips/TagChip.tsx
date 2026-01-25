/**
 * Chip component for displaying tags with consistent colors.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { getTagColor } from '../../theme';
import { useTheme } from '../../theme/ThemeProvider';

export interface TagChipProps {
  /** Tag ID (used to determine color) */
  id: string;
  /** Tag name to display */
  name: string;
  /** Called when chip is pressed */
  onPress?: () => void;
  /** Called when close icon is pressed (shows close icon if provided) */
  onClose?: () => void;
  /** Whether the chip is selected */
  selected?: boolean;
  /** Size of the chip */
  size?: 'small' | 'medium';
}

export function TagChip({ id, name, onPress, onClose, selected, size = 'medium' }: TagChipProps) {
  const colors = getTagColor(id);
  const { theme } = useTheme();

  return (
    <Chip
      mode={selected ? 'flat' : 'outlined'}
      onPress={onPress}
      onClose={onClose}
      style={[
        styles.chip,
        size === 'small' && styles.chipSmall,
        selected && { backgroundColor: colors.bg },
        { borderColor: selected ? colors.bg : theme.colors.outlineVariant },
      ]}
      textStyle={[styles.text, size === 'small' && styles.textSmall, { color: colors.text }]}
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
    height: 24,
  },
  text: {
    fontSize: 14,
  },
  textSmall: {
    fontSize: 12,
  },
});
