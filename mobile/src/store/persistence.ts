/**
 * SQLite persistence for TinyBase store.
 * Uses expo-sqlite to persist data locally.
 */

import * as SQLite from 'expo-sqlite';
import type { MergeableStore } from 'tinybase';

const DB_NAME = 'dndbook.db';
const STORE_TABLE = 'tinybase_store';

/**
 * Creates and initializes the SQLite database for persistence.
 */
async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Create the store table if it doesn't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${STORE_TABLE} (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  return db;
}

/**
 * Saves the entire store state to SQLite.
 */
async function saveStore(db: SQLite.SQLiteDatabase, store: MergeableStore): Promise<void> {
  const json = store.getJson();

  await db.runAsync(
    `INSERT OR REPLACE INTO ${STORE_TABLE} (key, value) VALUES (?, ?)`,
    'store',
    json
  );
}

/**
 * Loads the store state from SQLite.
 */
async function loadStore(db: SQLite.SQLiteDatabase, store: MergeableStore): Promise<boolean> {
  const result = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM ${STORE_TABLE} WHERE key = ?`,
    'store'
  );

  if (result?.value) {
    try {
      store.setJson(result.value);
      return true;
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      return false;
    }
  }

  return false;
}

export interface Persister {
  load: () => Promise<boolean>;
  save: () => Promise<void>;
  startAutoSave: (intervalMs?: number) => void;
  stopAutoSave: () => void;
  destroy: () => Promise<void>;
}

/**
 * Creates a persister that saves TinyBase store to SQLite.
 */
export async function createPersister(store: MergeableStore): Promise<Persister> {
  const db = await initDatabase();
  let autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  let listenerId: string | null = null;

  const persister: Persister = {
    /**
     * Loads data from SQLite into the store.
     * Returns true if data was loaded, false if no data existed.
     */
    async load(): Promise<boolean> {
      return loadStore(db, store);
    },

    /**
     * Saves the current store state to SQLite.
     */
    async save(): Promise<void> {
      await saveStore(db, store);
    },

    /**
     * Starts auto-saving on store changes.
     * Uses debounced saves to avoid excessive writes.
     */
    startAutoSave(intervalMs = 1000): void {
      // Save on any store change (debounced)
      let saveTimeout: ReturnType<typeof setTimeout> | null = null;

      listenerId = store.addTablesListener(() => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          persister.save().catch(console.error);
        }, intervalMs);
      });

      // Also listen to values changes
      store.addValuesListener(() => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          persister.save().catch(console.error);
        }, intervalMs);
      });
    },

    /**
     * Stops auto-saving.
     */
    stopAutoSave(): void {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
      }
      if (listenerId) {
        store.delListener(listenerId);
        listenerId = null;
      }
    },

    /**
     * Cleans up resources.
     */
    async destroy(): Promise<void> {
      persister.stopAutoSave();
      await db.closeAsync();
    },
  };

  return persister;
}
