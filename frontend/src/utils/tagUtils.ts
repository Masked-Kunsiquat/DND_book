// utils/tagUtils.ts

// Map of raw tag types to display-friendly names
const tagTypeMapping: Record<string, string> = {
  note: "Note",
  session_log: "Session Log",
  location: "Location",
  npc: "NPC",
};

/**
 * Returns a display-friendly name for a tag type.
 */
export const getTagDisplayName = (rawType: string): string => {
  return tagTypeMapping[rawType] || rawType; // Fallback to rawType if no mapping exists
};
