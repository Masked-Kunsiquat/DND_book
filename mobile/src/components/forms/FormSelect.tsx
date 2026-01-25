/**
 * Single-select dropdown for forms.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Menu, Text, TextInput } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormSelectProps {
  /** Field label */
  label: string;
  /** Selected value */
  value?: string;
  /** Available options */
  options: SelectOption[];
  /** Selection handler */
  onChange: (value: string) => void;
  /** Optional placeholder text */
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

export function FormSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  helperText,
  error,
  disabled = false,
  containerStyle,
}: FormSelectProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);
  const message = error ?? helperText;

  const selectedLabel = useMemo(() => {
    return options.find((option) => option.value === value)?.label ?? '';
  }, [options, value]);

  const handleOpen = () => {
    if (!disabled) {
      setVisible(true);
    }
  };

  const handleClose = () => setVisible(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Menu
        visible={visible}
        onDismiss={handleClose}
        anchor={
          <Pressable onPress={handleOpen} disabled={disabled}>
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label={label}
                value={selectedLabel}
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
          options.map((option) => (
            <Menu.Item
              key={option.value}
              title={option.label}
              onPress={() => {
                onChange(option.value);
                handleClose();
              }}
            />
          ))
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
  helperText: {
    marginLeft: spacing[1],
  },
});
