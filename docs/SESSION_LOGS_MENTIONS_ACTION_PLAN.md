# Session Logs, Mentions & Entity Architecture — Action Plan

> **Status**: Planning
> **Last Updated**: 2026-01-26
> **Related**: [MIGRATION_PLAN.md](../MIGRATION_PLAN.md), [react-native-controlled-mentions.md](../react-native-controlled-mentions.md)

---

## Executive Summary

This document defines the architecture and implementation plan for:

1. **Session Logs** — Real-time capture during play
2. **Notes** — Structured reference material (post-session)
3. **Mentions** — First-class entity references with customizable triggers
4. **Shadow Entities** — Wiki-style "reference first, define later" pattern

The goal is to create a frictionless in-session experience where users write naturally, reference entities inline, and organize later.

---

## Part A: Entity Definitions

### Core Entities (Finalized)

| Entity | Purpose | Primary Use |
|--------|---------|-------------|
| **Session Log** | Real-time capture during play | In-session |
| **Note** | Structured reference material | Post-session |
| **NPC** | Non-player characters | Both |
| **Player Character** | Party members / PCs | Both |
| **Location** | Named places with hierarchy | Both |
| **Item** | Loot, artifacts, meaningful objects | In-session (capture), Post-session (detail) |
| **Tag** | Cross-cutting labels for filtering | Both |

### Entity Relationships

```
Continuity (world setting)
    └── Campaign (specific game/timeline)
            ├── Session Log (real-time capture)
            │       └── Mentions → [NPC, PC, Location, Item, Tag]
            ├── Note (structured reference)
            │       └── Links → [NPC, PC, Location, Item, Tag]
            ├── NPC (scoped to campaign or continuity)
            ├── Player Character (scoped to campaign)
            ├── Location (hierarchical, scoped)
            └── Item (NEW - to be added)
```

### Session Log vs Note — Clear Separation

| Attribute | Session Log | Note |
|-----------|-------------|------|
| **Created** | During session | After session (or standalone) |
| **Structure** | Single rich text field + mentions | Title, sections, richer formatting |
| **Editing** | Append-heavy, minimal revision | Iterative refinement |
| **Contains** | Raw text with inline mentions | Curated content, entity links |
| **Purpose** | Brain dump, what happened | Wiki page, reference doc |
| **Required Fields** | Date, campaign | Title, campaign |

**Key Insight**: The current `SessionLog` schema has `summary`, `keyDecisions`, `outcomes` fields. These are **post-session enrichment** — they should NOT be required during capture. The primary in-session field should be a single `content` field with mentions.

---

## Part B: Mention System Architecture

### B.1 Trigger Configuration

**Recommendation**: Different triggers per entity type, user-configurable in settings.

#### Default Trigger Mapping

| Trigger | Entity Type | Example | Rationale |
|---------|-------------|---------|-----------|
| `@` | Characters (NPC + PC) | `@Lira`, `@Thorin` | Universal convention for people |
| `#` | Tags | `#quest`, `#mystery` | Universal convention for tags/topics |
| `$` | Locations | `$Whispering Springs` | Money symbol → places of value/interest |
| `!` | Items | `!Emerald Dagger` | Exclamation → notable loot/artifacts |

#### Why Combine NPC + PC Under `@`

- Users think "character" not "NPC vs PC"
- Reduces cognitive load
- Picker can show both with visual distinction (icon/color)
- During play, you reference who you met — doesn't matter if they're NPC or PC

#### Settings UI for Trigger Customization

