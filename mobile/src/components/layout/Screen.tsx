/**
 * Base screen wrapper with consistent padding and background.
 */

import React from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { layout } from '../../theme';

export interface ScreenProps {
  /** Screen content */
  children: React.ReactNode;
  /** Whether to use ScrollView (default: true) */
  scroll?: boolean;
  /** Whether to include safe area insets (default: true) */
  safe?: boolean;
  /** Custom padding (overrides default) */
  padding?: number;
  /** Whether content is refreshing */
  refreshing?: boolean;
  /** Called when user pulls to refresh */
  onRefresh?: () => void;
  /** Additional style for the container */
  style?: object;
}

export function Screen({
  children,
  scroll = true,
  safe = true,
  padding = layout.screenPadding,
  refreshing,
  onRefresh,
  style,
}: ScreenProps) {
  const { theme } = useTheme();

  const containerStyle = [
    styles.container,
    { backgroundColor: theme.colors.background, padding },
    style,
  ];

  const content = scroll ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  if (safe) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={containerStyle}>{content}</View>
      </SafeAreaView>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
