/**
 * ID generation utilities.
 * Uses expo-crypto for React Native compatibility.
 */

import * as Crypto from 'expo-crypto';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generates a random ID using expo-crypto.
 * URL-safe, similar to nanoid output.
 */
function randomId(length: number): string {
  const bytes = Crypto.getRandomBytes(length);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return id;
}

/**
 * Generates a unique ID for records.
 */
export function generateId(): string {
  return randomId(21);
}

/**
 * Generates a device ID for P2P identification.
 */
export function generateDeviceId(): string {
  return randomId(21);
}

/**
 * Returns the current ISO timestamp.
 */
export function now(): string {
  return new Date().toISOString();
}
