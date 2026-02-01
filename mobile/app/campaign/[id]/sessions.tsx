import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  AppCard,
  EmptyState,
  FormDateTimePicker,
  FormModal,
  FormMultiSelect,
  FormTextInput,
  Screen,
  Section,
} from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { commonStyles, layout, spacing } from '../../../src/theme';
import { formatDisplayDate, getTodayDateInput } from '../../../src/utils/date';
import {
  useCampaign,
  useCreateSessionLog,
  usePlayerCharacters,
  usePullToRefresh,
  useSessionLogsByDate,
} from '../../../src/hooks';

/**
 * Render the Campaign Sessions screen for viewing, creating, and managing session logs.
 *
 * Displays a campaign's session list (with pull-to-refresh), an empty state when no campaign
 * or sessions exist, and UI for creating a new session including title, date, summary,
 * and participant selection. Automatically opens the create modal when triggered via URL params.
 *
 * @returns A React element representing the Campaign Sessions screen.
 */
export default function CampaignSessionsScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[]; create?: string }>();
  const campaignId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);
  const shouldOpenCreate =
    params.create === '1' || params.create === 'true' || params.create === 'yes';
  const hasCampaignId = campaignId.trim().length > 0;
  const scopedCampaignId = hasCampaignId ? campaignId : '__missing__';

  const campaign = useCampaign(scopedCampaignId);
  const sessions = useSessionLogsByDate(hasCampaignId ? campaignId : undefined);
  const party = usePlayerCharacters(hasCampaignId ? campaignId : undefined);
  const createSessionLog = useCreateSessionLog();
  const { refreshing, onRefresh } = usePullToRefresh();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [draftPlayerIds, setDraftPlayerIds] = useState<string[]>([]);
  const [activeLinkModal, setActiveLinkModal] = useState<'participants' | null>(null);
  const [openedFromParam, setOpenedFromParam] = useState(false);

  const participantOptions = useMemo(() => {
    return party.map((pc) => ({
      label: pc.name || 'Unnamed character',
      value: pc.id,
    }));
  }, [party]);

  const openCreateModal = () => {
    setDraftTitle(`Session ${sessions.length + 1}`);
    setDraftDate(getTodayDateInput());
    setDraftSummary('');
    setDraftPlayerIds(party.map((pc) => pc.id));
    setCreateError(null);
    setIsCreateOpen(true);
  };

  useEffect(() => {
    if (!openedFromParam && shouldOpenCreate && campaign) {
      openCreateModal();
      setOpenedFromParam(true);
    }
  }, [campaign, openedFromParam, shouldOpenCreate]);

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
    setActiveLinkModal(null);
  };

  const openLinkModal = () => setActiveLinkModal('participants');
  const closeLinkModal = () => setActiveLinkModal(null);

  const handleCreate = () => {
    if (!hasCampaignId || isCreating) return;
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      setCreateError('Session title is required.');
      return;
    }
    const dateValue = draftDate.trim() || getTodayDateInput();

    setIsCreating(true);
    setCreateError(null);
    try {
      createSessionLog({
        title: trimmedTitle,
        date: dateValue,
        summary: draftSummary.trim(),
        campaignIds: [campaignId],
        playerCharacterIds: draftPlayerIds,
      });
      setIsCreateOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const createModal = (
    <FormModal
      title="New Session"
      visible={isCreateOpen}
      onDismiss={closeCreateModal}
      actions={
        <>
          <Button mode="text" onPress={closeCreateModal} disabled={isCreating}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleCreate} loading={isCreating} disabled={isCreating}>
            Create
          </Button>
        </>
      }
    >
      <FormTextInput label="Title" value={draftTitle} onChangeText={setDraftTitle} />
      <FormDateTimePicker
        label="Date"
        value={draftDate}
        onChange={setDraftDate}
        mode="date"
        helperText="Defaults to today."
      />
      <FormTextInput
        label="Summary"
        value={draftSummary}
        onChangeText={setDraftSummary}
        multiline
        style={styles.summaryInput}
      />
      <AppCard
        title="Participants"
        subtitle={`${draftPlayerIds.length} selected`}
        onPress={openLinkModal}
        right={<Text variant="labelSmall">Select</Text>}
        style={styles.editCard}
      />
      {createError && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {createError}
        </Text>
      )}
    </FormModal>
  );

  const linkModal = (
    <FormModal
      title="Participants"
      visible={Boolean(activeLinkModal)}
      onDismiss={closeLinkModal}
      actions={
        <Button mode="contained" onPress={closeLinkModal}>
          Done
        </Button>
      }
    >
      <FormMultiSelect
        label="Participants"
        value={draftPlayerIds}
        options={participantOptions}
        onChange={setDraftPlayerIds}
        helperText="Defaults to the current party."
      />
    </FormModal>
  );

  if (!hasCampaignId) {
    return (
      <>
        <Stack.Screen options={{ title: 'Sessions' }} />
        <Screen>
          <EmptyState
            title="No campaign selected"
            description="Select a campaign to view session logs."
            icon="calendar-blank-outline"
            action={{ label: 'Go Back', onPress: () => router.back() }}
          />
        </Screen>
      </>
    );
  }

  if (!campaign) {
    return (
      <>
        <Stack.Screen options={{ title: 'Sessions' }} />
        <Screen>
          <EmptyState
            title="Campaign not found"
            description="This campaign may have been deleted."
            icon="calendar-blank-outline"
            action={{ label: 'Go Back', onPress: () => router.back() }}
          />
        </Screen>
      </>
    );
  }

  if (sessions.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: campaign?.name ? `${campaign.name} Sessions` : 'Sessions' }} />
        <Screen onRefresh={onRefresh} refreshing={refreshing}>
          <Section title="Sessions" icon="calendar-blank-outline">
            <EmptyState
              title="No sessions yet"
              description="Create a session log to track your table history."
              icon="calendar-plus"
              action={{ label: 'New Session', onPress: openCreateModal }}
            />
          </Section>
        </Screen>
        {createModal}
        {linkModal}
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: campaign?.name ? `${campaign.name} Sessions` : 'Sessions' }} />
      <Screen scroll={false}>
        <FlatList
          data={sessions}
          keyExtractor={(session) => session.id}
          contentContainerStyle={commonStyles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View style={styles.header}>
              <Section title="Sessions" icon="calendar-blank-outline">
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {sessions.length} session{sessions.length === 1 ? '' : 's'}
                </Text>
              </Section>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <AppCard
                title={item.title || 'Untitled session'}
                subtitle={item.summary ? item.summary.slice(0, 120) : formatDisplayDate(item.date)}
                onPress={() => router.push(`/session/${item.id}`)}
              />
            </View>
          )}
        />
        <FAB
          icon="plus"
          onPress={openCreateModal}
          style={[commonStyles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          disabled={isCreating}
        />
      </Screen>
      {createModal}
      {linkModal}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing[2],
  },
  cardWrapper: {
    marginBottom: spacing[3],
  },
  summaryInput: {
    minHeight: 120,
  },
  editCard: {
    paddingVertical: spacing[1],
  },
});