/**
 * Custom React hooks.
 */

// UI
export { usePullToRefresh, type PullToRefreshState } from './usePullToRefresh';

// Sync
export { useSync, type UseSyncReturn } from './useSync';

// Campaigns
export {
  useCampaigns,
  useCampaign,
  useCurrentCampaign,
  useSetCurrentCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  type CreateCampaignInput,
  type UpdateCampaignInput,
} from './useCampaigns';

// Continuities
export {
  useContinuities,
  useContinuity,
  useCreateContinuity,
  useUpdateContinuity,
  useDeleteContinuity,
  type CreateContinuityInput,
  type UpdateContinuityInput,
} from './useContinuities';

// Notes
export {
  useNotes,
  useNote,
  useNotesByLocation,
  useNotesByTag,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  type CreateNoteInput,
  type UpdateNoteInput,
} from './useNotes';

// NPCs
export {
  useNpcs,
  useNpc,
  useNpcsByLocation,
  useNpcsByTag,
  useCreateNpc,
  useUpdateNpc,
  useDeleteNpc,
  type CreateNpcInput,
  type UpdateNpcInput,
} from './useNpcs';

// Locations
export {
  useLocations,
  useLocation,
  useChildLocations,
  useRootLocations,
  useLocationsByTag,
  useLocationPath,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
  type CreateLocationInput,
  type UpdateLocationInput,
} from './useLocations';

// Items
export {
  useItems,
  useItem,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  type CreateItemInput,
  type UpdateItemInput,
} from './useItems';

// Tags
export {
  useTags,
  useTag,
  useTagsByIds,
  useTagByName,
  useCreateTag,
  useGetOrCreateTag,
  useUpdateTag,
  useDeleteTag,
  type CreateTagInput,
  type UpdateTagInput,
} from './useTags';

// Session Logs
export {
  useSessionLogs,
  useSessionLog,
  useSessionLogsByDate,
  useCreateSessionLog,
  useUpdateSessionLog,
  useDeleteSessionLog,
  type CreateSessionLogInput,
  type UpdateSessionLogInput,
} from './useSessionLogs';

// Player Characters
export {
  usePlayerCharacters,
  usePlayerCharacter,
  usePlayerCharactersByPlayer,
  useCreatePlayerCharacter,
  useUpdatePlayerCharacter,
  useDeletePlayerCharacter,
  type CreatePlayerCharacterInput,
  type UpdatePlayerCharacterInput,
} from './usePlayerCharacters';

// Player Character Templates
export {
  usePlayerCharacterTemplates,
  usePlayerCharacterTemplate,
  useCreatePlayerCharacterTemplate,
  useUpdatePlayerCharacterTemplate,
  useDeletePlayerCharacterTemplate,
  type CreatePlayerCharacterTemplateInput,
  type UpdatePlayerCharacterTemplateInput,
} from './usePlayerCharacterTemplates';
