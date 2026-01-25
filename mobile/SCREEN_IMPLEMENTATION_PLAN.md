# Screen Implementation Plan

## Overview

This document outlines the plan for building out mobile screens, adapting patterns from the web app to React Native with our theme system.

## Current State

**Completed:**
- ✅ TinyBase store with all entity schemas
- ✅ CRUD hooks for all entities
- ✅ P2P sync infrastructure
- ✅ Theme system (colors, spacing, typography)
- ✅ Base components (Screen, Section, AppCard, TagChip, EmptyState, LoadingScreen)

**To Build:**
- Tab navigation structure
- Entity list screens
- Entity detail/edit screens
- Dashboard with stats
- P2P sync UI

---

## Phase 1: Navigation Structure

### 1.1 Tab Navigator Setup

Create bottom tab navigation with 5 tabs:

```
app/
├── (tabs)/
│   ├── _layout.tsx      # Tab navigator config
│   ├── index.tsx        # Dashboard (home)
│   ├── campaigns.tsx    # Campaigns list
│   ├── notes.tsx        # Notes list
│   ├── npcs.tsx         # NPCs list
│   └── locations.tsx    # Locations list
```

**Tab Icons** (MaterialCommunityIcons):
| Tab | Icon | Active Icon |
|-----|------|-------------|
| Dashboard | `view-dashboard-outline` | `view-dashboard` |
| Campaigns | `folder-outline` | `folder` |
| Notes | `note-text-outline` | `note-text` |
| NPCs | `account-group-outline` | `account-group` |
| Locations | `map-marker-outline` | `map-marker` |

### 1.2 Stack Routes for Details

```
app/
├── campaign/[id].tsx    # Campaign detail
├── note/[id].tsx        # Note detail/edit
├── npc/[id].tsx         # NPC detail/edit
├── location/[id].tsx    # Location detail
├── tag/[id].tsx         # Tag detail (optional)
└── sync/
    ├── index.tsx        # Sync hub
    ├── host.tsx         # Host session
    └── join.tsx         # Join session
```

---

## Phase 2: Entity Cards

Create specialized cards for each entity type in `src/components/cards/`:

### 2.1 CampaignCard
- Name (title)
- Created date (subtitle)
- Count badges: notes, npcs, locations
- Tap → navigate to campaign detail

### 2.2 NoteCard
- Title
- Content preview (first 100 chars)
- Tags row (TagChip components)
- Campaign badge (if assigned)
- Tap → navigate to note detail

### 2.3 NpcCard
- Name (title)
- Race + Role (subtitle)
- Avatar/image thumbnail (if available)
- Tags row
- Tap → navigate to NPC detail

### 2.4 LocationCard
- Name (title)
- Type badge (Plane, Realm, etc.)
- Parent location (if nested)
- Tags row
- Tap → navigate to location detail

---

## Phase 3: List Screens

Each list screen follows this pattern:

```tsx
export default function EntitiesScreen() {
  const entities = useEntities();
  const { theme } = useTheme();

  if (entities.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="No items yet"
          icon="folder-plus"
          action={{ label: 'Create First', onPress: handleCreate }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Optional: Search/filter bar */}
      <FlatList
        data={entities}
        renderItem={({ item }) => <EntityCard {...item} />}
        keyExtractor={(item) => item.id}
      />
      <FAB icon="plus" onPress={handleCreate} />
    </Screen>
  );
}
```

### 3.1 Campaigns List
- FlatList of CampaignCards
- FAB to create new campaign
- Current campaign indicator
- Long press → set as current campaign

### 3.2 Notes List
- FlatList of NoteCards
- Filter by current campaign (optional toggle)
- FAB to create new note
- Search by title

### 3.3 NPCs List
- FlatList of NpcCards
- Filter by current campaign
- FAB to create new NPC
- Group by first letter (SectionList) - optional

### 3.4 Locations List
- SectionList grouped by type (Plane → Realm → etc.)
- LocationCard for each item
- FAB to create new location
- Show hierarchy with indentation

---

## Phase 4: Dashboard

Home screen showing overview stats and quick actions.

### Layout
```
┌─────────────────────────┐
│      Current Campaign   │  ← Pressable to change
│      "Dragon's Lair"    │
├─────────────────────────┤
│  ┌─────┐  ┌─────┐      │
│  │ 12  │  │  8  │      │  ← Stat cards (2x2 grid)
│  │Notes│  │NPCs │      │
│  └─────┘  └─────┘      │
│  ┌─────┐  ┌─────┐      │
│  │  5  │  │  3  │      │
│  │Locs │  │ Tags│      │
│  └─────┘  └─────┘      │
├─────────────────────────┤
│  Recent Notes           │  ← Section with 3 recent
│  ┌───────────────────┐  │
│  │ Note Card         │  │
│  └───────────────────┘  │
├─────────────────────────┤
│  Quick Actions          │
│  [New Note] [Sync]      │
└─────────────────────────┘
```

