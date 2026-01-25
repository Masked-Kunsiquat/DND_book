/**
 * Multi-image picker with preview grid.
 */

import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';

export interface FormImageGalleryProps {
  /** Field label */
  label: string;
  /** Selected image URIs */
  values: string[];
  /** Change handler */
  onChange: (value: string[]) => void;
  /** Optional helper message */
  helperText?: string;
  /** Optional error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional container style */
  containerStyle?: object;
}

export function FormImageGallery({
  label,
  values,
  onChange,
  helperText,
  error,
  disabled = false,
  containerStyle,
}: FormImageGalleryProps) {
  const { theme } = useTheme();
  const [pickerError, setPickerError] = useState<string | null>(null);
  const message = error ?? pickerError ?? helperText;
  const hasError = Boolean(error || pickerError);

  const handlePick = async () => {
    if (disabled) return;
    setPickerError(null);
    try {
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

      if (!result.canceled && Array.isArray(result.assets) && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (!values.includes(uri)) {
          onChange([...values, uri]);
        }
      }
    } catch (pickerErr) {
      setPickerError('Unable to open the image library. Please try again.');
      console.error('Image picker failed', pickerErr);
    }
  };

  const handleRemove = (uri: string) => {
    if (disabled) return;
    onChange(values.filter((value) => value !== uri));
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
        {label}
      </Text>
      {values.length > 0 ? (
        <View style={styles.gallery}>
          {values.map((uri) => (
            <View
              key={uri}
              style={[styles.thumb, { borderColor: theme.colors.outlineVariant }]}
            >
              <Image source={{ uri }} style={styles.image} />
              <IconButton
                icon="close"
                size={16}
                onPress={() => handleRemove(uri)}
                disabled={disabled}
                iconColor={theme.colors.onSurface}
                style={[styles.removeButton, { backgroundColor: theme.colors.surface }]}
              />
            </View>
          ))}
        </View>
      ) : (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          No images yet.
        </Text>
      )}
      <Button mode="outlined" onPress={handlePick} disabled={disabled} icon="image-plus">
        Add image
      </Button>
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
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  thumb: {
    width: spacing[16],
    height: spacing[16],
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: -spacing[1],
    right: -spacing[1],
  },
  helperText: {
    marginLeft: spacing[1],
  },
});