```
┌─────────────────────────────────────────────────────┐
│ Mention Triggers                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Characters (NPCs & PCs)    [@] ▼                    │
│                            ┌──────────┐             │
│                            │ @        │ ← selected  │
│                            │ ~        │             │
│                            │ &        │             │
│                            │ ^        │             │
│                            └──────────┘             │
│                                                     │
│ Locations                  [$] ▼                    │
│                                                     │
│ Items                      [!] ▼                    │
│                                                     │
│ Tags                       [#] ▼                    │
│                                                     │
│ ─────────────────────────────────────────────────── │
│ Preview: "Met @Lira at $Whispering Springs,         │
│           found !Emerald Dagger #quest"             │
│                                                     │
│                              [Reset to Defaults]    │
└─────────────────────────────────────────────────────┘
```

#### Available Trigger Characters

Recommended pool (avoiding common punctuation):

| Character | Notes |
|-----------|-------|
| `@` | Standard for people/mentions |
| `#` | Standard for tags/topics |
| `$` | Distinct, easy to type |
| `!` | Distinct, suggests importance |
| `~` | Available alternative |
| `^` | Available alternative |
| `&` | Available alternative |
| `%` | Available (but avoid — encoding confusion) |

### B.2 Mention Data Model

Mentions are **structured tokens**, not markdown syntax.

#### Stored Format

```typescript
interface SessionLogContent {
  // Raw text with placeholder tokens
  text: string;
  // Example: "I met {{@:npc:abc123}} at {{$:location:def456}}"

  // Resolved mention metadata
  mentions: Mention[];
}

interface Mention {
  id: string;                              // Unique mention instance ID
  trigger: string;                         // '@', '$', '!', '#'
  entityType: 'npc' | 'pc' | 'location' | 'item' | 'tag';
  entityId: string | null;                 // null = shadow entity
  displayLabel: string;                    // "Whispering Springs"
  position: { start: number; end: number };
  status: 'resolved' | 'shadow';
}
```

#### Display vs Storage

| User Sees | Stored As |
|-----------|-----------|
| `[Whispering Springs]` (styled chip) | `{{$:location:xyz123}}` |
| `[Lira]` (styled chip) | `{{@:npc:abc456}}` |
| `[New Guy]` (faded chip) | `{{@:npc:null:New Guy}}` |

**Users never see encoding, tokens, or raw syntax.**

### B.3 Integration with react-native-controlled-mentions

The library supports exactly what we need:

```typescript
import { useMentions, TriggersConfig } from 'react-native-controlled-mentions';

// Trigger config — can be dynamic from user settings
const triggersConfig: TriggersConfig<'character' | 'location' | 'item' | 'tag'> = {
  character: {
    trigger: '@',
    textStyle: { fontWeight: 'bold', color: '#3B82F6' }, // blue
    allowedSpacesCount: 2, // "Lira the Brave"
    isInsertSpaceAfterMention: true,
  },
  location: {
    trigger: '$',
    textStyle: { fontWeight: 'bold', color: '#10B981' }, // green
    allowedSpacesCount: 3, // "The Whispering Springs"
    isInsertSpaceAfterMention: true,
  },
  item: {
    trigger: '!',
    textStyle: { fontWeight: 'bold', color: '#F59E0B' }, // amber
    allowedSpacesCount: 2,
    isInsertSpaceAfterMention: true,
  },
  tag: {
    trigger: '#',
    textStyle: { fontWeight: 'bold', color: '#6B7280' }, // gray
    allowedSpacesCount: 0, // Tags typically no spaces
    isInsertSpaceAfterMention: true,
  },
};
```

#### Handling Spaces in Entity Names

The library handles this via `allowedSpacesCount`:

- User types `$Whispering Springs`
- Picker appears, showing "Whispering Springs" location
- User selects → chip inserted with full name
- Stored as token with ID reference

**No URL encoding required. Ever.**

---

## Part C: Shadow Entity System

### C.1 Concept

Allow referencing entities that don't exist yet:

```
I met @Strange Merchant at $Crystal Cave
```

If "Strange Merchant" doesn't exist:
1. Reference is allowed immediately
2. App creates a placeholder/"shadow" entity
3. Tapping it later opens creation/edit screen
4. User fleshes it out post-session

