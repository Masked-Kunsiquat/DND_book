/**
 * Types for the onboarding tour system.
 */

/**
 * Tour step identifiers for AttachStep components.
 * These map to indices in the tour steps array.
 */
export const TOUR_STEP = {
  // Dashboard
  DASHBOARD_WELCOME: 0,
  DASHBOARD_CAMPAIGN_CARD: 1,
  DASHBOARD_STATS: 2,

  // Sessions
  SESSIONS_TAB: 3,
  SESSION_DETAIL: 4,
  SESSION_MENTIONS: 5,

  // NPCs
  NPCS_TAB: 6,
  NPC_CARD: 7,

  // Locations
  LOCATIONS_TAB: 8,

  // Tags
  TAGS_USAGE: 9,

  // Wrap-up
  TOUR_COMPLETE: 10,
} as const;

export type TourStepId = (typeof TOUR_STEP)[keyof typeof TOUR_STEP];

/**
 * Tour state stored in the app.
 */
export interface TourState {
  /** Whether the tour has been completed */
  completed: boolean;
  /** Whether the tour is currently active */
  active: boolean;
  /** Current step index */
  currentStep: number;
}
