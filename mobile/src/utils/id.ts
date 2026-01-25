/**
 * ID generation utilities.
 */

import { nanoid } from 'nanoid';

/**
 * Generates a unique ID for records.
 * Uses nanoid for URL-safe, unique identifiers.
 */
export function generateId(): string {
  return nanoid();
}

/**
 * Generates a device ID for P2P identification.
 * Longer than record IDs for better uniqueness across devices.
 */
export function generateDeviceId(): string {
  return nanoid(21);
}

/**
 * Returns the current ISO timestamp.
 */
export function now(): string {
  return new Date().toISOString();
}
