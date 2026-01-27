/**
 * Unified mention suggestions list for NPCs, PCs, locations, items, and tags.
 */

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SuggestionsProvidedProps } from 'react-native-controlled-mentions';
import {
  useCurrentCampaign,
  useItems,
  useLocations,
  useNpcs,
  usePlayerCharacters,
  useShadowEntities,
  useTags,
} from '../../hooks';
import type { EntityStatus } from '../../types/schema';
import { layout, spacing } from '../../theme';
import { useTheme } from '../../theme/ThemeProvider';

export type SuggestionTriggerKey = 'character' | 'location' | 'item' | 'tag';

export interface EntitySuggestionsProps {
  character?: SuggestionsProvidedProps;
  location?: SuggestionsProvidedProps;
  item?: SuggestionsProvidedProps;
  tag?: SuggestionsProvidedProps;
  maxSuggestions?: number;
  containerStyle?: object;
}

type SuggestionKind = 'npc' | 'pc' | 'location' | 'item' | 'tag';

interface SuggestionItem {
  id: string;
  name: string;
  kind: SuggestionKind;
  subtitle?: string;
  status?: EntityStatus;
}

const LABELS: Record<SuggestionTriggerKey, string> = {
  character: 'Characters',
  location: 'Locations',
  item: 'Items',
  tag: 'Tags',
};

const CREATE_LABELS: Record<SuggestionTriggerKey, string> = {
  character: 'Character',
  location: 'Location',
  item: 'Item',
  tag: 'Tag',
};

const ICONS: Record<SuggestionKind, string> = {
  npc: 'account-outline',
  pc: 'account-star-outline',
  location: 'map-marker-outline',
  item: 'treasure-chest-outline',
  tag: 'tag-outline',
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function fuzzyScore(query: string, target: string): number {
  if (!query) return 1;
  if (query === target) return 100;
  if (target.startsWith(query)) return 80 - Math.min(target.length - query.length, 20);
  const includesIndex = target.indexOf(query);
  if (includesIndex !== -1) return 60 - Math.min(includesIndex, 20);

  let score = 0;
  let searchIndex = 0;
  for (const char of query) {
    const matchIndex = target.indexOf(char, searchIndex);
    if (matchIndex === -1) return -1;
    score += matchIndex === searchIndex ? 2 : 1;
    searchIndex = matchIndex + 1;
  }

  return 30 + score;
}

function filterSuggestions(items: SuggestionItem[], query: string, max: number): SuggestionItem[] {
  const normalizedQuery = normalize(query);
  const scored = items
    .map((item) => ({
      item,
      score: fuzzyScore(normalizedQuery, normalize(item.name)),
    }))
    .filter((entry) => (normalizedQuery ? entry.score > 0 : true));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name);
  });

  return scored.slice(0, max).map((entry) => entry.item);
}

export function EntitySuggestions({
  character,
  location,
  item,
  tag,
  maxSuggestions = 6,
  containerStyle,
}: EntitySuggestionsProps) {
  const { theme } = useTheme();
  const currentCampaign = useCurrentCampaign();
  const campaignId = currentCampaign?.id;
  const continuityId = currentCampaign?.continuityId;

  const npcs = useNpcs(campaignId);
  const pcs = usePlayerCharacters(campaignId);
  const locations = useLocations(campaignId);
  const items = useItems(campaignId);
  const tags = useTags(continuityId, campaignId);
  const { createShadowEntity } = useShadowEntities();

  const triggerEntries = useMemo(
    () =>
      [
        ['character', character],
        ['location', location],
        ['item', item],
        ['tag', tag],
      ] as const,
    [character, location, item, tag]
  );

  const activeEntry = triggerEntries.find(([, data]) => data?.keyword !== undefined);

  if (!activeEntry || !activeEntry[1]) {
    return null;
  }

  const [activeKey, activeData] = activeEntry;
  const keyword = activeData.keyword ?? '';
  const trimmedKeyword = keyword.trim();

  const baseSuggestions: SuggestionItem[] = useMemo(() => {
    switch (activeKey) {
      case 'character':
        return [
          ...npcs.map((npc) => ({
            id: npc.id,
            name: npc.name,
            kind: 'npc' as const,
            subtitle: 'NPC',
            status: npc.status,
          })),
          ...pcs.map((pc) => ({
            id: pc.id,
            name: pc.name,
            kind: 'pc' as const,
            subtitle: 'PC',
          })),
        ];
      case 'location':
        return locations.map((loc) => ({
          id: loc.id,
          name: loc.name,
          kind: 'location' as const,
          subtitle: loc.type,
          status: loc.status,
        }));
      case 'item':
        return items.map((itm) => ({
          id: itm.id,
          name: itm.name,
          kind: 'item' as const,
          subtitle: itm.value ? `Value: ${itm.value}` : undefined,
          status: itm.status,
        }));
      case 'tag':
        return tags.map((tagItem) => ({
          id: tagItem.id,
          name: tagItem.name,
          kind: 'tag' as const,
        }));
      default:
        return [];
    }
  }, [activeKey, npcs, pcs, locations, items, tags]);

  const suggestions = useMemo(
    () => filterSuggestions(baseSuggestions, keyword, maxSuggestions),
    [baseSuggestions, keyword, maxSuggestions]
  );

  const hasExactMatch = useMemo(() => {
    if (!trimmedKeyword) return false;
    const normalizedKeyword = normalize(trimmedKeyword);
    return baseSuggestions.some((item) => normalize(item.name) === normalizedKeyword);
  }, [baseSuggestions, trimmedKeyword]);

  const showCreate = Boolean(trimmedKeyword) && !hasExactMatch;

  return (
    <Surface
      elevation={2}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
        containerStyle,
      ]}
    >
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {LABELS[activeKey]}
      </Text>
      {suggestions.length === 0 && !showCreate ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          No matches found.
        </Text>
      ) : (
        <View style={styles.list}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={`${suggestion.kind}-${suggestion.id}`}
              style={styles.row}
              onPress={() => activeData.onSelect({ id: suggestion.id, name: suggestion.name })}
            >
              <MaterialCommunityIcons
                name={ICONS[suggestion.kind] as any}
                size={18}
                color={theme.colors.primary}
              />
              <View style={styles.textGroup}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {suggestion.name}
                </Text>
                {suggestion.subtitle ? (
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {suggestion.subtitle}
                  </Text>
                ) : null}
              </View>
              {suggestion.status === 'shadow' ? (
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Shadow
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}
      {showCreate ? (
        <Pressable
          style={[styles.row, styles.createRow, { borderTopColor: theme.colors.outlineVariant }]}
          onPress={() => {
            const createdId = createShadowEntity(activeKey, trimmedKeyword);
            if (!createdId) return;
            activeData.onSelect({
              id: createdId,
              name: trimmedKeyword,
            });
          }}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={18}
            color={theme.colors.secondary}
          />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            Create "{trimmedKeyword}" as {CREATE_LABELS[activeKey]}
          </Text>
        </Pressable>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: layout.cardBorderRadius,
    padding: spacing[3],
    gap: spacing[2],
  },
  list: {
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  textGroup: {
    flex: 1,
  },
  createRow: {
    borderTopWidth: 1,
    paddingTop: spacing[2],
  },
});
