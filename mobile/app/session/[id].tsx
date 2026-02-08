import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { triggerRegEx } from 'react-native-controlled-mentions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { AttachStep } from 'react-native-spotlight-tour';
import {
  AppCard,
  AvatarGroup,
  ConfirmDialog,
  EmptyState,
  EntitySuggestions,
  FormDateTimePicker,
  FormModal,
  FormMultiSelect,
  FormTextInput,
  LocationMultiSelect,
  LocationCard,
  MentionInput,
  MentionRenderer,
  NoteCard,
  NPCCard,
  Screen,
  Section,
  TagChip,
  TagInput,
} from '../../src/components';
import { TOUR_STEP } from '../../src/onboarding';
import { useTheme } from '../../src/theme/ThemeProvider';
import { iconSizes, spacing } from '../../src/theme';
import { formatDateTime, formatDisplayDate, getTodayDateInput } from '../../src/utils/date';
import {
  useCampaigns,
  useDeleteSessionLog,
  useGetOrCreateTag,
  useItems,
  useLocations,
  useMentionSettings,
  useNotes,
  useNpcs,
  usePlayerCharacters,
  useSessionLog,
  useTags,
  useUpdateSessionLog,
} from '../../src/hooks';
import { generateId } from '../../src/utils/id';
import type { Item, Location, Mention, MentionSettings, Npc, PlayerCharacter } from '../../src/types/schema';

interface MentionExtractionResult {
  mentions: Mention[];
  npcIds: string[];
  playerCharacterIds: string[];
  locationIds: string[];
  itemIds: string[];
  tagIds: string[];
}

interface ShadowPromptItem {
  id: string | null;
  label: string;
  entityType: Mention['entityType'];
  route?: string;
}

/**
 * Combine two arrays of strings into a single array with duplicates removed while preserving element order.
 *
 * @param base - The primary array whose element order is preserved first
 * @param extra - The secondary array; elements not already present in `base` are appended in order
 * @returns A new array containing the unique strings from `base` followed by any additional strings from `extra` in their original order
 */
function mergeUnique(base: string[], extra: string[]): string[] {
  return Array.from(new Set([...base, ...extra]));
}

/**
 * Parse mention tokens from text and resolve them into structured mention objects and referenced ID lists.
 *
 * Scans `value` for mention patterns using the provided trigger tokens, resolves matches against the supplied entity collections, and marks mentions whose referenced entity is missing or flagged as shadow. Resolved entity IDs are collected into per-type arrays.
 *
 * @param settings - Trigger tokens to identify mention types (`character`, `location`, `item`, `tag`).
 * @param npcs - NPC records used to resolve character mentions and detect shadow NPCs.
 * @param pcs - Player character records used to distinguish PCs from NPCs.
 * @param locations - Location records used to resolve location mentions and detect shadow locations.
 * @param items - Item records used to resolve item mentions and detect shadow items.
 * @returns An object with:
 *  - `mentions`: parsed Mention objects (each includes `id`, `trigger`, `entityType`, optional `entityId`, `displayLabel`, `position`, and `status`).
 *  - `npcIds`, `playerCharacterIds`, `locationIds`, `itemIds`, `tagIds`: arrays of referenced entity IDs discovered in the text.
 */
