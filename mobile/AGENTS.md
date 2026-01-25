# Mobile App - Agent Guidelines

This is the Expo React Native mobile app for DND Book, an offline-first campaign management tool with P2P sync.

## Tech Stack

- **Framework**: Expo SDK 54 with expo-router (file-based routing)
- **Data Layer**: TinyBase (MergeableStore for CRDT sync)
- **Persistence**: expo-sqlite
- **P2P Sync**: Yjs + y-webrtc
- **UI**: React Native Paper (MD3) + @expo/vector-icons
- **Theming**: Custom theme system in `src/theme/`

## Directory Structure

```text
mobile/
├── app/                    # Expo Router pages (file-based routing)
│   ├── _layout.tsx         # Root layout (providers wrap here)
│   ├── index.tsx           # Redirect to tabs
│   └── (tabs)/             # Tab navigator screens
│       ├── _layout.tsx     # Tab navigator config
│       ├── index.tsx       # Dashboard
│       ├── campaigns.tsx   # Campaigns list
│       ├── notes.tsx       # Notes list (placeholder)
│       ├── npcs.tsx        # NPCs list (placeholder)
│       └── locations.tsx   # Locations list (placeholder)
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── cards/          # AppCard, StatCard, CampaignCard
│   │   ├── chips/          # TagChip
│   │   ├── layout/         # Screen, Section
│   │   └── shared/         # EmptyState, LoadingScreen
│   ├── hooks/              # Data access hooks (TinyBase CRUD)
│   ├── shims/              # Polyfills (isomorphic-webcrypto)
│   ├── store/              # TinyBase store, persistence, sync
│   ├── theme/              # Colors, spacing, typography, Paper themes
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions (logger, id)
├── assets/                 # App icons, splash screen
├── app.json
├── metro.config.js
├── package.json
└── tsconfig.json
```

## Key Patterns

### Data Flow
1. **Store** (`src/store/`) - TinyBase MergeableStore holds all app state
2. **Hooks** (`src/hooks/`) - React hooks for CRUD operations on each entity
3. **Components** - Use hooks to read/write data, never access store directly

### Theming
- Always use `useTheme()` or `useThemeColors()` from `src/theme/ThemeProvider`
- Use `theme.colors.*` for colors, never hardcode hex values
- Use `spacing.*` and `layout.*` constants for consistent sizing
- Dark mode is the default (DND aesthetic)

### Components
- Wrap screens with `<Screen>` component for consistent padding/scroll
- Use `<AppCard>` for card-based content
- Use `<Section>` for grouping with headers
- Use `<TagChip>` for tag display (auto-colors based on ID)

## Entity Schema

All entities have: `id`, `created`, `updated` (ISO strings)

| Entity | Key Fields | Relationships (JSON arrays) |
|--------|-----------|---------------------------|
| campaigns | name | - |
| notes | title, content, campaignId | locationIds, tagIds |
| npcs | name, race, role, background, image | campaignIds, locationIds, noteIds, tagIds |
| locations | name, type, description, parentId, map | campaignIds, tagIds, images |
| tags | name | - |
| sessionLogs | title, date, summary, keyDecisions, outcomes | campaignIds, locationIds, npcIds, noteIds, playerCharacterIds, tagIds |
| playerCharacters | name, player, race, class, background | campaignIds, noteIds |

## Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run typecheck      # TypeScript check
```

## Adding New Features

1. **New Entity**: Add to `src/store/schema.ts`, create hook in `src/hooks/`, add types to `src/types/schema.ts`
2. **New Screen**: Create file in `app/` directory (expo-router auto-routes)
3. **New Component**: Add to appropriate folder in `src/components/`, export from index.ts