### Components Needed
- `StatCard` - Pressable stat with count + label
- Campaign selector (modal or action sheet)

---

## Phase 5: Detail/Edit Screens

Each detail screen supports view + edit mode.

### 5.1 Campaign Detail
- Name (editable)
- Created/Updated dates
- Lists of related: notes, npcs, locations
- Delete action (with confirmation)

### 5.2 Note Detail
- Title (editable)
- Content (markdown editor or plain TextInput)
- Campaign selector
- Location multi-select
- Tag multi-select (with create new)
- Delete action

### 5.3 NPC Detail
- Name, Race, Role, Background (editable fields)
- Image picker
- Campaign multi-select
- Location multi-select
- Related notes
- Tags
- Delete action

### 5.4 Location Detail
- Name, Type, Description (editable)
- Parent location selector (hierarchy)
- Map image picker
- Gallery images
- Campaigns
- Tags
- Child locations list
- Delete action

---

## Phase 6: Forms & Inputs

Create form components in `src/components/forms/`:

### 6.1 FormTextInput
- Wraps Paper TextInput
- Label, error state, helper text

### 6.2 FormSelect
- Single-select dropdown/modal
- Used for: location type, parent location, campaign

### 6.3 FormMultiSelect
- Multi-select with chips
- Used for: tags, locations, campaigns

### 6.4 FormImagePicker
- Image thumbnail + pick button
- Uses expo-image-picker

### 6.5 TagInput
- Autocomplete existing tags
- Create new tag inline

---

## Phase 7: Sync UI

### 7.1 Sync Hub (`app/sync/index.tsx`)
- Current sync status
- Host / Join buttons
- Recent sessions

### 7.2 Host Screen (`app/sync/host.tsx`)
- Generate room code
- Display QR code
- Show connected peers
- End session button

### 7.3 Join Screen (`app/sync/join.tsx`)
- Room code input
- QR scanner option
- Join button
- Connection status

### 7.4 Sync Status Component
- Floating indicator showing sync state
- Tap to open sync hub

---

## Implementation Order

Recommended sequence:

| Order | Task | Dependencies |
|-------|------|--------------|
| 1 | Tab navigator layout | - |
| 2 | StatCard component | - |
| 3 | Dashboard screen | StatCard |
| 4 | CampaignCard | - |
| 5 | Campaigns list screen | CampaignCard |
| 6 | Campaign detail screen | Campaigns list |
| 7 | NoteCard | - |
| 8 | Notes list screen | NoteCard |
| 9 | Note detail screen | Notes list |
| 10 | NpcCard | - |
| 11 | NPCs list screen | NpcCard |
| 12 | NPC detail screen | NPCs list |
| 13 | LocationCard | - |
| 14 | Locations list screen | LocationCard |
| 15 | Location detail screen | Locations list |
| 16 | Form components | - |
| 17 | Create/Edit modals | Form components |
| 18 | Sync UI screens | - |

---

## File Checklist

### Navigation
- [x] `app/(tabs)/_layout.tsx`
- [x] `app/(tabs)/index.tsx` (dashboard)
- [x] `app/(tabs)/campaigns.tsx`
- [x] `app/(tabs)/notes.tsx`
- [x] `app/(tabs)/npcs.tsx`
- [x] `app/(tabs)/locations.tsx`

### Detail Screens
- [ ] `app/campaign/[id].tsx`
- [ ] `app/note/[id].tsx`
- [ ] `app/npc/[id].tsx`
- [ ] `app/location/[id].tsx`

### Sync Screens
- [ ] `app/sync/index.tsx`
- [ ] `app/sync/host.tsx`
- [ ] `app/sync/join.tsx`

### Components - Cards
- [x] `src/components/cards/StatCard.tsx`
- [x] `src/components/cards/CampaignCard.tsx`
- [ ] `src/components/cards/NoteCard.tsx`
- [ ] `src/components/cards/NpcCard.tsx`
- [ ] `src/components/cards/LocationCard.tsx`

### Components - Forms
- [ ] `src/components/forms/FormTextInput.tsx`
- [ ] `src/components/forms/FormSelect.tsx`
- [ ] `src/components/forms/FormMultiSelect.tsx`
- [ ] `src/components/forms/FormImagePicker.tsx`
- [ ] `src/components/forms/TagInput.tsx`

### Components - Sync
- [ ] `src/components/sync/SyncStatus.tsx`
- [ ] `src/components/sync/RoomCodeDisplay.tsx`
- [ ] `src/components/sync/PeerList.tsx`

---

## Notes

- Use `FlatList` for long lists (virtualized)
- Use `SectionList` for grouped data (locations by type)
- Prefer modals for create/edit on mobile (vs separate screens)
- FAB (Floating Action Button) for primary create actions
- Swipe actions for quick delete/edit on list items (optional)
- Pull-to-refresh on all list screens
