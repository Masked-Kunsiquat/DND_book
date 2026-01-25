# Store Module - Agent Guidelines

This module manages all app state using TinyBase with SQLite persistence and Yjs P2P sync.

## Files

| File | Purpose |
|------|---------|
| `index.ts` | StoreProvider context, `useStore()` hook |
| `schema.ts` | TinyBase schema definition, creates MergeableStore |
| `persistence.ts` | SQLite persistence layer (expo-sqlite) |
| `sync.ts` | P2P sync with Yjs + WebRTC |

## Architecture

```
┌─────────────────┐
│   Components    │  (use hooks from src/hooks/)
└────────┬────────┘
         │
┌────────▼────────┐
│     Hooks       │  (useCampaigns, useNotes, etc.)
└────────┬────────┘
         │
┌────────▼────────┐
│   TinyBase      │  MergeableStore (CRDT-enabled)
│     Store       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌───▼───┐
│SQLite │ │ Yjs   │
│ local │ │ sync  │
└───────┘ └───────┘
```

## Key Concepts

### MergeableStore
We use `createMergeableStore()` instead of `createStore()` because:
- Required for Yjs CRDT synchronization
- Enables conflict-free merging between devices
- Tracks changes with vector clocks

### Schema
All relationship fields are stored as JSON strings:
```typescript
// In TinyBase (string)
locationIds: '["abc123", "def456"]'

// In domain types (parsed)
locationIds: ['abc123', 'def456']
```

### Global Values
Store-level values (not in tables):
- `currentCampaignId` - Active campaign filter
- `deviceId` - Unique device identifier
- `lastSyncedAt` - Last P2P sync timestamp

## Persistence

SQLite stores the entire store as JSON in a single row:
```sql
CREATE TABLE tinybase_store (key TEXT PRIMARY KEY, value TEXT)
```

Auto-save is debounced (1000ms) to batch rapid changes.

## P2P Sync

### Room Codes
Format: `dndbook-XXX-NNN` (e.g., `dndbook-ABC-123`)
- 3 letters (no I, O to avoid confusion)
- 3 numbers

### Sync Flow
1. Host calls `hostSession(store)` → gets room code
2. Players call `joinSession(store, roomCode)`
3. Changes sync bidirectionally via WebRTC
4. Call `leaveSession()` to disconnect

### Signaling Server
Uses public `wss://signaling.yjs.dev` - consider self-hosting for production.

## Common Tasks

### Add new table
1. Add to `setTablesSchema()` in `schema.ts`
2. Create corresponding hook in `src/hooks/`
3. Add types to `src/types/schema.ts`

### Add new global value
1. Add to `setValuesSchema()` in `schema.ts`
2. Access via `store.getValue('key')` / `store.setValue('key', value)`
