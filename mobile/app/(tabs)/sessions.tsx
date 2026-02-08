import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { AttachStep } from 'react-native-spotlight-tour';
import {
  AppCard,
  EmptyState,
  FormDateTimePicker,
  FormModal,
  FormMultiSelect,
  FormTextInput,
  ModalActions,
  Screen,
  Section,
} from '../../src/components';
import { TOUR_STEP } from '../../src/onboarding';
import { useTheme } from '../../src/theme/ThemeProvider';
import { commonStyles, layout, spacing } from '../../src/theme';
import { formatDisplayDate, getTodayDateInput } from '../../src/utils/date';
import {
  useCreateSessionLog,
  useCurrentCampaign,
  usePlayerCharacters,
  usePullToRefresh,
  useSessionLogsByDate,
} from '../../src/hooks';

/**
 * Renders the Sessions screen for the current campaign, including session list,
 * creation modal, participant selector, and pull-to-refresh handling.
 *
 * The component automatically opens the create modal when triggered via URL params,
 * shows an empty state when no campaign or sessions exist, and provides UI for
 * creating, listing, and navigating to session logs.
 *
 * @returns The Sessions screen UI as a React element.
 */
export default function SessionsScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ create?: string }>();
  const shouldOpenCreate =
    params.create === '1' || params.create === 'true' || params.create === 'yes';
  const currentCampaign = useCurrentCampaign();
  const campaignId = currentCampaign?.id;

  const sessions = useSessionLogsByDate(campaignId);
  const party = usePlayerCharacters(campaignId);
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
    if (!openedFromParam && shouldOpenCreate && currentCampaign) {
      openCreateModal();
      setOpenedFromParam(true);
    }
  }, [currentCampaign, openedFromParam, shouldOpenCreate]);

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
    setActiveLinkModal(null);
  };

  const openLinkModal = () => setActiveLinkModal('participants');
  const closeLinkModal = () => setActiveLinkModal(null);

  const handleCreate = () => {
    if (!campaignId || isCreating) return;
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
        <ModalActions
          onCancel={closeCreateModal}
          onConfirm={handleCreate}
          confirmLabel="Create"
          loading={isCreating}
          disabled={isCreating}
        />
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

  if (!currentCampaign) {
    return (
      <>
        <Stack.Screen options={{ title: 'Sessions' }} />
        <Screen>
          <EmptyState
            title="No campaign selected"
            description="Select a campaign to view session logs."
            icon="calendar-blank-outline"
            action={{ label: 'Choose campaign', onPress: () => router.push('/campaigns') }}
          />
        </Screen>
      </>
    );
  }

  if (sessions.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Sessions' }} />
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
      <Stack.Screen options={{ title: 'Sessions' }} />
      <Screen scroll={false}>
        <FlatList
          data={sessions}
          keyExtractor={(session) => session.id}
          contentContainerStyle={commonStyles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <AttachStep index={TOUR_STEP.SESSIONS_TAB}>
              <View style={styles.header}>
                <Section title="Sessions" icon="calendar-blank-outline">
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {sessions.length} session{sessions.length === 1 ? '' : 's'}
                  </Text>
                </Section>
              </View>
            </AttachStep>
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
