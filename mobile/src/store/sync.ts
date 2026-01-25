/**
 * P2P sync using Yjs + WebRTC.
 * Enables real-time sync between devices at the table.
 */

import * as Y from 'yjs';
import { Platform } from 'react-native';
import { WebrtcProvider } from 'y-webrtc';
import type { MergeableStore } from 'tinybase';
import { createLogger } from '../utils/logger';

const log = createLogger('sync');

// Signaling servers for WebRTC connection establishment
const SIGNALING_SERVERS = [
  'wss://signaling.yjs.dev',
  'wss://y-webrtc-signaling-eu.herokuapp.com',
  'wss://y-webrtc-signaling-us.herokuapp.com',
];

const ICE_SERVERS = [
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// Room prefix for namespacing
const ROOM_PREFIX = 'dndbook-';

export interface SyncSession {
  roomId: string;
  doc: Y.Doc;
  provider: WebrtcProvider;
  isHost: boolean;
  cleanup?: () => void;
}

export interface SyncState {
  isConnected: boolean;
  peerCount: number;
  roomId: string | null;
}

let currentSession: SyncSession | null = null;

export function isSyncSupported(): boolean {
  return Platform.OS === 'web';
}

function assertSyncSupported(): void {
  if (!isSyncSupported()) {
    throw new Error('P2P sync is not supported on native yet.');
  }
}

/**
 * Generates a human-readable room code.
 * Format: ABC-123 (letters + numbers for easy verbal sharing)
 */
export function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I, O to avoid confusion
  const numbers = '0123456789';

  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  code += '-';
  for (let i = 0; i < 3; i++) {
    code += numbers[Math.floor(Math.random() * numbers.length)];
  }

  return code;
}

/**
 * Syncs TinyBase store data to/from Yjs document.
 */
function syncStoreToYDoc(store: MergeableStore, doc: Y.Doc, seedInitial: boolean): () => void {
  const yStore = doc.getMap('store');
  let applyingRemote = false;

  // Initial sync: push current store state to Yjs
  const storeJson = store.getJson();
  if (seedInitial || !yStore.has('data')) {
    yStore.set('data', storeJson);
  }

  // Listen for local store changes -> push to Yjs
  const tablesListenerId = store.addTablesListener(() => {
    if (applyingRemote) return;
    yStore.set('data', store.getJson());
  });

  const valuesListenerId = store.addValuesListener(() => {
    if (applyingRemote) return;
    yStore.set('data', store.getJson());
  });

  // Listen for remote Yjs changes -> update local store
  const handleYStoreChange = (event: Y.YMapEvent<unknown>) => {
    if (event.keysChanged.has('data')) {
      const remoteData = yStore.get('data') as string | undefined;
      if (remoteData) {
        try {
          // Only update if data is different (avoid loops)
          const currentData = store.getJson();
          if (remoteData !== currentData) {
            applyingRemote = true;
            try {
              store.setJson(remoteData);
            } finally {
              applyingRemote = false;
            }
          }
        } catch (error) {
          log.error('Failed to apply remote sync data', error);
        }
      }
    }
  };

  yStore.observe(handleYStoreChange);

  return () => {
    store.delListener(tablesListenerId);
    store.delListener(valuesListenerId);
    yStore.unobserve(handleYStoreChange);
  };
}

/**
 * Starts hosting a sync session.
 * Returns the room code for others to join.
 */
export async function hostSession(store: MergeableStore): Promise<string> {
  // Leave any existing session
  await leaveSession();
  assertSyncSupported();

  const roomCode = generateRoomCode();
  const roomId = ROOM_PREFIX + roomCode;

  const doc = new Y.Doc();

  const provider = new WebrtcProvider(roomId, doc, {
    signaling: SIGNALING_SERVERS,
    peerOpts: {
      config: {
        iceServers: ICE_SERVERS,
      },
    },
  });

  // Sync store with Yjs doc
  const cleanup = syncStoreToYDoc(store, doc, true);

  currentSession = {
    roomId: roomCode,
    doc,
    provider,
    isHost: true,
    cleanup,
  };

  return roomCode;
}

/**
 * Joins an existing sync session.
 */
export async function joinSession(store: MergeableStore, roomCode: string): Promise<void> {
  // Leave any existing session
  await leaveSession();
  assertSyncSupported();

  const normalizedCode = roomCode.toUpperCase().trim();
  const validRoomCode = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(normalizedCode);
  if (!validRoomCode) {
    throw new Error('Invalid room code. Use the format ABC-123.');
  }
  const roomId = ROOM_PREFIX + normalizedCode;

  const doc = new Y.Doc();

  const provider = new WebrtcProvider(roomId, doc, {
    signaling: SIGNALING_SERVERS,
    peerOpts: {
      config: {
        iceServers: ICE_SERVERS,
      },
    },
  });

  // Sync store with Yjs doc
  const cleanup = syncStoreToYDoc(store, doc, false);

  currentSession = {
    roomId: normalizedCode,
    doc,
    provider,
    isHost: false,
    cleanup,
  };
}

/**
 * Leaves the current sync session.
 */
export async function leaveSession(): Promise<void> {
  if (currentSession) {
    currentSession.cleanup?.();
    currentSession.provider.destroy();
    currentSession.doc.destroy();
    currentSession = null;
  }
}

/**
 * Gets the current sync state.
 */
export function getSyncState(): SyncState {
  if (!currentSession) {
    return {
      isConnected: false,
      peerCount: 0,
      roomId: null,
    };
  }

  const awareness = currentSession.provider.awareness;
  const peerCount = awareness.getStates().size - 1; // Exclude self

  return {
    isConnected: currentSession.provider.connected,
    peerCount: Math.max(0, peerCount),
    roomId: currentSession.roomId,
  };
}

/**
 * Checks if currently in a sync session.
 */
export function isInSession(): boolean {
  return currentSession !== null;
}

/**
 * Gets the current session info.
 */
export function getCurrentSession(): SyncSession | null {
  return currentSession;
}
