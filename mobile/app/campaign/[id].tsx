import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, TextInput } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Screen, EmptyState, Section, StatCard } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme';
import {
  useCampaign,
  useDeleteCampaign,
  useLocations,
  useNotes,
  useNpcs,
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

  const campaign = useCampaign(campaignId);
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const notes = useNotes(campaignId);
  const npcs = useNpcs(campaignId);
  const locations = useLocations(campaignId);
  const sessionLogs = useSessionLogs(campaignId);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
              <TextInput
                mode="outlined"
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
