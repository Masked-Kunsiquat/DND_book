# UI Revamp — Gap Briefs

Design briefs for the eight screens the existing ui-revamp docs do not cover. Each brief follows the same voice and six-pattern grammar established by the eleven existing redesign docs: Hero Card, Stats Strip, Horizontal Rails, Filter Chips, Portrait-Forward Grid, and Overflow Menu for destructive actions.

Colors used throughout: gray scale `#111827` (900) → `#f3f4f6` (100), primary blue `#3b82f6` (500), secondary indigo `#818cf8` (400). Cards on `#1f2937` (800) surface, page background `#111827` (900).

---

## 1. Items List

### Current state
A plain FlatList of `AppCard` rows. Each row shows item name as title and a subtitle string built from status ("Shadow item"), value ("Value: 50 gp"), or description — whichever applies first. A single text search field sits above the list. There are no tag filters, no scope filters, and no shadow-only toggle, despite the schema carrying `tagIds`, `scope`, and `status` on every item.

### Problems
- No tag filter. The NPCs and Locations lists both have visible tag chip rows; Items is the odd one out even though items carry `tagIds`.
- Shadow items are indistinguishable at a glance from complete ones — the word "Shadow item" appears in the subtitle, which is easy to miss.
- Value is buried in the subtitle alongside status and description; there is no consistent visual slot for it.
- A shared (continuity-scoped) item looks identical to a campaign item.

### Proposed AFTER
Apply the Filter Chips pattern at the top: a horizontal scrollable row of tag chips (matching the NPCs/Locations treatment) plus a "Shadow only" toggle pill. Below the chips, a compact count line ("N items"). The text search bar stays. List rows grow slightly to accommodate a right-aligned value badge — a small rounded pill in `#374151` showing "50 gp" or "—" when blank. Shadow items get a dashed left border (2 dp, `#818cf8` / secondary) so they read immediately as incomplete. Continuity-scoped items get a small `#3b82f6` dot or "Shared" micro-label beneath the title. Destructive create errors surface inline rather than in the subtitle slot. The FAB stays.

```
┌─────────────────────────────────────┐
│ Items                         [+FAB]│
├─────────────────────────────────────┤
│ 🔍 Search items...                  │
│ [#Ally] [#Enemy] [#Quest] > Shadow  │  ← Filter Chips row
├─────────────────────────────────────┤
│ 12 items                            │
│ ┌─────────────────────────── ─ ─ ─┐ │
│ │ Ithaca Bow           [50 gp]    │ │  ← value badge right
│ │ Campaign item                   │ │
│ └─────────────────────────── ─ ─ ─┘ │
│ ╔═════════════════════════════════╗ │
│ ║ Cursed Dagger        [Unknown] ║ │  ← dashed left border = shadow
│ ║ Shadow item · Shared           ║ │
│ ╚═════════════════════════════════╝ │
└─────────────────────────────────────┘
```

---

## 2. Item Detail

### Current state
A vertical scroll with three sections: a title/scope/timestamp header row, a Details section (description + value fields), and a Links section (campaigns + tags). Edit and Save are explicit buttons. Share to Continuity is a separate outlined button below the action row. Delete is a text button in the action row colored `error` — fully exposed alongside Cancel/Save.

### Problems
- Delete sits in the main action row next to Save, a pattern the revamp docs explicitly retire everywhere else. A misclick on a small screen deletes permanently.
- No visual hierarchy: description, value, campaigns, and tags receive equal visual weight despite different importance.
- The shadow banner card ("Created from a mention") is styled the same as the entity content cards — it doesn't read as a call-to-action state.
- Share button is orphaned below the action row with no clear grouping.

### Proposed AFTER
Hero Card at top: item name as `headlineMedium`, scope badge ("Shared" in `#3b82f6` or "Campaign only" in gray), updated timestamp as a caption. The shadow state replaces the Hero Card with an amber-tinted placeholder card ("Placeholder item — tap to complete") with a prominent "Mark Complete" contained button. Below the hero, a two-row Stats Strip shows: Value (left cell, click-to-edit) | Scope (right cell). Description follows as the main prose block — full-width, no label, letting the text breathe. Tags render as a chip row directly beneath. The campaigns block (typically just one) becomes a small horizontal rail of campaign chips. Overflow Menu (three-dot icon top-right) contains Share to Continuity and Delete as separate items, with Delete color-coded `error`. Edit mode is toggled from the overflow menu as well, collapsing the display fields into inputs in-place.

