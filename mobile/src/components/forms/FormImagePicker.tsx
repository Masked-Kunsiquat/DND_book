/**
 * Image picker input with preview and actions.
 */

import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';

export interface FormImagePickerProps {
  /** Field label */
  label: string;
  /** Current image URI */
  value?: string | null;
  /** Change handler */
  onChange: (value: string | null) => void;
  /** Optional helper message */
  helperText?: string;
  /** Optional error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional container style */
  containerStyle?: object;
}

export function FormImagePicker({
  label,
  value,
  onChange,
  helperText,
  error,
  disabled = false,
  containerStyle,
}: FormImagePickerProps) {
  const { theme } = useTheme();
  const [pickerError, setPickerError] = useState<string | null>(null);
  const message = error ?? pickerError ?? helperText;
  const hasError = Boolean(error || pickerError);

  const handlePick = async () => {
    if (disabled) return;
    setPickerError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      setPickerError('Media library permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
        {label}
      </Text>
      <View style={styles.previewRow}>
        <View style={[styles.preview, { borderColor: theme.colors.outlineVariant }]}>
          {value ? (
            <Image source={{ uri: value }} style={styles.image} />
          ) : (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No image selected
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <Button mode="contained" onPress={handlePick} disabled={disabled} compact>
            Choose
          </Button>
          {value ? (
            <Button
              mode="outlined"
              onPress={() => onChange(null)}
              disabled={disabled}
              compact
            >
              Remove
            </Button>
          ) : null}
        </View>
      </View>
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
    gap: spacing[2],
  },
  previewRow: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: layout.cardBorderRadius,
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
  actions: {
    flex: 1,
    gap: spacing[2],
  },
  helperText: {
    marginLeft: spacing[1],
  },
});
