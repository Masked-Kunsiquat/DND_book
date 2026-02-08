# Continuity / Shared Universe Roadmap

## Decisions (current)
- Every campaign belongs to exactly one Continuity.
- Sessions remain per-campaign (inherited by continuity via campaign membership).
- Player characters are copy-by-default, with a future option to link/share.
- Sharing approach: reference by default with an explicit fork/copy flow.

## Why this direction
- A Continuity layer removes duplicate data entry for shared Locations/NPCs/Lore.
- Campaigns stay opinionated/contained, but can opt into shared resources.
- Copy-by-default for Player Characters protects campaign tone and balance, while leaving the door open to shared templates.

## Clarifying fork vs copy (no Git required)
Forking does **not** require Git. It is a copy with provenance metadata.
- **Shared (reference):** one item stored at continuity scope, multiple campaigns link to it.
- **Fork (copy):** create a new campaign-scoped item that records origin metadata:
  - `originId`: the shared item id
  - `originContinuityId`
  - `forkedAt`
- Optional (later): a lightweight “changes from origin” comparison view, but not required.

This is compatible with CRDTs: shared items are single records, forks are new records.

---

## Proposed Data Model (minimal changes)

### New table
- **continuities**
  - id, name, description, created, updated

### Campaigns
- Add `continuityId` (required)

### Shared-capable entities
For entities that can be shared (NPCs, Locations, Tags, Lore Notes):
- Add `scope`: `campaign` | `continuity`
- Add `continuityId` when `scope === 'continuity'`
- Add `originId` + `originContinuityId` + `forkedAt` for forks
- Keep existing link arrays (`campaignIds`, etc.) for per-campaign usage where already present

### Session Logs
- Stay per-campaign (no continuity scope)
- Optional later: session templating or “continuity recap” fields

### Player Characters
- Keep per-campaign
- Optional later: `playerCharacterTemplates` table in continuity scope

---

## UX Flows

### 1) Continuity switcher
- Dashboard card: “Continuity: [Name]” → pick continuity
- Campaign creation must select continuity (no orphan campaigns)

### 2) Create flows (shared vs campaign)
- On create: “Create new” vs “Add from Continuity”
- Default to “Create new” in campaign scope

### 3) Shared library
- Add a **Library** screen (outside campaign tabs):
  - Locations / NPCs / Lore / Tags
  - Filters by continuity, type, tag

### 4) Detail actions (per item)
- “Share to Continuity” (creates shared version)
- “Fork into Campaign” (creates campaign copy from shared)
- “Copy to Campaign” (for Player Characters)

### 5) Visual indicators
- Badges on cards: `Shared` vs `Campaign Only`
- Warnings when editing shared items: “Changes affect all campaigns in this continuity.”

---

## Note-taking UX principles to incorporate
From `note-suggestions.md`:
- **Chronological log**: session log remains the primary note stream
- **Date headings**: ensure session date is prominent (done)
- **Highlight names**: future mentions/inline tagging
- **Special notes**: continuity-level “Reference Notes”
- **Open loops**: “Leads / Questions” list per campaign
- **Field notes**: quick NPC/Location summaries from a session

---

## Roadmap Phases

### Phase 0 — Foundations & Decisions
- Lock in data model (continuity table, campaign.continuityId)
- Migration plan: assign all existing campaigns to a default continuity
- Define scope policies per entity

### Phase 1 — Continuity Core
- Add `Continuity` table + CRUD
- Require continuity when creating campaigns
- Dashboard continuity switcher

### Phase 2 — Shared Library (Locations + NPCs + Tags)
- Add `scope`, `continuityId`, `originId` fields
- Library screen (continuity scoped)
- “Add from Continuity” flow in create/edit
- Badges + warnings for shared items

### Phase 3 — Fork & Copy Workflows
- Fork shared item into campaign
- Copy campaign item into another campaign
- Show origin metadata on forked items

### Phase 4 — Lore Notes & Mentioning
- Continuity-level Lore Notes
- Inline mentions for NPCs/Locations/Tags
- Auto-link in session notes

### Phase 5 — Cross-continuity Transfer
- “Export to other continuity” flow
- Advanced: rules for conflicts + merge

---

## Open Questions (updated)
- Shared items should auto-appear in new campaigns within the continuity, with the ability to unlink per-campaign (no cascade delete).
- Shared items can be edited from campaign views, with clear warnings and an option to fork.
- Read-only shared mode is undecided; default to editable for now.

---

## Recommended Next Steps
1) Implement Continuity table + required campaign selection.
2) Pilot shared Locations with scope + unlink flow.
3) Add “Share / Fork” affordances in location detail.
