import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  ConfirmDialog,
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
  useCampaigns,
  useCurrentCampaign,
  useDeleteCampaign,
  useLocations,
  useNotes,
  useNpcs,
  usePlayerCharacters,
  useSetCurrentCampaign,
  useSessionLogs,
  useSessionLogsByDate,
  useUpdateCampaign,
} from '../../src/hooks';

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
}

function formatSessionDate(value?: string): string {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleDateString();
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
  const campaigns = useCampaigns();
  const currentCampaign = useCurrentCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const setCurrentCampaign = useSetCurrentCampaign();
  const continuityId = campaign?.continuityId || currentCampaign?.continuityId || '';

  const notes = useNotes(continuityId, scopedCampaignId);
  const npcs = useNpcs(scopedCampaignId);
  const locations = useLocations(scopedCampaignId);
  const sessionLogs = useSessionLogs(scopedCampaignId);
  const sessionLogsByDate = useSessionLogsByDate(scopedCampaignId);
  const party = usePlayerCharacters(scopedCampaignId);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

  const topParty = useMemo(() => {
    return [...party].sort((a, b) => (a.name || '').localeCompare(b.name || '')).slice(0, 3);
  }, [party]);

  const topSessions = useMemo(() => {
    return sessionLogsByDate.slice(0, 3);
  }, [sessionLogsByDate]);

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

  const handleSeeSessions = () => {
    if (!campaign) return;
    router.push(`/campaign/${campaign.id}/sessions`);
  };

  const handleSeeParty = () => {
    if (!campaign) return;
    router.push(`/campaign/${campaign.id}/party`);
  };

  const renderPartySubtitle = (
    playerName?: string,
    race?: string,
    className?: string
  ) => {
    const parts = [
      playerName ? `Player: ${playerName}` : null,
      race || null,
      className || null,
    ].filter(
      Boolean
    );
    return parts.length > 0 ? parts.join(' • ') : 'No details yet.';
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
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const confirmDelete = () => {
    if (!campaign || isDeleting) return;
    try {
      setIsDeleting(true);
      const remainingCampaigns = campaigns.filter((item) => item.id !== campaign.id);
      const sameContinuity = remainingCampaigns.filter(
        (item) => item.continuityId === campaign.continuityId
      );
      const nextCampaign =
        sameContinuity[0] || remainingCampaigns[0] || null;

      deleteCampaign(campaign.id);
      if (nextCampaign && currentCampaign?.id === campaign.id) {
        setCurrentCampaign(nextCampaign.id);
      }
      router.replace({
        pathname: '/campaigns',
        params: { continuityId: campaign.continuityId },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete campaign.';
      setError(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
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
            <StatCard label="Sessions" value={sessionLogs.length} onPress={handleSeeSessions} />
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

        <Section
          title="Sessions"
          icon="calendar-blank-outline"
          action={{
            label: sessionLogs.length > 0 ? 'See all' : 'Add',
            onPress: handleSeeSessions,
          }}
        >
          {topSessions.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No sessions yet.
            </Text>
          ) : (
            topSessions.map((session) => (
              <AppCard
                key={session.id}
                title={session.title || 'Untitled session'}
                subtitle={
                  session.summary?.trim() ? session.summary : formatSessionDate(session.date)
                }
                onPress={() => router.push(`/session/${session.id}`)}
              />
            ))
          )}
        </Section>

        <Section
          title="Party"
          icon="account-group-outline"
          action={{ label: party.length > 0 ? 'See all' : 'Add', onPress: handleSeeParty }}
        >
          {topParty.length === 0 ? (
            <View style={styles.partyEmpty}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                No party members yet.
              </Text>
              <Button mode="outlined" icon="plus" onPress={handleSeeParty}>
                Add character
              </Button>
            </View>
          ) : (
            topParty.map((character) => (
              <AppCard
                key={character.id}
                title={character.name || 'Unnamed character'}
                subtitle={renderPartySubtitle(
                  character.player,
                  character.race,
                  character.class
                )}
                onPress={() => router.push(`/player-character/${character.id}`)}
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
      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete campaign?"
        description="This will remove the campaign and leave related records unlinked."
        confirmLabel="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
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
  partyEmpty: {
    gap: spacing[2],
  },
});
