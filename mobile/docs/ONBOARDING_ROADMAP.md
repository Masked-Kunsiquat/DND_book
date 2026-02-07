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

#### Implementation

```
mobile/src/onboarding/
├── TourProvider.tsx      # Wraps app with SpotlightTourProvider
├── steps.ts              # Tour step definitions
├── hooks/
│   └── useTour.ts        # Tour state management
└── components/
    └── TourTooltip.tsx   # Custom tooltip styling
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

### 4. Clear Demo Data

**Trigger points:**
- End of onboarding tour
- Settings → Data → "Clear Demo Data"
- Creating first real campaign (optional prompt)

**Implementation:**
```typescript
function clearSeedData(store: AppStore) {
  const seedContinuityId = store.getValue('seedDataContinuityId');
  if (!seedContinuityId) return;

  // Delete all entities where continuityId matches
  // Delete the continuity itself
  // Clear flags
  store.delValue('hasSeedData');
  store.delValue('seedDataContinuityId');
}
```

**Visual indicator while demo data exists:**
- Continuity name includes "(Demo)" suffix
- Optional: subtle badge on demo entities

---

## Implementation Order

### Phase 1: Seed Data
- [ ] Create `mobile/src/seed/` directory structure
- [ ] Define seed data types
- [ ] Create Odyssey data files (continuity, campaign, tags, locations, NPCs, items, session log)
- [ ] Create image path constants with asset requires
- [ ] Implement `seedOdysseyDemo()` function
- [ ] Implement `clearSeedData()` function
- [ ] Integrate seeding into `StoreProvider` for first-run

### Phase 2: Spotlight Tour
- [ ] Install `react-native-spotlight-tour`
- [ ] Create `TourProvider` wrapper
- [ ] Define tour steps referencing seed data
- [ ] Create custom tooltip component matching app theme
- [ ] Add tour trigger on first run (after seeding)
- [ ] Add "restart tour" option in Settings

### Phase 3: Polish
- [ ] End-of-tour prompt (keep demo / start fresh)
- [ ] Settings → "Clear Demo Data" option
- [ ] Visual indicator for demo entities
- [ ] Handle edge cases (user deletes demo entities mid-tour)
- [ ] Test full flow on fresh install

---

## Files to Create/Modify

### New Files
```
mobile/src/seed/
mobile/src/seed/index.ts
mobile/src/seed/types.ts
mobile/src/seed/odyssey/index.ts
mobile/src/seed/odyssey/continuity.ts
mobile/src/seed/odyssey/tags.ts
mobile/src/seed/odyssey/locations.ts
mobile/src/seed/odyssey/npcs.ts
mobile/src/seed/odyssey/items.ts
mobile/src/seed/odyssey/session-logs.ts
mobile/src/seed/odyssey/images.ts

mobile/src/onboarding/
mobile/src/onboarding/TourProvider.tsx
mobile/src/onboarding/steps.ts
mobile/src/onboarding/hooks/useTour.ts
mobile/src/onboarding/components/TourTooltip.tsx
```

### Modified Files
```
mobile/src/store/index.ts          # Add seeding logic to StoreProvider
mobile/app/settings.tsx            # Add "Clear Demo Data" option
mobile/package.json                # Add react-native-spotlight-tour
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