function extractMentions(
  value: string,
  settings: MentionSettings,
  npcs: Npc[],
  pcs: PlayerCharacter[],
  locations: Location[],
  items: Item[]
): MentionExtractionResult {
  if (!value) {
    return {
      mentions: [],
      npcIds: [],
      playerCharacterIds: [],
      locationIds: [],
      itemIds: [],
      tagIds: [],
    };
  }

  const triggerToKey = new Map<string, 'character' | 'location' | 'item' | 'tag'>([
    [settings.character, 'character'],
    [settings.location, 'location'],
    [settings.item, 'item'],
    [settings.tag, 'tag'],
  ]);

  const npcById = new Map(npcs.map((npc) => [npc.id, npc]));
  const pcIdSet = new Set(pcs.map((pc) => pc.id));
  const locationById = new Map(locations.map((location) => [location.id, location]));
  const itemById = new Map(items.map((item) => [item.id, item]));

  const mentionList: Mention[] = [];
  const npcIds = new Set<string>();
  const playerCharacterIds = new Set<string>();
  const locationIds = new Set<string>();
  const itemIds = new Set<string>();
  const tagIds = new Set<string>();

  const regex = new RegExp(triggerRegEx.source, 'gi');

  for (const match of value.matchAll(regex)) {
    const trigger = match[2] ?? '';
    const name = match[3] ?? '';
    const rawId = match[4] ?? '';
    if (!trigger || !name) continue;

    const triggerKey = triggerToKey.get(trigger);
    if (!triggerKey) continue;

    const entityId = rawId && rawId !== 'null' ? rawId : null;
    let entityType: Mention['entityType'] = 'tag';
    let status: Mention['status'] = 'resolved';

    switch (triggerKey) {
      case 'character': {
        if (entityId && pcIdSet.has(entityId)) {
          entityType = 'pc';
          playerCharacterIds.add(entityId);
        } else {
          entityType = 'npc';
          if (entityId) {
            npcIds.add(entityId);
            const npc = npcById.get(entityId);
            if (!npc || npc.status === 'shadow') {
              status = 'shadow';
            }
          } else {
            status = 'shadow';
          }
        }
        break;
      }
      case 'location': {
        entityType = 'location';
        if (entityId) {
          locationIds.add(entityId);
          const location = locationById.get(entityId);
          if (!location || location.status === 'shadow') {
            status = 'shadow';
          }
        } else {
          status = 'shadow';
        }
        break;
      }
      case 'item': {
        entityType = 'item';
        if (entityId) {
          itemIds.add(entityId);
          const item = itemById.get(entityId);
          if (!item || item.status === 'shadow') {
            status = 'shadow';
          }
        } else {
          status = 'shadow';
        }
        break;
      }
      case 'tag': {
        entityType = 'tag';
        if (entityId) {
          tagIds.add(entityId);
        }
        if (!entityId) {
          status = 'shadow';
        }
        break;
      }
      default:
        break;
    }

    const start = match.index ?? 0;
    const end = start + (match[0]?.length ?? 0);

    mentionList.push({
      id: generateId(),
      trigger,
      entityType,
      entityId,
      displayLabel: name,
      position: { start, end },
      status,
    });
  }

  return {
    mentions: mentionList,
    npcIds: Array.from(npcIds),
    playerCharacterIds: Array.from(playerCharacterIds),
    locationIds: Array.from(locationIds),
    itemIds: Array.from(itemIds),
    tagIds: Array.from(tagIds),
  };
}

/**
 * Produce a deduplicated list of shadow prompt items from mention objects, including navigation routes when an entityId is available.
 *
 * @param mentions - Array of mentions to process; only mentions with `status === 'shadow'` are included in the result
 * @returns An array of `ShadowPromptItem` entries representing unique shadow mentions. Each item contains `id`, `label`, `entityType`, and a `route` when the mention has an `entityId` (route is derived from the `entityType`)
 */
