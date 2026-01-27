/**
 * TinyBase store provider and context.
 * Provides the store to the entire app via React context.
 */

import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { createAppStore, type AppStore } from './schema';
import { createPersister, type Persister } from './persistence';
import { generateDeviceId, generateId, now } from '../utils/id';
import { createLogger } from '../utils/logger';
import { DEFAULT_MENTION_SETTINGS } from '../utils/mentions';

// Context for the store
const StoreContext = createContext<AppStore | null>(null);
const log = createLogger('store');

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Provides the TinyBase store to the component tree.
 * Initializes the store, loads persisted data, and sets up auto-save.
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const [store, setStore] = useState<AppStore | null>(null);
  const [isReady, setIsReady] = useState(false);
  const persisterRef = useRef<Persister | null>(null);

  useEffect(() => {
    async function initStore() {
      const appStore = createAppStore();
      let persister: Persister | null = null;
      let didMigrateContinuity = false;
      let didMigrateMentionSettings = false;

      try {
        // Create persister and load existing data
        persister = await createPersister(appStore);
        persisterRef.current = persister;

        let hadData = false;
        try {
          // Load persisted data (if any)
          hadData = await persister.load();
        } catch (error) {
          log.error('Failed to load persisted data', error);
        }

        // Set device ID if not already set (first run or no persisted data)
        const existingDeviceId = appStore.getValue('deviceId');
        const didSetDeviceId = !existingDeviceId;
        if (didSetDeviceId) {
          appStore.setValue('deviceId', generateDeviceId());
        }

        // Ensure mention settings are initialized
        const existingMentionSettings = appStore.getValue('mentionSettings');
        if (!existingMentionSettings) {
          appStore.setValue('mentionSettings', JSON.stringify(DEFAULT_MENTION_SETTINGS));
          didMigrateMentionSettings = true;
        }

        // Ensure at least one continuity exists
        const continuitiesTable = appStore.getTable('continuities');
        let defaultContinuityId = Object.keys(continuitiesTable)[0];
        if (!defaultContinuityId) {
          defaultContinuityId = generateId();
          const timestamp = now();
          appStore.setRow('continuities', defaultContinuityId, {
            id: defaultContinuityId,
            name: 'Default Continuity',
            description: '',
            created: timestamp,
            updated: timestamp,
          });
          didMigrateContinuity = true;
        }

        // Backfill campaign continuity ids
        const campaignsTable = appStore.getTable('campaigns');
        Object.entries(campaignsTable).forEach(([campaignId, row]) => {
          const continuityId = (row as { continuityId?: string }).continuityId;
          if (!continuityId) {
            appStore.setRow('campaigns', campaignId, {
              ...row,
              continuityId: defaultContinuityId,
              updated: now(),
            });
            didMigrateContinuity = true;
          }
        });

        // Backfill location scope metadata
        const locationsTable = appStore.getTable('locations');
        Object.entries(locationsTable).forEach(([locationId, row]) => {
          const scope = (row as { scope?: string }).scope;
          const continuityId = (row as { continuityId?: string }).continuityId;
          if (!scope || !continuityId) {
            appStore.setRow('locations', locationId, {
              ...row,
              scope: scope || 'campaign',
              continuityId: continuityId || defaultContinuityId,
              originId: (row as { originId?: string }).originId || '',
              originContinuityId:
                (row as { originContinuityId?: string }).originContinuityId || '',
              forkedAt: (row as { forkedAt?: string }).forkedAt || '',
              updated: now(),
            });
            didMigrateContinuity = true;
          }
        });

        // Backfill NPC scope metadata
        const npcsTable = appStore.getTable('npcs');
        Object.entries(npcsTable).forEach(([npcId, row]) => {
          const scope = (row as { scope?: string }).scope;
          const continuityId = (row as { continuityId?: string }).continuityId;
          if (!scope || !continuityId) {
            appStore.setRow('npcs', npcId, {
              ...row,
              scope: scope || 'campaign',
              continuityId: continuityId || defaultContinuityId,
              originId: (row as { originId?: string }).originId || '',
              originContinuityId:
                (row as { originContinuityId?: string }).originContinuityId || '',
              forkedAt: (row as { forkedAt?: string }).forkedAt || '',
              updated: now(),
            });
            didMigrateContinuity = true;
          }
        });

        // Backfill note scope metadata
        const campaignContinuityById = new Map<string, string>();
        Object.entries(campaignsTable).forEach(([campaignId, row]) => {
          const continuityId = (row as { continuityId?: string }).continuityId;
          if (continuityId) {
            campaignContinuityById.set(campaignId, continuityId);
          }
        });

        const notesTable = appStore.getTable('notes');
        Object.entries(notesTable).forEach(([noteId, row]) => {
          const scope = (row as { scope?: string }).scope;
          const continuityId = (row as { continuityId?: string }).continuityId;
          const existingCampaignIds = (row as { campaignIds?: string }).campaignIds;
          if (!scope || !continuityId || !existingCampaignIds) {
            const campaignId = (row as { campaignId?: string }).campaignId || '';
            const resolvedContinuityId =
              continuityId || campaignContinuityById.get(campaignId) || defaultContinuityId;
            const campaignIds =
              existingCampaignIds || JSON.stringify(campaignId ? [campaignId] : []);
            appStore.setRow('notes', noteId, {
              ...row,
              scope: scope || 'campaign',
              continuityId: resolvedContinuityId,
              campaignId,
              campaignIds,
              originId: (row as { originId?: string }).originId || '',
              originContinuityId:
                (row as { originContinuityId?: string }).originContinuityId || '',
              forkedAt: (row as { forkedAt?: string }).forkedAt || '',
              updated: now(),
            });
            didMigrateContinuity = true;
          }
        });

        // Backfill tag scope metadata
        const tagsTable = appStore.getTable('tags');
        Object.entries(tagsTable).forEach(([tagId, row]) => {
          const scope = (row as { scope?: string }).scope;
          const continuityId = (row as { continuityId?: string }).continuityId;
          if (!scope || !continuityId) {
            appStore.setRow('tags', tagId, {
              ...row,
              scope: scope || 'continuity',
              continuityId: continuityId || defaultContinuityId,
              campaignId: (row as { campaignId?: string }).campaignId || '',
              originId: (row as { originId?: string }).originId || '',
              originContinuityId:
                (row as { originContinuityId?: string }).originContinuityId || '',
              forkedAt: (row as { forkedAt?: string }).forkedAt || '',
              updated: now(),
            });
            didMigrateContinuity = true;
          }
        });

        // Start auto-saving changes
        persister.startAutoSave();

        // Save immediately if this is first run or device ID was newly set
        if (!hadData || didSetDeviceId || didMigrateContinuity || didMigrateMentionSettings) {
          await persister.save();
        }
      } catch (error) {
        log.error('Failed to initialize store', error);

        const existingDeviceId = appStore.getValue('deviceId');
        if (!existingDeviceId) {
          appStore.setValue('deviceId', generateDeviceId());
        }
      } finally {
        setStore(appStore);
        setIsReady(true);
      }
    }

    initStore();

    // Cleanup on unmount
    return () => {
      if (persisterRef.current) {
        persisterRef.current.destroy();
      }
    };
  }, []);

  if (!isReady || !store) {
    return null; // Or a loading spinner
  }

  return React.createElement(
    StoreContext.Provider,
    { value: store },
    children
  );
}

/**
 * Hook to access the TinyBase store.
 * Must be used within a StoreProvider.
 */
export function useStore(): AppStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
}

// Re-export schema types
export { createAppStore, type AppStore } from './schema';
