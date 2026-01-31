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

### 1.2 Extract Date Utilities
- **Status:** Pending
- **Impact:** Consolidates date parsing/formatting scattered across components
- **Location:** `src/utils/date.ts`
- **Functions:**
  - `formatDate(isoString, options?)` - Consistent date display
  - `parseDate(isoString)` - Safe date parsing with null fallback
  - `sortByDate(items, field, descending?)` - Generic date sorting

### 1.3 Extract Array Serialization Helpers ✅
- **Status:** Complete (included with 1.1)
- **Impact:** Pairs with `parseJsonArray()` for consistency
- **Location:** `src/utils/parsing.ts`
- **Functions:**
  - [x] `stringifyArray(arr)` - Safe JSON.stringify for arrays

---

## Phase 2: Hook Helpers (High Priority)

### 2.1 Generic Update Builder
- **Status:** Pending
- **Impact:** Reduces ~180 lines of repetitive update logic
- **Location:** `src/utils/entityHelpers.ts`
- **Pattern to replace:**
  ```typescript
  const updates: Record<string, string> = { updated: now() };
  if (data.field !== undefined) updates.field = data.field;
  // ... repeated for every field
  ```

### 2.2 Row-to-Entity Defaults Helper
- **Status:** Pending
- **Impact:** Simplifies `rowToX()` functions
- **Location:** `src/utils/entityHelpers.ts`
- **Functions:**
  - `applyStringDefault(value, fallback)` - Handle undefined strings
  - `applyEnumDefault(value, fallback, validValues)` - Type-safe enum defaults

---

## Phase 3: Custom Hooks (Medium Priority)

### 3.1 `useEntityCounts()` Hook
- **Status:** Pending
- **Impact:** Eliminates 3 duplicate counting patterns in campaigns.tsx
- **Location:** `src/hooks/useEntityCounts.ts`
- **Usage:**
  ```typescript
  const noteCounts = useEntityCounts(notes, (n) =>
    n.scope === 'campaign' ? [n.campaignId] : n.campaignIds
  );
  ```

### 3.2 `useFormModal()` Hook
- **Status:** Pending
- **Impact:** Standardizes modal state management across pages
- **Location:** `src/hooks/useFormModal.ts`
- **Encapsulates:**
  - `isOpen` state
  - `draft` state (generic)
  - `error` state
  - `open()`, `close()`, `setField()` helpers

---

## Phase 4: Architecture Improvements (Low Priority)

### 4.1 Hook Factory Pattern
- **Status:** Pending
- **Impact:** Could reduce each entity hook by 50%+
- **Risk:** Higher complexity, needs careful design
- **Approach:** Create `createEntityHooks()` factory for CRUD operations

### 4.2 Naming Convention Standardization
- **Status:** Pending
- **Issues:**
  - `Npc` (type) vs `NPCCard` (component) vs `NPC` (display)
  - Inconsistent capitalization across codebase
- **Decision needed:** Pick one convention and apply globally

### 4.3 Error Handling Strategy
- **Status:** Pending
- **Issues:**
  - Fire-and-forget async calls (`void removeManagedImage()`)
  - Inconsistent error throwing vs logging
- **Recommendation:** Define explicit error handling policy

---

## Tracking

| Phase | Item | Status | PR |
|-------|------|--------|-----|
| 1.1 | Extract `parseJsonArray()` | ✅ Complete | - |
| 1.2 | Date utilities | ⏳ Pending | - |
| 1.3 | Array serialization | ✅ Complete | - |
| 2.1 | Generic update builder | ⏳ Pending | - |
| 2.2 | Row defaults helper | ⏳ Pending | - |
| 3.1 | `useEntityCounts()` | ⏳ Pending | - |
| 3.2 | `useFormModal()` | ⏳ Pending | - |
| 4.1 | Hook factory | ⏳ Pending | - |
| 4.2 | Naming conventions | ⏳ Pending | - |
| 4.3 | Error handling | ⏳ Pending | - |

---

## Notes

- Each refactoring should be a separate commit/PR for easy review
- Run `npm run typecheck` after each change to verify no regressions
- Update this document as items are completed
