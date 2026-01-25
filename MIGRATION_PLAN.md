# DND Book: Expo Migration Plan

## Overview

Transform the React/Vite web app into an offline-first Expo mobile app with P2P sync capabilities using TinyBase + Yjs.

## Tech Stack Comparison

| Current | New |
|---------|-----|
| React + Vite | Expo (React Native) |
| PocketBase SDK | TinyBase + Yjs |
| PocketBase server | No server required (P2P) |
| TailwindCSS | NativeWind or Tamagui |
| Flowbite React | React Native Paper / Tamagui |
| react-router-dom | expo-router |

## Phase 1: Project Setup

### 1.1 Initialize Expo Project

```bash
# Create new Expo app alongside existing frontend
npx create-expo-app@latest mobile --template blank-typescript

# Install core dependencies
cd mobile
npx expo install expo-sqlite expo-file-system expo-secure-store expo-network expo-linking expo-image-picker
npm install tinybase yjs y-webrtc
```

### 1.2 Project Structure

```
DND_book/
├── backend/                 # Keep for now (optional cloud sync later)
├── frontend/                # Keep for web (optional)
├── mobile/                  # New Expo app
│   ├── app/                 # expo-router pages
│   │   ├── (auth)/
│   │   │   └── login.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx        # Dashboard
│   │   │   ├── campaigns.tsx
│   │   │   ├── notes.tsx
│   │   │   ├── npcs.tsx
│   │   │   └── locations.tsx
│   │   ├── campaign/
│   │   │   └── [id].tsx
│   │   ├── note/
│   │   │   └── [id].tsx
│   │   ├── npc/
│   │   │   └── [id].tsx
│   │   ├── location/
│   │   │   └── [id].tsx
│   │   ├── sync/
│   │   │   ├── host.tsx         # DM hosts session
│   │   │   └── join.tsx         # Players join
│   │   └── _layout.tsx
│   ├── src/
│   │   ├── store/
│   │   │   ├── index.ts         # TinyBase store setup
│   │   │   ├── schema.ts        # Table definitions
│   │   │   ├── persistence.ts   # expo-sqlite persister
│   │   │   └── sync.ts          # Yjs + WebRTC sync
│   │   ├── hooks/
│   │   │   ├── useStore.ts
│   │   │   ├── useCampaigns.ts
│   │   │   ├── useNotes.ts
│   │   │   ├── useNpcs.ts
│   │   │   ├── useLocations.ts
│   │   │   ├── useTags.ts
│   │   │   └── useSync.ts
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   ├── forms/
│   │   │   ├── layout/
│   │   │   └── sync/
│   │   ├── types/
│   │   │   └── schema.ts
│   │   └── utils/
│   │       ├── id.ts            # ID generation (nanoid)
│   │       └── colors.ts
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
└── docs/
```

## Phase 2: Data Layer (TinyBase)

### 2.1 Schema Definition

Map PocketBase collections to TinyBase tables:

