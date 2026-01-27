import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from 'react-native-paper';
import { FormSelect, Screen, Section } from '../../src/components';
import { useMentionSettings, type MentionSettingKey } from '../../src/hooks';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import { MENTION_TRIGGER_OPTIONS } from '../../src/utils/mentions';

const OPTION_ITEMS = MENTION_TRIGGER_OPTIONS.map((value) => ({
  label: value,
  value,
}));

const LABELS: Record<MentionSettingKey, string> = {
  character: 'Characters (NPCs & PCs)',
  location: 'Locations',
  item: 'Items',
  tag: 'Tags',
};

const PREVIEW_LABELS = {
  character: 'Lira',
  location: 'Whispering Springs',
  item: 'Emerald Dagger',
  tag: 'quest',
};

export default function MentionSettingsScreen() {
  const { theme } = useTheme();
  const { settings, updateMentionSetting, resetMentionSettings } = useMentionSettings();
  const [errors, setErrors] = useState<Partial<Record<MentionSettingKey, string>>>({});

  const handleChange = (key: MentionSettingKey, value: string) => {
    const conflictKey = (Object.keys(settings) as MentionSettingKey[]).find(
      (other) => other !== key && settings[other] === value
    );

    if (conflictKey) {
      setErrors((prev) => ({
        ...prev,
        [key]: `"${value}" is already assigned to ${LABELS[conflictKey]}.`,
      }));
      return;
    }

    updateMentionSetting(key, value);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleReset = () => {
    resetMentionSettings();
    setErrors({});
  };

  const preview = `Met ${settings.character}${PREVIEW_LABELS.character} at ${settings.location}${PREVIEW_LABELS.location}, found ${settings.item}${PREVIEW_LABELS.item} ${settings.tag}${PREVIEW_LABELS.tag}.`;

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Mentions' }} />
      <Section
        title="Mention Triggers"
        icon="at"
        action={{
          label: 'Reset',
          onPress: handleReset,
        }}
      >
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Choose which characters activate each mention picker.
        </Text>
        <FormSelect
          label={LABELS.character}
          value={settings.character}
          options={OPTION_ITEMS}
          onChange={(value) => handleChange('character', value)}
          error={errors.character}
        />
        <FormSelect
          label={LABELS.location}
          value={settings.location}
          options={OPTION_ITEMS}
          onChange={(value) => handleChange('location', value)}
          error={errors.location}
        />
        <FormSelect
          label={LABELS.item}
          value={settings.item}
          options={OPTION_ITEMS}
          onChange={(value) => handleChange('item', value)}
          error={errors.item}
        />
        <FormSelect
          label={LABELS.tag}
          value={settings.tag}
          options={OPTION_ITEMS}
          onChange={(value) => handleChange('tag', value)}
          error={errors.tag}
        />
        <View style={styles.preview}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Preview
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
            {preview}
          </Text>
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    gap: spacing[1],
  },
});
