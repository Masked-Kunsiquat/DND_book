import type { MentionSettings } from '../types/schema';

export const MENTION_TRIGGER_OPTIONS = ['@', '#', '$', '!', '~', '^', '&'] as const;

export const DEFAULT_MENTION_SETTINGS: MentionSettings = {
  character: '@',
  location: '$',
  item: '!',
  tag: '#',
};

function isValidTrigger(value: unknown): value is (typeof MENTION_TRIGGER_OPTIONS)[number] {
  return typeof value === 'string' && MENTION_TRIGGER_OPTIONS.includes(value as any);
}

export function parseMentionSettings(raw?: string | null): MentionSettings {
  if (!raw) return DEFAULT_MENTION_SETTINGS;

  try {
    const parsed = JSON.parse(raw) as Partial<MentionSettings> | null;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_MENTION_SETTINGS;

    const merged: MentionSettings = {
      character: isValidTrigger(parsed.character)
        ? parsed.character
        : DEFAULT_MENTION_SETTINGS.character,
      location: isValidTrigger(parsed.location)
        ? parsed.location
        : DEFAULT_MENTION_SETTINGS.location,
      item: isValidTrigger(parsed.item)
        ? parsed.item
        : DEFAULT_MENTION_SETTINGS.item,
      tag: isValidTrigger(parsed.tag)
        ? parsed.tag
        : DEFAULT_MENTION_SETTINGS.tag,
    };

    return merged;
  } catch {
    return DEFAULT_MENTION_SETTINGS;
  }
}
