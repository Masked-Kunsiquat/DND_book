# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DND Book is an offline-first campaign management app for Dungeon Masters and tabletop RPG players. It organizes notes, NPCs, locations, items, session logs, and other campaign data with P2P sync for table-top play.

**Active development**: The Expo mobile app (`mobile/`) is the primary codebase. The legacy `frontend/` web app is deprecated.

## Development Commands

All commands run from the `mobile/` directory:

```bash
npx expo start              # Start Expo dev server
npx expo start --go         # Start with Expo Go
npx expo run:ios            # Run on iOS simulator
npx expo run:android        # Run on Android emulator
npm run lint                # Run ESLint
npm run typecheck           # TypeScript check only
```

## Architecture

### Monorepo Structure
- **mobile/** - Expo React Native app (active development)
- **frontend/** - Legacy React/Vite web app (deprecated)
- **backend/** - PocketBase container (deprecated, replaced by local TinyBase)
- **docs/** - Jekyll documentation site for GitHub Pages

### Mobile App Organization
```text
mobile/
├── app/                    # Expo Router file-based routing
│   ├── (tabs)/             # Tab navigation (dashboard, sessions, npcs, etc.)
│   ├── campaign/[id]/      # Campaign detail routes
│   ├── npc/[id].tsx        # Entity detail screens
│   ├── location/[id].tsx
│   ├── session/[id].tsx
│   ├── settings/           # App settings
│   └── sync/               # P2P sync screens
│
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── cards/          # Card components (AppCard, NPCCard, etc.)
│   │   ├── chips/          # Badges and chips (TagChip, DemoBadge)
│   │   ├── forms/          # Form inputs (TextInput, Select, Modal)
│   │   ├── mentions/       # @mention system (MentionInput, Renderer)
│   │   ├── layout/         # Screen, Section, Breadcrumb
│   │   └── shared/         # EmptyState, FilterHeader, etc.
│   │
│   ├── hooks/              # Data access hooks (useCampaigns, useNpcs, etc.)
│   ├── store/              # TinyBase store, schema, persistence, sync
│   ├── theme/              # ThemeProvider, colors, spacing, typography
│   ├── onboarding/         # Spotlight tour system
│   ├── seed/               # Demo data (Odyssey campaign)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utilities (id, mentions, logger, etc.)
```

### Key Patterns

**Data Layer (TinyBase)**
- All data stored locally in SQLite via TinyBase mergeable store
- Hooks follow pattern: `useXyz()` for reads, `useCreateXyz()` / `useUpdateXyz()` for writes
- Arrays stored as JSON strings, parsed at runtime
- Scope system: entities can be `'campaign'` or `'continuity'` scoped
- Status field: `'complete'` vs `'shadow'` for incomplete entities

**Component Patterns**
- `Screen` component wraps all screens (handles SafeArea, scroll, pull-to-refresh)
- Form components prefixed with `Form` (FormTextInput, FormSelect, etc.)
- Cards display entity data with consistent styling

**Theme System**
- `useTheme()` hook provides theme colors and dark mode toggle
- React Native Paper provides Material 3 components
- Dark theme is default

**Onboarding Tour**
- Uses `react-native-spotlight-tour` for guided walkthrough
- `AttachStep` components mark highlight targets
- Tour auto-starts on first run with demo data
- Steps defined in `src/onboarding/steps.tsx`

**Mention System**
- Configurable triggers: `@` (NPC), `$` (location), `!` (item), `#` (tag)
- `MentionInput` component for editing
- `MentionRenderer` for display

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo (React Native) |
| Routing | expo-router (file-based) |
| State | TinyBase (mergeable store) |
| Persistence | expo-sqlite |
| P2P Sync | Yjs + y-webrtc (web only) |
| UI | React Native Paper (Material 3) |
| Icons | Material Community Icons |
| Tour | react-native-spotlight-tour |
| Mentions | react-native-controlled-mentions |

## Store Schema

**Tables:**
- `continuities` - Campaign universes (supports forking)
- `campaigns` - Individual campaigns
- `notes` - Rich notes with @mentions
- `npcs` - Characters with scope (campaign/continuity)
- `locations` - Hierarchical (Plane → Realm → Locale → etc.)
- `items` - Equipment and quest items
- `tags` - Categories with colors
- `sessionLogs` - Game session records
- `playerCharacters` - Player character records

**Global Values:**
- `currentCampaignId` - Selected campaign
- `tourCompleted` - Onboarding state
- `hasSeedData` - Demo data flag
- `mentionSettings` - Trigger character config

## Common Tasks

### Adding a New Entity Type
1. Add table schema in `src/store/schema.ts`
2. Add TypeScript types in `src/types/schema.ts`
3. Create hooks in `src/hooks/useNewEntity.ts`
4. Export from `src/hooks/index.ts`

### Adding a Tour Step
1. Add constant in `src/onboarding/types.ts`
2. Add step content in `src/onboarding/steps.tsx` (STEP_CONTENT array)
3. Add before hook if navigation needed (STEP_BEFORE_HOOKS)
4. Wrap target component with `<AttachStep index={TOUR_STEP.X}>`

### Creating a New Screen
1. Add file in `app/` following expo-router conventions
2. Use `Screen` component wrapper
3. Register scroll ref if needed for tour: `registerScrollViewRef('key', ref)`

## Demo Data

First-run seeds an "Odyssey" demo campaign with:
- NPCs: Odysseus, Circe, Polyphemus, etc.
- Locations: Ithaca, Troy, Aegean Sea, etc.
- Session logs with @mentions
- Tags: Enemy, Ally, Goddess, etc.

Clear via Settings → "Clear Demo Data" or tour completion modal.

## Legacy Web App (Deprecated)

The `frontend/` directory contains the original React/Vite web app. It's no longer actively developed. See [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for migration details.

```bash
# Legacy commands (frontend/ directory)
npm run dev          # Vite dev server
npm run build        # Production build
```
