/**
 * Spacing scale for consistent layout.
 * Based on 4px base unit (matches Tailwind's default scale).
 */

export const spacing = {
  /** 0px */
  0: 0,
  /** 2px */
  0.5: 2,
  /** 4px */
  1: 4,
  /** 6px */
  1.5: 6,
  /** 8px */
  2: 8,
  /** 10px */
  2.5: 10,
  /** 12px */
  3: 12,
  /** 14px */
  3.5: 14,
  /** 16px */
  4: 16,
  /** 20px */
  5: 20,
  /** 24px */
  6: 24,
  /** 28px */
  7: 28,
  /** 32px */
  8: 32,
  /** 36px */
  9: 36,
  /** 40px */
  10: 40,
  /** 44px */
  11: 44,
  /** 48px */
  12: 48,
  /** 56px */
  14: 56,
  /** 64px */
  16: 64,
  /** 80px */
  20: 80,
  /** 96px */
  24: 96,
  /** 128px */
  32: 128,
  /** 160px */
  40: 160,
  /** 192px */
  48: 192,
  /** 224px */
  56: 224,
  /** 256px */
  64: 256,
} as const;

export const borderRadius = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;
