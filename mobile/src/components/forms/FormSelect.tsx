/**
 * Single-select dropdown for forms.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { List, Modal, Portal, Text, TextInput } from 'react-native-paper';
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
  const handleToggle = () => (visible ? handleClose() : handleOpen());

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable onPress={handleToggle} disabled={disabled}>
        <View pointerEvents="none" collapsable={false}>
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
              {options.map((option) => (
                <List.Item
                  key={option.value}
                  title={option.label}
                  titleStyle={{ color: theme.colors.onSurface }}
                  right={(props) =>
                    option.value === value ? <List.Icon {...props} icon="check" /> : null
                  }
                  onPress={() => {
                    onChange(option.value);
                    handleClose();
                  }}
                />
              ))}
            </ScrollView>
          )}
        </Modal>
      </Portal>
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
  helperText: {
    marginLeft: spacing[1],
  },
});
