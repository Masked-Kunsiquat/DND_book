/**
 * Expo-friendly shim for `isomorphic-webcrypto/src/react-native`.
 * lib0 expects an object with `ensureSecure`, `subtle`, and `getRandomValues`.
 */

import * as Crypto from 'expo-crypto';
import type { IntBasedTypedArray, UintBasedTypedArray } from 'expo-modules-core';

type WebCryptoLike = {
  ensureSecure: () => void;
  getRandomValues: <T extends IntBasedTypedArray | UintBasedTypedArray>(array: T) => T;
  subtle?: unknown;
};

const webcrypto: WebCryptoLike = {
  ensureSecure: () => {
    // No-op for native; Expo provides secure randomness via expo-crypto.
  },
  getRandomValues: <T extends IntBasedTypedArray | UintBasedTypedArray>(array: T) => {
    Crypto.getRandomValues(array);
    return array;
  },
  subtle: undefined,
};

export default webcrypto;
