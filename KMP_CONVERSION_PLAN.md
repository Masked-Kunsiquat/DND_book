# DND Book: Kotlin Multiplatform Conversion Plan

> **Scope**: Rewrite the Expo React Native app (`mobile/`) as a Kotlin Multiplatform + Compose Multiplatform project targeting Android and iOS. All audit findings from the pre-migration reports are fixed by design in the new architecture; no patches are applied to the Expo codebase.

---

## Table of Contents

1. [Assumptions & Open Questions](#1-assumptions--open-questions)
2. [Recommended Stack](#2-recommended-stack)
3. [Module Layout](#3-module-layout)
4. [Relational Schema Design](#4-relational-schema-design)
5. [Sync Architecture](#5-sync-architecture)
6. [Cross-Cutting Feature Designs](#6-cross-cutting-feature-designs)
7. [Fix-by-Design Register](#7-fix-by-design-register)
8. [Parity Deviations (Deliberate Improvements)](#8-parity-deviations-deliberate-improvements)
9. [Phased Delivery Plan](#9-phased-delivery-plan)

---

## 1. Assumptions & Open Questions

### Confirmed assumptions (baked in)

| # | Assumption |
|---|-----------|
| A1 | **Targets: Android + iOS only.** Desktop (JVM) and web (Wasm) are out of scope but the module split keeps them addable later without restructuring shared code. Confirm before Phase 0. |
| A2 | **Compose Multiplatform for all UI.** No SwiftUI or XML layouts; all screens are in `commonMain` with Compose. iOS stability confirmed (CMP 1.8.0, May 2025; CMP 1.10.0, Jan 2026). |
| A3 | **App is pre-release.** No migration of existing user data is required. The one-shot TinyBase importer (see §4) is a development-only convenience, not a shipped feature. |
| A4 | **Dark theme is default.** Light/system modes are supported and persisted (fixing the Expo bug). |
| A5 | **P2P sync is local-network only.** No cloud relay, no internet required at the table. |
| A6 | **Mention token format `{trigger}[Label](id)` is preserved verbatim** in stored content columns so that content rows can be copied 1:1 from the legacy SQLite blob during development. |

### Resolved decisions (2026-07-13)

> All nine open questions resolved. The parity checklist (`KMP_PARITY_CHECKLIST.md §35`) points here; do not duplicate.

| # | Decision | Resolution |
|---|----------|-----------|
| Q1 | Android minimum API level | **API 26** (Android 8.0 Oreo) |
| Q2 | iOS minimum deployment target | **iOS 16** |
| Q3 | Image storage | **Content-addressed blob store from day one** (see below for full spec). Sync of blobs is deferred to a later phase; Phase 1 behavior is otherwise identical to local-file storage. |
| Q4 | Desktop (JVM) target | **No desktop target** — revisit post-1.0 |
| Q5 | Room-code sync network scope | **Same Wi-Fi only** (no internet relay) |
| Q6 | `usePlayerCharactersByPlayer` hook | **Drop** from KMP data layer (exported but unused in Expo) |
| Q7 | Item fields `ownerId`, `ownerType`, `locationId` | **Keep in schema, no UI** — fields present in `items` table; ownership UI is deferred |
| Q8 | `playerCharacter.tagIds` | **Skip** — playerCharacters have no tagIds in current Expo schema |
| Q9 | Stale mention display labels on entity rename | **Accept stale labels** — scanning all content on rename is too expensive; inherent text-storage limitation (M1 carry-over) |

#### Q3 — Content-addressed blob store (full spec)

**Decision**: Images use a content-addressed blob store from day one. Blob sync is deferred.

**Mechanics**:
- On import, hash the image bytes (SHA-256). Store the file as `filesDir/images/<hash>.<ext>`.
- The database stores the hash string (not a file path or URI).
- A new `blobs` table (see schema below) tracks every known blob.
- Image columns on `npcs`, `locations`, and `player_characters` (portrait) and the `location_images` join table store blob hashes, not URIs.
- **Deletion / GC**: blobs are never deleted directly. A garbage-collection pass (run after any entity delete) removes rows from `blobs` where no other table column still references that hash.
- **Phase 1 behavior**: identical to local-file storage — images are read from `filesDir/images/<hash>.<ext>` via `Coil 3` using a custom `BlobFetcher` that resolves a `blob:<hash>` URI scheme to the filesystem path.
- **Sync (deferred)**: blob exchange over sync (sending/receiving raw bytes via the Ktor WebSocket alongside row deltas) is a later-phase item. In Phase 5, a peer that receives a row referencing an unknown hash requests the blob bytes from the host.

**`blobs` table** (add to schema §4):

```sql
CREATE TABLE blobs (
  hash       TEXT PRIMARY KEY,   -- SHA-256 hex string
  extension  TEXT NOT NULL,      -- e.g. 'jpg', 'png', 'webp'
  size       INTEGER NOT NULL,   -- bytes
  created    TEXT NOT NULL       -- ISO-8601
);
```

**Schema changes**:
- `npcs.image_uri` → renamed to `npcs.image_hash TEXT` (references `blobs.hash`; nullable; no FK constraint so GC can clean up independently)
- `locations.map_uri` → renamed to `locations.map_hash TEXT`
- `player_characters.image_uri` → renamed to `player_characters.image_hash TEXT`
- `pc_templates.image_uri` → renamed to `pc_templates.image_hash TEXT`
- `location_images.uri` → renamed to `location_images.blob_hash TEXT` (references `blobs.hash`)

---

## 2. Recommended Stack

### Build & project tooling

| Concern | Choice | One-line rationale | Rejected alternative |
|---------|--------|-------------------|---------------------|
| Build tool | **Gradle (Kotlin DSL) + KMP plugin 2.x** | Standard; KMP Gradle plugin ships with the toolchain | Maven (no KMP support) |
| KMP plugin | **`org.jetbrains.kotlin.multiplatform` 2.4.0** | Kotlin 2.4.0 is the lowest that supports Gradle 9.4 (max Gradle 9.5); pinned version | Older 1.9 plugin (pre-K2) |
| Version catalog | **`libs.versions.toml`** | Single source of truth for deps across all modules | Per-module buildscript blocks |

### UI

| Concern | Choice | One-line rationale | Rejected alternative |
|---------|--------|-------------------|---------------------|
| UI toolkit | **Compose Multiplatform 1.10+** | Stable on iOS since CMP 1.8; shares all screens in `commonMain` | SwiftUI+Compose bridge (doubles maintenance) |
| Design system | **Material 3 with custom `ColorScheme`** | Hex palette from `colors.ts` overrides MD3 roles; no dynamic-color tonal shifts | Dynamic color (clashes with bespoke palette) |
| Component theming | **Custom `AppTheme` wrapping `MaterialTheme`** | Pins typography (Roboto), shape (12 dp radius), and hex-keyed color roles | Reactive MD3 theming (wrong visual target) |
| Image loading | **Coil 3 (3.0+)** | KMP-native; `AsyncImage` works identically in `commonMain` for both local URIs and future remote URLs; backed by Ktor or OkHttp | Glide (Android-only) |

### Navigation

| Concern | Choice | One-line rationale | Rejected alternative |
|---------|--------|-------------------|---------------------|
| Navigation | **`org.jetbrains.androidx.navigation:navigation-compose:2.9.x`** | Officially supported CMP port of AndroidX Navigation; type-safe routes via `@Serializable` destination classes; JetBrains ships it | Voyager (lower bus factor; less AndroidX integration); Decompose (overkill for this UI shape — all screens are Compose) |

### Data layer

| Concern | Choice | One-line rationale | Rejected alternative |
|---------|--------|-------------------|---------------------|
| Local database | **SQLDelight 2.3.2** | SQL-first; generates type-safe Kotlin from `.sq` files; mature KMP support since 2.0; coroutine/Flow extensions built-in | Room 3.0 KMP (newer, Google-backed, but Android-first mental model and less `.sq` expressiveness for the FK-heavy schema here) |
| ORM style | **Raw SQLDelight queries** | Full control over FK cascades, join tables, and migration scripts | Exposed KMP (alpha, less stable) |
| Migrations | **SQLDelight `migrations/` directory, numbered** | Version-tracked; run automatically on schema version bump | Manual migration strings |

### Dependency injection

| Concern | Choice | One-line rationale | Rejected alternative |
|---------|--------|-------------------|---------------------|
| DI | **Koin 4.x** | Runtime DI; minimal boilerplate; first-class KMP + Compose ViewModel integration; `koinViewModel()` in Compose; active community | kotlin-inject (compile-time but smaller contributor base and more configuration ceremony for KMP); Hilt (Android-only) |

### Networking & serialization

| Concern | Choice | One-line rationale | Rejected alternative |
|---------|--------|-------------------|---------------------|
| Networking (sync) | **Ktor 3.x (client + server-socket)** | KMP-native; coroutine-first; WebSocket support for local sync relay; same library for DNS probe HTTP pings | Retrofit (JVM/Android only) |
| Serialization | **`kotlinx.serialization` 1.8+** | Official Kotlin serialization; `@Serializable` on domain models; used by both Navigation routes and sync message codec | Gson (JVM only); Moshi (JVM only) |
| DNS-SD discovery | **`dns-sd-kt` 1.0.5 (Appstractive)** | Only KMP library wrapping Android NSD + Apple Bonjour; ships `.local` service announce/discover; last updated April 2026 | Custom `expect/actual` NSD wrappers (high maintenance cost) |

### Settings & preferences

| Concern | Choice | One-line rationale | Rejected alternative |
|---------|--------|-------------------|---------------------|
| Key-value prefs | **AndroidX DataStore Preferences 1.1.x (KMP)** | Coroutine + Flow native; KMP support since 1.1.0; handles theme, tourCompleted, mentionSettings, deviceId | `multiplatform-settings` (third-party; adds another dep for same functionality now that DataStore is KMP) |

### Logging & testing

| Concern | Choice | One-line rationale | Rejected alternative |
|---------|--------|-------------------|---------------------|
| Logging | **`co.touchlab:kermit` 2.x** | Structured, tagged, KMP-native logging; Crashlytics sink available | Timber (Android only) |
| Unit tests | **`kotlin.test` + Turbine + Kotest assertions** | `kotlin.test` is built-in; Turbine for Flow testing; Kotest for expressive assertions | JUnit 5 (JVM only) |
| UI tests | **Compose UI Testing (platform-specific per target)** | CMP provides `ComposeTestRule` on Android; iOS UI tests via XCTest | Espresso (Android only) |

---

## 3. Module Layout

```
DND_book/
├── kmp/                          ← new KMP root (sibling of mobile/)
│   ├── build.gradle.kts          ← root build file
│   ├── gradle/libs.versions.toml ← version catalog
│   │
│   ├── shared/
│   │   ├── domain/               ← :shared:domain
│   │   │   └── src/commonMain/
│   │   │       ├── model/        ← data classes: Continuity, Campaign, Npc, …
│   │   │       ├── repository/   ← repository interfaces (pure Kotlin)
│   │   │       └── sync/         ← SyncMessage sealed class, HLC, conflict rules
│   │   │
│   │   ├── data/                 ← :shared:data
│   │   │   └── src/
│   │   │       ├── commonMain/
│   │   │       │   ├── db/       ← SQLDelight .sq files + generated DAOs
│   │   │       │   ├── repo/     ← repository implementations (use DAOs + DataStore)
│   │   │       │   ├── sync/     ← SyncRepository, LWW engine, HLC
│   │   │       │   └── seed/     ← Odyssey demo data seeder
│   │   │       ├── androidMain/  ← Android SQLite driver, NSD, Ktor engine
│   │   │       └── iosMain/      ← iOS SQLite driver, Bonjour, Darwin HTTP engine
│   │   │
│   │   └── ui/                   ← :shared:ui
│   │       └── src/commonMain/
│   │           ├── theme/        ← AppTheme, AppColors, AppTypography
│   │           ├── components/   ← shared Composables (cards, chips, forms, mentions)
│   │           ├── navigation/   ← NavGraph, Route sealed classes
│   │           ├── screens/      ← all screen Composables (in sub-packages per domain)
│   │           ├── onboarding/   ← TourController, SpotlightOverlay, TourStep
│   │           └── viewmodels/   ← ViewModels (via Koin; one per screen)
│   │
│   ├── androidApp/               ← :androidApp
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── kotlin/
│   │           └── MainActivity.kt  ← setContent { AppTheme { AppNavHost() } }
│   │
│   └── iosApp/                   ← :iosApp (Xcode project)
│       └── iosApp/
│           └── ContentView.swift  ← MainViewController from shared:ui
```

### What lives where

| Layer | Responsibility |
|-------|---------------|
| `:shared:domain` | Pure Kotlin domain models, repository interfaces, sync message types, HLC data class. Zero Android/iOS imports. Fully unit-testable without a device. |
| `:shared:data` | SQLDelight schema + queries, repository implementations, DataStore wiring, sync engine (LWW merge), seed data loader. `expect/actual` for SQLite driver and DNS-SD. |
| `:shared:ui` | All Compose screens, ViewModels, theme, navigation graph, mention parser/renderer, spotlight tour. No platform-specific imports; `expect/actual` only for `LocalContext` equivalents if needed. |
| `:androidApp` | `MainActivity`, Koin Android initializer, `Application` class, AndroidManifest permissions (INTERNET, CHANGE_NETWORK_STATE for NSD). |
| `:iosApp` | Xcode project, `@main` Swift entry point, `MainViewController` call, Info.plist (Bonjour `NSBonjourServices`, local network `NSLocalNetworkUsageDescription`). |

---

## 4. Relational Schema Design

### Design principles

- Every TinyBase JSON-array field becomes a **join table** with a proper FK and `ON DELETE CASCADE` (or `SET NULL` where semantically appropriate).
- `ON DELETE CASCADE` eliminates the entire class of C1–C6 blocker bugs by construction.
- `scope` is a Kotlin `enum class Scope { CAMPAIGN, CONTINUITY }` stored as TEXT.
- `status` is a Kotlin `enum class EntityStatus { COMPLETE, SHADOW }` stored as TEXT.
- All timestamps are ISO-8601 strings stored as `TEXT` (preserve parity with Expo data for the dev-time importer).
- `id` columns are app-generated ULIDs (replace Expo's custom `generateId()` — ULIDs are sortable and collision-resistant).
- `hlc` column added to every mutable row for the LWW sync engine (see §5).

---

### Core tables

#### `continuities`
```sql
CREATE TABLE continuities (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  hlc          TEXT NOT NULL,            -- hybrid logical clock timestamp
  created      TEXT NOT NULL,
  updated      TEXT NOT NULL
);
```

#### `campaigns`
```sql
CREATE TABLE campaigns (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  continuity_id  TEXT NOT NULL REFERENCES continuities(id) ON DELETE CASCADE,
  hlc            TEXT NOT NULL,
  created        TEXT NOT NULL,
  updated        TEXT NOT NULL
);
```

#### `notes`
```sql
CREATE TABLE notes (
  id                    TEXT PRIMARY KEY,
  title                 TEXT NOT NULL DEFAULT '',
  content               TEXT NOT NULL DEFAULT '',  -- contains {trigger}[Label](id) tokens
  scope                 TEXT NOT NULL DEFAULT 'campaign',
  continuity_id         TEXT NOT NULL REFERENCES continuities(id) ON DELETE CASCADE,
  campaign_id           TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  -- Fork/share provenance
  origin_id             TEXT,
  origin_continuity_id  TEXT,
  forked_at             TEXT,
  hlc                   TEXT NOT NULL,
  created               TEXT NOT NULL,
  updated               TEXT NOT NULL
);
```

#### `blobs`
```sql
CREATE TABLE blobs (
  hash       TEXT PRIMARY KEY,   -- SHA-256 hex string
  extension  TEXT NOT NULL,      -- e.g. 'jpg', 'png', 'webp'
  size       INTEGER NOT NULL,   -- bytes
  created    TEXT NOT NULL       -- ISO-8601
);
```
> Content-addressed store. Blobs are stored as `filesDir/images/<hash>.<ext>`. No FK constraints on referencing columns — deletion is handled by GC (remove blobs no row references). Blob sync over the WebSocket is a Phase 5+ item.

#### `npcs`
```sql
CREATE TABLE npcs (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  race                  TEXT NOT NULL DEFAULT '',
  role                  TEXT NOT NULL DEFAULT '',
  background            TEXT NOT NULL DEFAULT '',
  status                TEXT NOT NULL DEFAULT 'complete',  -- 'complete' | 'shadow'
  image_hash            TEXT,    -- SHA-256 hash; resolves to filesDir/images/<hash>.<ext> via blobs table
  scope                 TEXT NOT NULL DEFAULT 'campaign',
  continuity_id         TEXT NOT NULL REFERENCES continuities(id) ON DELETE CASCADE,
  origin_id             TEXT,
  origin_continuity_id  TEXT,
  forked_at             TEXT,
  hlc                   TEXT NOT NULL,
  created               TEXT NOT NULL,
  updated               TEXT NOT NULL
);
```

#### `locations`
```sql
CREATE TABLE locations (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  type                  TEXT NOT NULL,  -- 'Plane'|'Realm'|'Continent'|'Territory'|'Province'|'Locale'|'Landmark'
  description           TEXT NOT NULL DEFAULT '',
  status                TEXT NOT NULL DEFAULT 'complete',
  parent_id             TEXT REFERENCES locations(id) ON DELETE SET NULL,
  map_hash              TEXT,    -- SHA-256 hash; resolves via blobs table
  scope                 TEXT NOT NULL DEFAULT 'campaign',
  continuity_id         TEXT NOT NULL REFERENCES continuities(id) ON DELETE CASCADE,
  origin_id             TEXT,
  origin_continuity_id  TEXT,
  forked_at             TEXT,
  hlc                   TEXT NOT NULL,
  created               TEXT NOT NULL,
  updated               TEXT NOT NULL
);
```

#### `items`
```sql
CREATE TABLE items (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  value          TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'complete',
  scope          TEXT NOT NULL DEFAULT 'campaign',
  continuity_id  TEXT NOT NULL REFERENCES continuities(id) ON DELETE CASCADE,
  -- Owner link (optional; ownerType distinguishes npc vs playerCharacter)
  owner_id       TEXT,
  owner_type     TEXT,                         -- 'npc' | 'playerCharacter' | null
  location_id    TEXT REFERENCES locations(id) ON DELETE SET NULL,
  hlc            TEXT NOT NULL,
  created        TEXT NOT NULL,
  updated        TEXT NOT NULL
);
```
> Note: `owner_id` + `owner_type` are schema-present (parity) but UI for item ownership is flagged as a deviation improvement (§8).

#### `tags`
```sql
CREATE TABLE tags (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  color                 TEXT NOT NULL DEFAULT '#6B7280',
  scope                 TEXT NOT NULL DEFAULT 'campaign',
  continuity_id         TEXT NOT NULL REFERENCES continuities(id) ON DELETE CASCADE,
  campaign_id           TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  origin_id             TEXT,
  origin_continuity_id  TEXT,
  forked_at             TEXT,
  hlc                   TEXT NOT NULL,
  created               TEXT NOT NULL,
  updated               TEXT NOT NULL
);
```

#### `session_logs`
```sql
CREATE TABLE session_logs (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  date          TEXT NOT NULL,
  content       TEXT NOT NULL DEFAULT '',   -- {trigger}[Label](id) tokens
  mentions_json TEXT NOT NULL DEFAULT '[]', -- extracted mention objects (JSON cache)
  summary       TEXT NOT NULL DEFAULT '',
  key_decisions TEXT NOT NULL DEFAULT '',
  outcomes      TEXT NOT NULL DEFAULT '',
  campaign_id   TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  hlc           TEXT NOT NULL,
  created       TEXT NOT NULL,
  updated       TEXT NOT NULL
);
```
> `campaign_id` is singular: session logs are always campaign-scoped (parity). The TinyBase `campaignIds` JSON array becomes a single FK — session logs don't share across campaigns.

#### `player_characters`
```sql
CREATE TABLE player_characters (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  player     TEXT NOT NULL DEFAULT '',
  race       TEXT NOT NULL DEFAULT '',
  class_name TEXT NOT NULL DEFAULT '',
  background TEXT NOT NULL DEFAULT '',
  image_hash TEXT,    -- SHA-256 hash; resolves via blobs table
  hlc        TEXT NOT NULL,
  created    TEXT NOT NULL,
  updated    TEXT NOT NULL
);
```

#### `pc_templates`
```sql
CREATE TABLE pc_templates (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  player                TEXT NOT NULL DEFAULT '',
  race                  TEXT NOT NULL DEFAULT '',
  class_name            TEXT NOT NULL DEFAULT '',
  background            TEXT NOT NULL DEFAULT '',
  image_hash            TEXT,    -- SHA-256 hash; resolves via blobs table
  continuity_id         TEXT NOT NULL REFERENCES continuities(id) ON DELETE CASCADE,
  origin_id             TEXT,
  origin_continuity_id  TEXT,
  forked_at             TEXT,
  hlc                   TEXT NOT NULL,
  created               TEXT NOT NULL,
  updated               TEXT NOT NULL
);
```

---

### Join tables (replacing JSON arrays)

Every join table has a compound PK and cascades on both FKs.

```sql
-- note ↔ campaign (notes are multi-campaign)
CREATE TABLE note_campaigns (
  note_id     TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, campaign_id)
);

-- note ↔ location
CREATE TABLE note_locations (
  note_id     TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, location_id)
);

-- note ↔ tag
CREATE TABLE note_tags (
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- npc ↔ campaign
CREATE TABLE npc_campaigns (
  npc_id      TEXT NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  PRIMARY KEY (npc_id, campaign_id)
);

-- npc ↔ location
CREATE TABLE npc_locations (
  npc_id      TEXT NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (npc_id, location_id)
);

-- npc ↔ note
CREATE TABLE npc_notes (
  npc_id  TEXT NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  PRIMARY KEY (npc_id, note_id)
);

-- npc ↔ tag
CREATE TABLE npc_tags (
  npc_id TEXT NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (npc_id, tag_id)
);

-- location ↔ campaign
CREATE TABLE location_campaigns (
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  PRIMARY KEY (location_id, campaign_id)
);

-- location ↔ tag
CREATE TABLE location_tags (
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  tag_id      TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (location_id, tag_id)
);

-- location gallery images (replacing JSON `images` array)
CREATE TABLE location_images (
  id          TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  blob_hash   TEXT NOT NULL,   -- SHA-256 hash; resolves via blobs table
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- item ↔ campaign
CREATE TABLE item_campaigns (
  item_id     TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, campaign_id)
);

-- item ↔ tag
CREATE TABLE item_tags (
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id  TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- session_log ↔ location (extracted from mentions + explicit links)
CREATE TABLE session_locations (
  session_id  TEXT NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, location_id)
);

-- session_log ↔ npc
CREATE TABLE session_npcs (
  session_id TEXT NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  npc_id     TEXT NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, npc_id)
);

-- session_log ↔ note
CREATE TABLE session_notes (
  session_id TEXT NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  note_id    TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, note_id)
);

-- session_log ↔ player_character
CREATE TABLE session_player_characters (
  session_id         TEXT NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  player_character_id TEXT NOT NULL REFERENCES player_characters(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, player_character_id)
);

-- session_log ↔ item
CREATE TABLE session_items (
  session_id TEXT NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  item_id    TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, item_id)
);

-- session_log ↔ tag
CREATE TABLE session_tags (
  session_id TEXT NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  tag_id     TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, tag_id)
);

-- player_character ↔ campaign
CREATE TABLE pc_campaigns (
  player_character_id TEXT NOT NULL REFERENCES player_characters(id) ON DELETE CASCADE,
  campaign_id         TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  PRIMARY KEY (player_character_id, campaign_id)
);

-- player_character ↔ note
CREATE TABLE pc_notes (
  player_character_id TEXT NOT NULL REFERENCES player_characters(id) ON DELETE CASCADE,
  note_id             TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  PRIMARY KEY (player_character_id, note_id)
);
```

### App settings (DataStore, not SQLite)

```kotlin
// DataStore Preferences keys
val CURRENT_CAMPAIGN_ID   = stringPreferencesKey("currentCampaignId")
val DEVICE_ID             = stringPreferencesKey("deviceId")
val LAST_SYNCED_AT        = stringPreferencesKey("lastSyncedAt")
val MENTION_SETTINGS      = stringPreferencesKey("mentionSettings")  // JSON
val TOUR_COMPLETED        = booleanPreferencesKey("tourCompleted")
val HAS_SEED_DATA         = booleanPreferencesKey("hasSeedData")
val SEED_CONTINUITY_ID    = stringPreferencesKey("seedContinuityId")
val THEME_MODE            = stringPreferencesKey("themeMode")         // "dark"|"light"|"system"
```
> The three runtime-only TinyBase values (`hasSeedData`, `seedDataContinuityId`, `tourCompleted`) are promoted to DataStore. `LAST_SYNCED_AT` is now written by the sync engine (fixing the Expo gap). `THEME_MODE` is new (fixing the Expo persistence bug).

### TinyBase importer (dev convenience)

A standalone Kotlin script in `tools/TinybaseImporter.kt` reads `dndbook.db`, parses the single JSON blob from `tinybase_store`, and inserts rows into the new SQLDelight schema via FK-aware ordering. Not a shipped feature; used only during development to seed a copy of production data for manual testing. The schema above is designed to accept every field from the parity inventory with no data loss.

---

## 5. Sync Architecture

### Problem with the Expo approach

`store.setJson(remoteData)` (audit finding D4) performs a full-store last-write-wins overwrite: the joiner's local data is destroyed. The TinyBase `MergeableStore` CRDT capability is never exercised.

### Chosen approach: Field-level LWW with Hybrid Logical Clock + local Ktor relay

**Why not Yjs/y-webrtc**: WebRTC requires a signaling server and STUN; neither is viable in a local-network-only P2P scenario on native Kotlin without a JS bridge. Yjs itself is JS-only.

**Why not a full CRDT library (Synk/crdt-kit)**: Both are young KMP libraries (low bus factor). The data model here — 10 tables, fields that are strings or scalars — does not need operation logs or vector clocks. Field-level LWW with HLC timestamps is sufficient and is the pattern used by PowerSync, Electric SQL, and most production local-first apps.

**Architecture**:

```
┌─────────────┐     DNS-SD (mDNS)       ┌─────────────┐
│   Device A  │ ←─── discover ────────► │   Device B  │
│  (DM host)  │                         │  (player)   │
│             │  Ktor WebSocket server   │             │
│  :8765      │ ◄──────────────────────►│  WS client  │
└─────────────┘   sync messages (JSON)  └─────────────┘
       │                                       │
  SQLDelight                             SQLDelight
  (local DB)                             (local DB)
```

**Components**:

1. **`HybridLogicalClock`** (`:shared:domain`) — `data class Hlc(val physicalMs: Long, val counter: Int, val nodeId: String)` serialized as `"$physicalMs.$counter.$nodeId"`. Provides total ordering with clock-skew resistance (max 60 s drift tolerated).

2. **`SyncMessage`** (`:shared:domain`) — sealed class:
   - `FullState(rows: List<SyncRow>)` — sent by host when a peer first connects
   - `Delta(rows: List<SyncRow>)` — incremental updates after initial sync
   - `Ack(hlc: String)` — peer acknowledges receipt
   - `SyncRow(table: String, rowId: String, columnDeltas: Map<String, Pair<String?, String>>)` where the pair is `(value, hlc)`.

3. **`LwwMergeEngine`** (`:shared:data`) — on receiving a `SyncRow`, for each column: if `incoming_hlc > local_hlc` → apply write + update local HLC. Join tables are treated as LWW-set-entries (insert if incoming HLC is newer than local delete HLC, or if no local record exists).

4. **`SyncRepository`** (`:shared:data`) — owns Ktor server (host) or Ktor client (joiner):
   - **Host**: starts `embeddedServer(CIO, port = 8765)` with a WebSocket route. On peer connect, sends `FullState`. Subscribes to SQLDelight's `Flow`-based query listeners; emits `Delta` on any change.
   - **Joiner**: discovers host via `dns-sd-kt`, connects via `HttpClient.webSocket`. On `FullState` received, runs `LwwMergeEngine` for all rows. On peer `Delta`, same. Local changes emit `Delta` to host.

5. **Room code UX parity**: The DNS-SD service name IS the room code (`dndbook-ABC-123._tcp.local`). Host generates `ABC-123` code (same algorithm as Expo), registers it as a Bonjour/NSD service. Joiner either enters the code manually (same UI) or auto-discovers and shows a list of nearby sessions. This replaces WebRTC signaling — no internet required.

### Conflict resolution rule

> **Last writer wins per field**, ordered by HLC. Two devices editing the same NPC's `name` simultaneously: the one with the higher HLC timestamp wins. HLC includes `nodeId` as a tiebreaker so the ordering is total and deterministic.

### Guarantees

- A joiner **never loses local data**: only fields with a newer HLC are overwritten.
- Disconnect and reconnect is safe: the host sends a fresh `FullState` only if the peer's last-seen HLC is unknown; otherwise it sends only deltas since that HLC.
- Join-table entries use a `deleted` flag + HLC ("tombstone") so removals also merge correctly without re-appearing after sync.

---

## 6. Cross-Cutting Feature Designs

### 6.1 Scope / Fork / Share

Implemented identically to Expo. Domain model:

```kotlin
enum class Scope { CAMPAIGN, CONTINUITY }

interface Forkable {
  val originId: String?
  val originContinuityId: String?
  val forkedAt: String?
}
```

- **Share** (`campaign → continuity`): sets `scope = CONTINUITY`, clears `campaign_id` (or removes from `_campaigns` join table), sets `continuity_id`. Nulls provenance fields.
- **Fork** (`continuity → campaign`): inserts a new row with a new `id`, sets `scope = CAMPAIGN`, populates provenance fields, links to current `campaign_id`.
- Applies to: `notes`, `npcs`, `locations`, `tags`, `pc_templates`. `items` and `session_logs` do not fork (parity). **Improvement**: `items` get a Fork action in the port (see §8).
- **Remove from campaign** (continuity-scoped entity): removes the join-table row; entity persists in library.

### 6.2 Shadow Entities

```kotlin
enum class EntityStatus { COMPLETE, SHADOW }
```

Applies to `npcs`, `locations`, `items`. Shadow entities are auto-created by the mention parser when an `@`/`$`/`!` token references an unknown entity ID (or when a user types a new mention label that doesn't resolve to an existing entity).

Shadow prompt modal appears on `SessionLogDetailScreen` when `session.linkedEntities.any { it.status == SHADOW }`. "Complete All Now" opens a bottom sheet listing all shadow entities; tapping each one navigates to its detail screen so the DM can complete them individually (improvement I5, fixes F4 — Expo only navigated to the first). "Remind Me Later" dismisses without action.

### 6.3 Mention Parsing Pipeline

**Token format** (preserved): `{trigger}[Label](entityId)` where trigger ∈ `{'@', '$', '!', '#', '~', '^', '&'}`.

**Parser** (`:shared:ui/components/mentions/`):

```kotlin
object MentionParser {
  private val TOKEN_REGEX = Regex("""\{([^}]+)}\[([^\]]*?)]\(([^)]*?)\)""")

  fun extract(content: String, triggerMap: Map<String, EntityType>): List<MentionToken>
  fun render(content: String, triggerMap: Map<String, EntityType>, resolver: (EntityType, String) -> EntityStatus?): AnnotatedString
}
```

**Pipeline**:
1. User types in `MentionTextField` (custom BasicTextField + suggestion dropdown).
2. On keystroke, scan backward from cursor for an active trigger character.
3. Fetch candidates from the relevant repository (NPCs for `@`, locations for `$`, items for `!`, tags for `#`).
4. On selection, insert `{trigger}[Label](id)` token at cursor.
5. On **save** (`session_logs` AND `notes` — improvement over Expo which skips notes):
   - Run `MentionParser.extract()` → `List<MentionToken>`.
   - Upsert join-table rows for each resolved entity.
   - Shadow-create any unresolved entity references.
   - Update `mentions_json` cache in `session_logs`.
6. **Display**: `MentionRenderer` maps each `MentionToken` to a `SpanStyle` (colored, bold) using `AnnotatedString`. Deleted entities render in strikethrough shadow style (parity M2). Renamed entities show the stored `Label` (parity M1 — inherent limitation of text-stored mentions, documented).

**Configurable triggers** (DataStore `mentionSettings`):

```kotlin
@Serializable
data class MentionSettings(
  val npcTrigger: String = "@",
  val locationTrigger: String = "$",
  val itemTrigger: String = "!",
  val tagTrigger: String = "#"
)
```

Conflict detection: duplicate trigger characters are rejected at the settings UI level before save (resolving M4 — validation is enforced in the ViewModel, not just the UI).

### 6.4 Location Hierarchy Validation

Hierarchy: `Plane > Realm > Continent > Territory > Province > Locale > Landmark`.

```kotlin
val LOCATION_TYPE_ORDER = listOf("Plane","Realm","Continent","Territory","Province","Locale","Landmark")

fun validateParent(childType: String, parentType: String): Boolean =
  LOCATION_TYPE_ORDER.indexOf(parentType) == LOCATION_TYPE_ORDER.indexOf(childType) - 1
```

Enforced in `LocationRepository.upsert()` — returns `Result.Failure(HierarchyValidationError)` if violated, not just a UI warning. The list screen shows `hierarchyIssues` count (parity) via a query that joins `locations l LEFT JOIN locations p ON l.parent_id = p.id` and checks type ordering. Type-change validation on the detail screen re-runs validation against existing children before committing.

### 6.5 Onboarding Tour

**Chosen approach: custom `SpotlightOverlay` Composable** in `:shared:ui/onboarding/`.

The `kmp-showcase-compose` library (Suwasto, Dec 2025) provides a KMP-compatible spotlight that works on both Android and iOS, using `BlendMode.Clear` to punch a hole through a dimmed overlay. However, to avoid a single-maintainer dependency for a critical UX flow, the port implements the same pattern directly — it is ~150 lines of Compose code and does not require a library.

**Implementation**:

```kotlin
// TourController manages step state, persisted in DataStore
class TourController(private val prefs: AppPreferences) {
  val currentStep: StateFlow<TourStep?> = ...
  fun advance(); fun dismiss(); fun restart()
}

// Each screen wraps target composables:
@Composable fun SpotlightTarget(step: TourStep, controller: TourController, content: @Composable () -> Unit)
// Draws a dimmed full-screen Canvas with a BlendMode.Clear hole over the measured bounds of `content`
// Tooltip auto-positions above/below based on target rect vs screen midpoint
```

**Tour steps** (parity with Expo 11 steps):

| Step | ID | Screen | Navigation |
|------|----|--------|-----------|
| 0 | DASHBOARD_WELCOME | Dashboard | (start) |
| 1 | DASHBOARD_CAMPAIGN_CARD | Dashboard | — |
| 2 | DASHBOARD_STATS | Dashboard | — |
| 3 | SESSIONS_TAB | Dashboard→Sessions | tab navigate |
| 4 | SESSION_DETAIL | Sessions | navigate to seed session (guard: check seed exists first) |
| 5 | SESSION_MENTIONS | Session detail | — |
| 6 | NPCS_TAB | Sessions→NPCs | tab navigate |
| 7 | NPC_CARD | NPCs | — |
| 8 | LOCATIONS_TAB | NPCs→Locations | tab navigate |
| 9 | TAGS_USAGE | Locations→Tags | navigate (fix T4: use `navigate`, not `replace`, so tab bar stays) |
| 10 | TOUR_COMPLETE | Tags | modal |

**Tour robustness fixes**:
- `currentStep` persisted in DataStore → survives app kill (fixes T2).
- Auto-start gated on `hasSeedData && !tourCompleted` evaluated once in `AppViewModel` on startup (fixes T3 remount re-trigger).
- Step 4 (SESSION_DETAIL) guards: `if (seedSessionExists) navigate else skipToStep(5)` (fixes T1).
- Step 9 uses `navController.navigate(Tags)` not `popBackStack`/`replace` (fixes T4).

**Seed state integration**:
- `clearSeedData()` also calls `prefs.set(TOUR_COMPLETED, false)` and `prefs.set(HAS_SEED_DATA, false)` (fixes D1).
- "Start Fresh" in tour complete modal calls `clearSeedData()` then `tourController.restart()` (fixes the desynced restart path).

### 6.6 Seed Data (Odyssey)

Implemented as a `SeedDataLoader` in `:shared:data/seed/`. Uses `kotlinx.serialization` to deserialize a bundled `odyssey_seed.json` (checked into the repo) into domain model objects, then calls repository methods. Fixed entity IDs (matching Expo) for the seed session used by the tour. Called once on first launch when `!hasSeedData`.

### 6.7 Theme Persistence

`ThemeMode` (dark / light / system) stored in DataStore `THEME_MODE` key. `AppTheme` composable reads it via `collectAsState()`. Default is `dark`. Resolves the Expo persistence bug at `settings/appearance`.

### 6.8 Settings Screens

| Screen | Status in Expo | KMP disposition |
|--------|---------------|----------------|
| Appearance (theme) | UI-only, not persisted | Fully implemented, DataStore-backed |
| Mentions | Implemented | Parity + ViewModel-level trigger conflict validation |
| Sync | ComingSoon stub | Fully implemented (host/join/leave, room code, peer count) |
| Data | ComingSoon stub | Fully implemented (load/clear demo data with proper state reset) |
| Restart Tour | Implemented | Parity |

### 6.9 Continuity Detail Screen

The Expo app has no `/continuity/[id]` route (noted in parity inventory item 1). The KMP port adds a `ContinuityDetailScreen` showing: name/description, library shortcuts (locations, NPCs, tags, notes, PC templates), campaign list with tap-to-set-current. This closes the missing-screen gap.

---

## 7. Fix-by-Design Register

| Audit ID | Description | Resolution in KMP architecture |
|----------|-------------|-------------------------------|
| **D4** | `store.setJson()` full-overwrite on join | LWW sync engine merges per field via HLC; joiner never overwrites newer local data (§5) |
| **C1** | NPC delete misses cascade | `ON DELETE CASCADE` on `npc_campaigns`, `npc_locations`, `npc_notes`, `npc_tags`, `session_npcs`; SQLite enforces at DB level |
| **C2** | Location delete orphans children | `ON DELETE SET NULL` on `locations.parent_id`; children become root-level (no dangling FK); referencing join tables cascade |
| **C3** | Campaign delete leaves dangling `campaignId` | `ON DELETE CASCADE` on all `*_campaigns` join tables; `ON DELETE SET NULL` on `session_logs.campaign_id` would orphan sessions — instead cascade deletes session logs with the campaign |
| **C4** | Item delete leaves stale `itemIds` in sessionLogs | `ON DELETE CASCADE` on `session_items` join table |
| **C5** | Tag delete misses `items` + `playerCharacters` | `ON DELETE CASCADE` on `item_tags`; `pc_tags` join table added (new; Expo had no `playerCharacter ↔ tag` link in schema, but tag usage in items is now properly cascaded) |
| **C6** | Continuity delete UI-only guard | `ON DELETE CASCADE` from `continuities` to `campaigns`, `npcs`, `locations`, `notes`, `items`, `tags` — DB-level enforcement regardless of UI |
| **T1** | Tour step 4 navigates to potentially-missing seed session | Guard in `TourController.advance()`: check `seedSessionId` exists before navigating; skip to step 5 if not (§6.5) |
| **T2** | Tour step not persisted; kill → restart at step 0 | `currentStep` written to DataStore on every `advance()` call (§6.5) |
| **T3** | Tour auto-start re-triggers on component remount | Auto-start evaluated once in `AppViewModel.init {}`, not in a Composable effect (§6.5) |
| **T4** | TAGS_USAGE uses `router.replace` → tab bar disappears | Uses `navController.navigate(Tags)` from the bottom nav graph (§6.5) |
| **F1** | Dashboard "New Session" pushes invalid `/sessions` route | Route system is type-safe via `@Serializable` destination classes; invalid routes are compile errors |
| **F2** | Bare route strings (ambiguous) | All navigation uses sealed `Route` classes; no string literals |
| **F3** | Settings Sync/Data items have `onPress: undefined` | Both screens fully implemented (§6.8) |
| **F4** | "Complete All Now" only navigates to first shadow | Fixed as deliberate improvement I5 (§8): opens a bottom sheet listing all shadow entities so the user can tap each to navigate and complete them in turn |
| **E3** | `tags.tsx` ignores `continuityId` param | `TagsScreen` in KMP receives `continuityId` as a typed nav argument and filters accordingly |
| **P1** | Sync screens reachable on native but all disabled | Sync is native-first; screens are always enabled on Android + iOS |
| **P2** | 1s sync polling runs on native where unsupported | Polling replaced by Flow-based reactive listeners; no polling |
| **M1** | Renamed entities keep stale displayLabel | Inherent text-storage limitation; documented. Not fixable without scanning all content strings on rename (expensive). Carry over — improvement tracked separately. |
| **M4** | Duplicate trigger chars clobber in triggerToKey Map | ViewModel validates uniqueness before persisting `MentionSettings`; rejects duplicates with an inline error (§6.3) |
| **M2** | Deleted mentioned entity correctly shows shadow/strikethrough style | Preserved by design: `MentionRenderer` checks entity status from the repository; deleted/shadow entities render in strikethrough shadow style (§6.3). No action needed. |
| **D1** | `clearSeedData` does not clear `tourCompleted` | `clearSeedData()` now clears `HAS_SEED_DATA`, `SEED_CONTINUITY_ID`, and `TOUR_COMPLETED` from DataStore atomically (§6.5) |
| **D2** | Stale `currentCampaignId` after campaign delete causes minor flicker | `ON DELETE CASCADE` on `campaigns` table combined with a reactive DataStore `currentCampaignId` listener in `AppViewModel` clears the stale ID immediately on delete; no flicker possible |
| **D3** | Module-level sync singleton + per-instance 1 s polling causes instance divergence | Polling entirely replaced by SQLDelight `Flow`-based reactive listeners; `SyncRepository` is a singleton scoped to the Koin app module (§5) |
| **D6** | `useDeleteLocation` comment acknowledges orphaned children; dialog omits warning when `scope !== 'continuity'` | `ON DELETE SET NULL` on `locations.parent_id` ensures children are orphaned at DB level regardless of scope; `LocationRepository.delete()` returns the affected child count so the UI `ConfirmDialog` always shows it (§6.4) |
| **L3** | Malformed `sessionLog` rows skipped on seed clear, clutter store | KMP seed data is inserted and cleared via proper SQLDelight queries with FK constraints; no malformed rows possible; `clearSeedData()` cascades via `ON DELETE CASCADE` from the seed continuity |
| **L4** | `playerCharacterTemplates` hooks exported but PC template flow underused | `pc_templates` table is a first-class entity in §4; `PcTemplateRepository` is fully implemented in Phase 2; Library screen for templates ships in Phase 2 |
| **L5** | `localeCompare` on ISO timestamps in Dashboard (semantically odd) | SQLDelight queries use `ORDER BY updated DESC` at the SQL level; no client-side string sort needed |

---

## 8. Parity Deviations (Deliberate Improvements)

The following are intentional divergences from the Expo app. Review and veto any before Phase 2.

| # | Feature area | Expo behavior | KMP behavior | Rationale |
|---|-------------|--------------|-------------|-----------|
| I1 | Mention extraction | Only `session_logs` extract/autosave mentions | `notes` also extract mentions on save | Notes contain `{trigger}[Label](id)` tokens but never populate link arrays; the port fixes this |
| I2 | Items | No Fork action | Items get a Share and Fork action (scope promotion/fork, parity with notes/npcs/locations) | Items already have `scope`/`continuityId` in schema; asymmetry was unintentional |
| I3 | Items | No tag filter on list screen | Tag filter chip row added to `ItemsScreen` | Items have `tagIds` in schema; omission was an oversight |
| I4 | Tag detail | Usage count excludes items | Items shown in tag usage StatCard and filtered list | Items have `tagIds`; exclusion was a bug |
| I5 | "Complete All Now" | Navigates to first shadow only | Opens a bottom sheet listing all shadow entities; tap each to complete | F4 was a known bad-UX; iterating all is the stated intent of the label |
| I6 | Continuity | No detail screen | `ContinuityDetailScreen` added (campaigns, library shortcuts) | Identified gap in parity inventory |
| I7 | Theme | Not persisted; always restarts dark | Persisted in DataStore; respects system mode | Bug fix promoted to improvement |
| I8 | Settings/Sync | Web-only, native stub | Native P2P with room code + DNS-SD | Core feature, now platform-supported |
| I9 | ID generation | Custom `generateId()` | ULID (sortable, collision-resistant) | Better for sync ordering; stored format is still a string, so content migration is trivially compatible |
| I10 | `lastSyncedAt` | Declared in schema, never written | Written by `SyncRepository` on successful sync | Completes the declared intent |
| I11 | `usePlayerCharactersByPlayer` hook | Exported and unused in Expo | Dropped from KMP data layer (see Q6) | Dead code; no UI ever consumed it |

---

## 9. Phased Delivery Plan

Phases are ordered so **a working Android build exists after Phase 2** and iOS follows in Phase 3. Each phase has explicit exit criteria; do not start the next phase until all criteria are met.

---

### Phase 0 — Scaffold

**Goal**: Empty KMP project compiles and runs "Hello World" on Android and iOS.

- [ ] Create `kmp/` directory at repo root; initialize Gradle multi-project build
- [x] Add KMP plugin 2.4.0, configure `androidApp` + `iosApp` + `shared:domain` + `shared:data` + `shared:ui` modules
- [x] Set up `libs.versions.toml` with all library versions (Kotlin 2.4.0, CMP 1.10.3, SQLDelight 2.3.2, Koin 4.0.0, Ktor 3.0.3, Coil 3.0.4, DataStore 1.1.1, Kermit 2.0.4, kotlinx.serialization 1.7.3, navigation-compose 2.9.2, dns-sd-kt 1.0.5)
- [ ] Wire Koin initialization in `androidApp` and `iosApp`
- [ ] Verify `androidApp` runs on emulator, `iosApp` runs on iOS simulator

**Exit criteria**: `./gradlew :androidApp:assembleDebug` succeeds; both targets launch to "Hello World" screen.

---

### Phase 1 — Data Layer

**Goal**: All tables created, all repositories implemented, seed data loads correctly on Android.

- [x] Write all `.sq` files in `:shared:data/db/` (core tables + join tables from §4)
- [x] Configure SQLDelight driver (`expect/actual` for Android SQLite + iOS SQLite)
- [x] SQLDelight migrations: not applicable at v1 — the `.sq` schema IS the version-1 baseline; the `migrations/` directory will be introduced with the first schema bump (see implementation notes)
- [x] Implement DataStore with all preference keys from §4
- [x] Implement all repository interfaces (`ContinuityRepository`, `CampaignRepository`, `NpcRepository`, `LocationRepository`, `ItemRepository`, `TagRepository`, `SessionLogRepository`, `PlayerCharacterRepository`, `PcTemplateRepository`)
- [x] Implement `SeedDataLoader` with Odyssey data (fresh-install verification lands with the Phase 2 debug/dashboard screen; seed + clear covered by JVM tests)
- [x] Implement `MentionParser.extract()` and unit test against token format
- [x] Implement `HybridLogicalClock` and unit test (ordering, tiebreak, skew)
- [x] Unit tests for all repository CRUD operations (in-memory SQLite driver)
- [x] Verify `ON DELETE CASCADE` behavior with repository integration tests

**Exit criteria**: All unit tests pass; fresh Android install shows seed data queryable from a debug screen.

#### Phase 1 implementation notes (2026-07-14)

- **Tables**: 11 core (10 entity tables + `blobs`) and 20 relationship tables (the 19 pure join tables from §4 plus `location_images`, which has its own PK). All join-table FKs cascade; `locations.parent_id` and the nullable `campaign_id`/`location_id` columns use `SET NULL` per §4. FK-column indices were added (join-table second columns + core-table FK columns) for cascade performance — §4 did not enumerate indices.
- **Migrations**: SQLDelight 2.x uses the `.sq` schema as the version-1 baseline; there is no prior version to migrate from, so no `migrations/` directory exists yet. It will be created with the first schema bump.
- **MentionParser** lives in `:shared:domain` (`com.dndbook.domain.mention.MentionParser`) rather than `:shared:ui` so the data layer can extract mentions without a UI dependency; the `render()` half (AnnotatedString styling) ships with `:shared:ui` in Phase 2 as §6.3 describes.
- **Seed data** is defined in Kotlin (`SeedDataLoader.kt` + `OdysseySeedIds.kt`) instead of a bundled `odyssey_seed.json` — avoids adding a resource-loading pipeline in Phase 1. Content and fixed entity IDs are 1:1 with the Expo seed. Seed rows carry HLC `0.0.seed` so any real edit wins LWW merges. `clear()` deletes only the seed continuity and relies on FK cascades (validated by test).
- **Blob store**: `BlobRepositoryImpl` + `expect/actual BlobFileStore` implement put(bytes)→hash, resolvePath(hash)→file path, and GC (deletes unreferenced rows *and* files). SHA-256 is a pure-Kotlin implementation validated against FIPS 180-4 test vectors (no platform crypto dependency).
- **JVM target**: `:shared:domain` and `:shared:data` gained a `jvm()` target purely for unit tests against an in-memory JDBC SQLite driver. This is not a desktop app target (Q4 unchanged).
- **Plan inconsistency resolved**: §7 (C5) mentions a `pc_tags` join table, but §1 Q8 resolves that player characters have no tags and §4 defines no such table. Followed §4/Q8 — no `pc_tags` table. The items half of C5 is covered by the `item_tags` cascade (tested).
- **Q6 honored**: no `getPlayerCharactersByPlayer`-style query was carried over.

---

### Phase 2 — Core CRUD Screens (Android-first)

**Goal**: All screens are navigable and functional on Android. A DM can manage a campaign end-to-end.

- [ ] Implement `AppTheme` (MD3 + custom hex `ColorScheme`, typography, shapes)
- [ ] Implement `AppNavHost` with all `@Serializable` route classes
- [ ] Implement bottom tab navigation (Dashboard, Sessions, Notes, NPCs, Locations, Items)
- [ ] **Dashboard**: hero campaign card, stats strip, recent notes rail, quick actions
- [ ] **Campaigns screen**: list, create modal, long-press set current, FAB
- [ ] **Campaign detail**: stats, section rails (Notes/NPCs/Locations/Sessions/Party), inline name edit, delete
- [ ] **Sessions screen + Session detail**: list with date badges + month headers; autosave with `MentionTextField`; shadow prompt modal; link modals
- [ ] **Notes screen + Note detail**: filter chips (text, tag, scope, campaign, location); `MentionTextField` + mention extraction on save (I1); boilerplate templates; Share/Fork
- [ ] **NPCs screen + NPC detail**: portrait grid; shadow toggle; shadow card; Share/Fork/Remove
- [ ] **Locations screen + Location detail**: grouped-by-root list; hierarchy issue count; hero map banner; breadcrumb pill trail; Move (re-parent); Share/Fork/Remove; gallery
- [ ] **Items screen + Item detail**: text + tag filter (I3); Share/Fork (I2)
- [ ] **Tags screen + Tag detail**: usage StatCards including items (I4); color swatches; Share/Fork
- [ ] **Continuities screen + detail** (I6)
- [ ] **Party + PlayerCharacter detail + PC Templates library**
- [ ] **Library screens** (NPCs, Locations, Notes): Add/Remove toggles
- [ ] All form modals (create/edit) with validation
- [ ] Confirm dialogs for all destructive actions (via overflow menu per ui-revamp §3 pattern 6)
- [ ] `Coil 3` `AsyncImage` for NPC/location/PC portraits with custom `BlobFetcher` (resolves `blob:<hash>` URI scheme to `filesDir/images/<hash>.<ext>`); image picker wired (Android photo picker) hashes bytes on import and writes to `blobs` table
- [ ] Pull-to-refresh on all list screens (cosmetic; triggers refresh of the Flow)
- [ ] `DemoBadge` on seeded entities
- [ ] Empty state screens for no-campaign, no-entities conditions

**Exit criteria**: Full manual walkthrough of all CRUD flows on Android emulator with no crashes. Cascade deletes verified (delete campaign → entities gone; delete NPC → gone from all join tables).

---

### Phase 3 — iOS Parity

**Goal**: All Phase 2 screens work identically on iOS.

- [ ] Verify `iosApp` Xcode project compiles and launches
- [ ] Add `NSLocalNetworkUsageDescription` and `NSBonjourServices` to `Info.plist`
- [ ] Wire iOS SQLite driver + DataStore
- [ ] Image picker: use iOS `PHPickerViewController` via `expect/actual` (Android uses `ActivityResultContracts.PickVisualMedia`)
- [ ] File URI handling for local images (iOS sandbox path differs from Android)
- [ ] Manual walkthrough of all CRUD flows on iOS simulator
- [ ] Fix any Compose rendering differences (scroll physics, keyboard avoidance, safe area insets)

**Exit criteria**: All Phase 2 exit criteria pass on iOS simulator. Image pick + display works on both platforms.

---

### Phase 4 — Cross-Cutting Features

**Goal**: Scope/fork/share, shadow system, mention pipeline, location validation, settings, theme, and the continuity-detail screen are all complete.

- [ ] **Settings screens**: Appearance (with DataStore persistence), Mentions (with trigger validation), Sync (host/join/leave), Data (load/clear demo)
- [ ] **Theme**: dark/light/system mode persisted and applied on app restart
- [ ] **Share / Fork** flows for notes, NPCs, locations, tags, items (I2), pc_templates
- [ ] **Shadow entity**: auto-create in `MentionParser` when mention token doesn't resolve; shadow card on detail screens; "Complete All Now" bottom sheet (I5)
- [ ] **Location hierarchy validation** in repository + type-change guard on detail screen
- [ ] **Mention settings**: configurable triggers, conflict rejection, live preview
- [ ] **PC Templates**: Save-as-Template, instantiate into campaign
- [ ] **`lastSyncedAt`** written to DataStore on sync success (I10)
- [ ] **ULID** ID generation (I9) — verify no collision with seed IDs
- [ ] Integration tests for Share/Fork flows, shadow creation, mention extraction on notes

**Exit criteria**: All features pass manual walkthrough on both platforms. Mention extraction on notes creates join-table rows. Fork + edit + share cycle verified.

---

### Phase 5 — P2P Sync

**Goal**: Host and join flows work on two physical or emulated devices on the same Wi-Fi network.

- [ ] Implement `HybridLogicalClock` (already unit-tested in Phase 1)
- [ ] Implement `LwwMergeEngine` with per-field HLC comparison + tombstones for join-table entries
- [ ] Implement `SyncMessage` sealed class + `kotlinx.serialization` codec
- [ ] Implement host: `embeddedServer(CIO, port = 8765)` + WebSocket route + `dns-sd-kt` service registration
- [ ] Implement joiner: `dns-sd-kt` discovery + `HttpClient.webSocket` connection + `LwwMergeEngine` on receive
- [ ] `FullState` send on peer connect; `Delta` on SQLDelight Flow change
- [ ] Sync UI: host screen (room code hero, connected peers, stop button); join screen (manual code entry + auto-discovered list)
- [ ] `lastSyncedAt` written to DataStore on successful sync round
- [ ] Peer count badge on Dashboard sync button
- [ ] Test: host on Android, join on iOS (or two Android devices) — create NPC on host, verify appears on joiner; edit on both simultaneously, verify LWW resolution is deterministic
- [ ] Test: disconnect mid-session → reconnect → delta sync recovers without data loss

**Exit criteria**: Two-device sync demo passes without data loss in the conflict scenario. Room code flow matches Expo UX (ABC-123 format, share button on host screen).

---

### Phase 6 — Onboarding, Polish & Release Prep

**Goal**: First-run experience is complete; app is release-quality.

- [ ] Implement `SpotlightOverlay` Composable + `TourController` (persisted step, guarded auto-start)
- [ ] Wire all 11 tour steps with navigation guards (§6.5)
- [ ] Tour complete modal: "Keep Demo" / "Start Fresh" (with `clearSeedData()` + `resetTour()`)
- [ ] Deep-link config (both platforms) for future share URLs
- [ ] Performance: verify no recomposition jank on NPC portrait grid (use `LazyVerticalGrid`, stable keys)
- [ ] Accessibility: content descriptions on all icon buttons, portrait images, FABs
- [ ] Crashlytics / Kermit sink wired (or log-only for initial release)
- [ ] ProGuard/R8 rules for SQLDelight, Koin, kotlinx.serialization
- [ ] iOS App Store metadata skeleton (bundle ID, signing)
- [ ] Android release signing config
- [ ] Manual QA pass: fresh install → tour → CRUD → sync → clear demo → restart tour

**Exit criteria**: Fresh install on a physical Android device and iOS device completes the full tour without errors. `./gradlew :androidApp:assembleRelease` produces a signable APK.

---

*Plan authored 2026-07-13. Supersedes the previous Vite→Expo MIGRATION_PLAN.md for any overlapping architectural decisions.*