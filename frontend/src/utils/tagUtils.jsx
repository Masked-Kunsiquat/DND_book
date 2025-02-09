// utils/tagUtils.js

/**
 * Maps raw tag types to user-friendly display names.
 */
export const tagTypeMapping = {
  note: "Note",
  session_log: "Session Log",
  location: "Location",
  npc: "NPC",
};

/**
 * Retrieves a user-friendly display name for a given tag type.
 * @param {string} rawType - The raw tag type.
 * @returns {string} - The user-friendly name of the tag type.
 */
export const getTagDisplayName = (rawType) => tagTypeMapping[rawType] || rawType;