```
┌─────────────────────────────────────┐
│ ← Item Detail              [⋮ menu] │  ← overflow: Edit / Share / Delete
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  Ithaca Bow           Campaign  │ │  ← Hero Card
│ │  Updated Jul 13                 │ │
│ └─────────────────────────────────┘ │
│  Value         │  Scope             │  ← Stats Strip
│  50 gp         │  Campaign item     │
├─────────────────────────────────────┤
│  A recurve bow carved from olive    │
│  wood, strung with ox-gut cord.     │  ← prose block
│                                     │
│  [#Quest] [#Hero]                   │  ← tag chips
│                                     │
│  [The Long Way Home ›]              │  ← campaign chip rail
└─────────────────────────────────────┘
```

---

## 3. Tags List

### Current state
A FlatList where each row is an `AppCard` with the tag name as title and a usage summary string ("3 notes • 2 npcs • 1 location") as subtitle. The tag's color only appears after tapping into the detail screen — the list itself shows no color. A text search field and a Tour-attached header sit above the list.

### Problems
- No color in the list rows. Tags are a visual system; scanning a list of gray text rows defeats the purpose.
- Items are absent from usage counts (Expo omits them; tag delete also misses items).
- The "create" FAB opens a modal with a color swatch picker, but the color you choose is invisible until you navigate away and come back.
- Rows have no visual differentiation between continuity-scoped and campaign-scoped tags.

