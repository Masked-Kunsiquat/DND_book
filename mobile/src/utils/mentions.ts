import type { MentionSettings } from '../types/schema';

export const MENTION_TRIGGER_OPTIONS = ['@', '#', '$', '!', '~', '^', '&'] as const;

export const DEFAULT_MENTION_SETTINGS: MentionSettings = {
  character: '@',
  location: '$',
  item: '!',
  tag: '#',
};

/**
 * Determines whether a value is one of the allowed mention trigger characters.
 *
 * @param value - The value to check.
 * @returns `true` if `value` is one of the allowed trigger characters (`@`, `#`, `$`, `!`, `~`, `^`, `&`), `false` otherwise.
 */
function isValidTrigger(value: unknown): value is (typeof MENTION_TRIGGER_OPTIONS)[number] {
  return typeof value === 'string' && MENTION_TRIGGER_OPTIONS.includes(value as any);
}

/**
 * Parse a JSON string into validated MentionSettings, falling back to defaults for missing or invalid fields.
 *
 * @param raw - JSON string representing partial MentionSettings; may be undefined or null.
 * @returns A MentionSettings object where each field is the parsed value if it is an allowed trigger character, otherwise the corresponding default from DEFAULT_MENTION_SETTINGS.
 */
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