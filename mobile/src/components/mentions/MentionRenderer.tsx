/**
 * Read-only renderer for mention-aware content.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useMentionSettings } from '../../hooks';
import { gray, semanticColors, spacing } from '../../theme';
import { useTheme } from '../../theme/ThemeProvider';
import type { Mention, MentionStatus, MentionSettings } from '../../types/schema';
import { triggerRegEx } from 'react-native-controlled-mentions';

export interface MentionRendererProps {
  /** Content with mention tokens */
  value: string;
  /** Optional stored mention metadata for lookup */
  mentions?: Mention[];
  /** Optional press handler override */
  onPressMention?: (mention: Mention) => void;
  /** Optional container style */
  containerStyle?: object;
  /** Optional base text style */
  textStyle?: TextStyle;
}

interface RenderableMention {
  trigger: string;
  label: string;
  entityId: string | null;
  entityType: Mention['entityType'];
  status: MentionStatus;
  position: { start: number; end: number };
}

interface Segment {
  type: 'text' | 'mention';
  text: string;
  mention?: RenderableMention;
}

/**
 * Append an alpha channel to a hex color string, returning a hex color with opacity.
 *
 * Normalizes shorthand `#RGB` to `#RRGGBB`, clamps `alpha` to the range 0–1, and appends
 * the corresponding two-digit alpha hex to produce `#RRGGBBAA`. If `color` is not a
 * valid `#RGB` or `#RRGGBB` hex string, the input is returned unchanged.
 *
 * @param color - A hex color string in `#RGB` or `#RRGGBB` form
 * @param alpha - Opacity value between 0 and 1 (values outside this range are clamped)
 * @returns A hex color string with an appended alpha channel (`#RRGGBBAA`) or the original `color` if invalid
 */
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

/**
 * Map a mention trigger string to its corresponding entity type using the provided settings.
 *
 * @param trigger - The trigger token extracted from a mention (e.g., '@', '#')
 * @param settings - Configuration specifying which triggers represent location, item, and tag
 * @returns The resolved entity type: `location`, `item`, `tag`, or `npc` (default)
 */
function resolveEntityType(trigger: string, settings: MentionSettings): Mention['entityType'] {
  if (trigger === settings.location) return 'location';
  if (trigger === settings.item) return 'item';
  if (trigger === settings.tag) return 'tag';
  return 'npc';
}

/**
 * Compute the text style for a mention token based on its status.
 *
 * @param mention - The renderable mention whose `status` determines styling.
 * @param baseColor - Color used for active/normal mention styling.
 * @param shadowColor - Color used when the mention's status is `'shadow'`.
 * @returns A TextStyle for the mention: if `mention.status === 'shadow'` the style uses `shadowColor`, a dashed underline, and a translucent background; otherwise the style uses `baseColor`, heavier font weight, and a translucent background.
 */
function getMentionStyle(
  mention: RenderableMention,
  baseColor: string,
  shadowColor: string
): TextStyle {
  if (mention.status === 'shadow') {
    return {
      color: shadowColor,
      textDecorationLine: 'underline',
      textDecorationStyle: 'dashed',
      backgroundColor: withAlpha(shadowColor, 0.12),
    };
  }

  return {
    color: baseColor,
    fontWeight: '600',
    backgroundColor: withAlpha(baseColor, 0.15),
  };
}

/**
 * Convert a mention-marked string into an ordered array of text and mention segments for rendering.
 *
 * @param value - Input string containing mention tokens that match the library's `triggerRegEx`
 * @param mentions - Optional array of stored Mention metadata used to enrich segments when a mention's position matches
 * @param settings - MentionSettings used to infer an entityType when not provided by matched metadata
 * @returns An array of segments where each element is either a plain text segment or a mention segment containing a `RenderableMention` (`trigger`, `label`, `entityId`, `entityType`, `status`, and `position`)
 */
