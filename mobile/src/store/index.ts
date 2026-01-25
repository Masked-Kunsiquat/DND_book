/**
 * TinyBase store provider and context.
 * Provides the store to the entire app via React context.
 */

import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { createAppStore, type AppStore } from './schema';
import { createPersister, type Persister } from './persistence';
import { generateDeviceId } from '../utils/id';

// Context for the store
const StoreContext = createContext<AppStore | null>(null);

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

      // Create persister and load existing data
      const persister = await createPersister(appStore);
      persisterRef.current = persister;

      // Load persisted data (if any)
      const hadData = await persister.load();

      // Set device ID if not already set (first run or no persisted data)
      const existingDeviceId = appStore.getValue('deviceId');
      if (!existingDeviceId) {
        appStore.setValue('deviceId', generateDeviceId());
      }

      // Start auto-saving changes
      persister.startAutoSave();

      // Save immediately if this is first run
      if (!hadData) {
        await persister.save();
      }

      setStore(appStore);
      setIsReady(true);
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
