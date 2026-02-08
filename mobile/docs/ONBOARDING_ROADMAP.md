# Onboarding & Demo Data Roadmap

This document outlines the implementation plan for the app onboarding experience using seeded demo data based on Homer's Odyssey.

## Overview

The onboarding flow teaches users the app's opinionated workflow by letting them explore (or be guided through) a pre-populated campaign. Users learn by doing—seeing real data, real mentions, real linked entities—rather than reading abstract tooltips.

## Components

### 1. Seed Data (The Odyssey Demo)

**Continuity:** "🏺 The Wine-Dark Sea (Demo)"
**Campaign:** "The Long Way Home"

#### Assets Complete ✅
Located in `mobile/assets/seed-data/`

**NPCs (10):**
- aeolus, athena, calypso, circe, eurylochus, odysseus, penelope, polyphemus, poseidon, tiresias

**Locations (10):**
- aeaea, aegean_sea, aeolia, cyclops-island, ithica, mount-olympus, ogygia, sirens-strait, troy, underworld

**Items (3):**
- bag-of-winds, bow-of-odysseus, moly-herb

#### Data Structure

```
mobile/src/seed/
├── index.ts              # Main seeder function + clear demo function
├── odyssey/
│   ├── index.ts          # Re-exports all Odyssey data
│   ├── continuity.ts     # Continuity + campaign definitions
│   ├── tags.ts           # Tag definitions (hostile, divine, ally, etc.)
│   ├── locations.ts      # Location hierarchy
│   ├── npcs.ts           # NPC definitions with links
│   ├── items.ts          # Item definitions
│   ├── session-logs.ts   # Demo session log with mentions
│   └── images.ts         # Asset path constants
└── types.ts              # Seed data types
```

#### Entity Relationships

```
Continuity: The Wine-Dark Sea
└── Campaign: The Long Way Home
    ├── Locations (hierarchical)
    │   ├── Mortal Realm (Plane)
    │   │   ├── Aegean Sea (Territory)
    │   │   │   ├── Ithaca (Locale) [home/goal]
    │   │   │   ├── Troy (Locale) [starting point]
    │   │   │   ├── Cyclops Island (Locale)
    │   │   │   └── Sirens' Strait (Locale)
    │   │   ├── Aeolia (Locale) [floating island]
    │   │   ├── Aeaea (Locale) [Circe's island]
    │   │   └── Ogygia (Locale) [Calypso's island]
    │   └── Divine Realm (Plane)
    │       ├── Mount Olympus (Locale)
    │       └── Underworld (Locale)
    │
    ├── NPCs
    │   ├── Odysseus (protagonist)
    │   ├── Eurylochus (crewmate, session log narrator)
    │   ├── Polyphemus [Cyclops Island] #hostile #blinded
    │   ├── Circe [Aeaea] #magic #ally
    │   ├── Calypso [Ogygia] #divine
    │   ├── Tiresias [Underworld] #oracle
    │   ├── Aeolus [Aeolia] #divine #ally
    │   ├── Poseidon [Divine Realm] #divine #grudge
    │   ├── Athena [Mount Olympus] #divine #ally
    │   └── Penelope [Ithaca] #home
    │
    ├── Items
    │   ├── Bag of Winds (from Aeolus)
    │   ├── Moly Herb (protection from Circe)
    │   └── Bow of Odysseus (endgame)
    │
    ├── Tags
    │   ├── #hostile, #ally, #divine
    │   ├── #blinded, #grudge, #magic
    │   ├── #home, #oracle, #endgame
    │   └── #poseidons-grudge (consequence tracking example)
    │
    └── Session Logs
        └── "Session 3: Nobody's Clever Plan"
            - POV: Eurylochus (crewmember)
            - Scene: Cyclops cave encounter
            - Demonstrates: @mentions, #tags, key decisions, outcomes
            - Shows: consequence tracking (Poseidon's grudge)
```

---

### 2. Spotlight Tour (react-native-spotlight-tour)

