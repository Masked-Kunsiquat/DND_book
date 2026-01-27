/**
 * React hooks for mention trigger settings.
 */

import { useCallback, useMemo } from 'react';
import { useValue } from 'tinybase/ui-react';
import { useStore } from '../store';
import type { MentionSettings } from '../types/schema';
import { DEFAULT_MENTION_SETTINGS, parseMentionSettings } from '../utils/mentions';

export type MentionSettingKey = keyof MentionSettings;

export interface UseMentionSettingsResult {
  settings: MentionSettings;
  setMentionSettings: (settings: MentionSettings) => void;
  updateMentionSetting: (key: MentionSettingKey, value: string) => void;
  resetMentionSettings: () => void;
}

/**
 * Manage mention trigger settings persisted in the TinyBase store.
 *
 * Reads the stored `mentionSettings` value, parses it into `MentionSettings`, and provides functions to overwrite the settings, update a single setting key, or reset to the default settings.
 *
 * @returns An object containing the current `settings`, `setMentionSettings` to replace them, `updateMentionSetting` to change a single key, and `resetMentionSettings` to restore defaults.
 */
export function useMentionSettings(): UseMentionSettingsResult {
  const store = useStore();
  const rawSettings = useValue('mentionSettings', store) as string | undefined;

  const settings = useMemo(() => parseMentionSettings(rawSettings), [rawSettings]);

  const setMentionSettings = useCallback(
    (next: MentionSettings) => {
      store.setValue('mentionSettings', JSON.stringify(next));
    },
    [store]
  );

  const updateMentionSetting = useCallback(
    (key: MentionSettingKey, value: string) => {
      const next = { ...settings, [key]: value };
      store.setValue('mentionSettings', JSON.stringify(next));
    },
    [store, settings]
  );

  const resetMentionSettings = useCallback(() => {
    store.setValue('mentionSettings', JSON.stringify(DEFAULT_MENTION_SETTINGS));
  }, [store]);

  return { settings, setMentionSettings, updateMentionSetting, resetMentionSettings };
}