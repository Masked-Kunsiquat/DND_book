/**
 * Shared style constants for reuse across components.
 * These reduce duplication of common layout patterns.
 */

import { StyleSheet, ViewStyle } from 'react-native';
import { spacing } from './spacing';

// FAB layout constants (duplicated from index.ts to avoid circular dependency)
const FAB_SIZE = 56;
const FAB_MARGIN = spacing[4]; // 16px

/**
 * Common layout styles used throughout the app.
 */
export const commonStyles = StyleSheet.create({
  /**
   * Basic flex row with centered items.
   * Use for horizontal layouts like icon + text.
   */
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  /**
   * Flex row with space-between justification.
   * Use for headers with title on left and action on right.
   */
  flexRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,

  /**
   * Padding for lists that have a FAB overlay.
   * Prevents the last item from being obscured.
   */
  listContent: {
    paddingBottom: FAB_SIZE + FAB_MARGIN * 2,
  } as ViewStyle,

  /**
   * Absolute positioning for FAB buttons.
   */
  fab: {
    position: 'absolute',
    right: FAB_MARGIN,
    bottom: FAB_MARGIN,
  } as ViewStyle,
});
