/**
 * Helper text component for form fields.
 * Displays helper messages or error messages with appropriate styling.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

export interface FormHelperTextProps {
  /** Message to display */
  message?: string;
  /** Whether this is an error message */
  error?: boolean;
}

/**
 * Renders helper or error text below form fields.
 * Returns null if no message is provided.
 */
export function FormHelperText({ message, error = false }: FormHelperTextProps) {
  const { theme } = useTheme();

  if (!message) {
    return null;
  }

  return (
    <Text
      variant="bodySmall"
      style={[
        styles.helperText,
        { color: error ? theme.colors.error : theme.colors.onSurfaceVariant },
      ]}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  helperText: {
    marginLeft: spacing[1],
  },
});
