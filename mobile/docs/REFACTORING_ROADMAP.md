# Mobile Codebase Refactoring Roadmap

This document tracks code quality improvements and refactoring efforts for the mobile app.

## Overview

Analysis identified **~400+ lines of duplicated code** across hooks and components. This roadmap prioritizes refactoring by impact and complexity.

---

## Phase 1: Shared Utilities (High Priority)

### 1.1 Extract `parseJsonArray()` ✅
- **Status:** Complete
- **Impact:** Eliminated 7 duplicate implementations (~56 lines)
- **Location:** `src/utils/parsing.ts`
- **Files updated:**
  - [x] Create `src/utils/parsing.ts`
  - [x] `src/hooks/useNotes.ts`
  - [x] `src/hooks/useNpcs.ts`
  - [x] `src/hooks/useLocations.ts`
  - [x] `src/hooks/useItems.ts`
  - [x] `src/hooks/useTags.ts`
  - [x] `src/hooks/useSessionLogs.ts`
  - [x] `src/hooks/usePlayerCharacters.ts`

### 1.2 Extract Date Utilities ✅
- **Status:** Complete
- **Impact:** Eliminated ~60 lines of duplicate date handling across 5 files
- **Location:** `src/utils/date.ts`
- **Functions:**
  - [x] `parseDate(value)` - Safe date parsing with null fallback
  - [x] `formatDisplayDate(value, fallback)` - Locale-specific date display
  - [x] `formatShortDate(value, fallback)` - Short date format (Jan 15, 2024)
  - [x] `formatDateTime(value, fallback)` - Full date and time display
  - [x] `formatDateInput(date)` - YYYY-MM-DD for form inputs
  - [x] `getTodayDateInput()` - Today's date in YYYY-MM-DD
  - [x] `safeDateTimestamp(value)` - Timestamp for sorting (returns 0 on invalid)
  - [x] `sortByDateDesc(extractor)` - Generic comparator (newest first)
  - [x] `sortByDateAsc(extractor)` - Generic comparator (oldest first)
- **Files updated:**
  - [x] `src/hooks/useSessionLogs.ts` - Use `sortByDateDesc`
  - [x] `src/components/cards/CampaignCard.tsx` - Use `formatShortDate`
  - [x] `app/(tabs)/sessions.tsx` - Use `formatDisplayDate`, `getTodayDateInput`
  - [x] `app/session/[id].tsx` - Use `formatDateTime`, `formatDisplayDate`, `getTodayDateInput`
  - [x] `app/campaign/[id]/sessions.tsx` - Use `formatDisplayDate`, `getTodayDateInput`

### 1.3 Extract Array Serialization Helpers ✅
- **Status:** Complete (included with 1.1)
- **Impact:** Pairs with `parseJsonArray()` for consistency
- **Location:** `src/utils/parsing.ts`
- **Functions:**
  - [x] `stringifyArray(arr)` - Safe JSON.stringify for arrays

---

## Phase 2: Hook Helpers (High Priority)

### 2.1 Generic Update Builder ✅
- **Status:** Complete
- **Impact:** Reduced ~180 lines of repetitive update logic
- **Location:** `src/utils/entityHelpers.ts`
- **Functions:**
  - [x] `buildUpdates(data, schema)` - Builds update object from partial input data
  - [x] `FieldSchema` type - Defines field types ('string' | 'array' | 'json')
- **Files updated:**
  - [x] `src/hooks/useNotes.ts`
  - [x] `src/hooks/useNpcs.ts`
  - [x] `src/hooks/useLocations.ts`
  - [x] `src/hooks/useItems.ts`
  - [x] `src/hooks/useTags.ts`
  - [x] `src/hooks/useSessionLogs.ts`
  - [x] `src/hooks/usePlayerCharacters.ts`
  - [x] `src/hooks/useCampaigns.ts`

### 2.2 Row-to-Entity Defaults Helper ⏭️
- **Status:** Skipped
- **Reason:** After analysis, the `rowToX()` patterns are already concise:
  - String defaults use `row.field || ''` (3 chars overhead)
  - Enum defaults require type casts that a generic helper can't simplify
  - Adding helpers would increase imports without meaningful line reduction
