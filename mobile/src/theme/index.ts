/**
 * Theme system for DND Book mobile app.
 * Provides dark and light themes with React Native Paper integration.
 */

import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { gray, primary, secondary, success, warning, error } from './colors';
import { spacing, borderRadius } from './spacing';
import { fontFamily, fontSize } from './typography';

// Export all sub-modules
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './styles';

// Custom font configuration for Paper
const fontConfig = {
  displayLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: fontFamily.regular,
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: fontFamily.regular,
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: fontFamily.regular,
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 22,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

/**
 * Dark theme (default for DND Book)
 */
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    // Primary
    primary: primary[500],
    onPrimary: '#ffffff',
    primaryContainer: primary[800],
    onPrimaryContainer: primary[100],

    // Secondary
    secondary: secondary[400],
    onSecondary: '#ffffff',
    secondaryContainer: secondary[800],
    onSecondaryContainer: secondary[100],

    // Tertiary (using purple for variety)
    tertiary: '#c084fc',
    onTertiary: '#ffffff',
    tertiaryContainer: '#6b21a8',
    onTertiaryContainer: '#f3e8ff',

    // Background & Surface
    background: gray[900],
    onBackground: gray[100],
    surface: gray[800],
    onSurface: gray[100],
    surfaceVariant: gray[700],
    onSurfaceVariant: gray[300],
    surfaceDisabled: `${gray[700]}40`,
    onSurfaceDisabled: `${gray[400]}60`,

    // Outline
    outline: gray[600],
    outlineVariant: gray[700],

    // Error
    error: error[500],
    onError: '#ffffff',
    errorContainer: error[900],
    onErrorContainer: error[100],

    // Inverse
    inverseSurface: gray[100],
    inverseOnSurface: gray[900],
    inversePrimary: primary[700],

    // Shadow & Scrim
    shadow: '#000000',
    scrim: '#000000',

    // Elevation tint
    elevation: {
      level0: 'transparent',
      level1: gray[800],
      level2: '#2d3748', // gray-750 equivalent
      level3: gray[700],
      level4: '#3f4a5c', // gray-650 equivalent
      level5: gray[600],
    },
  },
};

/**
 * Light theme
 */
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    // Primary
    primary: primary[600],
    onPrimary: '#ffffff',
    primaryContainer: primary[100],
    onPrimaryContainer: primary[900],

    // Secondary
    secondary: secondary[600],
    onSecondary: '#ffffff',
    secondaryContainer: secondary[100],
    onSecondaryContainer: secondary[900],

    // Tertiary
    tertiary: '#9333ea',
    onTertiary: '#ffffff',
    tertiaryContainer: '#f3e8ff',
    onTertiaryContainer: '#581c87',

    // Background & Surface
    background: gray[50],
    onBackground: gray[900],
    surface: '#ffffff',
    onSurface: gray[900],
    surfaceVariant: gray[100],
    onSurfaceVariant: gray[700],
    surfaceDisabled: `${gray[200]}40`,
    onSurfaceDisabled: `${gray[500]}60`,

    // Outline
    outline: gray[400],
    outlineVariant: gray[200],

    // Error
    error: error[600],
    onError: '#ffffff',
    errorContainer: error[100],
    onErrorContainer: error[900],

    // Inverse
    inverseSurface: gray[800],
    inverseOnSurface: gray[100],
    inversePrimary: primary[300],

    // Shadow & Scrim
    shadow: '#000000',
    scrim: '#000000',

    // Elevation
    elevation: {
      level0: 'transparent',
      level1: gray[50],
      level2: gray[100],
      level3: gray[200],
      level4: gray[200],
      level5: gray[300],
    },
  },
};

/**
 * Semantic colors for use throughout the app.
 * These provide consistent colors for common UI patterns.
 */
export const semanticColors = {
  success: {
    main: success[500],
    light: success[100],
    dark: success[700],
    contrastText: '#ffffff',
  },
  warning: {
    main: warning[500],
    light: warning[100],
    dark: warning[700],
    contrastText: '#000000',
  },
  error: {
    main: error[500],
    light: error[100],
    dark: error[700],
    contrastText: '#ffffff',
  },
  info: {
    main: primary[500],
    light: primary[100],
    dark: primary[700],
    contrastText: '#ffffff',
  },
} as const;

/**
 * App-specific layout constants
 */
export const layout = {
  spacing,
  borderRadius,
  // Screen padding
  screenPadding: spacing[4],
  // Card
  cardPadding: spacing[4],
  cardBorderRadius: borderRadius.xl,
  // Chips
  chipSmallHeight: spacing[6],
  chipSmallPaddingY: spacing[0.5],
  // List items
  listItemPadding: spacing[3],
  listItemHeight: 56,
  // Headers
  headerHeight: 56,
  // Bottom tabs
  tabBarHeight: 64,
  // FAB
  fabSize: 56,
  fabMargin: spacing[4],
} as const;
