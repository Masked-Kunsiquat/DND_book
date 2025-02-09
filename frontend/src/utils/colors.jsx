// utils/colors.js

/**
 * Predefined Tailwind CSS classes for tag colors.
 */
export const tagColors = [
  "bg-blue-100 text-blue-800",
  "bg-gray-100 text-gray-800",
  "bg-red-100 text-red-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-indigo-100 text-indigo-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
];

/**
 * Cache for previously computed tag colors.
 */
const tagColorCache = new Map();

/**
 * Retrieves a consistent color for a given tag ID.
 * @param {string} tagId - The unique identifier for the tag.
 * @returns {string} - Corresponding Tailwind CSS color class.
 * @throws {Error} If tagId is not provided.
 */
export const getTagColor = (tagId) => {
  if (!tagId) {
    throw new Error("tagId is required");
  }

  if (tagColorCache.has(tagId)) {
    return tagColorCache.get(tagId);
  }

  const index = tagId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % tagColors.length;
  
  const color = tagColors[index];
  tagColorCache.set(tagId, color);
  return color;
};