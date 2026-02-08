/**
 * Tour step definitions for the onboarding experience.
 */

import React from 'react';
import type { TourStep } from 'react-native-spotlight-tour';
import { TourTooltip } from './TourTooltip';
import { TOUR_STEP } from './types';

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
 * Creates the tour steps array for SpotlightTourProvider.
 *
 * @param onComplete - Callback when tour is completed
 * @returns Array of TourStep objects
 */
export function createTourSteps(onComplete: () => void): TourStep[] {
  const totalSteps = STEP_CONTENT.length;

  return STEP_CONTENT.map((content, index) => ({
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
