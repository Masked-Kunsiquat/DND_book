import type { MentionSettings } from '../types/schema';

export const MENTION_TRIGGER_OPTIONS = ['@', '#', '$', '!', '~', '^', '&'] as const;

export const DEFAULT_MENTION_SETTINGS: MentionSettings = {
  character: '@',
  location: '$',
  item: '!',
  tag: '#',
};

export function parseMentionSettings(raw?: string | null): MentionSettings {
  if (!raw) return DEFAULT_MENTION_SETTINGS;

  try {
    const parsed = JSON.parse(raw) as Partial<MentionSettings> | null;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_MENTION_SETTINGS;

    const merged: MentionSettings = {
      character: typeof parsed.character === 'string' ? parsed.character : DEFAULT_MENTION_SETTINGS.character,
      location: typeof parsed.location === 'string' ? parsed.location : DEFAULT_MENTION_SETTINGS.location,
      item: typeof parsed.item === 'string' ? parsed.item : DEFAULT_MENTION_SETTINGS.item,
      tag: typeof parsed.tag === 'string' ? parsed.tag : DEFAULT_MENTION_SETTINGS.tag,
    };

    return merged;
  } catch {
    return DEFAULT_MENTION_SETTINGS;
  }
}