```typescript
// src/store/schema.ts
import { createStore, createRelationships } from 'tinybase';

export const createAppStore = () => {
  const store = createStore();

  // Define tables matching PocketBase collections
  store.setTablesSchema({
    campaigns: {
      id: { type: 'string' },
      name: { type: 'string' },
      created: { type: 'string' },
      updated: { type: 'string' },
    },
    notes: {
      id: { type: 'string' },
      title: { type: 'string' },
      content: { type: 'string' },
      campaignId: { type: 'string' },
      locationIds: { type: 'string' },  // JSON array
      tagIds: { type: 'string' },        // JSON array
      created: { type: 'string' },
      updated: { type: 'string' },
    },
    npcs: {
      id: { type: 'string' },
      name: { type: 'string' },
      race: { type: 'string' },
      role: { type: 'string' },
      background: { type: 'string' },
      image: { type: 'string' },         // Local file path
      campaignIds: { type: 'string' },   // JSON array
      locationIds: { type: 'string' },
      noteIds: { type: 'string' },
      tagIds: { type: 'string' },
      created: { type: 'string' },
      updated: { type: 'string' },
    },
    locations: {
      id: { type: 'string' },
      name: { type: 'string' },
      type: { type: 'string' },          // Plane, Realm, etc.
      description: { type: 'string' },
      parentId: { type: 'string' },
      campaignIds: { type: 'string' },
      tagIds: { type: 'string' },
      map: { type: 'string' },           // Local file path
      images: { type: 'string' },        // JSON array of paths
      created: { type: 'string' },
      updated: { type: 'string' },
    },
    tags: {
      id: { type: 'string' },
      name: { type: 'string' },
      created: { type: 'string' },
      updated: { type: 'string' },
    },
    sessionLogs: {
      id: { type: 'string' },
      title: { type: 'string' },
      date: { type: 'string' },
      summary: { type: 'string' },
      keyDecisions: { type: 'string' },
      outcomes: { type: 'string' },
      campaignIds: { type: 'string' },
      locationIds: { type: 'string' },
      npcIds: { type: 'string' },
      noteIds: { type: 'string' },
      tagIds: { type: 'string' },
      created: { type: 'string' },
      updated: { type: 'string' },
    },
    playerCharacters: {
      id: { type: 'string' },
      name: { type: 'string' },
      player: { type: 'string' },
      race: { type: 'string' },
      class: { type: 'string' },
      background: { type: 'string' },
      campaignIds: { type: 'string' },
      noteIds: { type: 'string' },
      created: { type: 'string' },
      updated: { type: 'string' },
    },
  });

  return store;
};

// Relationships for querying
export const createAppRelationships = (store: Store) => {
  const relationships = createRelationships(store);

  // Location hierarchy
  relationships.setRelationshipDefinition(
    'locationParent',
    'locations',
    'locations',
    'parentId'
  );

  return relationships;
};
```

### 2.2 Persistence (expo-sqlite)

```typescript
// src/store/persistence.ts
import * as SQLite from 'expo-sqlite';
import { createSqlite3Persister } from 'tinybase/persisters/persister-sqlite3';
import type { Store } from 'tinybase';

export const createPersister = async (store: Store) => {
  const db = await SQLite.openDatabaseAsync('dndbook.db');

  const persister = createSqlite3Persister(store, db, {
    mode: 'tabular',  // One SQLite table per TinyBase table
    autoLoadIntervalSeconds: 1,
  });

  // Load existing data
  await persister.load();

  // Auto-save changes
  await persister.startAutoSave();

  return persister;
};
```

### 2.3 P2P Sync (Yjs + WebRTC)

```typescript
// src/store/sync.ts
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { createYjsMergeableStorePersister } from 'tinybase/persisters/persister-yjs';
import type { MergeableStore } from 'tinybase';

interface SyncSession {
  doc: Y.Doc;
  provider: WebrtcProvider;
  persister: any;
}

let currentSession: SyncSession | null = null;

export const hostSession = async (
  store: MergeableStore,
  roomId: string
): Promise<string> => {
  await leaveSession();

  const doc = new Y.Doc();

  // WebRTC provider - connects to signaling server
  const provider = new WebrtcProvider(roomId, doc, {
    signaling: ['wss://signaling.yjs.dev'],  // Public, or self-host
    password: null,  // Optional: add room password
  });

  // Sync TinyBase store with Yjs doc
  const persister = createYjsMergeableStorePersister(store, doc);
  await persister.load();
  await persister.startAutoSave();

  currentSession = { doc, provider, persister };

  return roomId;
};

export const joinSession = async (
  store: MergeableStore,
  roomId: string
): Promise<void> => {
  await leaveSession();

  const doc = new Y.Doc();

  const provider = new WebrtcProvider(roomId, doc, {
    signaling: ['wss://signaling.yjs.dev'],
  });

  const persister = createYjsMergeableStorePersister(store, doc);
  await persister.load();
  await persister.startAutoSave();

  currentSession = { doc, provider, persister };
};

export const leaveSession = async (): Promise<void> => {
  if (currentSession) {
    await currentSession.persister.stopAutoSave();
    currentSession.provider.destroy();
    currentSession.doc.destroy();
    currentSession = null;
  }
};

export const getConnectedPeers = (): number => {
  if (!currentSession) return 0;
  return currentSession.provider.awareness.getStates().size;
};

export const generateRoomId = (): string => {
  // Generate readable room code: ABC-123
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '0123456789';
  let code = '';
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)];
  code += '-';
  for (let i = 0; i < 3; i++) code += numbers[Math.floor(Math.random() * numbers.length)];
  return `dndbook-${code}`;
};
```

## Phase 3: Hooks Layer

### 3.1 Store Provider

