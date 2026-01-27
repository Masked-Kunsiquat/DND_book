# Hooks Module - Agent Guidelines

React hooks for CRUD operations on TinyBase entities. Each entity has its own hook file.

## Pattern

All entity hooks follow this structure:

```typescript
// 1. Row-to-domain converter (handles JSON parsing)
function rowToEntity(row: EntityRow): Entity { ... }

// 2. Read hooks
export function useEntities(): Entity[]           // Get all
export function useEntity(id: string): Entity | null  // Get one
export function useEntitiesByX(x): Entity[]       // Filtered queries

// 3. Write hooks (return callbacks)
export function useCreateEntity(): (data: CreateInput) => string
export function useUpdateEntity(): (id: string, data: UpdateInput) => void
export function useDeleteEntity(): (id: string) => void
```

## Files

| File | Entity | Special Features |
|------|--------|-----------------|
| `useCampaigns.ts` | Campaign | `useCurrentCampaign()`, `useSetCurrentCampaign()` |
| `useNotes.ts` | Note | Filter by campaignId |
| `useNpcs.ts` | NPC | Filter by campaignId, tag |
| `useLocations.ts` | Location | Hierarchy: `useChildLocations()`, `useRootLocations()`, `useLocationPath()` |
| `useItems.ts` | Item | - |
| `useTags.ts` | Tag | `useGetOrCreateTag()`, `useTagByName()` |
| `useMentionSettings.ts` | Mention Settings | Global trigger preferences |
| `useShadowEntities.ts` | Shadow Entities | Mention-driven placeholder creation |
| `useSessionLogs.ts` | SessionLog | Filter by campaignId |
| `usePlayerCharacters.ts` | PlayerCharacter | `usePlayerCharactersByPlayer()` |
| `useSync.ts` | - | P2P sync state and actions |

## Key Conventions

### JSON Array Fields
Relationship fields are stored as JSON strings in TinyBase:
```typescript
// Reading: parse in row-to-domain converter
locationIds: JSON.parse(row.locationIds || '[]')

// Writing: stringify in create/update
locationIds: JSON.stringify(data.locationIds || [])
```

### Timestamps
Use `now()` from `../utils/id` for consistent ISO timestamps:
```typescript
import { generateId, now } from '../utils/id';

const timestamp = now();
store.setRow('entities', id, {
  id: generateId(),
  created: timestamp,
  updated: timestamp,
  ...data
});
```

### Update Pattern
Always preserve existing fields and update timestamp:
```typescript
const existing = store.getRow('entities', id);
store.setRow('entities', id, {
  ...existing,
  ...data,
  updated: now(),
});
```

### Memoization
Use `useMemo` and `useCallback` to prevent unnecessary re-renders:
```typescript
export function useEntities(): Entity[] {
  const store = useStore();
  const table = store.getTable('entities');

  return useMemo(() => {
    return Object.values(table).map(row => rowToEntity(row));
  }, [table]);
}
```

## Adding a New Entity Hook

1. Create `use{Entity}s.ts` in this directory
2. Define `rowToEntity()` converter
3. Implement standard CRUD hooks
4. Add any entity-specific query hooks
5. Export from `index.ts`
6. Add types to `src/types/schema.ts` if not already present
