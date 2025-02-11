export const tagColors: string[] = [
  "bg-blue-100 text-blue-800",
  "bg-gray-100 text-gray-800",
  "bg-red-100 text-red-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-indigo-100 text-indigo-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
];

const tagColorCache = new Map<string, string>();

/**
 * Returns a consistent color class for a given tag ID.
 */
export const getTagColor = (tagId: string): string => {
  if (!tagId) {
    throw new Error("tagId is required");
  }

  if (tagColorCache.has(tagId)) {
    return tagColorCache.get(tagId)!;
  }

  const index = tagId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % tagColors.length;

  const color = tagColors[index];
  tagColorCache.set(tagId, color);
  return color;
};