### C.2 Schema Addition

Add `status` field to all mentionable entities:

```typescript
// Add to NPC, Location, Item schemas
{
  // ... existing fields
  status: { type: 'string' }, // 'complete' | 'shadow'
}

// TypeScript type
type EntityStatus = 'complete' | 'shadow';
```

### C.3 Shadow Entity Creation Flow

```
┌─────────────────────────────────────────────────────┐
│ User types: @Strange                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🔍 No matches found                             │ │
│ │                                                 │ │
│ │ ┌───────────────────────────────────────────┐   │ │
│ │ │ + Create "Strange" as Character           │   │ │
│ │ └───────────────────────────────────────────┘   │ │
│ │ ┌───────────────────────────────────────────┐   │ │
│ │ │ + Create "Strange" as Location            │   │ │
│ │ └───────────────────────────────────────────┘   │ │
│ │ ┌───────────────────────────────────────────┐   │ │
│ │ │ + Create "Strange" as Item                │   │ │
│ │ └───────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Continue typing to refine...]                      │
└─────────────────────────────────────────────────────┘
```

### C.4 Shadow Entity Visual Treatment

| State | Appearance |
|-------|------------|
| **Complete** | Solid chip, brand color, tap → detail view |
| **Shadow** | Dotted border, faded color, tap → edit/create |

```
Complete:  [Lira]          ← solid blue background
Shadow:    [̲S̲t̲r̲a̲n̲g̲e̲ ̲M̲e̲r̲c̲h̲a̲n̲t̲]   ← dotted border, faded
```

### C.5 Post-Session Resolution

After session ends, prompt user:

```
┌─────────────────────────────────────────────────────┐
│ Session Complete                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ You mentioned 3 new entities:                       │
│                                                     │
│   ○ Strange Merchant (Character)      [Edit]        │
│   ○ Crystal Cave (Location)           [Edit]        │
│   ○ Void Shard (Item)                 [Edit]        │
│                                                     │
│ ─────────────────────────────────────────────────── │
│                                                     │
│   [Complete All Now]        [Remind Me Later]       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### C.6 Handling Duplicate Shadows

When user types `@Strange Merchant` and a shadow already exists:

1. Fuzzy search includes shadow entities
2. Picker shows existing shadow with indicator
3. User can select existing or create new

```
┌─────────────────────────────────────────────────────┐
│ @strange                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ○ Strange Merchant (incomplete)    [Select]       │
│   ──────────────────────────────────────────────    │
│   + Create new "strange"                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Part D: Items Entity (New)

### D.1 Rationale

Items are distinct from other entities:
- Found during sessions (loot)
- Referenced quickly (`!Emerald Dagger`)
- May have ownership, location, value

Currently not in schema. Adding as lightweight entity.

### D.2 Schema Definition

```typescript
// Add to mobile/src/store/schema.ts
items: {
  id: { type: 'string' },
  name: { type: 'string' },
  description: { type: 'string' },
  status: { type: 'string' },        // 'complete' | 'shadow'
  scope: { type: 'string' },         // 'campaign' | 'continuity'
  continuityId: { type: 'string' },
  campaignIds: { type: 'string' },   // JSON array
  ownerId: { type: 'string' },       // NPC or PC who has it
  ownerType: { type: 'string' },     // 'npc' | 'pc' | null
  locationId: { type: 'string' },    // Where it is/was found
  value: { type: 'string' },         // Optional: "50 gp", "priceless"
  tagIds: { type: 'string' },        // JSON array
  created: { type: 'string' },
  updated: { type: 'string' },
},
```

### D.3 TypeScript Types

