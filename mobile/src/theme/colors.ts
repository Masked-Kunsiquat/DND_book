/**
 * Centralized color palette for DND Book.
 * Based on Tailwind CSS color palette for consistency with web app.
 */

// Gray scale (Tailwind gray)
export const gray = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
} as const;

// Primary colors (blue)
export const primary = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
} as const;

// Secondary colors (indigo)
export const secondary = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
} as const;

// Success colors (emerald)
export const success = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
} as const;

// Warning colors (amber)
export const warning = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
} as const;

// Error/Danger colors (red)
export const error = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
} as const;

// Purple
export const purple = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',
  700: '#7c3aed',
  800: '#6b21a8',
  900: '#581c87',
} as const;

// Pink
export const pink = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899',
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
} as const;

// Yellow
export const yellow = {
  50: '#fefce8',
  100: '#fef9c3',
  200: '#fef08a',
  300: '#fde047',
  400: '#facc15',
  500: '#eab308',
  600: '#ca8a04',
  700: '#a16207',
  800: '#854d0e',
  900: '#713f12',
} as const;

// Green
export const green = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
} as const;

// Tag color definitions (matching web app)
export const tagColors = [
  { bg: primary[100], text: primary[800], name: 'blue' },
  { bg: gray[100], text: gray[800], name: 'gray' },
  { bg: error[100], text: error[800], name: 'red' },
  { bg: green[100], text: green[800], name: 'green' },
  { bg: yellow[100], text: yellow[800], name: 'yellow' },
  { bg: secondary[100], text: secondary[800], name: 'indigo' },
  { bg: purple[100], text: purple[800], name: 'purple' },
  { bg: pink[100], text: pink[800], name: 'pink' },
] as const;

const tagColorCache = new Map<string, (typeof tagColors)[number]>();

/**
 * Returns a consistent color object for a given tag ID.
 */
export function getTagColor(tagId: string): (typeof tagColors)[number] {
  if (!tagId) {
    return tagColors[0];
  }

  if (tagColorCache.has(tagId)) {
    return tagColorCache.get(tagId)!;
  }

  const index =
    tagId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % tagColors.length;

  const color = tagColors[index];
  tagColorCache.set(tagId, color);
  return color;
}
