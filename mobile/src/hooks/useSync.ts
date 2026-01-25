/**
 * React hook for P2P sync functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import {
  hostSession,
  joinSession,
  leaveSession,
  getSyncState,
  isInSession,
  type SyncState,
} from '../store/sync';
import { createLogger } from '../utils/logger';

const log = createLogger('sync');

export interface UseSyncReturn {
  /** Current sync state */
  state: SyncState;
  /** Whether currently in a sync session */
  inSession: boolean;
  /** Host a new sync session, returns room code */
  host: () => Promise<string>;
  /** Join an existing session by room code */
  join: (roomCode: string) => Promise<void>;
  /** Leave the current session */
  leave: () => Promise<void>;
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Hook for managing P2P sync sessions.
 */
export function useSync(): UseSyncReturn {
  const store = useStore();
  const [state, setState] = useState<SyncState>(getSyncState());
  const [inSession, setInSession] = useState(isInSession());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll for sync state updates
  useEffect(() => {
    const interval = setInterval(() => {
      setState(getSyncState());
      setInSession(isInSession());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const host = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      log.debug('Hosting sync session');
      const roomCode = await hostSession(store);
      log.debug('Hosted sync session', roomCode);
      setState(getSyncState());
      setInSession(true);
      return roomCode;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to host session';
      log.error('Failed to host session', err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [store]);

  const join = useCallback(async (roomCode: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      log.debug('Joining sync session', roomCode);
      await joinSession(store, roomCode);
      log.debug('Joined sync session', roomCode);
      setState(getSyncState());
      setInSession(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join session';
      log.error('Failed to join session', err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [store]);

  const leave = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      log.debug('Leaving sync session');
      await leaveSession();
      log.debug('Left sync session');
      setState(getSyncState());
      setInSession(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave session';
      log.error('Failed to leave session', err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    state,
    inSession,
    host,
    join,
    leave,
    isLoading,
    error,
  };
}