### Proposed AFTER
Each row becomes a two-part layout: a large color swatch circle (40 dp) on the left (matching the tag's stored color), tag name + scope label in the center, and usage summary on the right — formatted as a compact four-cell grid (notes / npcs / locations / sessions) with small count numbers. Items count is added as a fifth cell. Continuity-scoped tags get a small "continuity" icon; campaign-scoped tags get none (campaign-local is the less common case, so no icon = default continuity). The create modal's live preview chip updates in real time as the user types name and picks color — same as current, but now the list reinforces the color choice on return. Filter Chips: add a scope filter row ("All / Continuity / Campaign only") above the search field.

```
┌─────────────────────────────────────┐
│ Tags                          [+FAB]│
├─────────────────────────────────────┤
│ [All] [Continuity] [Campaign only]  │  ← scope filter chips
│ 🔍 Search tags...                   │
├─────────────────────────────────────┤
│ ●  Enemy       ∞ shared             │
│    3 notes · 5 npcs · 2 loc · 0 ses│
├─────────────────────────────────────┤
│ ●  Ally        ∞ shared             │
│    1 note · 3 npcs · 4 loc · 1 ses │
├─────────────────────────────────────┤
│ ●  Grudge      campaign only        │
│    0 notes · 1 npc · 0 loc · 2 ses │
└─────────────────────────────────────┘
```
(● = filled color circle matching tag.color)

---

## 4. Tag Detail

### Current state
Three sections: a "Tag" section showing the color chip + scope label; a "Usage" section with a 2×2 grid of StatCards (Notes, NPCs, Locations, Sessions — tappable where count > 0); and an "Actions" section with Edit, Delete, Share, Fork buttons all in the same row. Items are absent from usage. The edit modal shows the color swatches correctly.

### Problems
- Edit/Delete/Share/Fork all live at the same visual level; Delete is not visually distinguished as destructive.
- Items missing from usage counts.
- The tag chip at top is small (the `small` size prop) — there is no sense of "this is the tag you're managing."
- Usage StatCards are a 2×2 grid, not the Stats Strip used elsewhere.

### Proposed AFTER
Hero Card: tag name at large scale, with the entire card background tinted to the tag's color at 20% opacity. Below the hero, a Stats Strip of five cells: Notes | NPCs | Locations | Sessions | Items — each tappable to the filtered list. Color chip + scope label drop to a small row beneath the strip. Edit is a contained button; Share and Fork are outlined buttons beneath. Delete moves to the Overflow Menu (three-dot) and appears in `error` color. The edit modal is unchanged; color swatches stay.

```
┌─────────────────────────────────────┐
│ ← Tag                      [⋮ menu]│  ← overflow: Delete
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  ● Enemy              Shared   │ │  ← Hero Card, bg tinted tag color
│ └─────────────────────────────────┘ │
│  Notes │ NPCs │ Locs │ Sess │ Items │  ← Stats Strip
│    3   │   5  │   2  │   1  │   0   │
├─────────────────────────────────────┤
│  [Edit]                             │
│  [Share to Continuity]              │
│  [Fork to Campaign]                 │
└─────────────────────────────────────┘
```

---

## 5. Session Detail

Session detail is the most complex screen in the app. It is the intersection of the mention system, the shadow lifecycle, autosave, and the broadest set of linked entity types. The brief below addresses each concern in sequence.

### Current state
The screen is a long vertical scroll with six sections: header (title + date), Session Log (MentionInput or MentionRenderer), Summary (with hidden key-decisions/outcomes), Participants (avatar group + PC cards), Links (five tap-to-modal cards for Campaign/Locations/NPCs/Notes/Tags), and a meta row (created/updated). Edit and Delete buttons anchor the bottom. The shadow prompt is a modal that appears after Save if any shadow mentions exist; "Complete All Now" only navigates to the first shadow entity.

### Problems
- The Session Log section and the Summary section compete for vertical space with no visual hierarchy. The log is the primary artifact; the summary is the retrospective. They feel equal right now.
- Quick-insert toolbar (icon buttons + labels) sits below the MentionInput with no clear visual container — it reads like an afterthought.
- The shadow prompt's "Complete All Now" only navigates to the first entity, despite implying it will complete all of them.
- Links section in view mode dumps all entity types into a single flat list — campaigns, locations, NPCs, notes, and tags share one visual bucket.
- Delete is in the action row alongside Back and is colored `error` — same pattern the revamp retires.
- Participants avatar stack exists, but PC cards beneath it repeat the same info visually at twice the size.
- "Add key decisions + outcomes" is a text button that hides two important retrospective fields.

### Proposed AFTER
**Header**: date badge (large, left-aligned, same style as sessions list) + session title as `headlineMedium`. Overflow Menu top-right contains Delete (destructive). Edit pencil stays as an icon button.

**Session Log** leads the page as the primary card — full-width, distinct background tint (`#1f2937` → slightly elevated surface), no section header needed. The MentionInput fills this card. Quick-insert toolbar becomes a sticky strip at the bottom of the card itself (inside the card boundary), visually anchored to the editor: four icon buttons in a row, labeled beneath, separated from the editor by a 1 dp divider.

**Summary block** follows as a collapsible card. Collapsed: shows the first line of summary text (or "No summary yet"). Expanded: reveals Summary textarea + Key Decisions + Outcomes. The collapsed-by-default state reduces cognitive load when the DM is logging in real time and not yet writing retrospective notes.

**Participants** become a compact horizontal avatar rail (30 dp avatars, scrollable, max visible ~5) with a "+ Manage" chip on the right. No duplicate list of PC cards beneath — tap the "+ Manage" chip to open the participant modal. Tap an individual avatar to navigate to that PC's detail screen.

**Links** are split by domain using the Horizontal Rails pattern: a Locations rail, an NPCs rail, a Notes rail, and a tag chip row — each labeled with an icon and a count. Each rail is a compact horizontal scroll of mini-cards. Campaign is shown as a single chip row at top of the Links area (sessions only ever have one campaign). In edit mode each rail has a "+" button that opens its respective link modal.

**Shadow prompt modal**: lists all shadow entities. "Complete All Now" opens a **bottom sheet** listing every shadow entity; the user taps each one individually to navigate to its detail screen and complete it (KMP_CONVERSION_PLAN.md §6.2 and §8, I5). This replaces the Expo behavior of navigating only to the first shadow entity. "Remind Me Later" dismisses the prompt without action.

```
┌─────────────────────────────────────┐
│ ← Session               [⋮] [✏]    │  ← overflow: Delete
├─────────────────────────────────────┤
│  JUL   Cyclops Encounter            │  ← date badge + title
│  13    The Long Way Home            │
├─────────────────────────────────────┤
│ ┌─────────── Session Log ─────────┐ │
│ │ The crew landed on the island   │ │
│ │ of @[Polyphemus](id)...         │ │  ← mention-highlighted text
│ ├─────────────────────────────────┤ │
│ │ [@] [$] [!] [#]                 │ │  ← quick-insert strip (sticky)
│ └─────────────────────────────────┘ │
│ ▼ Summary (tap to expand)           │  ← collapsible
│ ┌ Participants ──────────────────┐  │
│ │ 😀 😀 😀  + Manage            │  │  ← avatar rail
│ └────────────────────────────────┘  │
│ Campaign: [The Long Way Home]       │
│ Locations: [Cyclops Island ›][+]    │  ← domain rail
│ NPCs:      [Polyphemus ›] [+]       │
│ Notes:     [Session Note ›] [+]     │
│ Tags:      [#Monster] [#Enemy] [+]  │
└─────────────────────────────────────┘
```

---

## 6. NPC Detail

### Current state
A header row with the name as `headlineSmall` and a pencil icon. Below it: a Profile section with a small (48 dp) circular avatar beside the race/role labels, followed by background prose. Below that: a Links section with campaigns, locations, notes, and tags. A Meta section with timestamps. Action row: Back, Remove (conditional), Delete. Share/Fork row below. Delete and Share are exposed in the main scroll.

### Problems
- The avatar is 48 dp — barely larger than the tag chip already used on list rows. NPCs are the most character-driven entity in the app; their portrait deserves the same prominence given to them in the list redesign.
- Delete is in the main action row at full visual weight alongside Back.
- The profile metadata (race, role) is two plain label strings; they carry no visual weight.
- Background text starts immediately after a tiny avatar with no breathing room.

### Proposed AFTER
Hero Card at top: large portrait image (full-width card, aspect 16:9 or 3:2, rounded bottom corners), NPC name as `headlineLarge` overlaid at bottom-left with a subtle gradient scrim. Shadow NPC state: replace the hero image with a dashed-border placeholder showing a generic silhouette icon — immediately communicates "incomplete." Below the hero: a Stats Strip of two cells — Race | Role — as pill-style labels. Scope badge ("Shared" in `#3b82f6`) appears beneath the strip as a small chip when `scope === 'continuity'`.

Background prose follows at full width, given room to breathe. Links section uses small Horizontal Rails for Locations and Notes (scrollable mini-cards with a "+" button on each rail), and a tag chip row for Tags. Campaign assignment is a single chip (typically one).

Overflow Menu (three-dot, top-right) contains: Edit, Share to Continuity / Fork to Campaign (conditional), Remove from Campaign (conditional), Delete (destructive, `error` color). This moves all destructive and scope-management actions off the main scroll entirely.

```
┌─────────────────────────────────────┐
│ ←                          [⋮ menu]│  ← Edit / Share / Fork / Remove / Delete
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │      [large portrait image]     │ │  ← Hero Card
│ │                                 │ │
│ │ Circe           ∞ Shared        │ │  ← name + scope overlay
│ └─────────────────────────────────┘ │
│  Race: Goddess  │  Role: Witch      │  ← Stats Strip
├─────────────────────────────────────┤
│  A divine enchantress who turned    │
│  Odysseus's crew into swine...      │  ← background prose
│                                     │
│  Locations: [Aeaea ›] [+]           │  ← location rail
│  Notes:     [Meeting Notes ›] [+]   │
│  Tags:  [#Goddess] [#Ally] [+]      │
│  Campaign: [The Long Way Home]      │
└─────────────────────────────────────┘
```

---

## 7. Sync Join

> **Architecture note (reconciled with KMP_CONVERSION_PLAN.md §5):** The KMP rewrite makes sync fully native via Ktor WebSocket + DNS-SD (Decision G). There is no "web only" restriction. The "native only fallback" card described in the Expo current state is NOT reproduced. The AFTER design below is for all platforms.

### Current state (Expo — for reference only)
A single screen with one section ("Join") containing: a description text, a room code text input (auto-uppercased), a Join Session button, and a Leave Session button. On native, all controls are disabled and a red "P2P sync is not supported on native yet" message appears beneath. No status beyond the helper text on the input.

### Problems (all resolved by native-first KMP sync)
- The room code input is the primary interaction on this screen, but it reads like a form field in the middle of a page rather than a focused entry point.
- "P2P sync is not supported on native yet" appeared as an error string — resolved because KMP sync is always enabled on native.
- Join and Leave are equal-weight buttons stacked vertically with no visual distinction.
- There is no indication of the current sync state (connecting, connected, error) beyond the input helper text.

### Proposed AFTER (applies to Android and iOS — no platform split)
Apply the same treatment the Sync Host redesign doc gives to the host's room code: the room code input becomes the hero of the screen. A large mono-spaced text field at center (matching the host's displayed code aesthetic), with a "Join" contained button directly beneath it — no other buttons at the same level. Leave Session moves to the Overflow Menu (top-right), available only when connected.