```typescript
// src/store/index.ts
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createMergeableStore } from 'tinybase';
import { createPersister } from './persistence';

const StoreContext = createContext<MergeableStore | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<MergeableStore | null>(null);

  useEffect(() => {
    const init = async () => {
      const s = createMergeableStore();
      // Apply schema...
      await createPersister(s);
      setStore(s);
    };
    init();
  }, []);

  if (!store) return null; // Or loading screen

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  return store;
};
```

### 3.2 Data Hooks (example)

```typescript
// src/hooks/useNotes.ts
import { useTable, useRow, useSetRowCallback, useDelRowCallback } from 'tinybase/ui-react';
import { useStore } from '../store';
import { nanoid } from 'nanoid';

export const useNotes = (campaignId?: string) => {
  const store = useStore();
  const notes = useTable('notes', store);

  // Filter by campaign if provided
  const filtered = campaignId
    ? Object.fromEntries(
        Object.entries(notes).filter(([_, note]) =>
          JSON.parse(note.campaignId || '[]').includes(campaignId)
        )
      )
    : notes;

  return Object.values(filtered);
};

export const useNote = (id: string) => {
  const store = useStore();
  return useRow('notes', id, store);
};

export const useCreateNote = () => {
  const store = useStore();

  return (data: Partial<Note>) => {
    const id = nanoid();
    const now = new Date().toISOString();
    store.setRow('notes', id, {
      id,
      title: data.title || '',
      content: data.content || '',
      campaignId: data.campaignId || '',
      locationIds: JSON.stringify(data.locationIds || []),
      tagIds: JSON.stringify(data.tagIds || []),
      created: now,
      updated: now,
    });
    return id;
  };
};

export const useUpdateNote = () => {
  const store = useStore();

  return (id: string, data: Partial<Note>) => {
    const existing = store.getRow('notes', id);
    store.setRow('notes', id, {
      ...existing,
      ...data,
      updated: new Date().toISOString(),
    });
  };
};

export const useDeleteNote = () => {
  const store = useStore();
  return (id: string) => store.delRow('notes', id);
};
```

## Phase 4: UI Migration

### 4.1 Component Mapping

| Web (Flowbite) | Mobile (Recommended) |
|----------------|---------------------|
| `<Card>` | `<Card>` from react-native-paper |
| `<Button>` | `<Button>` from react-native-paper |
| `<TextInput>` | `<TextInput>` from react-native-paper |
| `<Sidebar>` | Bottom tabs via expo-router |
| `<Navbar>` | Stack header via expo-router |
| `<Modal>` | `<Portal><Modal>` from react-native-paper |
| `<Badge>` | `<Chip>` from react-native-paper |
| TailwindCSS | Custom theme system (src/theme/) |

### 4.2 Styling Approach

**Decision: React Native Paper + Custom Theme System**

We chose Paper over NativeWind because:
- Paper provides pre-built accessible components
- Custom theme in `src/theme/` gives same benefits as Tailwind (spacing scale, color palette)
- Less build complexity (no Tailwind/PostCSS config)
- MD3 theming with dark/light mode built-in

Theme usage:
```tsx
import { useTheme } from '../src/theme/ThemeProvider';
import { spacing, layout } from '../src/theme';

const { theme } = useTheme();
// theme.colors.surface, theme.colors.onSurface, etc.
// spacing[4] = 16px, layout.cardBorderRadius = 12px
```

## Phase 5: P2P Sync UI

### 5.1 Host Session Screen

```typescript
// app/sync/host.tsx
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useStore } from '../../src/store';
import { hostSession, generateRoomId, getConnectedPeers } from '../../src/store/sync';

export default function HostScreen() {
  const store = useStore();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peers, setPeers] = useState(0);

  const startSession = async () => {
    const id = generateRoomId();
    await hostSession(store, id);
    setRoomId(id);

    // Poll for peer count
    const interval = setInterval(() => {
      setPeers(getConnectedPeers());
    }, 1000);

    return () => clearInterval(interval);
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      {!roomId ? (
        <Pressable onPress={startSession} className="bg-blue-600 px-6 py-3 rounded-lg">
          <Text className="text-white font-bold">Start Session</Text>
        </Pressable>
      ) : (
        <>
          <Text className="text-2xl font-bold mb-4">{roomId}</Text>
          <QRCode value={roomId} size={200} />
          <Text className="mt-4 text-gray-600">{peers} player(s) connected</Text>
        </>
      )}
    </View>
  );
}
```

