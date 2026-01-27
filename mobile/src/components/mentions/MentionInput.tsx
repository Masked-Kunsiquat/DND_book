/**
 * Mention-aware text input wrapper using react-native-controlled-mentions.
 */

import React, { useMemo } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useMentions, type TriggersConfig } from 'react-native-controlled-mentions';
import { useMentionSettings } from '../../hooks';
import { layout, semanticColors, spacing, gray } from '../../theme';
import { useTheme } from '../../theme/ThemeProvider';

export type MentionTriggerKey = 'character' | 'location' | 'item' | 'tag';

type MentionTriggersConfig = TriggersConfig<MentionTriggerKey>;

export interface MentionInputProps
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'multiline'> {
  /** Current value */
  value: string;
  /** Change handler */
  onChangeText: (value: string) => void;
  /** Optional suggestions renderer */
  renderSuggestions?: (triggers: ReturnType<typeof useMentions>['triggers']) => React.ReactNode;
  /** Optional container style */
  containerStyle?: object;
  /** Multiline input (default: true) */
  multiline?: boolean;
}

function withAlpha(color: string, alpha: number): string {
  if (!color.startsWith('#') || (color.length !== 7 && color.length !== 4)) {
    return color;
  }

  const normalized =
    color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color;

  const clamped = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');

  return `${normalized}${alphaHex}`;
}

export function MentionInput({
  value,
  onChangeText,
  renderSuggestions,
  containerStyle,
  placeholder = 'Start typing...',
  multiline = true,
  style,
  ...rest
}: MentionInputProps) {
  const { theme } = useTheme();
  const { settings } = useMentionSettings();

  const triggersConfig = useMemo<MentionTriggersConfig>(() => {
    const characterColor = semanticColors.info.main;
    const locationColor = semanticColors.success.main;
    const itemColor = semanticColors.warning.main;
    const tagColor = gray[400];

    return {
      character: {
        trigger: settings.character,
        textStyle: {
          color: characterColor,
          fontWeight: '600',
          backgroundColor: withAlpha(characterColor, 0.18),
        },
        allowedSpacesCount: 2,
        isInsertSpaceAfterMention: true,
      },
      location: {
        trigger: settings.location,
        textStyle: {
          color: locationColor,
          fontWeight: '600',
          backgroundColor: withAlpha(locationColor, 0.18),
        },
        allowedSpacesCount: 3,
        isInsertSpaceAfterMention: true,
      },
      item: {
        trigger: settings.item,
        textStyle: {
          color: itemColor,
          fontWeight: '600',
          backgroundColor: withAlpha(itemColor, 0.18),
        },
        allowedSpacesCount: 2,
        isInsertSpaceAfterMention: true,
      },
      tag: {
        trigger: settings.tag,
        textStyle: {
          color: tagColor,
          fontWeight: '600',
          backgroundColor: withAlpha(tagColor, 0.18),
        },
        allowedSpacesCount: 0,
        isInsertSpaceAfterMention: true,
      },
    };
  }, [settings]);

  const { textInputProps, triggers } = useMentions({
    value,
    onChange: onChangeText,
    triggersConfig,
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        {...rest}
        {...textInputProps}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        multiline={multiline}
        style={[
          styles.input,
          {
            color: theme.colors.onSurface,
            borderColor: theme.colors.outlineVariant,
            backgroundColor: theme.colors.surface,
          },
          textInputProps.style,
          style,
        ]}
      />
      {renderSuggestions ? renderSuggestions(triggers) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  input: {
    minHeight: 160,
    borderWidth: 1,
    borderRadius: layout.cardBorderRadius,
    padding: spacing[3],
    textAlignVertical: 'top',
  },
});
