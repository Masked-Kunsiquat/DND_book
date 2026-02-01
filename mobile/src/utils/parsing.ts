/**
 * Shared parsing utilities for TinyBase row data.
 *
 * TinyBase stores all values as strings, so arrays must be JSON-encoded.
 * These utilities provide safe parsing with sensible defaults.
 */

/**
 * Safely parses a JSON-encoded array string.
 *
 * @param value - JSON string expected to represent an array
 * @returns The parsed array, or an empty array if value is falsy, invalid JSON, or not an array
 *
 * @example
 * parseJsonArray('["a","b"]') // => ['a', 'b']
 * parseJsonArray('') // => []
 * parseJsonArray('not json') // => []
 * parseJsonArray(undefined) // => []
 */
export function parseJsonArray<T = string>(value?: string): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Safely stringifies an array for TinyBase storage.
 *
 * @param arr - Array to stringify (defaults to empty array if undefined)
 * @returns JSON string representation of the array
 *
 * @example
 * stringifyArray(['a', 'b']) // => '["a","b"]'
 * stringifyArray(undefined) // => '[]'
 */
export function stringifyArray<T>(arr?: T[]): string {
  return JSON.stringify(arr ?? []);
}
