/**
 * Tour step definitions for the onboarding experience.
 */

import React from 'react';
import { FlatList, ScrollView, SectionList } from 'react-native';
import { router } from 'expo-router';
import type { TourStep } from 'react-native-spotlight-tour';
import { TourTooltip } from './TourTooltip';
import { TOUR_STEP } from './types';
import { createLogger } from '../utils/logger';

const log = createLogger('tour-steps');

/**
 * A scrollable component that has a scrollToOffset method (FlatList, SectionList, etc.)
 * or scrollTo method (ScrollView).
 */
interface Scrollable {
  scrollToOffset?: (params: { offset: number; animated?: boolean }) => void;
  scrollTo?: (options: { y: number; animated?: boolean }) => void;
}

/**
 * Registry for scroll refs that tour steps can use to scroll to top.
 * Components register their ScrollView or FlatList refs here for the tour to access.
 */
const scrollRefs: Map<string, React.RefObject<Scrollable | null>> = new Map();

/**
 * Register a ScrollView, FlatList, or SectionList ref for a screen so the tour can scroll it.
 */
export function registerScrollViewRef(
  screenKey: string,
  ref: React.RefObject<ScrollView | FlatList | SectionList | null>
): void {
  scrollRefs.set(screenKey, ref as React.RefObject<Scrollable | null>);
}

/**
 * Unregister a scroll ref when a screen unmounts.
 */
export function unregisterScrollViewRef(screenKey: string): void {
  scrollRefs.delete(screenKey);
}

/**
 * Scroll a registered screen to the top.
 */
function scrollToTop(screenKey: string): Promise<void> {
  return new Promise((resolve) => {
    const ref = scrollRefs.get(screenKey);
    if (ref?.current) {
      log.debug(`Scrolling ${screenKey} to top`);
      // Handle FlatList (scrollToOffset) vs ScrollView (scrollTo)
      if (ref.current.scrollToOffset) {
        ref.current.scrollToOffset({ offset: 0, animated: false });
      } else if (ref.current.scrollTo) {
        ref.current.scrollTo({ y: 0, animated: false });
      }
      // Small delay to let the scroll complete
      setTimeout(resolve, 50);
    } else {
      log.debug(`No scroll ref for ${screenKey}, skipping scroll`);
      resolve();
    }
  });
}

/**
 * Navigate to a tab and optionally scroll to top.
 */
function navigateToTab(path: string, screenKey?: string): () => Promise<void> {
  return async () => {
    log.debug(`Navigating to ${path}`);
    router.push(path as '/(tabs)');
    // Wait for navigation to complete
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (screenKey) {
      await scrollToTop(screenKey);
    }
  };
}

/**
 * Step content definitions.
 * Each step has a title and description shown in the tooltip.
 */
const STEP_CONTENT = [
  // DASHBOARD_WELCOME (0)
  {
    title: 'Welcome to DND Book!',
    description:
      "This is your campaign dashboard. We've loaded a demo campaign based on Homer's Odyssey to help you learn the ropes.",
  },
  // DASHBOARD_CAMPAIGN_CARD (1)
  {
    title: 'Your Campaign',
    description:
      'This shows your current campaign. Tap to switch campaigns or create new ones. Long-press to set a campaign as current.',
  },
  // DASHBOARD_STATS (2)
  {
    title: 'Quick Stats',
    description:
      'See counts of your NPCs, locations, notes, and more at a glance. Tap any stat to jump to that section.',
  },
  // SESSIONS_TAB (3)
  {
    title: 'Session Logs',
    description:
      'This is where you capture what happens at the table. Create session logs to track events, decisions, and outcomes.',
  },
  // SESSION_DETAIL (4)
  {
    title: 'Session Details',
    description:
      "Open a session to see the full log. Notice the @mentions—they link to NPCs and locations you've referenced.",
  },
  // SESSION_MENTIONS (5)
  {
    title: 'The @Mention System',
    description:
      'Type @ to mention NPCs or locations. The app suggests existing entities or creates new "shadow" ones you can flesh out later.',
  },
  // NPCS_TAB (6)
  {
    title: 'NPCs',
    description:
      "All your characters live here. Search, filter by tags, and tap any NPC to see their full profile and connections.",
  },
  // NPC_CARD (7)
  {
    title: 'NPC Cards',
    description:
      'Each card shows key info: name, role, and tags. Tap to view details, edit, or see linked locations and notes.',
  },
  // LOCATIONS_TAB (8)
  {
    title: 'Locations',
    description:
      'Locations are hierarchical—Planes contain Realms, which contain Locales, and so on. Explore the Odyssey journey!',
  },
  // TAGS_USAGE (9)
  {
    title: 'Tags Connect Everything',
    description:
      'Use tags like #hostile, #ally, or #grudge to track themes and consequences across sessions. They\'re the glue of your campaign.',
  },
  // TOUR_COMPLETE (10)
  {
    title: "You're Ready!",
    description:
      'Explore the demo data, or clear it and start your own campaign. You can restart this tour anytime from Settings.',
  },
];

/**
 * Before hooks for each step to handle navigation and scrolling.
 * Maps step index to a function that runs before the step is shown.
 */
const STEP_BEFORE_HOOKS: Record<number, () => Promise<void> | void> = {
  // Dashboard steps - scroll to top
  [TOUR_STEP.DASHBOARD_WELCOME]: () => scrollToTop('dashboard'),
  [TOUR_STEP.DASHBOARD_CAMPAIGN_CARD]: () => scrollToTop('dashboard'),
  [TOUR_STEP.DASHBOARD_STATS]: () => scrollToTop('dashboard'),

  // Sessions tab - navigate there first
  [TOUR_STEP.SESSIONS_TAB]: navigateToTab('/(tabs)/sessions', 'sessions'),

  // Session detail - navigate to the first session
  [TOUR_STEP.SESSION_DETAIL]: async () => {
    log.debug('Navigating to session detail for tour');
    // This will be handled by the sessions screen which should navigate to the first session
    // when the tour reaches this step. For now, just ensure we're on sessions tab.
    await navigateToTab('/(tabs)/sessions', 'sessions')();
  },

  // NPCs tab
  [TOUR_STEP.NPCS_TAB]: navigateToTab('/(tabs)/npcs', 'npcs'),

  // Locations tab
  [TOUR_STEP.LOCATIONS_TAB]: navigateToTab('/(tabs)/locations', 'locations'),

  // Tags - navigate to tags screen
  [TOUR_STEP.TAGS_USAGE]: navigateToTab('/tags'),
};

/**
 * Creates the tour steps array for SpotlightTourProvider.
 *
 * @param onComplete - Callback when tour is completed
 * @returns Array of TourStep objects
 */
export function createTourSteps(onComplete: () => void): TourStep[] {
  const totalSteps = STEP_CONTENT.length;

  return STEP_CONTENT.map((content, index) => ({
    before: STEP_BEFORE_HOOKS[index],
    render: ({ next, previous, stop }) => (
      <TourTooltip
        title={content.title}
        description={content.description}
        currentStep={index + 1}
        totalSteps={totalSteps}
        onNext={() => {
          if (index === totalSteps - 1) {
            stop();
            onComplete();
          } else {
            next();
          }
        }}
        onPrevious={previous}
        onStop={() => {
          stop();
          onComplete();
        }}
        isFirst={index === 0}
        isLast={index === totalSteps - 1}
      />
    ),
  }));
}

/**
 * Get the step index for a given step ID.
 * Useful for programmatic navigation.
 */
export function getStepIndex(stepId: keyof typeof TOUR_STEP): number {
  return TOUR_STEP[stepId];
}