```typescript
// Add to mobile/src/types/schema.ts
export interface Item {
  id: RecordId;
  name: string;
  description: string;
  status: 'complete' | 'shadow';
  scope: EntityScope;
  continuityId: RecordId;
  campaignIds: RecordId[];
  ownerId: RecordId;
  ownerType: 'npc' | 'pc' | null;
  locationId: RecordId;
  value: string;
  tagIds: RecordId[];
  created: IsoDateString;
  updated: IsoDateString;
}

export interface ItemRow {
  id: string;
  name: string;
  description: string;
  status: string;
  scope: string;
  continuityId: string;
  campaignIds: string;
  ownerId: string;
  ownerType: string;
  locationId: string;
  value: string;
  tagIds: string;
  created: string;
  updated: string;
}
```

---

## Part E: Session Log Refactoring

### E.1 Current Schema Issues

Current `SessionLog` has:
- `summary` — post-session field, not in-session
- `keyDecisions` — post-session field
- `outcomes` — post-session field
- No `content` field for raw capture

### E.2 Proposed Schema Changes

```typescript
// Updated sessionLogs schema
sessionLogs: {
  id: { type: 'string' },
  title: { type: 'string' },
  date: { type: 'string' },
  campaignId: { type: 'string' },      // Single campaign (session belongs to one)

  // PRIMARY CAPTURE FIELD
  content: { type: 'string' },         // NEW: Raw text with mention tokens
  mentions: { type: 'string' },        // NEW: JSON array of Mention objects

  // POST-SESSION ENRICHMENT (optional)
  summary: { type: 'string' },         // Optional summary
  keyDecisions: { type: 'string' },    // Optional
  outcomes: { type: 'string' },        // Optional

  // Entity references (derived from mentions, for querying)
  locationIds: { type: 'string' },
  npcIds: { type: 'string' },
  playerCharacterIds: { type: 'string' },
  itemIds: { type: 'string' },         // NEW
  tagIds: { type: 'string' },

  created: { type: 'string' },
  updated: { type: 'string' },
},
```

### E.3 In-Session UI

```
┌─────────────────────────────────────────────────────┐
│ ← Session: Jan 26, 2026                      [Done] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Arrived at [Whispering Springs]. Met [Lira] who     │
│ told us about the missing merchants.                │
│                                                     │
│ Fought [Goblin Scout] × 3 in the forest.            │
│                                                     │
│ Found [Emerald Dagger] in the ruins.                │
│ [Strange Merchant] appeared and offered to buy it.  │
│                                                     │
│ We decided to keep the dagger and investigate       │
│ the #mystery further.                               │
│                                                     │
│ __________________________________________________ │
│ |                                                 | │
│ |_________________________________________________| │
│                                                     │
│   @ Character   $ Location   ! Item   # Tag         │
└─────────────────────────────────────────────────────┘
```

**Key UX Points**:
- Full-screen text input
- Minimal chrome
- Quick-insert buttons for triggers
- Auto-save
- No required fields during play

---

## Part F: Implementation Plan

### Phase 1: Foundation (Week 1)

#### 1.1 Schema Updates

- [x] Add `items` table to schema
- [x] Add `status` field to `npcs`, `locations`, `items`
- [x] Add `content` and `mentions` fields to `sessionLogs`
- [x] Update TypeScript types
- [x] Create `useItems` hook

#### 1.2 Settings Infrastructure

- [x] Create `MentionSettings` type in schema values
- [x] Add settings screen UI for trigger customization
- [x] Store user preferences in TinyBase values
- [x] Create `useMentionSettings` hook

### Phase 2: Mention Input (Week 2)

#### 2.1 Install & Configure Library

- [x] Install `react-native-controlled-mentions`
- [x] Create `MentionInput` wrapper component
- [x] Integrate with user trigger settings
- [x] Style mention chips (complete vs shadow)

#### 2.2 Suggestion Pickers

- [ ] Create unified `EntitySuggestions` component
- [ ] Implement fuzzy search across entity types
- [ ] Add "Create new" option for shadow entities
- [ ] Handle multiple trigger types (`@`, `$`, `!`, `#`)

#### 2.3 Shadow Entity Creation

