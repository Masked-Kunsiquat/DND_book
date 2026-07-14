# KMP Parity Checklist

Acceptance criteria for the Kotlin/Compose Multiplatform rewrite of the Expo mobile app.
Each item is tagged:
- **[PARITY]** — reproduce exactly as Expo does it
- **[REVAMP]** — presentation changed per ui-revamp design doc
- **[IMPROVED]** — behavior deliberately fixed vs. Expo (bug, data-loss risk, or known snag)
- **[DECISION]** — (legacy tag) all A–J decisions are now resolved in Section 35; open questions for the user are in `KMP_CONVERSION_PLAN.md § Open questions` (Q1–Q9)

---

## 1. App Shell & Navigation

- [ ] [PARITY] Single `NavHost` with a bottom-tab scaffold: Dashboard, Sessions, Notes, NPCs, Locations, Items. Campaigns tab hidden (no tab icon).
- [ ] [PARITY] Header menu on every tab: Settings → `AppSettings` graph; Continuity → `/continuities`.
- [ ] [PARITY] All non-tab routes pushed as full-screen destinations on a single back-stack above the tab scaffold.
- [ ] [PARITY] Index route (`/`) redirects immediately to Dashboard tab.
- [ ] [PARITY] Dark theme is the default on first launch (light/system are valid selections).
- [ ] [IMPROVED] Theme mode persisted to the data store (SQLite); Expo only held it in React state — app always restarted dark regardless of selection.
- [ ] [PARITY] `StoreProvider` (TinyBase equivalent — SQLite-backed) initializes before any screen renders; loading splash shown until store is ready.
- [ ] [PARITY] `TourProvider` wraps the entire app; tour state checked on Dashboard focus.

---

## 2. Dashboard `/(tabs)/index`

- [ ] [REVAMP] Hero Card: current campaign name + continuity name, tap → Campaign Detail. (Revamp promotes this to a large card at top.)
- [ ] [REVAMP] Stats Strip: single horizontal row (Notes | NPCs | Locations | Items | Tags) with dividers, tapping each navigates to its tab.
- [ ] [PARITY] Recent Notes rail: top 3 notes sorted by `updated`, each tapping → Note Detail. Empty if no notes.
- [ ] [PARITY] Quick Actions section: New Campaign → `/campaigns?create=1`; New Session → `/(tabs)/sessions?create=1` (**[IMPROVED]**: Expo pushed `/sessions`, a non-existent route — use the correct tab path); Party → `/campaign/{currentCampaignId}/party`; Sync → `/sync`.
- [ ] [PARITY] Tour Complete widget visible only when tour is finished; tapping it triggers "You're ready!" tooltip.
- [ ] [PARITY] Tour auto-start: on Dashboard focus, if `hasSeedData && !tourCompleted`, start tour after 100 ms delay. Guard against double-start with a `hasAutoStarted` flag that resets only when `tourCompleted` resets.
- [ ] [PARITY] `AttachStep` equivalents wrap: welcome heading, campaign card, stats strip. (Tour steps 0–2.)
- [ ] [PARITY] Pull-to-refresh on Dashboard (cosmetic; local-first store, no network call).
- [ ] [PARITY] Empty state when no campaign is selected: prompt to choose/create a campaign.

---

## 3. Campaigns (Hidden Tab / Modal Entry)

- [ ] [PARITY] Params: `create` (boolean string), `continuityId`.
- [ ] [PARITY] "Current campaign" section at top; tapping → Campaign Detail.
- [ ] [PARITY] Long-press on any campaign row sets it as current.
- [ ] [PARITY] FAB opens create modal: name field + continuity selector (dropdown of all continuities).
- [ ] [PARITY] After create: new campaign becomes current, navigate → Campaign Detail.
- [ ] [PARITY] If `create=1` param present, open create modal on screen entry.
- [ ] [PARITY] If `continuityId` param present, pre-select that continuity in the create modal.
- [ ] [PARITY] Pull-to-refresh (cosmetic).

---

## 4. Sessions Tab `/(tabs)/sessions`

- [ ] [PARITY] Param: `create` — if set, open create modal on entry.
- [ ] [REVAMP] Sessions grouped under month/year section headers (e.g., "July 2026"), sorted date descending within each group.
- [ ] [REVAMP] Each session row: date badge (month abbr + day number) on left, title + summary excerpt in center, participant avatar stack (max 3, +N overflow) on right.
- [ ] [PARITY] Create modal fields: title (optional), date (optional — defaults to today), summary, participants (defaults to current party member IDs).
- [ ] [PARITY] After create: navigate → Session Detail.
- [ ] [PARITY] `AttachStep` equivalent on the first session card (Tour step 3 — SESSIONS_TAB).
- [ ] [PARITY] Empty state: no campaign vs. no sessions (two distinct messages).
- [ ] [PARITY] Pull-to-refresh (cosmetic).

---

## 5. Session Detail `/session/{id}`

