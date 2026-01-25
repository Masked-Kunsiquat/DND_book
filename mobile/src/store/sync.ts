/**
 * P2P sync using Yjs + WebRTC.
 * Enables real-time sync between devices at the table.
 */

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import type { MergeableStore } from 'tinybase';

// Signaling servers for WebRTC connection establishment
const SIGNALING_SERVERS = ['wss://signaling.yjs.dev'];

// Room prefix for namespacing
const ROOM_PREFIX = 'dndbook-';

export interface SyncSession {
  roomId: string;
  doc: Y.Doc;
  provider: WebrtcProvider;
  isHost: boolean;
}

export interface SyncState {
  isConnected: boolean;
  peerCount: number;
  roomId: string | null;
}

let currentSession: SyncSession | null = null;

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
function syncStoreToYDoc(store: MergeableStore, doc: Y.Doc): void {
  const yStore = doc.getMap('store');

  // Initial sync: push current store state to Yjs
  const storeJson = store.getJson();
  yStore.set('data', storeJson);

  // Listen for local store changes -> push to Yjs
  store.addTablesListener(() => {
    yStore.set('data', store.getJson());
  });

  store.addValuesListener(() => {
    yStore.set('data', store.getJson());
  });

  // Listen for remote Yjs changes -> update local store
  yStore.observe((event) => {
    if (event.keysChanged.has('data')) {
      const remoteData = yStore.get('data') as string | undefined;
      if (remoteData) {
        try {
          // Only update if data is different (avoid loops)
          const currentData = store.getJson();
          if (remoteData !== currentData) {
            store.setJson(remoteData);
          }
        } catch (error) {
          console.error('Failed to apply remote sync data:', error);
        }
      }
    }
  });
}

/**
 * Starts hosting a sync session.
 * Returns the room code for others to join.
 */
export async function hostSession(store: MergeableStore): Promise<string> {
  // Leave any existing session
  await leaveSession();

  const roomCode = generateRoomCode();
  const roomId = ROOM_PREFIX + roomCode;

  const doc = new Y.Doc();

  const provider = new WebrtcProvider(roomId, doc, {
    signaling: SIGNALING_SERVERS,
  });

  // Sync store with Yjs doc
  syncStoreToYDoc(store, doc);

  currentSession = {
    roomId: roomCode,
    doc,
    provider,
    isHost: true,
  };

  return roomCode;
}

/**
 * Joins an existing sync session.
 */
export async function joinSession(store: MergeableStore, roomCode: string): Promise<void> {
  // Leave any existing session
  await leaveSession();

  const normalizedCode = roomCode.toUpperCase().trim();
  const roomId = ROOM_PREFIX + normalizedCode;

  const doc = new Y.Doc();

  const provider = new WebrtcProvider(roomId, doc, {
    signaling: SIGNALING_SERVERS,
  });

  // Sync store with Yjs doc
  syncStoreToYDoc(store, doc);

  currentSession = {
    roomId: normalizedCode,
    doc,
    provider,
    isHost: false,
  };
}

/**
 * Leaves the current sync session.
 */
export async function leaveSession(): Promise<void> {
  if (currentSession) {
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