- [ ] Implement `createShadowEntity` function
- [ ] Update entity hooks to handle shadow status
- [ ] Add visual distinction for shadow entities in lists

### Phase 3: Session Log Refactor (Week 3)

#### 3.1 Capture UI

- [ ] Redesign session log create/edit screen
- [ ] Integrate `MentionInput` component
- [ ] Remove required fields during capture
- [ ] Add quick-insert trigger buttons
- [ ] Implement auto-save

#### 3.2 Entity Extraction

- [ ] Parse mentions from content on save
- [ ] Update `locationIds`, `npcIds`, etc. from mentions
- [ ] Handle shadow entity references

#### 3.3 Post-Session Flow

- [ ] Create "Incomplete Entities" prompt
- [ ] Add filter for shadow entities in lists
- [ ] Implement shadow → complete transition

### Phase 4: Polish (Week 4)

#### 4.1 Display & Rendering

- [ ] Create `MentionRenderer` for read-only display
- [ ] Implement tap-to-navigate on mentions
- [ ] Add shadow entity visual treatment everywhere

#### 4.2 Migration & Testing

- [ ] Create migration for existing session logs
- [ ] Test P2P sync with mentions
- [ ] Handle edge cases (deleted entities, etc.)

---

## Part G: Technical Decisions

### G.1 Markdown vs Rich Text

**Decision**: Hybrid approach

- **Mentions**: Structured tokens (first-class)
- **Basic formatting**: Simple markdown (bold, italic, lists)
- **No complex markdown**: Skip tables, code blocks, etc.

**Rationale**:
- RN markdown renderers are fragile
- Mentions need to be interactive objects
- Simple formatting is enough for session logs

### G.2 Storage Format for Mentions

**Decision**: Token placeholders + metadata array

```typescript
// Stored
{
  content: "Met {{@:abc123}} at {{$:def456}}",
  mentions: [
    { trigger: '@', entityType: 'npc', entityId: 'abc123', label: 'Lira', ... },
    { trigger: '$', entityType: 'location', entityId: 'def456', label: 'Whispering Springs', ... }
  ]
}
```

**Rationale**:
- Tokens are parseable
- Metadata enables rendering without lookup
- Supports offline display
- P2P sync friendly

### G.3 Trigger Conflicts

**Decision**: Validate trigger uniqueness in settings

If user tries to assign `@` to both Characters and Locations:
- Show error: "@ is already assigned to Characters"
- Prevent save until resolved

### G.4 Entity Type Detection from Trigger

When user types `@Lira`:
- Picker shows Characters (NPCs + PCs)
- When user types `$Lira` (if that location exists)
- Picker shows Locations

Trigger determines entity type search context.

---

## Part H: Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `mobile/src/components/mentions/MentionInput.tsx` | Wrapper around library |
| `mobile/src/components/mentions/EntitySuggestions.tsx` | Unified picker |
| `mobile/src/components/mentions/MentionChip.tsx` | Styled chip component |
| `mobile/src/components/mentions/MentionRenderer.tsx` | Read-only display |
| `mobile/src/hooks/useItems.ts` | Item CRUD operations |
| `mobile/src/hooks/useMentionSettings.ts` | Trigger preferences |
| `mobile/src/hooks/useShadowEntities.ts` | Shadow entity management |
| `mobile/app/settings/mentions.tsx` | Settings UI |
| `mobile/app/item/[id].tsx` | Item detail page |

### Modified Files

| File | Changes |
|------|---------|
| `mobile/src/store/schema.ts` | Add items table, status fields, content/mentions to sessionLogs |
| `mobile/src/types/schema.ts` | Add Item types, update SessionLog, add EntityStatus |
| `mobile/src/hooks/useSessionLogs.ts` | Handle content/mentions, shadow references |
| `mobile/src/hooks/useNpcs.ts` | Add status field handling |
| `mobile/src/hooks/useLocations.ts` | Add status field handling |
| `mobile/app/session/[id].tsx` | New capture UI with MentionInput |
| `mobile/app/(tabs)/sessions.tsx` | Show shadow indicators |
| `mobile/app/settings.tsx` | Link to mention settings |