- [ ] [PARITY] Header: title (editable when in edit mode) + date (editable). Edit pencil icon top-right.
- [ ] [PARITY] `AttachStep` equivalent wraps the header (Tour step 4 — SESSION_DETAIL).
- [ ] [PARITY] "Session Log" section: `MentionInput`-equivalent (rich text with mention highlighting) when editing; `MentionRenderer`-equivalent when viewing. Empty state: "No session log yet."
- [ ] [PARITY] `AttachStep` equivalent wraps the Session Log section (Tour step 5 — SESSION_MENTIONS).
- [ ] [PARITY] Quick-insert toolbar below the mention editor: icon buttons for character (@ trigger), location ($ trigger), item (! trigger), tag (# trigger). Labels shown beneath each button showing the configured trigger character.
- [ ] [PARITY] 600 ms debounce autosave of `content` while editing: calls `updateSessionLog` with extracted mention arrays (npcIds, playerCharacterIds, locationIds, itemIds, tagIds). Debounce resets on each keystroke.
- [ ] [PARITY] Explicit Save also extracts mentions and updates all linked ID arrays.
- [ ] [PARITY] "Summary" section: summary textarea + "Add key decisions + outcomes" toggle (reveals keyDecisions + outcomes textareas).
- [ ] [PARITY] Participants section: avatar group + list of player character cards → `/player-character/{id}`.
- [ ] [PARITY] Links section edit mode: tap-to-open modals for Campaign, Locations, NPCs, Notes, Tags. Each modal opens over the screen.
- [ ] [PARITY] Links section view mode: campaign card(s), location cards, NPC cards, note cards, tag chips — all tappable to their detail screens.
- [ ] [IMPROVED] Shadow prompt modal: appears after Save when any shadow mentions exist. Lists all shadow entities with type label and tap-to-navigate. "Complete All Now" opens a bottom sheet listing every shadow entity so the user can tap each to complete it — **not** just the first one (Expo F4 fix; KMP_CONVERSION_PLAN.md §6.2, I5). "Remind Me Later" dismisses.
- [ ] [PARITY] Delete: overflow menu (destructive) → ConfirmDialog → `deleteSessionLog` → navigate back.
- [ ] [PARITY] No Share, no Fork, no scope — sessions are always campaign-scoped.
- [ ] [PARITY] Created/Updated timestamps shown at bottom.
- [ ] [PARITY] "Session not found" empty state if `id` resolves to nothing.
- [ ] [PARITY] Scroll ref registered for tour (`session-detail` key).

---

## 6. Notes Tab `/(tabs)/notes`

- [ ] [PARITY] Param: `tagId` — pre-selects that tag in the tag filter on entry.
- [ ] [PARITY] Filters: text search, tag chips row (visible, not collapsed), scope selector (all/campaign/continuity), campaign selector, location multi-select, tag multi-select panel.
- [ ] [PARITY] Quick-insert boilerplate templates: Date Heading, Chrono Log, Leads/Questions, NPCs, Locations, Items/Loot, Highlights — each inserts a pre-formatted text block into the new note's content.
- [ ] [PARITY] FAB opens create modal; modal includes nested link modals for locations/NPCs/tags.
- [ ] [PARITY] Cards → Note Detail.
- [ ] [PARITY] Empty states: no campaign; no notes; no notes matching filters.
- [ ] [PARITY] Pull-to-refresh.

---

## 7. Note Detail `/note/{id}`

- [ ] [PARITY] Toggle between view (MentionRenderer) and edit (MentionInput or rich-text editor) modes.
- [ ] [PARITY] Mentions rendered with highlight styling by entity type; tapping a mention navigates to that entity.
- [ ] [IMPROVED] Notes extract/parse mentions into join-table rows on save (matching session log behavior). Expo left mentions verbatim with no link extraction — this was an oversight. Decision D resolved: FIX (KMP_CONVERSION_PLAN.md §6.3, I1).
- [ ] [PARITY] Share to Continuity (if campaign-scoped): ConfirmDialog → updates scope + continuityId.
- [ ] [PARITY] Fork to Campaign (if continuity-scoped): creates a copy with `originId`/`originContinuityId`/`forkedAt` → navigate to new note.
- [ ] [PARITY] Delete → ConfirmDialog → navigate back. **[IMPROVED]**: cascade-remove `noteId` from `npc.noteIds`, `session.noteIds`, `playerCharacter.noteIds`.
- [ ] [PARITY] No shadow status on notes.
- [ ] [PARITY] "Note not found" empty state.

---

## 8. NPCs Tab `/(tabs)/npcs`

- [ ] [REVAMP] 2-column portrait roster grid. Avatar leads (large, ~88 dp circle). Shadow NPCs get a dashed border on the avatar instead of a text badge.
- [ ] [REVAMP] Tag filters as visible chip row (not collapsed accordion).
- [ ] [PARITY] Text search: name/race/role.
- [ ] [PARITY] Shadow-only toggle filter.
- [ ] [PARITY] Library icon button → `/library/npcs?continuityId={id}`.
- [ ] [PARITY] `AttachStep` equivalent on the NPC count / list header (Tour step 6 — NPCS_TAB).
- [ ] [PARITY] `AttachStep` equivalent on the first NPC card (Tour step 7 — NPC_CARD).
- [ ] [PARITY] Create modal: name, race, role, background, image picker, scope selector, + link modals for campaign/continuity/location/note/tags.
- [ ] [PARITY] DemoBadge (small "demo" chip) on NPCs where `continuityId === seedDataContinuityId`.
- [ ] [PARITY] Empty states: no campaign; no NPCs; no NPCs matching filters.
- [ ] [PARITY] Pull-to-refresh.
- [ ] [PARITY] Scroll ref registered (`npcs` key).

---

## 9. NPC Detail `/npc/{id}`

- [ ] [REVAMP] Hero Card at top: large portrait (full-width or 2/3-width image), name as headline, race•role subtitle beneath. (Matches the portrait-forward pattern established by the NPCs list revamp.)
- [ ] [PARITY] Shadow NPC banner card: "Created from a mention. Fill in details to complete." + "Mark Complete" button.
- [ ] [PARITY] Profile section (edit mode): image picker, race, role, background (multiline).
- [ ] [PARITY] Scope label: "Shared in continuity" shown beneath name when `scope === 'continuity'`.
- [ ] [PARITY] Links section: campaign(s), locations, notes, tags — view mode shows cards/chips; edit mode uses tap-to-open link modals.
- [ ] [PARITY] Edit mode: Saving when `status === 'shadow'` promotes status to `'complete'`.
- [ ] [PARITY] Meta section: created/updated timestamps.
- [ ] [PARITY] Action bar: Back, Remove from Campaign (continuity-scoped NPCs in current campaign only), Delete (destructive, overflow menu).
- [ ] [IMPROVED] Delete: cascade-remove NPC ID from `note.npcIds`, `session.npcIds`, `location.npcIds` in all referencing rows before deleting the NPC row.
- [ ] [PARITY] Share to Continuity (campaign-scoped): ConfirmDialog → promotes scope.
- [ ] [PARITY] Fork to Campaign (continuity-scoped): creates copy with fork metadata → navigate to new NPC.
- [ ] [PARITY] Remove from Campaign (continuity-scoped): filters `campaignIds` → navigate back.
- [ ] [PARITY] "NPC not found" empty state.

---

## 10. Locations Tab `/(tabs)/locations`

- [ ] [REVAMP] Overview Stats Strip at top: total count, root count, hierarchy-issue count, type count.
- [ ] [REVAMP] Type focus filter as chip row (not dropdown).
- [ ] [PARITY] Tag filter chip row.
- [ ] [PARITY] Shadow-only toggle.
- [ ] [PARITY] SectionList grouped by root location (Plane-level); sub-items indented.
- [ ] [PARITY] Hierarchy validation indicators: "missingParent" and "type mismatch" warnings on affected rows.
- [ ] [PARITY] Library button → `/library/locations?continuityId={id}`.
- [ ] [PARITY] Create modal: name, type, scope, campaign(s), parent location, description.
- [ ] [PARITY] `AttachStep` equivalent wrapping overview stats (Tour step 8 — LOCATIONS_TAB).
- [ ] [PARITY] Empty states: no campaign; no locations; no locations matching filters.
- [ ] [PARITY] Pull-to-refresh.
- [ ] [PARITY] Scroll ref registered (`locations` key).

---

## 11. Location Detail `/location/{id}`

- [ ] [REVAMP] Map image as hero banner at top (full-width, tappable to open in gallery). Breadcrumb pill trail beneath banner (collapses to "… > Parent > Current" when depth > 4).
- [ ] [PARITY] Parent chip below breadcrumb; tapping navigates to parent.
- [ ] [PARITY] Shadow Location banner + "Mark Complete" button.
- [ ] [PARITY] Type display; type-change validation: if children exist, blocked/warned when new type can't be a legal parent of existing child types.
- [ ] [PARITY] Move (re-parent) modal: location type selector + parent location picker.
- [ ] [PARITY] Gallery section: map + additional images (horizontal rail), image picker in edit mode.
- [ ] [IMPROVED] Delete: cascade-reparent or orphan children (set `parentId = ''` on direct children), remove `locationId` from `npc.locationIds`, `session.locationIds`. Before deleting, show count of affected children in ConfirmDialog.
- [ ] [PARITY] Share to Continuity, Fork to Campaign, Remove from Campaign — same rules as NPCs.
- [ ] [PARITY] "Location not found" empty state.

---

## 12. Items Tab `/(tabs)/items`

- [ ] [IMPROVED] Filter Chips row: tag chips visible above list (no tag filter exists in Expo despite items carrying `tagIds` — KMP adds it; KMP_CONVERSION_PLAN.md §8, I3).
- [ ] [PARITY] Text search: name + description.
- [ ] [PARITY] Shadow-item subtitle indicator.
- [ ] [PARITY] FAB → create modal: scope selector, campaign(s) (if continuity-scoped), name, description, value. After create → Item Detail.
- [ ] [PARITY] Cards sorted by `updated` descending.
- [ ] [PARITY] Empty states: no campaign; no items; no items matching filters.
- [ ] [PARITY] Pull-to-refresh.

---

## 13. Item Detail `/item/{id}`

- [ ] [PARITY] Header: name (headline) + scope label + updated timestamp. Edit pencil top-right.
- [ ] [PARITY] Shadow Item banner: "Created from a mention." + "Mark Complete" button.
- [ ] [PARITY] Details section: description (multiline), value. Edit/save inline.
- [ ] [PARITY] Links section: campaign(s) + tags. Edit mode: campaign multi-select + TagInput.
- [ ] [PARITY] Share to Continuity (campaign-scoped only): ConfirmDialog → promotes scope + preserves campaignIds.
- [ ] [IMPROVED] Fork to Campaign action added (Decision I2 — Expo omitted Fork for items; asymmetry was unintentional; items already have `scope`/`continuityId` in schema). (KMP_CONVERSION_PLAN.md §8, I2).
- [ ] [IMPROVED] Delete: cascade-remove `itemId` from `session.itemIds`. Expo's `useDeleteItem` omits this.
- [ ] [PARITY] "Item not found" empty state.
- [ ] [IMPROVED] Item fields `ownerId`, `ownerType`, `locationId` kept in schema, no UI in v1. Decision E resolved: KEEP IN SCHEMA (KMP_CONVERSION_PLAN.md §4; see Q7 for deferred UI decision).

---

## 14. Tags Screen `/tags`

- [ ] [IMPROVED] `continuityId` param is honored. Expo's tags screen ignores the param and falls back to `currentCampaign?.continuityId`, breaking the link from the Continuities screen.
- [ ] [PARITY] Search field.
- [ ] [REVAMP] Tag list: each row shows a color-coded chip on the left (instead of just a text label), usage summary string "X notes • Y NPCs • Z locations • W sessions", chevron right.
- [ ] [PARITY] FAB → create modal: name, scope (continuity/campaign), color swatches (16-swatch grid), live preview chip. Duplicate-name validation.
- [ ] [PARITY] `AttachStep` equivalent on the tag list header (Tour step 9 — TAGS_USAGE).
- [ ] [PARITY] Scroll ref registered (`tags` key).
- [ ] [PARITY] Empty states: no tags; no tags matching search.
- [ ] [PARITY] Pull-to-refresh.

---

## 15. Tag Detail `/tag/{id}`

- [ ] [PARITY] Tag chip at top (large, color-coded) + scope label.
- [ ] [PARITY] Usage Stats Strip: Notes | NPCs | Locations | Sessions — each count taps to filtered list where applicable. Sessions count is derived inline (no dedicated hook).
- [ ] [IMPROVED] Usage counts include Items (Expo omits items from tag usage; `useDeleteTag` also misses items). Items count taps → Items tab filtered by this tag.
- [ ] [PARITY] Edit modal: name field + color swatches + live preview chip. Duplicate-name validation.
- [ ] [PARITY] Delete → ConfirmDialog (scope-aware message) → `deleteTag`. **[IMPROVED]**: cascade covers notes, npcs, locations, sessionLogs, **and items** (Expo's cascade missed items — Decision F resolved: SKIP playerCharacters since they have no `tagIds` in the current schema; see Q8 if this changes). (KMP_CONVERSION_PLAN.md §7 C5).
- [ ] [PARITY] Share to Continuity (campaign-scoped): ConfirmDialog → updates scope.
- [ ] [PARITY] Fork to Campaign (continuity-scoped): creates copy with fork metadata → navigate to new tag.
- [ ] [PARITY] "Tag not found" empty state.

---

## 16. Campaign Detail `/campaign/{id}`

- [ ] [REVAMP] Hero Card: campaign name (large), continuity label, entity counts in a Stats Strip below.
- [ ] [REVAMP] Domain rails (horizontal scroll rails, color-coded): Notes rail, NPCs rail, Locations rail, Sessions rail, Party rail.
- [ ] [PARITY] "View All" link on each rail → sets `currentCampaignId` to this campaign + navigates to that tab.
- [ ] [PARITY] Inline name edit (tap name → text field → auto-save on blur or explicit save).
- [ ] [PARITY] Delete → ConfirmDialog → switch `currentCampaignId` to a sibling campaign in same continuity → navigate to `/campaigns?continuityId={id}`. **[IMPROVED]**: cascade-remove dangling `campaignId` references from campaign-scoped entities (Expo leaves orphans in store).
- [ ] [PARITY] Party section → `/campaign/{id}/party`.

---

## 17. Campaign Party `/campaign/{id}/party`

- [ ] [PARITY] List of player characters for this campaign.
- [ ] [PARITY] "Templates" button → `/library/player-characters`.
- [ ] [PARITY] Create modal → navigate → Player Character Detail.
- [ ] [PARITY] Pull-to-refresh.

---

## 18. Campaign Sessions `/campaign/{id}/sessions`

- [ ] [PARITY] Campaign-scoped view of sessions tab — identical behavior to sessions tab but filtered to this campaign.
- [ ] [REVAMP] Inherits sessions revamp: date badge, avatar stack, month headers.

---

## 19. Player Character Detail `/player-character/{id}`

- [ ] [PARITY] Portrait (image), player name, race, class, background fields.
- [ ] [PARITY] Sessions section: list of sessions this PC participated in → Session Detail.
- [ ] [PARITY] Note link modal (edit mode only; no `useNotesByPlayerCharacter` — notes shown in edit modal only).
- [ ] [PARITY] Save as Template: creates a `playerCharacterTemplate` record with same fields.
- [ ] [PARITY] Delete → ConfirmDialog → navigate back.
- [ ] [PARITY] No scope/shadow/Share/Fork.

---

## 20. Continuities `/continuities`

- [ ] [REVAMP] Hero Card for current continuity; library shortcuts as an icon-grid below (Locations, NPCs, Tags, Notes, PC Templates).
- [ ] [PARITY] All-continuities list below. Tapping a continuity switches `currentCampaignId` to the most-recently-updated campaign in that continuity.
- [ ] [PARITY] Create modal → `/campaigns?create=1&continuityId={newId}`.
- [ ] [PARITY] Edit modal: name field + Delete button. Delete is UI-disabled if any campaigns exist in the continuity. **[IMPROVED]**: the delete guard is also enforced in the data layer, not just the UI.
- [ ] [IMPROVED] `/continuity/{id}` detail screen added in KMP port (Decision A resolved: ADD). Shows name/description, library shortcuts, and campaign list. (KMP_CONVERSION_PLAN.md §6.9, I6).

---

## 21. Settings `/settings`

- [ ] [REVAMP] Clean section groups with icons, matching settings revamp doc.
- [ ] [PARITY] Appearance section → `/settings/appearance`.
- [ ] [PARITY] Mentions section → `/settings/mentions`.
- [ ] [IMPROVED] Sync section → `/settings/sync` — fully implemented native P2P sync (Ktor + DNS-SD). Decision G resolved: FIX with field-level LWW + HLC. No ComingSoon badge. (KMP_CONVERSION_PLAN.md §5, §6.8, I8).
- [ ] [IMPROVED] Data section → `/settings/data` — fully implemented (Load/Clear demo data). Decision H resolved: IMPLEMENT. No ComingSoon badge. (KMP_CONVERSION_PLAN.md §6.8).
- [ ] [PARITY] "Restart Tour" button → resets `tourCompleted` → re-triggers tour auto-start on next Dashboard focus.
- [ ] [PARITY] "Load Demo Data" button → seeds Odyssey campaign (idempotent if already seeded).
- [ ] [PARITY] "Clear Demo Data" button → removes all seed entities; resets `hasSeedData` + `seedDataContinuityId`. **[IMPROVED]**: also resets `tourCompleted` so tour can auto-start again after re-seeding (Expo's `clearSeedData` omits this).

---

## 22. Settings / Appearance `/settings/appearance`

- [ ] [IMPROVED] Theme mode (light/dark/system) persisted to store. Expo renders this screen but only holds mode in React state — choice is lost on restart.
- [ ] [PARITY] Immediate live preview of color scheme on selection.
- [ ] [PARITY] Remove ComingSoon badge (since persistence will actually work).

---

## 23. Settings / Mentions `/settings/mentions`

- [ ] [PARITY] Four trigger selects: character, location, item, tag. Options: `@`, `#`, `$`, `!`, `~`, `^`, `&`.
- [ ] [PARITY] Conflict detection: if two triggers are set to the same character, both fields show an error and Save is disabled.
- [ ] [PARITY] Reset button restores defaults (`@`, `$`, `!`, `#`).
- [ ] [PARITY] Live preview of how each trigger renders in a sample mention.

---

## 24. Sync Screens `/sync`, `/sync/host`, `/sync/join`

- [ ] [IMPROVED] All sync screens are **fully enabled on all native platforms** — no "web only" banner. KMP sync is native-first via Ktor + DNS-SD (Decision G resolved; KMP_CONVERSION_PLAN.md §5, I8, P1). The Expo "P2P sync is web only" banner is not reproduced.
- [ ] [REVAMP] `/sync/host`: room code as large hero text + Share Sheet button (matches sync host revamp doc). Status indicator below. Room code registered as `dndbook-ABC-123._tcp.local` DNS-SD service.
- [ ] [REVAMP] `/sync/join`: room code input with prominent "Join Session" primary button; auto-discovered nearby sessions list also shown. Status strip (colored dot + plain-English state). (Matches UI_REVAMP_GAPS.md §7 proposed after, adapted for native P2P — not web-only.)
- [ ] [IMPROVED] Join flow: enter code OR select auto-discovered session → DNS-SD lookup → Ktor WebSocket connect → `LwwMergeEngine` merge on receive. Connected state shows "Connected to {roomId}". Leave button enabled only when connected.
- [ ] [IMPROVED] Sync data model: field-level LWW with Hybrid Logical Clock — **not** `store.setJson()` full-overwrite (Decision G resolved). No Yjs/WebRTC signaling servers required. `lastSyncedAt` written to DataStore on each successful sync round (I10). (KMP_CONVERSION_PLAN.md §5).

---

## 25. Library Screens `/library/npcs|locations|notes|/library/player-characters`

- [ ] [PARITY] `/library/npcs`: continuity-scoped NPC list, search, Add/Remove toggle per NPC (updates `campaignIds`). No create.
- [ ] [PARITY] `/library/locations`: same pattern for locations.
- [ ] [PARITY] `/library/notes`: same pattern for notes.
- [ ] [PARITY] `/library/player-characters`: templates list. "Add" instantiates PC into current campaign → navigate to Player Character Detail. Full CRUD on templates.
- [ ] [IMPROVED] `usePlayerCharactersByPlayer` hook dropped from KMP data layer (Decision C resolved: DROP; exported in Expo but never used by any screen). (KMP_CONVERSION_PLAN.md §8, I11; Q6).

---

## 26. Cross-Cutting: Scope / Share / Fork Rules

Per-entity rules enforced in the data layer (not just the UI):

| Entity | Share (→ continuity) | Fork (→ campaign copy) | Remove (unlink from campaign) |
|---|---|---|---|
| Notes | yes | yes | no (delete only) |
| NPCs | yes | yes | yes (continuity-scoped only) |
| Locations | yes | yes | yes (continuity-scoped only) |
| Items | yes | **yes** (KMP improvement I2 — Expo had no Fork; asymmetry was unintentional) | no |
| Tags | yes | yes | no |
| Sessions | no | no | no (always campaign) |
| Player Characters | no | no | no |

- [ ] [PARITY] Share sets `scope = 'continuity'`, `continuityId`, preserves `campaignIds`.
- [ ] [PARITY] Fork creates new record with `originId`, `originContinuityId`, `forkedAt`, `scope = 'campaign'`, `campaignIds = [currentCampaignId]`.
- [ ] [PARITY] Remove from Campaign: filters the entity's `campaignIds` to exclude current campaign. Only available when `scope === 'continuity'` and entity is in current campaign.

---

## 27. Cross-Cutting: Shadow Entity Lifecycle

- [ ] [PARITY] Entities with `status = 'shadow'` are created automatically when a mention token `{trigger}[Label](null)` is typed in a session log or note with no matching entity.
- [ ] [PARITY] Shadow NPCs/Locations/Items show a distinct visual treatment on their list rows (NPC: dashed avatar ring; Location/Item: shadow badge).
- [ ] [PARITY] Shadow banner on detail screens with "Mark Complete" one-tap.
- [ ] [PARITY] Edit-and-save on a shadow NPC promotes to `'complete'` automatically.
- [ ] [PARITY] Shadow prompt in Session Detail fires after Save when any shadow mentions exist.
- [ ] [IMPROVED] "Complete All Now" navigates through each shadow entity in turn (queue), not just the first.
- [ ] [PARITY] Deleting a shadow entity does not break mention rendering (renderer falls back to plain text or "deleted" style).

---

## 28. Cross-Cutting: Mention System

- [ ] [PARITY] Token format: `{trigger}[DisplayLabel](entityId)` stored verbatim in `content` strings.
- [ ] [PARITY] Four configurable triggers: `character`, `location`, `item`, `tag` — each mapped to a user-selected character.
- [ ] [PARITY] Suggestion dropdown appears on trigger character typed; filters entity list by typed text.
- [ ] [PARITY] Selecting a suggestion inserts `{trigger}[Name](id)` token.
- [ ] [PARITY] Unresolved entity (new name not in store): inserts `{trigger}[Name](null)` and creates a shadow entity for NPCs/Locations/Items; for tags, calls `getOrCreateTag`.
- [ ] [PARITY] Quick-insert toolbar (session detail only): icon buttons that append the trigger character to content, opening the suggestion dropdown.
- [ ] [PARITY] Renderer highlights mention tokens by type; color and style match entity domain color.
- [ ] [PARITY] Stale display labels (entity renamed after mention stored) remain until content is re-saved. Decision I resolved: ACCEPT (KMP_CONVERSION_PLAN.md §7 M1; see Q9).
- [ ] [IMPROVED] Session autosave (600 ms debounce) extracts mention arrays into join tables; **Notes also extract mentions on save** (Decision D resolved: FIX, KMP_CONVERSION_PLAN.md §6.3, I1).

---

## 29. Cross-Cutting: Location Hierarchy

- [ ] [PARITY] Seven levels: Plane > Realm > Continent > Territory > Province > Locale > Landmark.
- [ ] [PARITY] A location's parent must be exactly one level above it in the hierarchy.
- [ ] [PARITY] Type-change validation: blocked if new type would be illegal relative to existing parent or children.
- [ ] [PARITY] Hierarchy issue count shown on Locations list (missing-parent count + type-mismatch count).
- [ ] [PARITY] Breadcrumb on Location Detail collapses to `… > Parent > Current` when depth exceeds 4.
- [ ] [IMPROVED] Delete cascade: reparent or orphan child locations, remove location from referencing arrays.

---

## 30. Cross-Cutting: Tour (Steps 0–10)

- [ ] [PARITY] 11 steps total. Step indices must match `TOUR_STEP` constants so `AttachStep` equivalents bind correctly.
- [ ] [PARITY] Step 0 DASHBOARD_WELCOME: Dashboard, welcome heading.
- [ ] [PARITY] Step 1 DASHBOARD_CAMPAIGN_CARD: Dashboard, campaign card.
- [ ] [PARITY] Step 2 DASHBOARD_STATS: Dashboard, stats strip.
- [ ] [PARITY] Step 3 SESSIONS_TAB: navigate to Sessions tab, highlight list.
- [ ] [IMPROVED] Step 4 SESSION_DETAIL: navigate to seed session `SESSION_IDS.cyclopsEncounter`. **Guard**: if seed data has been cleared (i.e., `hasSeedData === false`), skip to step 5 rather than navigating to a missing session.
- [ ] [PARITY] Step 5 SESSION_MENTIONS: same session screen, highlight Session Log section.
- [ ] [PARITY] Step 6 NPCS_TAB: navigate to NPCs tab, highlight list header.
- [ ] [PARITY] Step 7 NPC_CARD: same screen, highlight first NPC card.
- [ ] [IMPROVED] Step 8 LOCATIONS_TAB: navigate to Locations tab using `navController.navigate(Locations)` (NOT `replace`). Expo tour step 9 used `router.replace('/tags')` which popped the back-stack and hid the tab bar mid-tour (T4 fix; KMP_CONVERSION_PLAN.md §6.5).
- [ ] [PARITY] Step 9 TAGS_USAGE: navigate to Tags screen, highlight tag list header.
- [ ] [PARITY] Step 10 TOUR_COMPLETE: return to Dashboard, complete modal with "Keep Demo" / "Start Fresh".
- [ ] [PARITY] Before-hooks scroll registered screens to top (via registered scroll refs).
- [ ] [PARITY] `bounce` motion, `rectangle` spotlight shape, `0.85` backdrop opacity.
- [ ] [IMPROVED] Tour step index persisted (not just `tourCompleted`), so resuming after app kill continues from where user left off rather than restarting at step 0.
- [ ] [IMPROVED] Auto-start guard uses a persistent flag (not local component state) to prevent re-triggering on screen remount.
- [ ] [PARITY] Tour stops gracefully if `hasSeedData` becomes false mid-tour.

---

## 31. Cross-Cutting: Seed Data (Odyssey Campaign)

- [ ] [PARITY] Continuity: "The Wine-Dark Sea (Demo)", fixed `seedDataContinuityId`.
- [ ] [PARITY] Campaign: "The Long Way Home", set as `currentCampaignId` on seed.
- [ ] [PARITY] 10 Tags: Enemy, Ally, Goddess, Monster, Hero, Mortal, Island, Sea, Divine, Quest.
- [ ] [PARITY] 12 Locations: 2 planes, 1 territory, 9 locales (Ithaca, Troy, Aegean Sea, Cyclops Island, Circe's Isle, Land of the Dead, Phaeacia, Scylla & Charybdis, Calypso's Island, Sirens' Rock).
- [ ] [PARITY] 10 NPCs: Odysseus, Circe, Polyphemus, Penelope, Telemachus, Athena, Poseidon, Tiresias, Calypso, Nausicaa.
- [ ] [PARITY] 3 Items: (whatever the current seed produces — match exactly).
- [ ] [PARITY] 1 SessionLog: "Cyclops Encounter", fixed ID `SESSION_IDS.cyclopsEncounter` — used by tour step 4.
- [ ] [PARITY] Seed flags written: `hasSeedData = 'true'`, `seedDataContinuityId`, `currentCampaignId`.
- [ ] [PARITY] Seed is idempotent: re-running when `hasSeedData === 'true'` is a no-op.
- [ ] [IMPROVED] `clearSeedData` also resets `tourCompleted` (Expo omits this, causing tour to never auto-start after re-seeding).

---

## 32. Cross-Cutting: Pull-to-Refresh

- [ ] [PARITY] Pull-to-refresh gesture on: Sessions, NPCs, Locations, Items, Campaigns, Tags, Party, Dashboard.
- [ ] [PARITY] Cosmetic only (local-first store, no network request). Show spinner for ~300 ms then dismiss.

---

## 33. Cross-Cutting: Image Handling

- [ ] [IMPROVED] Images use a **content-addressed blob store** from day one (Q3 resolved 2026-07-13). On import, bytes are SHA-256 hashed; file stored as `filesDir/images/<hash>.<ext>`; DB stores the hash string. Decision J superseded.
- [ ] [IMPROVED] `blobs` table (`hash PK`, `extension`, `size`, `created`) tracks all known blobs. `npcs.image_hash`, `locations.map_hash`, `player_characters.image_hash`, `pc_templates.image_hash`, and `location_images.blob_hash` all reference blob hashes (not file paths or URIs).
- [ ] [IMPROVED] Coil 3 `AsyncImage` uses a custom `BlobFetcher` that resolves `blob:<hash>` URI scheme to the filesystem path.
- [ ] [IMPROVED] On delete of an NPC, Location, or Player Character: run blob GC pass — delete rows from `blobs` where no table column references that hash, then delete the file from `filesDir/images/`.
- [ ] [PARITY] Location gallery: array of blob hashes in `location_images` join table; add/remove in edit mode.
- [ ] Blob sync over WebSocket (sending/receiving raw bytes alongside row deltas) is a **Phase 5+ deferred item** — not required for Phase 1–4.

---

## 34. Cross-Cutting: Store / Persistence

- [ ] [IMPROVED] SQLite-backed via **SQLDelight 2.4+** with proper relational schema and FK constraints; replaces the single JSON blob TinyBase approach. No single-blob serialization. (KMP_CONVERSION_PLAN.md §4).
- [ ] [IMPROVED] SQLDelight `Flow`-based reactive queries replace 1-second debounce polling; changes propagate reactively, no debounce needed on the data layer (autosave debounce on UI input fields is preserved where noted).
- [ ] [IMPROVED] Migrations via SQLDelight numbered migrations directory (`migrations/`), replacing the 8 idempotent backfill steps. The 8 Expo backfills are subsumed into `V1__initial_schema.sq` (clean install; no migration from TinyBase). (KMP_CONVERSION_PLAN.md §4).
- [ ] [IMPROVED] `hasSeedData`, `seedDataContinuityId`, `tourCompleted` stored in **DataStore Preferences** (formally declared keys). Expo wrote these as informal runtime values outside the declared schema. (KMP_CONVERSION_PLAN.md §4, DataStore keys).
- [ ] [IMPROVED] `lastSyncedAt` written by `SyncRepository` on every successful sync round. Decision G resolved: FIX (KMP_CONVERSION_PLAN.md §5, I10).
- [ ] [IMPROVED] Entity IDs generated as **ULIDs** (sortable, collision-resistant) rather than Expo's custom `generateId()`. Stored as TEXT strings — format-compatible with existing content migration. (KMP_CONVERSION_PLAN.md §8, I9).

---

## 35. Decision Register

> **Open questions that still need a user decision live in `KMP_CONVERSION_PLAN.md § Open questions` (Q1–Q9). This section records the resolution of each A–J item; if an item is still open it says so and cites the canonical question number.**

**A. `/continuity/{id}` detail screen**
~~KEEP as-is~~ **RESOLVED — ADD** (KMP_CONVERSION_PLAN.md §6.9, Deliberate Improvement I6).
A `ContinuityDetailScreen` is included in Phase 2, showing name/description, library shortcuts, and campaign list.

**B. `/settings/sync` and `/settings/data` routes**
~~KEEP as ComingSoon stubs~~ **RESOLVED — IMPLEMENT** (KMP_CONVERSION_PLAN.md §6.8, Deliberate Improvements I8, I10).
Both screens are fully implemented. Sync uses the native Ktor/DNS-SD P2P stack. Data screen handles load/clear demo data with proper atomic state reset. ComingSoon badges are removed.

**C. `usePlayerCharactersByPlayer` hook**
**RESOLVED — DROP** (KMP_CONVERSION_PLAN.md §8, Deliberate Improvement I11; see also Q6).
Hook was exported but never consumed by any screen; omitted from KMP data layer.

**D. Note mention extraction**
~~KEEP asymmetry~~ **RESOLVED — FIX** (KMP_CONVERSION_PLAN.md §6.3 and Deliberate Improvement I1).
Notes extract and upsert mention join-table rows on save in the KMP port, matching session log behavior. The asymmetry was an oversight, not an intentional design. All [PARITY] tags in §7 and §28 that say "notes do NOT extract" are updated to [IMPROVED].

**E. Item fields `ownerId`, `ownerType`, `locationId`**
**RESOLVED — KEEP IN SCHEMA, NO UI** (KMP_CONVERSION_PLAN.md §4 `items` table note; see also Q7).
Fields are present in the SQLDelight schema for future inventory use; no UI is added in v1. See Q7 for the deferred ownership UI decision.

**F. `useDeleteTag` cascade omits `playerCharacters`**
**RESOLVED — SKIP** (KMP_CONVERSION_PLAN.md §7, finding C5; see also Q8).
`playerCharacters` have no `tagIds` field in the current Expo schema. The KMP port adds `item_tags` cascade (C5/I4) but does not add `playerCharacter ↔ tag` links in v1. See Q8 if this should change.

**G. Sync: full-store LWW overwrite (BLOCKER)**
~~FIX using CRDT merge~~ **RESOLVED — field-level LWW + Hybrid Logical Clock via Ktor + DNS-SD** (KMP_CONVERSION_PLAN.md §5).
The KMP port replaces `store.setJson()` full-overwrite with a `LwwMergeEngine` merging per-column using HLC timestamps. Ktor WebSocket + local DNS-SD discovery replaces Yjs/WebRTC (JS-only, requires internet signaling server). `lastSyncedAt` is written on every successful sync (Deliberate Improvement I10). The sync join screen shows a native room-code entry UI — the "P2P sync is web only" banner does not appear.

**H. `/settings/data` route**
~~KEEP ComingSoon~~ **RESOLVED — IMPLEMENT** (same as B; KMP_CONVERSION_PLAN.md §6.8).
Settings/Data screen is fully implemented: Load Demo Data (idempotent), Clear Demo Data (atomically resets `hasSeedData`, `seedDataContinuityId`, `tourCompleted`).

**I. Stale mention display labels**
**RESOLVED — ACCEPT stale labels** (KMP_CONVERSION_PLAN.md §7 finding M1; see also Q9).
Inherent text-storage limitation; scanning all content on every rename is expensive. Carry-over from Expo; see Q9 if this should be revisited.

**J. Image persistence across reinstall**
**RESOLVED — default: keep local file URIs in `images/` sub-directory** (KMP_CONVERSION_PLAN.md Open Question Q3 / Assumption A3).
Images are copied to a dedicated `images/` sub-directory in the app's `filesDir`. Full content-addressed blob store is deferred; see Q3.

---

*Document version: 2026-07-13. All A–J items resolved. Remaining open decisions: see KMP_CONVERSION_PLAN.md § Open questions (Q1–Q9).*
