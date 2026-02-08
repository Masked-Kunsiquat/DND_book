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
 * Seed session ID for tour navigation.
 * This is the demo session we navigate to during the tour.
 */
const SEED_SESSION_ID = 'session-cyclops-encounter';

/**
 * Helper to create a delay promise.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Before hooks for each step to handle navigation and scrolling.
 * Maps step index to a function that runs before the step is shown.
 */
const STEP_BEFORE_HOOKS: Record<number, () => Promise<void> | void> = {
  // Dashboard steps - ensure we're on dashboard and scrolled to top
  [TOUR_STEP.DASHBOARD_WELCOME]: async () => {
    log.debug('Before DASHBOARD_WELCOME');
    router.push('/(tabs)');
    await delay(300);
    await scrollToTop('dashboard');
  },
  [TOUR_STEP.DASHBOARD_CAMPAIGN_CARD]: () => scrollToTop('dashboard'),
  [TOUR_STEP.DASHBOARD_STATS]: () => scrollToTop('dashboard'),

  // Sessions tab - navigate there and scroll to top
  [TOUR_STEP.SESSIONS_TAB]: async () => {
    log.debug('Before SESSIONS_TAB');
    router.push('/(tabs)/sessions');
    await delay(300);
    await scrollToTop('sessions');
  },

  // Session detail - navigate to the seed session
  [TOUR_STEP.SESSION_DETAIL]: async () => {
    log.debug('Before SESSION_DETAIL - navigating to seed session');
    router.push(`/session/${SEED_SESSION_ID}`);
    await delay(400);
    await scrollToTop('session-detail');
  },

  // Session mentions - same screen, just ensure scrolled to show mentions section
  [TOUR_STEP.SESSION_MENTIONS]: () => scrollToTop('session-detail'),

  // NPCs tab - navigate and scroll to top
  [TOUR_STEP.NPCS_TAB]: async () => {
    log.debug('Before NPCS_TAB');
    router.push('/(tabs)/npcs');
    await delay(300);
    await scrollToTop('npcs');
  },

  // NPC card - same screen, scroll to top to show first card
  [TOUR_STEP.NPC_CARD]: () => scrollToTop('npcs'),

  // Locations tab - navigate and scroll to top
  [TOUR_STEP.LOCATIONS_TAB]: async () => {
    log.debug('Before LOCATIONS_TAB');
    router.push('/(tabs)/locations');
    await delay(300);
    await scrollToTop('locations');
  },

  // Tags screen - navigate there
  [TOUR_STEP.TAGS_USAGE]: async () => {
    log.debug('Before TAGS_USAGE');
    router.push('/tags');
    await delay(300);
    await scrollToTop('tags');
  },

  // Tour complete - navigate back to dashboard
  [TOUR_STEP.TOUR_COMPLETE]: async () => {
    log.debug('Before TOUR_COMPLETE - returning to dashboard');
    router.push('/(tabs)');
    await delay(300);
    await scrollToTop('dashboard');
  },
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