An auto-discovered sessions list appears below the hero code area when DNS-SD finds nearby hosts on the same network — each row shows the room code and the host's device name. Tapping a row fills the code field and triggers join automatically.

Connection status becomes a Status Strip below the input: a colored indicator dot (gray = idle, yellow = connecting, green = connected, red = error) + a plain-English status line ("Not connected" / "Connecting…" / "Connected to ABC-123"). This replaces the helper text and the inline error.

```
┌─────────────────────────────────────┐
│ ← Join Session              [⋮ Leave│  ← overflow: Leave Session (when connected)
├─────────────────────────────────────┤
│                                     │
│  Enter the room code shared         │
│  by the host.                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ABC - 123                  │   │  ← hero code input, mono, large
│  └─────────────────────────────┘   │
│                                     │
│  [     Join Session     ]           │  ← contained primary button
│                                     │
│  ● Not connected                    │  ← status strip
│                                     │
│  Nearby sessions:                   │
│  ┌────────────────────────────────┐ │
│  │  ABC-123  ·  DM's iPad         │ │  ← auto-discovered via DNS-SD
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 8. Onboarding Tour Visuals

### Current state
`react-native-spotlight-tour` provides a spotlight cutout with a `rectangle` shape, `bounce` motion, and an `0.85` opacity dark backdrop. The tooltip (`TourTooltip`) is a plain white card with a title, description text, step counter ("1 / 11"), and Previous / Stop / Next buttons. No icon, no illustration, no color accent. The tooltip renders the same for every step regardless of which domain it's highlighting.

### Problems
- Every tooltip looks identical — the same white card regardless of whether the step is about sessions, NPCs, or tags. There is no visual cue that anchors the tooltip to the domain being introduced.
- The stop button ("×") is small and visually equivalent to the previous button, so users frequently dismiss the tour by accident when trying to go back.
- Step counter ("1 / 11") uses the same typography as the button labels, making it easy to miss.
- The final step (Tour Complete) modal and the "Keep Demo / Start Fresh" choice use the same plain card style as the 10 teaching steps — the completion moment doesn't feel like a celebration.
- The session detail steps (4 and 5) highlight an area that may be off-screen; there is no indication to the user that they should scroll down to see the highlighted element.

### Proposed AFTER
**Tooltip anatomy**: left-side color accent bar (4 dp) tinted to the domain color for the highlighted entity type — blue for sessions (`#3b82f6`), indigo for NPCs (`#818cf8`), green for locations, amber for items, purple for tags, no accent for dashboard steps. Domain icon (20 dp, same color as accent) appears before the title. Step counter moves to above the title as a muted caption ("Step 3 of 11"). Stop button moves to a small × in the top-right corner of the tooltip card, separated visually from the navigation buttons. Previous and Next become clear asymmetric buttons: Next as contained primary, Previous as text-only.