### 5.2 Join Session Screen

```typescript
// app/sync/join.tsx
import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useStore } from '../../src/store';
import { joinSession } from '../../src/store/sync';
import { router } from 'expo-router';

export default function JoinScreen() {
  const store = useStore();
  const [roomId, setRoomId] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinSession(store, roomId);
      router.replace('/');
    } catch (error) {
      console.error('Failed to join:', error);
    }
    setJoining(false);
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-xl mb-4">Enter Room Code</Text>
      <TextInput
        value={roomId}
        onChangeText={setRoomId}
        placeholder="ABC-123"
        className="border rounded-lg px-4 py-2 text-center text-2xl w-48"
        autoCapitalize="characters"
      />
      <Pressable
        onPress={handleJoin}
        disabled={joining || roomId.length < 7}
        className="bg-blue-600 px-6 py-3 rounded-lg mt-4"
      >
        <Text className="text-white font-bold">
          {joining ? 'Joining...' : 'Join Session'}
        </Text>
      </Pressable>
    </View>
  );
}
```

## Phase 6: File/Image Handling

Images and maps need special handling since they can't sync via CRDTs:

```typescript
// src/utils/files.ts
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const IMAGES_DIR = `${FileSystem.documentDirectory}images/`;

export const ensureImagesDir = async () => {
  const info = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
};

export const pickAndSaveImage = async (): Promise<string | null> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return null;

  const uri = result.assets[0].uri;
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const dest = `${IMAGES_DIR}${filename}`;

  await ensureImagesDir();
  await FileSystem.copyAsync({ from: uri, to: dest });

  return dest;
};
```

**P2P Image Sync Strategy:**
- Store only local file paths in TinyBase
- For table-top sync: images stay local (players see "[Image: npc-portrait.jpg]")
- Future enhancement: stream images over WebRTC data channel

## Phase 7: Migration Checklist

### Week 1: Foundation
- [ ] Initialize Expo project with expo-router
- [ ] Set up TinyBase store with schema
- [ ] Implement expo-sqlite persistence
- [ ] Test data CRUD operations

### Week 2: Core Screens
- [ ] Dashboard (campaign overview)
- [ ] Campaigns list/detail
- [ ] Notes list/detail with editor
- [ ] NPCs list/detail
- [ ] Locations list/detail with hierarchy

### Week 3: P2P Sync
- [ ] Implement Yjs + WebRTC sync
- [ ] Host session screen with QR code
- [ ] Join session screen
- [ ] Sync status indicator
- [ ] Test multi-device sync

### Week 4: Polish
- [ ] Tags filtering
- [ ] Search functionality
- [ ] Image handling
- [ ] Dark mode
- [ ] Error handling & offline indicators

## Data Migration (Optional)

If you have existing PocketBase data to migrate:

```typescript
// scripts/migrate-from-pocketbase.ts
import PocketBase from 'pocketbase';
import * as FileSystem from 'expo-file-system';

export const migrateFromPocketBase = async (
  pbUrl: string,
  email: string,
  password: string,
  store: MergeableStore
) => {
  const pb = new PocketBase(pbUrl);
  await pb.collection('users').authWithPassword(email, password);

  // Migrate each collection
  const campaigns = await pb.collection('campaigns').getFullList();
  for (const c of campaigns) {
    store.setRow('campaigns', c.id, {
      id: c.id,
      name: c.name,
      created: c.created,
      updated: c.updated,
    });
  }

  const notes = await pb.collection('notes').getFullList();
  for (const n of notes) {
    store.setRow('notes', n.id, {
      id: n.id,
      title: n.title,
      content: n.content,
      campaignId: n.campaign || '',
      locationIds: JSON.stringify(n.locations || []),
      tagIds: JSON.stringify(n.tags || []),
      created: n.created,
      updated: n.updated,
    });
  }

  // ... repeat for other collections
};
```

## Future Enhancements

1. **Cloud Backup**: Add optional sync to Supabase/Firebase for backup
2. **Image P2P Sync**: WebRTC data channel for binary file transfer
3. **Encryption**: E2E encrypt sync data with room password
4. **QR Code Scanning**: Use expo-camera to scan room codes
5. **Offline Indicator**: Show sync status in UI
6. **Conflict UI**: Show manual resolution for text conflicts (rare with CRDTs)