function buildSegments(
  value: string,
  mentions: Mention[] | undefined,
  settings: MentionSettings
): Segment[] {
  if (!value) return [{ type: 'text', text: '' }];

  const segments: Segment[] = [];
  const regex = new RegExp(triggerRegEx.source, 'gi');
  let lastIndex = 0;

  for (const match of value.matchAll(regex)) {
    const start = match.index ?? 0;
    const full = match[0] ?? '';
    const end = start + full.length;
    if (start > lastIndex) {
      segments.push({ type: 'text', text: value.slice(lastIndex, start) });
    }

    const trigger = match[2] ?? '';
    const label = match[3] ?? '';
    const rawId = match[4] ?? '';
    const entityId = rawId && rawId !== 'null' ? rawId : null;

    const matched = mentions?.find(
      (mention) => mention.position.start === start && mention.position.end === end
    );

    const entityType = matched?.entityType ?? resolveEntityType(trigger, settings);
    const status = matched?.status ?? (entityId ? 'resolved' : 'shadow');

    segments.push({
      type: 'mention',
      text: label,
      mention: {
        trigger,
        label,
        entityId,
        entityType,
        status,
        position: { start, end },
      },
    });

    lastIndex = end;
  }

  if (lastIndex < value.length) {
    segments.push({ type: 'text', text: value.slice(lastIndex) });
  }

  return segments;
}

/**
 * Render read-only text with styled mention tokens and optional interaction.
 *
 * @param value - The content string containing mention tokens to render.
 * @param mentions - Optional metadata used to resolve mention identities and statuses.
 * @param onPressMention - Optional callback invoked when a mention with an `entityId` is pressed; receives a mapped Mention-like object.
 * @param containerStyle - Optional style overrides for the outer container View.
 * @param textStyle - Optional base Text style applied to the rendered content.
 * @returns A React element that displays the input text with mention tokens styled; mentions that have an `entityId` are interactive and will either invoke `onPressMention` or navigate to the corresponding in-app route.
 */
export function MentionRenderer({
  value,
  mentions,
  onPressMention,
  containerStyle,
  textStyle,
}: MentionRendererProps) {
  const { theme } = useTheme();
  const { settings } = useMentionSettings();
  const router = useRouter();

  const segments = useMemo(
    () => buildSegments(value, mentions, settings),
    [mentions, settings, value]
  );

  const handlePress = (mention: RenderableMention) => {
    if (onPressMention) {
      onPressMention({
        id: `${mention.entityType}:${mention.entityId ?? mention.label}`,
        trigger: mention.trigger,
        entityType: mention.entityType,
        entityId: mention.entityId,
        displayLabel: mention.label,
        position: mention.position,
        status: mention.status,
      });
      return;
    }

    if (!mention.entityId) return;
    switch (mention.entityType) {
      case 'npc':
        router.push(`/npc/${mention.entityId}`);
        break;
      case 'pc':
        router.push(`/player-character/${mention.entityId}`);
        break;
      case 'location':
        router.push(`/location/${mention.entityId}`);
        break;
      case 'item':
        router.push(`/item/${mention.entityId}`);
        break;
      case 'tag':
        router.push(`/tag/${mention.entityId}`);
        break;
      default:
        break;
    }
  };

  const baseColorByType: Record<Mention['entityType'], string> = {
    npc: theme.colors.primary,
    pc: theme.colors.primary,
    location: semanticColors.success.main,
    item: semanticColors.warning.main,
    tag: gray[400],
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.text, { color: theme.colors.onSurfaceVariant }, textStyle]}>
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return <Text key={`text-${index}`}>{segment.text}</Text>;
          }

          const mention = segment.mention;
          if (!mention) {
            return <Text key={`mention-${index}`}>{segment.text}</Text>;
          }

          const baseColor = baseColorByType[mention.entityType] ?? theme.colors.primary;
          const mentionStyle = getMentionStyle(
            mention,
            baseColor,
            theme.colors.onSurfaceVariant
          );

          return (
            <Text
              key={`mention-${index}`}
              onPress={mention.entityId ? () => handlePress(mention) : undefined}
              style={[styles.mention, mentionStyle]}
            >
              {segment.text}
            </Text>
          );
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  mention: {
    fontWeight: '600',
  },
});