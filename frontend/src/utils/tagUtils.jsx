// utils/tagUtils.js

// Map of raw tag types to display-friendly names
export const tagTypeMapping = {
    note: "Note",
    session_log: "Session Log",
    location: "Location",
    npcs: "NPC"
  };
  
  // Utility function to get the display name for a tag type
  export const getTagDisplayName = (rawType) => {
    return tagTypeMapping[rawType] || rawType; // Fallback to rawType if no mapping exists
  };
  