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

function resolveEntityType(trigger: string, settings: MentionSettings): Mention['entityType'] {
  if (trigger === settings.location) return 'location';
  if (trigger === settings.item) return 'item';
  if (trigger === settings.tag) return 'tag';
  return 'npc';
}

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
