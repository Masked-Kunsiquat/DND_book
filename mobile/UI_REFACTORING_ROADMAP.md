# UI Refactoring Roadmap

This document tracks UI-focused code quality improvements for the mobile app.

## Overview

Analysis identified **~520 lines of duplicated UI code** across components and screens. This roadmap prioritizes refactoring by impact and complexity.

---

## Phase 1: Shared Style Constants (High Priority, Low Risk)

### 1.1 Extract Common Layout Styles
- **Status:** Pending
- **Impact:** ~45 lines across 9 files
- **Location:** `src/theme/styles.ts`
- **Patterns to extract:**
  - `flexRow`: `{ flexDirection: 'row', alignItems: 'center' }`
  - `flexRowBetween`: `{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }`
  - `listContent`: `{ paddingBottom: layout.fabSize + layout.fabMargin * 2 }`
- **Files affected:**
  - `src/components/cards/*.tsx` (tagsRow patterns)
  - `app/(tabs)/*.tsx` (list screens)

### 1.2 Extract FAB Styles
- **Status:** Pending
- **Impact:** ~8 lines, 4 files (100% duplicate)
- **Location:** `src/theme/styles.ts`
- **Pattern:**
  ```typescript
  fab: {
    position: 'absolute',
    right: layout.fabMargin,
    bottom: layout.fabMargin,
  }
  ```
- **Files affected:**
  - `app/(tabs)/notes.tsx`
  - `app/(tabs)/npcs.tsx`
  - `app/(tabs)/locations.tsx`
  - `app/(tabs)/items.tsx`

---

## Phase 2: Reusable Badge Component (High Priority)

### 2.1 Create StyledBadge Component
- **Status:** Pending
- **Impact:** ~60 lines across 5 files
- **Location:** `src/components/shared/StyledBadge.tsx`
- **Variants:**
  - `type` - Location type badge
  - `shadow` - Shadow/incomplete status
  - `campaign` - Campaign scope indicator
  - `count` - Numeric count badge
- **Files to update:**
  - `src/components/cards/NoteCard.tsx` (campaignBadge)
  - `src/components/cards/LocationCard.tsx` (typeBadge, shadowBadge)
  - `src/components/cards/LocationRow.tsx` (typeBadge, shadowBadge)
  - `src/components/cards/CampaignCard.tsx` (CountBadge)

---

## Phase 3: Form Component Consolidation (Medium Priority)

### 3.1 Extract FormHelperText Component
- **Status:** Pending
- **Impact:** ~40 lines across 4 files
- **Location:** `src/components/forms/FormHelperText.tsx`
- **Props:**
  - `message?: string`
  - `error?: boolean`
- **Files to update:**
  - `src/components/forms/FormTextInput.tsx`
  - `src/components/forms/FormSelect.tsx`
  - `src/components/forms/FormMultiSelect.tsx`
  - `src/components/forms/FormImagePicker.tsx`

### 3.2 Standardize Form Container Styling
- **Status:** Pending
- **Impact:** ~50 lines across 19+ files
- **Location:** `src/theme/styles.ts`
- **Pattern:**
  ```typescript
  surfaceContainer: (theme) => ({
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.outlineVariant,
    borderWidth: 1,
    borderRadius: layout.cardBorderRadius,
  })
  ```

---

## Phase 4: List Screen Patterns (Medium Priority, Higher Risk)

### 4.1 Extract FilterHeader Component
- **Status:** Pending
- **Impact:** ~80 lines across 3 files
- **Location:** `src/components/shared/FilterHeader.tsx`
- **Props:**
  - `expanded: boolean`
  - `onToggle: () => void`
  - `resultCount: number`
  - `children: ReactNode` (filter content)
- **Files to update:**
  - `app/(tabs)/notes.tsx`
  - `app/(tabs)/npcs.tsx`
  - `app/(tabs)/locations.tsx`

### 4.2 Extract TagFilterSection Component
- **Status:** Pending
- **Impact:** ~30 lines across 3 files
- **Location:** `src/components/shared/TagFilterSection.tsx`
- **Props:**
  - `tags: Tag[]`
  - `selectedIds: string[]`
  - `onSelect: (ids: string[]) => void`
  - `onClear: () => void`

---

## Phase 5: Empty State Handling (Medium Priority)

### 5.1 Create useListEmptyState Hook
- **Status:** Pending
- **Impact:** ~160 lines across 4 files
- **Location:** `src/hooks/useListEmptyState.ts`
- **Returns:**
  - `showNoCampaign: boolean`
  - `showNoResults: boolean`
  - `showFilteredEmpty: boolean`
  - `clearFilters: () => void`
- **Files to update:**
  - `app/(tabs)/notes.tsx`
  - `app/(tabs)/npcs.tsx`
  - `app/(tabs)/locations.tsx`
  - `app/(tabs)/items.tsx`

---

## Phase 6: Modal Action Patterns (Low Priority)

### 6.1 Extract ModalActions Component
- **Status:** Pending
- **Impact:** ~80 lines across 10+ files
- **Location:** `src/components/forms/ModalActions.tsx`
- **Props:**
  - `onCancel: () => void`
  - `onConfirm: () => void`
  - `confirmLabel?: string`
  - `loading?: boolean`
  - `disabled?: boolean`

---

## Tracking

| Phase | Item | Status | Impact | Files |
|-------|------|--------|--------|-------|
| 1.1 | Common layout styles | ⏳ Pending | ~45 lines | 9 |
| 1.2 | FAB styles | ⏳ Pending | ~8 lines | 4 |
| 2.1 | StyledBadge component | ⏳ Pending | ~60 lines | 5 |
| 3.1 | FormHelperText | ⏳ Pending | ~40 lines | 4 |
| 3.2 | Form container styles | ⏳ Pending | ~50 lines | 19+ |
| 4.1 | FilterHeader | ⏳ Pending | ~80 lines | 3 |
| 4.2 | TagFilterSection | ⏳ Pending | ~30 lines | 3 |
| 5.1 | useListEmptyState | ⏳ Pending | ~160 lines | 4 |
| 6.1 | ModalActions | ⏳ Pending | ~80 lines | 10+ |

**Total potential savings:** ~520+ lines

---

## Notes

- Start with Phase 1 (style constants) as it's lowest risk
- Phase 2 (Badge) provides good visual consistency wins
- Phases 4-5 are higher risk due to screen-level changes
- Run `npm run typecheck` after each change
- Test affected screens manually after refactoring