- **Original proposal:**
  - `applyStringDefault(value, fallback)` - Handle undefined strings
  - `applyEnumDefault(value, fallback, validValues)` - Type-safe enum defaults

---

## Phase 3: Custom Hooks (Medium Priority)

### 3.1 `useEntityCounts()` Hook ✅
- **Status:** Complete
- **Impact:** Eliminated 3 duplicate counting patterns (~24 lines)
- **Location:** `src/hooks/useEntityCounts.ts`
- **Usage:**
  ```typescript
  const noteCounts = useEntityCounts(notes, (n) =>
    n.scope === 'campaign' ? [n.campaignId] : n.campaignIds
  );
  ```
- **Files updated:**
  - [x] Create `src/hooks/useEntityCounts.ts`
  - [x] Export from `src/hooks/index.ts`
  - [x] `app/(tabs)/campaigns.tsx` - Use for note, NPC, and location counts

### 3.2 `useFormModal()` Hook ⏭️
- **Status:** Skipped
- **Reason:** After analysis, the complexity outweighs the benefit:
  - Common state (isOpen, isCreating, error) is only ~6 lines per page
  - Draft fields vary widely (2-10 fields per entity type)
  - Each field needs typed individual setters for form bindings
  - A generic hook would require complex generics without meaningful simplification
  - Current explicit approach is clear and maintainable
- **Original proposal:**
  - `isOpen` state
  - `draft` state (generic)
  - `error` state
  - `open()`, `close()`, `setField()` helpers

---

## Phase 4: Architecture Improvements (Low Priority)

### 4.1 Hook Factory Pattern ⏭️
- **Status:** Skipped
- **Reason:** After analysis, the variations across hooks are too significant:
  - Different filter parameters per entity (campaignId, continuityId, scope logic)
  - Custom query hooks vary by entity (`useTagsByIds`, `useNpcsByLocation`, etc.)
  - Delete side effects differ (NPCs/Locations clean up images, Tags cascade)
  - Create logic varies (Tags generate colors, Notes handle scope, etc.)
  - A factory would require complex configuration objects harder to maintain than explicit code
- **Original proposal:** Create `createEntityHooks()` factory for CRUD operations

### 4.2 Naming Convention Standardization ✅
- **Status:** Complete (documented as acceptable)
- **Analysis:** Current naming follows common React conventions:
  - Types: `Npc` (PascalCase, treating acronym as a word)
  - Components: `NPCCard` (all-caps acronym for readability)
  - Hooks: `useNpcs`, `useNpc` (camelCase with lowercase acronym)
- **Conclusion:** The pattern is consistent within each category - no changes needed

### 4.3 Error Handling Strategy ✅
- **Status:** Complete (documented as acceptable)
- **Analysis:** Current patterns are intentional and consistent:
  - **Throw + log.error**: Update hooks throw for "not found" (caller handles)
  - **Fire-and-forget (`void`)**: Image cleanup - `removeManagedImage()` handles errors internally with `log.warn`
  - **log.error + continue**: Store/sync operations degrade gracefully
  - **log.warn + fallback**: File operations return fallback values on failure
- **Conclusion:** No changes needed - the strategy is appropriate for each context

---

## Tracking

| Phase | Item | Status | PR |
|-------|------|--------|-----|
| 1.1 | Extract `parseJsonArray()` | ✅ Complete | - |
| 1.2 | Date utilities | ✅ Complete | - |
| 1.3 | Array serialization | ✅ Complete | - |
| 2.1 | Generic update builder | ✅ Complete | - |
| 2.2 | Row defaults helper | ⏭️ Skipped | - |
| 3.1 | `useEntityCounts()` | ✅ Complete | - |
| 3.2 | `useFormModal()` | ⏭️ Skipped | - |
| 4.1 | Hook factory | ⏭️ Skipped | - |
| 4.2 | Naming conventions | ✅ Documented | - |
| 4.3 | Error handling | ✅ Documented | - |

---

## Notes

- Each refactoring should be a separate commit/PR for easy review
- Run `npm run typecheck` after each change to verify no regressions
- Update this document as items are completed
