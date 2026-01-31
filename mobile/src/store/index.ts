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
 * Renders a context provider that initializes and supplies the application store to its children.
 *
 * Initializes the store, loads persisted data, performs required backfills and migrations, starts persistence (auto-save), and ensures essential defaults (device ID, mention settings, and a continuity) before rendering children.
 *
 * @param children - Elements to render inside the provider
 * @returns A React element that provides the initialized AppStore via context (or `null` while initializing)
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const [store, setStore] = useState<AppStore | null>(null);
  const [isReady, setIsReady] = useState(false);
  const persisterRef = useRef<Persister | null>(null);

  useEffect(() => {
    /**
     * Initialize the application store by loading persisted data, performing migrations/backfills, and starting persistence.
     *
     * Ensures a device ID and mention settings exist, creates a default continuity if none exist, backfills continuity/scope/status/related metadata for campaigns, locations, NPCs, notes, tags, items, and session logs, and starts the persister's auto-save. If this is the first run or any migration occurred, triggers an immediate save. On completion the initialized store is placed into component state and readiness is marked; on error a device ID will still be ensured.
     */
    async function initStore() {
      const appStore = createAppStore();
      let persister: Persister | null = null;
      let didMigrateContinuity = false;
      let didMigrateMentionSettings = false;
      let didMigrateEntityStatus = false;
      let didMigrateSessionLogs = false;

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
          const status = (row as { status?: string }).status;
          if (!scope || !continuityId || !status) {
            appStore.setRow('npcs', npcId, {
              ...row,
              scope: scope || 'campaign',
              continuityId: continuityId || defaultContinuityId,
              status: status || 'complete',
              originId: (row as { originId?: string }).originId || '',
              originContinuityId:
                (row as { originContinuityId?: string }).originContinuityId || '',
              forkedAt: (row as { forkedAt?: string }).forkedAt || '',
              updated: now(),
            });
            didMigrateContinuity = true;
            didMigrateEntityStatus = true;
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

        // Backfill location status metadata
        Object.entries(locationsTable).forEach(([locationId, row]) => {
          const status = (row as { status?: string }).status;
          if (!status) {
            appStore.setRow('locations', locationId, {
              ...row,
              status: 'complete',
              updated: now(),
            });
            didMigrateEntityStatus = true;
          }
        });

        // Backfill item status metadata
        const itemsTable = appStore.getTable('items');
        Object.entries(itemsTable).forEach(([itemId, row]) => {
          const status = (row as { status?: string }).status;
          if (!status) {
            appStore.setRow('items', itemId, {
              ...row,
              status: 'complete',
              updated: now(),
            });
            didMigrateEntityStatus = true;
          }
        });

        // Backfill session log mention fields
        const sessionLogsTable = appStore.getTable('sessionLogs');
        Object.entries(sessionLogsTable).forEach(([sessionId, row]) => {
          const current = row as {
            content?: string;
            mentions?: string;
            itemIds?: string;
            summary?: string;
            keyDecisions?: string;
            outcomes?: string;
          };

          const updates: Record<string, string> = {};
          if (current.content === undefined) {
            const summary = (current.summary || '').trim();
            const decisions = (current.keyDecisions || '').trim();
            const outcomes = (current.outcomes || '').trim();
            let legacyContent = summary;
            if (!legacyContent && decisions) {
              legacyContent = `Key decisions: ${decisions}`;
            }
            if (outcomes) {
              legacyContent = legacyContent
                ? `${legacyContent}\nOutcomes: ${outcomes}`
                : `Outcomes: ${outcomes}`;
            }
            updates.content = legacyContent;
          }
          if (current.mentions === undefined) {
            updates.mentions = '[]';
          }
          if (current.itemIds === undefined) {
            updates.itemIds = '[]';
          }

          if (Object.keys(updates).length > 0) {
            appStore.setRow('sessionLogs', sessionId, {
              ...row,
              ...updates,
              updated: now(),
            });
            didMigrateSessionLogs = true;
          }
        });

        // Start auto-saving changes
        persister.startAutoSave();

        // Save immediately if this is first run or device ID was newly set
        if (
          !hadData ||
          didSetDeviceId ||
          didMigrateContinuity ||
          didMigrateMentionSettings ||
          didMigrateEntityStatus ||
          didMigrateSessionLogs
        ) {
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
 * Accesses the current AppStore from React context.
 *
 * @returns The current AppStore instance
 * @throws Error if called outside of a StoreProvider
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