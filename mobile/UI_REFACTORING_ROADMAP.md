# UI Refactoring Roadmap

This document tracks UI-focused code quality improvements for the mobile app.

## Overview

Analysis identified **~520 lines of duplicated UI code** across components and screens. This roadmap prioritizes refactoring by impact and complexity.

---

## Phase 1: Shared Style Constants (High Priority, Low Risk)

### 1.1 Extract Common Layout Styles
- **Status:** ✅ Complete
- **Impact:** ~45 lines across 9 files
- **Location:** `src/theme/styles.ts`
- **Patterns extracted:**
  - `flexRow`: `{ flexDirection: 'row', alignItems: 'center' }`
  - `flexRowBetween`: `{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }`
  - `listContent`: `{ paddingBottom: layout.fabSize + layout.fabMargin * 2 }`
- **Files updated:**
  - `app/(tabs)/notes.tsx`
  - `app/(tabs)/npcs.tsx`
  - `app/(tabs)/locations.tsx`
  - `app/(tabs)/items.tsx`
  - `app/(tabs)/sessions.tsx`
  - `app/(tabs)/campaigns.tsx`
  - `app/tags.tsx`
  - `app/campaign/[id]/sessions.tsx`
  - `app/campaign/[id]/party.tsx`
  - `app/library/player-characters.tsx`

### 1.2 Extract FAB Styles
- **Status:** ✅ Complete
- **Impact:** ~8 lines, 4 files (100% duplicate)
- **Location:** `src/theme/styles.ts`
- **Pattern extracted:**
  ```typescript
  fab: {
    position: 'absolute',
    right: layout.fabMargin,
    bottom: layout.fabMargin,
  }
  ```
- **Files updated:**
  - `app/(tabs)/notes.tsx`
  - `app/(tabs)/npcs.tsx`
  - `app/(tabs)/locations.tsx`
  - `app/(tabs)/items.tsx`
  - `app/(tabs)/sessions.tsx`
  - `app/(tabs)/campaigns.tsx`
  - `app/tags.tsx`
  - `app/campaign/[id]/sessions.tsx`
  - `app/campaign/[id]/party.tsx`

---

## Phase 2: Reusable Badge Component (High Priority)

### 2.1 Create StyledBadge Component
- **Status:** ✅ Complete
- **Impact:** ~60 lines across 5 files
- **Location:** `src/components/shared/StyledBadge.tsx`
- **Variants implemented:**
  - `default` - Neutral badge (surfaceVariant colors)
  - `primary` - Primary-colored badge (primaryContainer colors)
  - `shadow` - Dashed border badge (indicates incomplete status)
  - `count` - Numeric value with label (for stats display)
- **Files updated:**
  - `src/components/cards/NoteCard.tsx` (campaignBadge)
  - `src/components/cards/LocationCard.tsx` (typeBadge, shadowBadge)
  - `src/components/cards/LocationRow.tsx` (typeBadge, shadowBadge, sharedBadge)
  - `src/components/cards/CampaignCard.tsx` (CountBadge)

---

## Phase 3: Form Component Consolidation (Medium Priority)

### 3.1 Extract FormHelperText Component
- **Status:** ✅ Complete
- **Impact:** ~40 lines across 4 files
- **Location:** `src/components/forms/FormHelperText.tsx`
- **Props:**
  - `message?: string`
  - `error?: boolean`
- **Files updated:**
  - `src/components/forms/FormTextInput.tsx`
  - `src/components/forms/FormSelect.tsx`
  - `src/components/forms/FormMultiSelect.tsx`
  - `src/components/forms/FormImagePicker.tsx`

### 3.2 Standardize Form Container Styling
- **Status:** ⏭️ Skipped (dynamic theme styles, high effort for 19+ files)
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
- **Status:** ✅ Complete
- **Impact:** ~80 lines across 3 files
- **Location:** `src/components/shared/FilterHeader.tsx`
- **Props:**
  - `expanded: boolean`
  - `onToggle: () => void`
  - `children: ReactNode` (filter content)
  - `style?: object` (optional style override)
- **Files updated:**
  - `app/(tabs)/notes.tsx`
  - `app/(tabs)/npcs.tsx`
  - `app/(tabs)/locations.tsx`

### 4.2 Extract TagFilterSection Component
- **Status:** ✅ Complete
- **Impact:** ~30 lines across 3 files
- **Location:** `src/components/shared/TagFilterSection.tsx`
- **Props:**
  - `tags: Tag[]`
  - `selectedIds: string[]`
  - `onToggle: (tagId: string) => void`
  - `onClear: () => void`
  - `headerStyle?: object`
- **Files updated:**
  - `app/(tabs)/notes.tsx`
  - `app/(tabs)/npcs.tsx`
  - `app/(tabs)/locations.tsx`

---

## Phase 5: Empty State Handling (Medium Priority)

### 5.1 Create useListEmptyState Hook
- **Status:** ✅ Complete
- **Impact:** ~160 lines across 4 files
- **Location:** `src/hooks/useListEmptyState.ts`
- **Returns:**
  - `showNoCampaign: boolean`
  - `showNoResults: boolean`
  - `showFilteredEmpty: boolean`
  - `showList: boolean`
- **Files updated:**
  - `app/(tabs)/notes.tsx`
  - `app/(tabs)/npcs.tsx`
  - `app/(tabs)/locations.tsx`
  - `app/(tabs)/items.tsx`

---

## Phase 6: Modal Action Patterns (Low Priority)

### 6.1 Extract ModalActions Component
- **Status:** ✅ Complete
- **Impact:** ~80 lines across 10+ files
- **Location:** `src/components/forms/ModalActions.tsx`
- **Props:**
  - `onCancel: () => void`
  - `onConfirm: () => void`
  - `confirmLabel?: string`
  - `cancelLabel?: string`
  - `loading?: boolean`
  - `disabled?: boolean`
- **Files updated:**
  - `app/(tabs)/notes.tsx`
  - `app/(tabs)/npcs.tsx`
  - `app/(tabs)/locations.tsx`
  - `app/(tabs)/items.tsx`
  - `app/(tabs)/sessions.tsx`
  - `app/(tabs)/campaigns.tsx`
  - `app/continuities.tsx`
  - `app/tags.tsx`
  - `app/tag/[id].tsx`
  - `app/campaign/[id]/sessions.tsx`
  - `app/campaign/[id]/party.tsx`
  - `app/location/[id].tsx`
  - `app/library/player-characters.tsx`

---

## Tracking

| Phase | Item | Status | Impact | Files |
| --- | --- | --- | --- | --- |
| 1.1 | Common layout styles | ✅ Complete | ~45 lines | 10 |
| 1.2 | FAB styles | ✅ Complete | ~8 lines | 9 |
| 2.1 | StyledBadge component | ✅ Complete | ~60 lines | 5 |
| 3.1 | FormHelperText | ✅ Complete | ~40 lines | 4 |
| 3.2 | Form container styles | ⏭️ Skipped | ~50 lines | 19+ |
| 4.1 | FilterHeader | ✅ Complete | ~80 lines | 3 |
| 4.2 | TagFilterSection | ✅ Complete | ~30 lines | 3 |
| 5.1 | useListEmptyState | ✅ Complete | ~160 lines | 4 |
| 6.1 | ModalActions | ✅ Complete | ~80 lines | 10+ |

**Total potential savings:** ~520+ lines

---

## Notes

- Start with Phase 1 (style constants) as it's lowest risk
- Phase 2 (Badge) provides good visual consistency wins
- Phases 4-5 are higher risk due to screen-level changes
- Run `npm run typecheck` after each change
- Test affected screens manually after refactoring
