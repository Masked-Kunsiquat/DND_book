/**
 * NPC card with avatar, subtitle, and tags.
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from './AppCard';
import { TagChip } from '../chips/TagChip';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, iconSizes } from '../../theme';
import type { Npc, Tag } from '../../types/schema';

export interface NPCCardProps {
  /** NPC data */
  npc: Npc;
  /** Optional resolved tag objects */
  tags?: Tag[];
  /** Called when card is pressed */
  onPress?: () => void;
  /** Additional style for the card container */
  style?: object;
}

function buildSubtitle(npc: Npc): string {
  const details = [npc.race, npc.role].filter(Boolean);
  return details.length > 0 ? details.join(' • ') : 'No details yet.';
}

function NpcAvatar({ imageUri }: { imageUri?: string }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outlineVariant,
        },
      ]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.avatarImage} />
      ) : (
        <MaterialCommunityIcons
          name="account-circle-outline"
          size={iconSizes.lg}
          color={theme.colors.onSurfaceVariant}
        />
      )}
    </View>
  );
}

export function NPCCard({ npc, tags = [], onPress, style }: NPCCardProps) {
  return (
    <AppCard
      title={npc.name || 'Unnamed NPC'}
      subtitle={buildSubtitle(npc)}
      right={<NpcAvatar imageUri={npc.image} />}
      onPress={onPress}
      style={style}
    >
      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <TagChip key={tag.id} id={tag.id} name={tag.name} size="small" />
          ))}
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  avatar: {
    width: spacing[11],
    height: spacing[11],
    borderRadius: spacing[11] / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