---

## Part I: Open Questions

### Resolved

| Question | Decision |
|----------|----------|
| Combine NPC + PC under `@`? | **Yes** — unified "Character" concept |
| User-configurable triggers? | **Yes** — settings screen |
| Shadow entities? | **Yes** — wiki-style reference-first |
| Items as entity? | **Yes** — separate from Notes |

### Still Open

| Question | Options | Recommendation |
|----------|---------|----------------|
| Should tags support spaces? | `#my quest` vs `#my-quest` | **No spaces** — use kebab-case |
| Multiple mentions of same entity? | Dedup or allow? | **Allow** — user might reference multiple times |
| Mention in Note content? | Same system or simpler? | **Same system** — consistency |
| Cross-campaign mentions? | Allow referencing other campaign entities? | **No** — scope to current campaign for now |

---

## Appendix: Reference Implementation

### Mention Token Format

```
{{TRIGGER:ENTITY_TYPE:ENTITY_ID}}
{{TRIGGER:ENTITY_TYPE:null:LABEL}}  // for shadow entities
```

Examples:
- `{{@:npc:abc123}}` → complete NPC mention
- `{{@:npc:null:Strange Merchant}}` → shadow NPC
- `{{$:location:def456}}` → complete location
- `{{#:tag:xyz789}}` → tag

### Parsing Regex

```typescript
const MENTION_TOKEN_REGEX = /\{\{([^:]+):([^:]+):([^:}]+)(?::([^}]+))?\}\}/g;
// Groups: trigger, entityType, entityId, label (optional, for shadows)
```

### Example Session Log Content

**User sees**:
```
Arrived at [Whispering Springs]. Met [Lira] who told us about the missing
merchants. We fought [Goblin Scout] × 3. Found [Emerald Dagger] and met
[Strange Merchant] who wanted to buy it. Tagged this as #mystery.
```

**Stored as**:
```json
{
  "content": "Arrived at {{$:location:loc1}}. Met {{@:npc:npc1}} who told us about the missing merchants. We fought {{@:npc:npc2}} × 3. Found {{!:item:item1}} and met {{@:npc:null:Strange Merchant}} who wanted to buy it. Tagged this as {{#:tag:tag1}}.",
  "mentions": [
    { "trigger": "$", "entityType": "location", "entityId": "loc1", "label": "Whispering Springs", "status": "resolved" },
    { "trigger": "@", "entityType": "npc", "entityId": "npc1", "label": "Lira", "status": "resolved" },
    { "trigger": "@", "entityType": "npc", "entityId": "npc2", "label": "Goblin Scout", "status": "resolved" },
    { "trigger": "!", "entityType": "item", "entityId": "item1", "label": "Emerald Dagger", "status": "resolved" },
    { "trigger": "@", "entityType": "npc", "entityId": null, "label": "Strange Merchant", "status": "shadow" },
    { "trigger": "#", "entityType": "tag", "entityId": "tag1", "label": "mystery", "status": "resolved" }
  ]
}
```

---

## Summary: The Three Things That Matter

1. **Session logs = raw capture only**
   - Single `content` field with mentions
   - No structure during play
   - Structure is for post-session

2. **Mentions create shadow entities**
   - Reference first, define later
   - Zero friction during play
   - Cleanup happens after

3. **Mentions are structured, not markdown**
   - Use `react-native-controlled-mentions`
   - Store tokens, display labels
   - Users never see encoding

---

## Next Steps

1. **Review this plan** — confirm direction
2. **Phase 1 implementation** — schema updates
3. **Install library** — verify it meets needs
4. **Prototype MentionInput** — test with real data
