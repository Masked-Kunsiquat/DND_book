/**
 * TinyBase store provider and context.
 * Provides the store to the entire app via React context.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createAppStore, type AppStore } from './schema';
import { generateDeviceId } from '../utils/id';

// Context for the store
const StoreContext = createContext<AppStore | null>(null);

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Provides the TinyBase store to the component tree.
 * Initializes the store and sets up the device ID on first run.
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const [store, setStore] = useState<AppStore | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initStore() {
      const appStore = createAppStore();

      // Set device ID if not already set
      const existingDeviceId = appStore.getValue('deviceId');
      if (!existingDeviceId) {
        appStore.setValue('deviceId', generateDeviceId());
      }

      setStore(appStore);
      setIsReady(true);
    }

    initStore();
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