**Library:** [@stackbuilders/react-native-spotlight-tour](https://github.com/stackbuilders/react-native-spotlight-tour)

#### Tour Steps (Draft)

1. **Dashboard** - "Welcome! This is your campaign at a glance."
2. **Current Campaign Card** - "Tap here to switch campaigns or create new ones."
3. **Stats Section** - "Quick counts of your campaign content."
4. **Sessions Tab** - "Session logs capture what happens at the table."
5. **Session Detail** - "Try typing @ to mention an NPC or location."
6. **Mention Autocomplete** - "The app suggests existing entities or creates new ones."
7. **Shadow Entity Prompt** - "Entities created from mentions can be fleshed out later."
8. **Key Decisions Field** - "Capture choices that matter for future sessions."
9. **NPCs Tab** - "All your characters, searchable and filterable."
10. **Tags** - "Tags connect everything—use them to track themes and consequences."

#### Implementation ✅

```
mobile/src/onboarding/
├── index.ts              # Module exports
├── TourProvider.tsx      # Wraps app with SpotlightTourProvider + auto-start logic
├── TourTooltip.tsx       # Custom themed tooltip with nav buttons
├── steps.tsx             # Tour step definitions (11 steps)
├── useTour.ts            # Tour state management hook
└── types.ts              # Step IDs and type definitions
```

---

### 3. First-Run Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        APP LAUNCH                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │  Is first run?      │
                   │  (no persisted data)│
                   └─────────────────────┘
                         │          │
                        YES         NO
                         │          │
                         ▼          └──────────► Normal app
              ┌──────────────────┐
              │  Seed demo data  │
              │  (Odyssey)       │
              └──────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Start spotlight │
              │  tour            │
              └──────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Tour complete   │
              └──────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Prompt:         │
              │  [Keep Demo]     │
              │  [Start Fresh]   │
              └──────────────────┘
                    │         │
                    │         └──► Clear seed data
                    │              Create first campaign
                    │
                    └──────────► Keep exploring demo
```

---

### 4. Clear Demo Data ✅

**Trigger points:**
- Settings → Onboarding → "Clear Demo Data"
- (Future) End of onboarding tour prompt

**Implementation:** `src/seed/index.ts` → `clearSeedData()`
- Deletes all entities matching seed continuity ID
- Deletes the seed campaign and continuity
- Clears `hasSeedData` and `seedDataContinuityId` flags
- Clears `currentCampaignId` if it was the seed campaign

**Hook:** `src/hooks/useSeedData.ts`
- `hasSeedData` - check if demo data exists
- `clearSeedData()` - remove all demo data
- `isSeedContinuity(id)` - check if a continuity is demo data

**Visual indicator while demo data exists:**
- Continuity name includes "(Demo)" suffix: "🏺 The Wine-Dark Sea (Demo)"
- (Future) Optional: subtle badge on demo entities

---

## Implementation Order

### Phase 1: Seed Data ✅
- [x] Create `mobile/src/seed/` directory structure
- [x] Define seed data types (`types.ts`)
- [x] Create Odyssey data files (continuity, campaign, tags, locations, NPCs, items, session log)
- [x] Create image path constants with asset requires (`images.ts`)
- [x] Implement `seedOdysseyDemo()` function
- [x] Implement `clearSeedData()` function
- [x] Integrate seeding into `StoreProvider` for first-run
- [x] Create `useSeedData` hook for components

### Phase 2: Spotlight Tour ✅
- [x] Install `react-native-spotlight-tour`
- [x] Create `TourProvider` wrapper
- [x] Define tour steps (11 steps in `steps.tsx`)
- [x] Create custom `TourTooltip` component matching app theme
- [x] Create `useTour` hook for tour state management
- [x] Add tour auto-start on first run (after seeding)
- [x] Add `AttachStep` to Dashboard (campaign card, stats section)
- [x] Add "Restart Tour" option in Settings
- [x] Add "Clear Demo Data" option in Settings

### Phase 3: Polish ✅
- [x] Add `AttachStep` to more screens (Sessions, NPCs, Locations, Tags)
- [x] End-of-tour prompt (keep demo / start fresh)
- [x] Visual indicator for demo entities (DemoBadge with pottery icon)
- [x] Handle edge cases (tour stops if seed data cleared)
- [ ] Test full flow on fresh install

---

## Files Created/Modified

### Seed Data (Phase 1) ✅
```
mobile/src/seed/
├── index.ts                    # seedOdysseyDemo(), clearSeedData(), hasSeedData()
├── types.ts                    # IDs for continuity, campaign, tags, locations, NPCs, items
└── odyssey/
    ├── index.ts                # Re-exports
    ├── continuity.ts           # Continuity + campaign row data
    ├── tags.ts                 # 10 tags (hostile, ally, divine, etc.)
    ├── locations.ts            # 12 locations with hierarchy
    ├── npcs.ts                 # 10 NPCs with relationships
    ├── items.ts                # 3 items
    ├── session-logs.ts         # Demo session with @mentions
    └── images.ts               # Asset require() paths

mobile/src/hooks/useSeedData.ts # Hook for seed data management
```

### Onboarding Tour (Phase 2) ✅
```
mobile/src/onboarding/
├── index.ts                    # Module exports
├── TourProvider.tsx            # Provider + auto-start logic
├── TourTooltip.tsx             # Themed tooltip component
├── steps.tsx                   # 11 tour step definitions
├── useTour.ts                  # Tour state hook
└── types.ts                    # TOUR_STEP constants
```

### Modified Files ✅
```
mobile/src/store/index.ts                # First-run seeding in StoreProvider
mobile/src/hooks/index.ts                # Export useSeedData
mobile/src/components/index.ts           # Export DemoBadge
mobile/src/components/chips/DemoBadge.tsx    # Demo entity badge component
mobile/src/components/cards/NPCCard.tsx      # Added isDemo prop
mobile/src/components/cards/LocationCard.tsx # Added isDemo prop
mobile/src/components/cards/LocationRow.tsx  # Added isDemo prop
mobile/app/_layout.tsx                   # Wrap app with TourProvider
mobile/app/(tabs)/index.tsx              # AttachStep on campaign + stats
mobile/app/(tabs)/sessions.tsx           # AttachStep on sessions header
mobile/app/(tabs)/npcs.tsx               # AttachStep on NPCs header + first card, isDemo
mobile/app/(tabs)/locations.tsx          # AttachStep on locations header, isDemo
mobile/app/session/[id].tsx              # AttachStep on session detail + mentions
mobile/app/tags.tsx                      # AttachStep on tags header
mobile/app/settings.tsx                  # Restart Tour + Clear Demo Data
mobile/package.json                      # Added react-native-spotlight-tour
```

---

## Notes

### Why The Odyssey?
- Public domain (Homer, ancient Greece)
- Universally recognized story
- Episodic structure = natural session breaks
- Clear party dynamics, NPCs, locations
- Built-in consequence tracking (Poseidon's grudge)
- Perfect for demonstrating the app's features

### Image Style
All seed images use a consistent Greek black-figure pottery style:
- Terracotta/orange background
- Black silhouette figures
- Circular medallion format
- Generated via AI (Gemini) for consistency

### Spelling Note
- Asset uses `ithica.png` (consider renaming to `ithaca.png` for accuracy)