**Scroll prompt**: for steps 4 and 5 (session detail) where the target may be below the fold, show a brief "scroll down to see" indicator (animated chevron down) inside the spotlight cutout before the tooltip appears. This replaces the blind `scrollToTop` call with a visible cue.

**Tour Complete step**: replace the standard tooltip with a bottom-sheet modal. Larger format: celebration header ("You're Ready to Run!"), a brief two-line summary of what was covered, and two clear options — "Keep Demo Data" (outlined) and "Start Fresh" (contained, primary). The modal is not dismissible by tapping outside — the user must make a choice.

```
Tooltip structure (steps 0–9):
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│▌  Step 3 of 11                  [×]│  ← accent bar, caption, stop
│▌  📅 Sessions                      │  ← icon + title
│▌  Session logs are where you       │
│▌  capture what happens at the      │
│▌  table…                           │
│▌                          [← Prev] │
│▌               [Next →]            │  ← asymmetric buttons
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘

Tour Complete bottom-sheet:
┌─────────────────────────────────────┐
│           You're Ready!             │  ← large headline
│  You've seen sessions, NPCs,        │
│  locations, tags, and mentions.     │
│  Time to run your own campaign.     │
│                                     │
│  [Keep Demo Data]                   │
│  [Start Fresh]                      │  ← contained, primary
└─────────────────────────────────────┘
```

---

*Document version: 2026-07-13. Screens with existing ui-revamp docs: Dashboard, Campaign Detail, Sessions (list), NPCs (list), Locations (list), Location Detail, Note Detail, Player Character Detail, Settings, Sync Host, Continuities. This file covers the remaining eight.*