import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  FormTextInput,
  Screen,
  EmptyState,
  LoadingScreen,
  Section,
  StatCard,
  NoteCard,
  NPCCard,
  LocationCard,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import {
  useCampaign,
  useDeleteCampaign,
  useLocations,
  useNotes,
  useNpcs,
  useSetCurrentCampaign,
  useSessionLogs,
  useUpdateCampaign,
} from '../../src/hooks';

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
}

export default function CampaignDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const campaignId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);
  const hasCampaignId = campaignId.trim().length > 0;
  const scopedCampaignId = hasCampaignId ? campaignId : '__missing__';

  const campaign = useCampaign(scopedCampaignId);
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const setCurrentCampaign = useSetCurrentCampaign();

  const notes = useNotes(scopedCampaignId);
  const npcs = useNpcs(scopedCampaignId);
  const locations = useLocations(scopedCampaignId);
  const sessionLogs = useSessionLogs(scopedCampaignId);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const topNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => (b.updated || b.created).localeCompare(a.updated || a.created))
      .slice(0, 3);
  }, [notes]);

  const topNpcs = useMemo(() => {
    return [...npcs].sort((a, b) => (a.name || '').localeCompare(b.name || '')).slice(0, 3);
  }, [npcs]);

  const topLocations = useMemo(() => {
    return [...locations]
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .slice(0, 3);
  }, [locations]);

  const handleSeeNotes = () => {
    if (!campaign) return;
    setCurrentCampaign(campaign.id);
    router.push('/notes');
  };

  const handleSeeNpcs = () => {
    if (!campaign) return;
    setCurrentCampaign(campaign.id);
    router.push('/npcs');
  };

  const handleSeeLocations = () => {
    if (!campaign) return;
    setCurrentCampaign(campaign.id);
    router.push('/locations');
  };

  useEffect(() => {
    if (campaign && !isEditing) {
      setName(campaign.name);
    }
  }, [campaign, isEditing]);

  const handleEdit = () => {
    if (!campaign) return;
    setName(campaign.name);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (campaign) {
      setName(campaign.name);
    }
    setError(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!campaign) return;
    setError(null);
    try {
      updateCampaign(campaign.id, { name });
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update campaign.';
      setError(message);
    }
  };

  const handleDelete = () => {
    if (!campaign || isDeleting) return;
    Alert.alert(
      'Delete campaign?',
      'This will remove the campaign and leave related records unlinked.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              setIsDeleting(true);
              deleteCampaign(campaign.id);
              router.back();
            } catch (err) {
              const message =
                err instanceof Error ? err.message : 'Failed to delete campaign.';
              setError(message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!hasCampaignId) {
    return <LoadingScreen message="Loading campaign..." />;
  }

  if (!campaign) {
    return (
      <Screen>
        <EmptyState
          title="Campaign not found"
          description="This campaign may have been deleted."
          icon="folder-open-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: campaign.name || 'Campaign' }} />
      <Screen>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {isEditing ? (
              <FormTextInput
                label="Campaign name"
                value={name}
                onChangeText={setName}
                style={styles.titleInput}
              />
            ) : (
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                {campaign.name || 'Untitled campaign'}
              </Text>
            )}
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Created: {formatDate(campaign.created)}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Updated: {formatDate(campaign.updated)}
            </Text>
          </View>
          {!isEditing && (
            <IconButton
              icon="pencil"
              onPress={handleEdit}
              accessibilityLabel="Edit campaign"
            />
          )}
        </View>

        <Section title="Stats" icon="chart-box-outline">
          <View style={styles.statsRow}>
            <StatCard label="Notes" value={notes.length} />
            <StatCard label="NPCs" value={npcs.length} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Locations" value={locations.length} />
            <StatCard label="Sessions" value={sessionLogs.length} />
          </View>
        </Section>

        <Section
          title="Notes"
          icon="note-text-outline"
          action={notes.length > 0 ? { label: 'See all', onPress: handleSeeNotes } : undefined}
        >
          {topNotes.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No notes yet.
            </Text>
          ) : (
            topNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() => router.push(`/note/${note.id}`)}
              />
            ))
          )}
        </Section>

        <Section
          title="NPCs"
          icon="account-group-outline"
          action={npcs.length > 0 ? { label: 'See all', onPress: handleSeeNpcs } : undefined}
        >
          {topNpcs.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No NPCs yet.
            </Text>
          ) : (
            topNpcs.map((npc) => (
              <NPCCard
                key={npc.id}
                npc={npc}
                onPress={() => router.push(`/npc/${npc.id}`)}
              />
            ))
          )}
        </Section>

        <Section
          title="Locations"
          icon="map-marker-outline"
          action={
            locations.length > 0
              ? { label: 'See all', onPress: handleSeeLocations }
              : undefined
          }
        >
          {topLocations.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No locations yet.
            </Text>
          ) : (
            topLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onPress={() => router.push(`/location/${location.id}`)}
              />
            ))
          )}
        </Section>

        {error && (
          <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        <View style={styles.actionRow}>
          {isEditing ? (
            <>
              <Button mode="contained" onPress={handleSave} style={styles.actionButton}>
                Save
              </Button>
              <Button mode="outlined" onPress={handleCancel} style={styles.actionButton}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button mode="outlined" onPress={() => router.back()} style={styles.actionButton}>
                Back
              </Button>
              <Button
                mode="outlined"
                icon="trash-can-outline"
                onPress={handleDelete}
                style={styles.actionButton}
                textColor={theme.colors.error}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </>
          )}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  headerText: {
    flex: 1,
    gap: spacing[1],
  },
  titleInput: {
    marginBottom: spacing[1],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    marginTop: spacing[3],
  },
});
