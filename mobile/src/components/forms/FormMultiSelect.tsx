/**
 * Multi-select input with chip display.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Checkbox, Chip, List, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { FormHelperText } from './FormHelperText';
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
      setVisible(true);
    }
  };

  const handleClose = () => setVisible(false);
  const handleToggle = () => (visible ? handleClose() : handleOpen());

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
      <Portal>
        <Modal
          visible={visible}
          onDismiss={handleClose}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
          ]}
        >
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {label}
          </Text>
          {options.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No options available.
            </Text>
          ) : (
            <ScrollView
              style={styles.options}
              contentContainerStyle={styles.optionsContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {options.map((option) => {
                const selected = value.includes(option.value);
                return (
                  <List.Item
                    key={option.value}
                    title={option.label}
                    titleStyle={{ color: theme.colors.onSurface }}
                    left={() => (
                      <Checkbox
                        status={selected ? 'checked' : 'unchecked'}
                        onPress={() => toggleValue(option.value)}
                      />
                    )}
                    onPress={() => toggleValue(option.value)}
                  />
                );
              })}
            </ScrollView>
          )}
        </Modal>
      </Portal>
      <FormHelperText message={message} error={hasError} />
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
  modal: {
    marginHorizontal: spacing[4],
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing[3],
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: spacing[2],
  },
  options: {
    maxHeight: 320,
  },
  optionsContent: {
    gap: spacing[1],
  },
});
