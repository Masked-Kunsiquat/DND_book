/**
 * Date/time picker input with themed modal.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text, TextInput } from 'react-native-paper';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

type DateTimeMode = 'date' | 'time';

export interface FormDateTimePickerProps {
  /** Field label */
  label: string;
  /** ISO string value */
  value?: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Optional mode (date/time/datetime) */
  mode?: DateTimeMode;
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

function formatValue(value?: string, mode: DateTimeMode = 'date') {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  if (mode === 'time') return parsed.toLocaleTimeString();
  return parsed.toLocaleDateString();
}

function formatDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function FormDateTimePicker({
  label,
  value,
  onChange,
  mode = 'date',
  placeholder = 'Select date',
  helperText,
  error,
  disabled = false,
  containerStyle,
}: FormDateTimePickerProps) {
  const { theme, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const parsedValue = useMemo(() => {
    const dateValue = value ? new Date(value) : new Date();
    return Number.isNaN(dateValue.getTime()) ? new Date() : dateValue;
  }, [value]);
  const [tempDate, setTempDate] = useState(parsedValue);
  const hasError = Boolean(error);
  const message = error ?? helperText;

  useEffect(() => {
    if (!visible) {
      setTempDate(parsedValue);
    }
  }, [parsedValue, visible]);

  const openPicker = () => {
    if (disabled) return;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: tempDate,
        onChange: handleChange,
        mode,
        display: 'default',
        is24Hour: false,
        design: 'material',
      });
      return;
    }
    setVisible(true);
  };

  const closePicker = () => setVisible(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (selected) {
      setTempDate(selected);
    }

    if (Platform.OS === 'android') {
      if (event.type === 'set' && selected) {
        const nextValue =
          mode === 'date' ? formatDateOnly(selected) : selected.toISOString();
        onChange(nextValue);
      }
      closePicker();
    }
  };

  const handleConfirm = () => {
    const nextValue =
      mode === 'date' ? formatDateOnly(tempDate) : tempDate.toISOString();
    onChange(nextValue);
    closePicker();
  };

  const displayValue = formatValue(value, mode);

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable onPress={openPicker} disabled={disabled}>
        <View pointerEvents="none" collapsable={false}>
          <TextInput
            mode="outlined"
            label={label}
            value={displayValue}
            placeholder={placeholder}
            editable={false}
            disabled={disabled}
            error={hasError}
            right={<TextInput.Icon icon="calendar" />}
          />
        </View>
      </Pressable>
      <Portal>
        {Platform.OS === 'ios' && (
          <Modal
            visible={visible}
            onDismiss={closePicker}
            contentContainerStyle={[
              styles.modal,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
            ]}
          >
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {label}
            </Text>
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display="spinner"
              onChange={handleChange}
              textColor={theme.colors.onSurface}
              themeVariant={isDark ? 'dark' : 'light'}
            />
            <View style={styles.actions}>
              <Button mode="text" onPress={closePicker}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleConfirm}>
                Done
              </Button>
            </View>
          </Modal>
        )}
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  helperText: {
    marginLeft: spacing[1],
  },
});
