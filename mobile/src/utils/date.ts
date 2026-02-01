/**
 * Shared date utilities for consistent date handling across the app.
 *
 * These utilities provide safe parsing, formatting, and sorting of dates
 * with sensible fallbacks for invalid or missing values.
 */

/**
 * Safely parses a date string into a Date object.
 *
 * @param value - A date string parseable by Date constructor (e.g., ISO-8601)
 * @returns The parsed Date, or null if value is falsy or invalid
 *
 * @example
 * parseDate('2024-01-15') // => Date object
 * parseDate('invalid') // => null
 * parseDate('') // => null
 */
export function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a date string for display using locale-specific formatting.
 *
 * @param value - A date string parseable by Date constructor
 * @param fallback - Text to return if date is invalid (default: 'Unknown')
 * @returns Locale-formatted date string, or fallback if invalid
 *
 * @example
 * formatDisplayDate('2024-01-15') // => "Jan 15, 2024" (varies by locale)
 * formatDisplayDate('') // => "Unknown"
 * formatDisplayDate('', 'No date') // => "No date"
 */
export function formatDisplayDate(value?: string, fallback = 'Unknown'): string {
  const parsed = parseDate(value);
  if (!parsed) return fallback;
  return parsed.toLocaleDateString();
}

/**
 * Formats a date string with short month, day, and year.
 *
 * @param value - A date string parseable by Date constructor
 * @param fallback - Text to return if date is invalid (default: 'Unknown date')
 * @returns Formatted date like "Jan 15, 2024", or fallback if invalid
 *
 * @example
 * formatShortDate('2024-01-15T12:00:00Z') // => "Jan 15, 2024"
 */
export function formatShortDate(value?: string, fallback = 'Unknown date'): string {
  const parsed = parseDate(value);
  if (!parsed) return fallback;
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date string as both date and time using locale-specific formatting.
 *
 * @param value - A date string parseable by Date constructor
 * @param fallback - Text to return if date is invalid (default: 'Unknown')
 * @returns Locale-formatted date and time string, or fallback if invalid
 *
 * @example
 * formatDateTime('2024-01-15T14:30:00Z') // => "1/15/2024, 2:30:00 PM" (varies by locale)
 */
export function formatDateTime(value?: string, fallback = 'Unknown'): string {
  const parsed = parseDate(value);
  if (!parsed) return fallback;
  return parsed.toLocaleString();
}

/**
 * Formats a Date object as a calendar date string in YYYY-MM-DD format.
 * Useful for date inputs and storage.
 *
 * @param date - The Date object to format
 * @returns The formatted date string in YYYY-MM-DD form
 *
 * @example
 * formatDateInput(new Date(2024, 0, 15)) // => "2024-01-15"
 */
export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD.
 *
 * @returns Today's date in YYYY-MM-DD format
 *
 * @example
 * getTodayDateInput() // => "2024-01-15" (current date)
 */
export function getTodayDateInput(): string {
  return formatDateInput(new Date());
}

/**
 * Safely parses a date string and returns its timestamp.
 * Returns 0 for invalid or missing dates (useful for sorting).
 *
 * @param value - A date string parseable by Date constructor
 * @returns The timestamp in milliseconds, or 0 if invalid
 *
 * @example
 * safeDateTimestamp('2024-01-15') // => 1705276800000
 * safeDateTimestamp('invalid') // => 0
 */
export function safeDateTimestamp(value?: string): number {
  const time = Date.parse(value || '');
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Comparator function for sorting items by a date field (newest first).
 *
 * @param dateExtractor - Function to extract the date string from an item
 * @returns A comparator function for use with Array.sort()
 *
 * @example
 * const sessions = [...logs].sort(sortByDateDesc((s) => s.date));
 */
export function sortByDateDesc<T>(
  dateExtractor: (item: T) => string | undefined
): (a: T, b: T) => number {
  return (a, b) => {
    const aTime = safeDateTimestamp(dateExtractor(a));
    const bTime = safeDateTimestamp(dateExtractor(b));
    return bTime - aTime;
  };
}

/**
 * Comparator function for sorting items by a date field (oldest first).
 *
 * @param dateExtractor - Function to extract the date string from an item
 * @returns A comparator function for use with Array.sort()
 *
 * @example
 * const sessions = [...logs].sort(sortByDateAsc((s) => s.date));
 */
export function sortByDateAsc<T>(
  dateExtractor: (item: T) => string | undefined
): (a: T, b: T) => number {
  return (a, b) => {
    const aTime = safeDateTimestamp(dateExtractor(a));
    const bTime = safeDateTimestamp(dateExtractor(b));
    return aTime - bTime;
  };
}
