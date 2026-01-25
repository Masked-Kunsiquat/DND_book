/**
 * Form text input with helper and error messaging.
 */

import React, { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

type PaperTextInputProps = ComponentProps<typeof TextInput>;

export interface FormTextInputProps
  extends Omit<PaperTextInputProps, 'value' | 'onChangeText' | 'mode' | 'error'> {
  /** Field label */
  label: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChangeText: (value: string) => void;
  /** Optional helper message */
  helperText?: string;
  /** Optional error message */
  error?: string;
  /** Optional container style */
  containerStyle?: object;
}

export function FormTextInput({
  label,
  value,
  onChangeText,
  helperText,
  error,
  containerStyle,
  style,
  ...rest
}: FormTextInputProps) {
  const { theme } = useTheme();
  const hasError = Boolean(error);
  const message = error ?? helperText;

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={hasError}
        style={style}
        {...rest}
      />
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