function buildShadowPromptItems(mentions: Mention[]): ShadowPromptItem[] {
  const items: ShadowPromptItem[] = [];
  const seen = new Set<string>();

  mentions.forEach((mention) => {
    if (mention.status !== 'shadow') return;
    const key = `${mention.entityType}:${mention.entityId ?? mention.displayLabel.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);

    let route: string | undefined;
    if (mention.entityId) {
      switch (mention.entityType) {
        case 'npc':
          route = `/npc/${mention.entityId}`;
          break;
        case 'pc':
          route = `/player-character/${mention.entityId}`;
          break;
        case 'location':
          route = `/location/${mention.entityId}`;
          break;
        case 'item':
          route = `/item/${mention.entityId}`;
          break;
        case 'tag':
          route = `/tag/${mention.entityId}`;
          break;
        default:
          route = undefined;
      }
    }

    items.push({
      id: mention.entityId,
      label: mention.displayLabel || 'Unnamed',
      entityType: mention.entityType,
      route,
    });
  });

  return items;
}

/**
 * Display a session's details and provide UI to view and edit its log, linked entities, and metadata.
 *
 * Supports mention-aware content editing with autosave, management of campaigns/locations/NPCs/notes/tags,
 * resolving incomplete ("shadow") entities, and deleting the session.
 *
 * @returns A React element representing the session detail screen
 */
export default function SessionDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  }, [params.id]);

  const session = useSessionLog(sessionId);
  const campaigns = useCampaigns();
  const locations = useLocations();
  const npcs = useNpcs();
  const items = useItems();
  const notes = useNotes();
  const playerCharacters = usePlayerCharacters();
  const updateSessionLog = useUpdateSessionLog();
  const deleteSessionLog = useDeleteSessionLog();

  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState('');
  const [keyDecisions, setKeyDecisions] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [content, setContent] = useState('');
  const [shadowPromptOpen, setShadowPromptOpen] = useState(false);
  const [campaignIds, setCampaignIds] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [npcIds, setNpcIds] = useState<string[]>([]);
  const [noteIds, setNoteIds] = useState<string[]>([]);
  const [playerCharacterIds, setPlayerCharacterIds] = useState<string[]>([]);
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeLinkModal, setActiveLinkModal] = useState<
    'participants' | 'campaigns' | 'locations' | 'npcs' | 'notes' | 'tags' | null
  >(null);

  const normalizeCampaignIds = (ids: string[]) => (ids.length > 0 ? [ids[0]] : []);

  const displayCampaignIds = useMemo(
    () =>
      isEditing
        ? campaignIds
        : normalizeCampaignIds(session?.campaignIds ?? []),
    [campaignIds, isEditing, session?.campaignIds]
  );

  const continuityInfo = useMemo(() => {
    if (displayCampaignIds.length === 0) {
      return { continuityId: undefined, hasMismatch: false };
    }
    const selectedCampaigns = campaigns.filter((campaign) =>
      displayCampaignIds.includes(campaign.id)
    );
    const continuitySet = new Set(
      selectedCampaigns.map((campaign) => campaign.continuityId).filter(Boolean)
    );
    if (continuitySet.size > 1) {
      return { continuityId: undefined, hasMismatch: true };
    }
    const [continuityId] = Array.from(continuitySet);
    return { continuityId, hasMismatch: false };
  }, [campaigns, displayCampaignIds]);
  const continuityId = continuityInfo.continuityId;
  const hasContinuityMismatch = continuityInfo.hasMismatch;
  const activeCampaignId = displayCampaignIds[0] || '';
  const tagContinuityId = hasContinuityMismatch ? undefined : continuityId;
  const tags = useTags(tagContinuityId, tagContinuityId ? activeCampaignId : undefined);
  const getOrCreateTag = useGetOrCreateTag(
    tagContinuityId ? { continuityId: tagContinuityId, scope: 'continuity' } : undefined
  );
  const { settings: mentionSettings } = useMentionSettings();

  const mentionDerived = useMemo(
    () => extractMentions(content, mentionSettings, npcs, playerCharacters, locations, items),
    [content, mentionSettings, npcs, playerCharacters, locations, items]
  );

  const shadowPromptItems = useMemo(
    () => buildShadowPromptItems(mentionDerived.mentions),
    [mentionDerived.mentions]
  );

  useEffect(() => {
    if (session && !isEditing) {
      setTitle(session.title);
      setDate(session.date);
      setSummary(session.summary);
      setKeyDecisions(session.keyDecisions);
      setOutcomes(session.outcomes);
      setContent(session.content || '');
      setCampaignIds(normalizeCampaignIds(session.campaignIds));
      setLocationIds(session.locationIds);
      setNpcIds(session.npcIds);
      setNoteIds(session.noteIds);
      setPlayerCharacterIds(session.playerCharacterIds);
      setItemIds(session.itemIds);
      setTagIds(session.tagIds);
    }
  }, [session, isEditing]);

  useEffect(() => {
    if (!isEditing || !session) return;
    if ((content ?? '') === (session.content ?? '')) return;

    const handle = setTimeout(() => {
      updateSessionLog(session.id, {
        content,
        mentions: mentionDerived.mentions,
        locationIds: mergeUnique(locationIds, mentionDerived.locationIds),
        npcIds: mergeUnique(npcIds, mentionDerived.npcIds),
        playerCharacterIds: mergeUnique(
          playerCharacterIds,
          mentionDerived.playerCharacterIds
        ),
        itemIds: mergeUnique(itemIds, mentionDerived.itemIds),
        tagIds: mergeUnique(tagIds, mentionDerived.tagIds),
      });
    }, 600);

    return () => clearTimeout(handle);
  }, [
    content,
    isEditing,
    itemIds,
    locationIds,
    mentionDerived,
    npcIds,
    playerCharacterIds,
    session,
    tagIds,
    updateSessionLog,
  ]);

  const displayLocationIds = useMemo(
    () => (isEditing ? locationIds : session?.locationIds ?? []),
    [isEditing, locationIds, session?.locationIds]
  );
  const displayNpcIds = useMemo(
    () => (isEditing ? npcIds : session?.npcIds ?? []),
    [isEditing, npcIds, session?.npcIds]
  );
  const displayNoteIds = useMemo(
    () => (isEditing ? noteIds : session?.noteIds ?? []),
    [isEditing, noteIds, session?.noteIds]
  );
  const displayPlayerIds = useMemo(
    () => (isEditing ? playerCharacterIds : session?.playerCharacterIds ?? []),
    [isEditing, playerCharacterIds, session?.playerCharacterIds]
  );
  const displayTagIds = useMemo(
    () => (isEditing ? tagIds : session?.tagIds ?? []),
    [isEditing, session?.tagIds, tagIds]
  );

  const campaignIdSet = useMemo(
    () => new Set(displayCampaignIds),
    [displayCampaignIds]
  );

  const campaignOptions = useMemo(() => {
    return campaigns.map((campaign) => ({
      label: campaign.name || 'Untitled campaign',
      value: campaign.id,
    }));
  }, [campaigns]);

  const selectableLocations = useMemo(() => {
    if (campaignIdSet.size === 0) {
      return continuityId
        ? locations.filter((location) => location.continuityId === continuityId)
        : locations;
    }
    return locations.filter((location) => location.campaignIds.some((id) => campaignIdSet.has(id)));
  }, [campaignIdSet, continuityId, locations]);

  const npcOptions = useMemo(() => {
    const filtered =
      campaignIdSet.size === 0
        ? continuityId
          ? npcs.filter((npc) => npc.continuityId === continuityId)
          : npcs
        : npcs.filter((npc) => npc.campaignIds.some((id) => campaignIdSet.has(id)));
    return filtered.map((npc) => ({
      label:
        npc.scope === 'continuity'
          ? `${npc.name || 'Unnamed NPC'} (Shared)`
          : npc.name || 'Unnamed NPC',
      value: npc.id,
    }));
  }, [campaignIdSet, continuityId, npcs]);

  const noteOptions = useMemo(() => {
    const filtered =
      campaignIdSet.size === 0
        ? continuityId
          ? notes.filter((note) => note.continuityId === continuityId)
          : notes
        : notes.filter((note) => {
            if (note.scope === 'campaign') {
              return campaignIdSet.has(note.campaignId);
            }
            if (note.scope === 'continuity') {
              return note.campaignIds.some((id) => campaignIdSet.has(id));
            }
            return false;
          });
    return filtered.map((note) => ({
      label:
        note.scope === 'continuity'
          ? `${note.title || 'Untitled note'} (Shared)`
          : note.title || 'Untitled note',
      value: note.id,
    }));
  }, [campaignIdSet, continuityId, notes]);

  const playerOptions = useMemo(() => {
    const filtered =
      campaignIdSet.size === 0
        ? playerCharacters
        : playerCharacters.filter((pc) => pc.campaignIds.some((id) => campaignIdSet.has(id)));
    return filtered.map((pc) => ({
      label: pc.name || 'Unnamed character',
      value: pc.id,
    }));
  }, [campaignIdSet, playerCharacters]);

  const linkedCampaigns = useMemo(() => {
    const ids = new Set(displayCampaignIds);
    return campaigns.filter((campaign) => ids.has(campaign.id));
  }, [campaigns, displayCampaignIds]);

  const linkedLocations = useMemo(() => {
    const ids = new Set(displayLocationIds);
    return locations.filter((location) => ids.has(location.id));
  }, [displayLocationIds, locations]);

  const linkedNpcs = useMemo(() => {
    const ids = new Set(displayNpcIds);
    return npcs.filter((npc) => ids.has(npc.id));
  }, [displayNpcIds, npcs]);

  const linkedNotes = useMemo(() => {
    const ids = new Set(displayNoteIds);
    return notes.filter((note) => ids.has(note.id));
  }, [displayNoteIds, notes]);

  const linkedPlayers = useMemo(() => {
    const ids = new Set(displayPlayerIds);
    return playerCharacters.filter((pc) => ids.has(pc.id));
  }, [displayPlayerIds, playerCharacters]);

  const availableTags = useMemo(
    () => (tagContinuityId ? tags : []),
    [tagContinuityId, tags]
  );

  const resolvedTags = useMemo(() => {
    const tagById = new Map(availableTags.map((tag) => [tag.id, tag]));
    return displayTagIds
      .map((id) => tagById.get(id))
      .filter((tag): tag is (typeof availableTags)[number] => tag !== undefined);
  }, [availableTags, displayTagIds]);

  const handleCreateTag = (name: string) => {
    if (!tagContinuityId) return undefined;
    const id = getOrCreateTag(name);
    return id || undefined;
  };

  const handleCampaignChange = (value: string[]) => {
    const nextCampaignIds = value.length > 0 ? [value[value.length - 1]] : [];
    setCampaignIds(nextCampaignIds);
    if (nextCampaignIds.length === 0) return;
    const allowedCampaigns = new Set(nextCampaignIds);
    const allowedLocations = new Set(
      locations
        .filter((location) => location.campaignIds.some((id) => allowedCampaigns.has(id)))
        .map((location) => location.id)
    );
    const allowedNpcs = new Set(
      npcs
        .filter((npc) => npc.campaignIds.some((id) => allowedCampaigns.has(id)))
        .map((npc) => npc.id)
    );
    const allowedNotes = new Set(
      notes
        .filter((note) => {
          if (note.scope === 'campaign') {
            return allowedCampaigns.has(note.campaignId);
          }
          if (note.scope === 'continuity') {
            return note.campaignIds.some((id) => allowedCampaigns.has(id));
          }
          return false;
        })
        .map((note) => note.id)
    );
    const allowedPlayers = new Set(
      playerCharacters
        .filter((pc) => pc.campaignIds.some((id) => allowedCampaigns.has(id)))
        .map((pc) => pc.id)
    );
    setLocationIds((prev) => prev.filter((id) => allowedLocations.has(id)));
    setNpcIds((prev) => prev.filter((id) => allowedNpcs.has(id)));
    setNoteIds((prev) => prev.filter((id) => allowedNotes.has(id)));
    setPlayerCharacterIds((prev) => prev.filter((id) => allowedPlayers.has(id)));
  };

  const handleEdit = () => {
    if (!session) return;
    setTitle(session.title);
    setDate(session.date);
    setSummary(session.summary);
    setKeyDecisions(session.keyDecisions);
    setOutcomes(session.outcomes);
    setContent(session.content || '');
    setCampaignIds(normalizeCampaignIds(session.campaignIds));
    setLocationIds(session.locationIds);
    setNpcIds(session.npcIds);
    setNoteIds(session.noteIds);
    setPlayerCharacterIds(session.playerCharacterIds);
    setItemIds(session.itemIds);
    setTagIds(session.tagIds);
    setError(null);
    setShowAdvanced(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (session) {
      setTitle(session.title);
      setDate(session.date);
      setSummary(session.summary);
      setKeyDecisions(session.keyDecisions);
      setOutcomes(session.outcomes);
      setContent(session.content || '');
      setCampaignIds(normalizeCampaignIds(session.campaignIds));
      setLocationIds(session.locationIds);
      setNpcIds(session.npcIds);
      setNoteIds(session.noteIds);
      setPlayerCharacterIds(session.playerCharacterIds);
      setItemIds(session.itemIds);
      setTagIds(session.tagIds);
    }
    setError(null);
    setShowAdvanced(false);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!session) return;
    const trimmedTitle = title.trim();
    const resolvedDate = date.trim() || getTodayDateInput();
    setError(null);
    try {
      updateSessionLog(session.id, {
        title: trimmedTitle,
        date: resolvedDate,
        summary: summary.trim(),
        keyDecisions: keyDecisions.trim(),
        outcomes: outcomes.trim(),
        content,
        campaignIds,
        mentions: mentionDerived.mentions,
        locationIds: mergeUnique(locationIds, mentionDerived.locationIds),
        npcIds: mergeUnique(npcIds, mentionDerived.npcIds),
        noteIds,
        playerCharacterIds: mergeUnique(
          playerCharacterIds,
          mentionDerived.playerCharacterIds
        ),
        itemIds: mergeUnique(itemIds, mentionDerived.itemIds),
        tagIds: mergeUnique(tagIds, mentionDerived.tagIds),
      });
      setIsEditing(false);
      if (shadowPromptItems.length > 0) {
        setShadowPromptOpen(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update session.';
      setError(message);
    }
  };

  const quickInsertItems = useMemo(
    () => [
      { label: 'Character', trigger: mentionSettings.character, icon: 'account-outline' },
      { label: 'Location', trigger: mentionSettings.location, icon: 'map-marker-outline' },
      { label: 'Item', trigger: mentionSettings.item, icon: 'treasure-chest-outline' },
      { label: 'Tag', trigger: mentionSettings.tag, icon: 'tag-outline' },
    ],
    [mentionSettings]
  );

  const handleInsertTrigger = (trigger: string) => {
    setContent((prev) => {
      const next = prev && !prev.endsWith(' ') ? `${prev} ` : prev;
      return `${next}${trigger}`;
    });
  };

  const closeShadowPrompt = () => setShadowPromptOpen(false);

  const handleCompleteAll = () => {
    const firstRoute = shadowPromptItems.find((item) => item.route)?.route;
    setShadowPromptOpen(false);
    if (firstRoute) {
      router.push(firstRoute);
    }
  };

  const handleDelete = () => {
    if (!session || isDeleting) return;
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
  };

  const openLinkModal = (
    target: 'participants' | 'campaigns' | 'locations' | 'npcs' | 'notes' | 'tags'
  ) => {
    setActiveLinkModal(target);
  };

  const closeLinkModal = () => setActiveLinkModal(null);

  const linkModalTitle = (() => {
    switch (activeLinkModal) {
      case 'participants':
        return 'Participants';
      case 'campaigns':
        return 'Campaign';
      case 'locations':
        return 'Locations';
      case 'npcs':
        return 'NPCs';
      case 'notes':
        return 'Notes';
      case 'tags':
        return 'Tags';
      default:
        return '';
    }
  })();

  const linkModalBody = (() => {
    switch (activeLinkModal) {
      case 'participants':
        return (
          <FormMultiSelect
            label="Player characters"
            value={playerCharacterIds}
            options={playerOptions}
            onChange={setPlayerCharacterIds}
            helperText="Choose who took part in this session."
          />
        );
      case 'campaigns':
        return (
          <FormMultiSelect
            label="Campaign"
            value={campaignIds}
            options={campaignOptions}
            onChange={handleCampaignChange}
          />
        );
      case 'locations':
        return (
          <LocationMultiSelect
            locations={selectableLocations}
            value={locationIds}
            onChange={setLocationIds}
          />
        );
      case 'npcs':
        return (
          <FormMultiSelect
            label="NPCs"
            value={npcIds}
            options={npcOptions}
            onChange={setNpcIds}
          />
        );
      case 'notes':
        return (
          <FormMultiSelect
            label="Notes"
            value={noteIds}
            options={noteOptions}
            onChange={setNoteIds}
          />
        );
      case 'tags':
        if (!tagContinuityId) {
          return (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Select campaigns from a single continuity to edit tags.
            </Text>
          );
        }
        return (
          <TagInput
            tags={availableTags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
            selectedIds={tagIds}
            onChange={setTagIds}
            onCreateTag={handleCreateTag}
          />
        );
      default:
        return null;
    }
  })();

  const confirmDelete = () => {
    if (!session || isDeleting) return;
    try {
      setIsDeleting(true);
      deleteSessionLog(session.id);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete session.';
      setError(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (!session) {
    return (
      <Screen>
        <EmptyState
          title="Session not found"
          description="This session log may have been deleted."
          icon="calendar-blank-outline"
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: session.title || 'Session' }} />
      <Screen>
        <AttachStep index={TOUR_STEP.SESSION_DETAIL} fill>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              {isEditing ? (
                <>
                  <FormTextInput
                    label="Title (optional)"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Session title"
                  />
                  <FormDateTimePicker
                    label="Date (optional)"
                    value={date}
                    onChange={setDate}
                    mode="date"
                    helperText="Pick the session date."
                  />
                </>
              ) : (
                <>
                  <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                    {session.title || 'Untitled session'}
                  </Text>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDisplayDate(session.date)}
                  </Text>
                </>
              )}
            </View>
            {!isEditing && (
              <IconButton icon="pencil" onPress={handleEdit} accessibilityLabel="Edit session" />
            )}
          </View>
        </AttachStep>

        <AttachStep index={TOUR_STEP.SESSION_MENTIONS} fill>
          <Section title="Session Log" icon="text-box-outline">
            {isEditing ? (
              <>
                <MentionInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Capture what happens in the moment..."
                  renderSuggestions={(triggers) => (
                    <EntitySuggestions
                      character={triggers.character}
                      location={triggers.location}
                      item={triggers.item}
                      tag={triggers.tag}
                    />
                  )}
                />
                <View style={styles.quickInsertBlock}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Quick insert
                  </Text>
                  <View style={styles.quickInsertRow}>
                    {quickInsertItems.map((item) => (
                      <IconButton
                        key={item.label}
                        icon={item.icon}
                        size={iconSizes.md}
                        mode="outlined"
                        onPress={() => handleInsertTrigger(item.trigger)}
                        accessibilityLabel={`Insert ${item.label} trigger`}
                        iconColor={theme.colors.primary}
                      />
                    ))}
                  </View>
                  <View style={styles.quickInsertLabels}>
                    {quickInsertItems.map((item) => (
                      <Text
                        key={`${item.label}-label`}
                        variant="labelSmall"
                        style={{ color: theme.colors.onSurfaceVariant }}
                      >
                        {item.trigger} {item.label}
                      </Text>
                    ))}
                  </View>
                </View>
              </>
            ) : session.content?.trim() ? (
              <MentionRenderer value={session.content} mentions={mentionDerived.mentions} />
            ) : (
              <View style={styles.summaryBlock}>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  No session log yet.
                </Text>
              </View>
            )}
          </Section>
        </AttachStep>

        <Section title="Summary" icon="clipboard-text-outline">
          {isEditing ? (
            <>
              <FormTextInput
                label="Summary"
                value={summary}
                onChangeText={setSummary}
                multiline
                style={styles.summaryInput}
              />
              {showAdvanced ? (
                <>
                  <FormTextInput
                    label="Key decisions"
                    value={keyDecisions}
                    onChangeText={setKeyDecisions}
                    multiline
                    style={styles.summaryInput}
                  />
                  <FormTextInput
                    label="Outcomes"
                    value={outcomes}
                    onChangeText={setOutcomes}
                    multiline
                    style={styles.summaryInput}
                  />
                </>
              ) : (
                <Button mode="text" onPress={() => setShowAdvanced(true)}>
                  Add key decisions + outcomes
                </Button>
              )}
            </>
          ) : (
            <View style={styles.summaryBlock}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {session.summary?.trim() ? session.summary : 'No summary yet.'}
              </Text>
              <View style={styles.summarySection}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Key decisions
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {session.keyDecisions?.trim() ? session.keyDecisions : 'None recorded.'}
                </Text>
              </View>
              <View style={styles.summarySection}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Outcomes
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {session.outcomes?.trim() ? session.outcomes : 'None recorded.'}
                </Text>
              </View>
            </View>
          )}
        </Section>

        <Section title="Participants" icon="account-group-outline">
          {isEditing ? (
            <AppCard
              title="Manage participants"
              subtitle={`${playerCharacterIds.length} selected`}
              onPress={() => openLinkModal('participants')}
              right={
                <View style={styles.editCardRight}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
              }
              style={styles.editCard}
            />
          ) : linkedPlayers.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No participants linked.
            </Text>
          ) : (
            <View style={styles.participantGroup}>
              <AvatarGroup
                items={linkedPlayers.map((pc) => ({
                  id: pc.id,
                  name: pc.name,
                  image: pc.image,
                }))}
              />
              {linkedPlayers.map((pc) => (
                <AppCard
                  key={pc.id}
                  title={pc.name || 'Unnamed character'}
                  subtitle={pc.player ? `Player: ${pc.player}` : 'No player listed.'}
                  onPress={() => router.push(`/player-character/${pc.id}`)}
                  style={styles.inlineCard}
                />
              ))}
            </View>
          )}
        </Section>

        <Section title="Links" icon="link-variant">
          {isEditing ? (
            <View style={styles.linkList}>
              <AppCard
                title="Campaign"
                subtitle={campaignIds.length > 0 ? '1 selected' : 'Not linked'}
                onPress={() => openLinkModal('campaigns')}
                right={
                  <View style={styles.editCardRight}>
                    <MaterialCommunityIcons
                      name="folder-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={iconSizes.md}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                }
                style={styles.editCard}
              />
              <AppCard
                title="Locations"
                subtitle={`${locationIds.length} selected`}
                onPress={() => openLinkModal('locations')}
                right={
                  <View style={styles.editCardRight}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                }
                style={styles.editCard}
              />
              <AppCard
                title="NPCs"
                subtitle={`${npcIds.length} selected`}
                onPress={() => openLinkModal('npcs')}
                right={
                  <View style={styles.editCardRight}>
                    <MaterialCommunityIcons
                      name="account-group-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                }
                style={styles.editCard}
              />
              <AppCard
                title="Notes"
                subtitle={`${noteIds.length} selected`}
                onPress={() => openLinkModal('notes')}
                right={
                  <View style={styles.editCardRight}>
                    <MaterialCommunityIcons
                      name="note-text-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                }
                style={styles.editCard}
              />
              <AppCard
                title="Tags"
                subtitle={`${tagIds.length} selected`}
                onPress={() => openLinkModal('tags')}
                right={
                  <View style={styles.editCardRight}>
                    <MaterialCommunityIcons
                      name="tag-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                }
                style={styles.editCard}
              />
            </View>
          ) : (
            <>
              {linkedCampaigns.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  No campaigns linked.
                </Text>
              ) : (
                linkedCampaigns.map((campaign) => (
                  <AppCard
                    key={campaign.id}
                    title={campaign.name || 'Untitled campaign'}
                    onPress={() => router.push(`/campaign/${campaign.id}`)}
                    style={styles.inlineCard}
                  />
                ))
              )}
              {linkedLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onPress={() => router.push(`/location/${location.id}`)}
                />
              ))}
              {linkedNpcs.map((npc) => (
                <NPCCard
                  key={npc.id}
                  npc={npc}
                  onPress={() => router.push(`/npc/${npc.id}`)}
                />
              ))}
              {linkedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPress={() => router.push(`/note/${note.id}`)}
                />
              ))}
              {resolvedTags.length > 0 && (
                <View style={styles.tagsRow}>
                  {resolvedTags.map((tag) => (
                    <TagChip
                      key={tag.id}
                      id={tag.id}
                      name={tag.name}
                      color={tag.color}
                      size="small"
                      onPress={() => router.push(`/tag/${tag.id}`)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </Section>

        <View style={styles.metaRow}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Created: {formatDateTime(session.created)}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Updated: {formatDateTime(session.updated)}
          </Text>
        </View>

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
        title="Delete session?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmLoading={isDeleting}
        destructive
      />
      {shadowPromptOpen && (
        <FormModal
          title="Incomplete entities"
          visible={shadowPromptOpen}
          onDismiss={closeShadowPrompt}
          actions={
            <View style={styles.shadowActions}>
              <Button mode="contained" onPress={handleCompleteAll}>
                Complete All Now
              </Button>
              <Button mode="text" onPress={closeShadowPrompt}>
                Remind Me Later
              </Button>
            </View>
          }
        >
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            You mentioned new entities during this session. Tap any to fill in details.
          </Text>
          <View style={styles.shadowList}>
            {shadowPromptItems.map((item) => (
              <AppCard
                key={`${item.entityType}-${item.id ?? item.label}`}
                title={item.label}
                subtitle={item.entityType.toUpperCase()}
                onPress={item.route ? () => router.push(item.route!) : undefined}
                right={
                  item.route ? (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  ) : (
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Coming soon
                    </Text>
                  )
                }
              />
            ))}
          </View>
        </FormModal>
      )}
      {activeLinkModal && (
        <FormModal
          title={linkModalTitle}
          visible={Boolean(activeLinkModal)}
          onDismiss={closeLinkModal}
          actions={
            <Button mode="contained" onPress={closeLinkModal}>
              Done
            </Button>
          }
        >
          {linkModalBody}
        </FormModal>
      )}
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
    gap: spacing[2],
  },
  summaryInput: {
    minHeight: 120,
  },
  quickInsertBlock: {
    gap: spacing[1],
  },
  quickInsertRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  quickInsertLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  shadowActions: {
    gap: spacing[2],
  },
  shadowList: {
    marginTop: spacing[2],
    gap: spacing[2],
  },
  summaryBlock: {
    gap: spacing[3],
  },
  summarySection: {
    gap: spacing[1],
  },
  linkList: {
    gap: spacing[2],
  },
  editCard: {
    paddingVertical: spacing[1],
  },
  editCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  participantGroup: {
    gap: spacing[2],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  inlineCard: {
    marginBottom: spacing[2],
  },
  metaRow: {
    marginTop: spacing[4],
    gap: spacing[1],
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