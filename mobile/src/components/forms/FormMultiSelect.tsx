/**
 * Multi-select input with chip display.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Chip, Menu, Text, TextInput } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface FormMultiSelectProps {
  /** Field label */
  label: string;
  /** Selected values */
  value: string[];
  /** Available options */
  options: MultiSelectOption[];
  /** Change handler */
  onChange: (value: string[]) => void;
  /** Optional placeholder */
  placeholder?: string;
  /** Optional helper message */
  helperText?: string;
  /** Optional error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional container style */
  containerStyle?: object;
}

export function FormMultiSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  helperText,
  error,
  disabled = false,
  containerStyle,
}: FormMultiSelectProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);
  const message = error ?? helperText;

  const selectedOptions = useMemo(() => {
    const optionById = new Map(options.map((option) => [option.value, option]));
    return value.map((id) => optionById.get(id)).filter(Boolean) as MultiSelectOption[];
  }, [options, value]);

  const displayValue = selectedOptions.length
    ? selectedOptions.map((option) => option.label).join(', ')
    : '';

  const toggleValue = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleOpen = () => {
    if (!disabled) {
      setTimeout(() => setVisible(true), 0);
    }
  };

  const handleToggle = () => {
    if (visible) {
      setVisible(false);
      return;
    }
    handleOpen();
  };

  const handleClose = () => setVisible(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {selectedOptions.length > 0 && (
        <View style={styles.chipRow}>
          {selectedOptions.map((option) => (
            <Chip
              key={option.value}
              onClose={() => toggleValue(option.value)}
              style={styles.chip}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      )}
      <Menu
        visible={visible}
        onDismiss={handleClose}
        anchorPosition="bottom"
        keyboardShouldPersistTaps="handled"
        anchor={
          <Pressable onPress={handleToggle} disabled={disabled}>
            <View pointerEvents="none" collapsable={false}>
              <TextInput
                mode="outlined"
                label={label}
                value={displayValue}
                placeholder={placeholder}
                editable={false}
                disabled={disabled}
                error={hasError}
                right={<TextInput.Icon icon="menu-down" />}
              />
            </View>
          </Pressable>
        }
      >
        {options.length === 0 ? (
          <Menu.Item title="No options" disabled />
        ) : (
          options.map((option) => {
            const selected = value.includes(option.value);
            return (
              <Menu.Item
                key={option.value}
                title={option.label}
                leadingIcon={selected ? 'check' : undefined}
                onPress={() => toggleValue(option.value)}
              />
            );
          })
        )}
      </Menu>
      {message ? (
        <Text
          variant="bodySmall"
          style={[
            styles.helperText,
            { color: hasError ? theme.colors.error : theme.colors.onSurfaceVariant },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  chip: {
    marginRight: spacing[1],
  },
  helperText: {
    marginLeft: spacing[1],
  },
});
