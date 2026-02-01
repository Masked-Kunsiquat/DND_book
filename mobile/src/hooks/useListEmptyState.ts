import { useMemo } from 'react';

export interface ListEmptyStateOptions {
  /** Whether a campaign is currently selected */
  hasCampaign: boolean;
  /** Total count of items before filtering */
  totalCount: number;
  /** Count of items after filtering */
  filteredCount: number;
  /** Whether any filters are currently active */
  hasActiveFilters?: boolean;
}

export interface ListEmptyStateResult {
  /** True when no campaign is selected - show "select campaign" empty state */
  showNoCampaign: boolean;
  /** True when campaign exists but has no items - show "create first item" empty state */
  showNoResults: boolean;
  /** True when items exist but filters exclude all - show "clear filters" empty state */
  showFilteredEmpty: boolean;
  /** True when the main list should be rendered (has visible items) */
  showList: boolean;
}

/**
 * Determines which empty state to show for list screens.
 *
 * Encapsulates the common pattern of checking campaign selection,
 * total item count, and filtered item count to decide what UI to render.
 *
 * @param options - Configuration for empty state detection
 * @returns Object indicating which empty state (if any) should be displayed
 *
 * @example
 * ```tsx
 * const { showNoCampaign, showNoResults, showFilteredEmpty, showList } = useListEmptyState({
 *   hasCampaign: Boolean(currentCampaign),
 *   totalCount: notes.length,
 *   filteredCount: filteredNotes.length,
 *   hasActiveFilters: query.length > 0 || selectedTagIds.length > 0,
 * });
 *
 * if (showNoCampaign) return <EmptyState title="No campaign selected" ... />;
 * if (showNoResults) return <EmptyState title="No notes yet" ... />;
 * if (showFilteredEmpty) return <EmptyState title="No notes match your filters" ... />;
 * return <FlatList ... />;
 * ```
 */
export function useListEmptyState(options: ListEmptyStateOptions): ListEmptyStateResult {
  const { hasCampaign, totalCount, filteredCount, hasActiveFilters = false } = options;

  return useMemo(() => {
    // Priority 1: No campaign selected
    if (!hasCampaign) {
      return {
        showNoCampaign: true,
        showNoResults: false,
        showFilteredEmpty: false,
        showList: false,
      };
    }

    // Priority 2: No items exist at all
    if (totalCount === 0) {
      return {
        showNoCampaign: false,
        showNoResults: true,
        showFilteredEmpty: false,
        showList: false,
      };
    }

    // Priority 3: Items exist but all filtered out
    if (filteredCount === 0 && (hasActiveFilters || totalCount > 0)) {
      return {
        showNoCampaign: false,
        showNoResults: false,
        showFilteredEmpty: true,
        showList: false,
      };
    }

    // Default: Show the list
    return {
      showNoCampaign: false,
      showNoResults: false,
      showFilteredEmpty: false,
      showList: true,
    };
  }, [hasCampaign, totalCount, filteredCount, hasActiveFilters]);
}
