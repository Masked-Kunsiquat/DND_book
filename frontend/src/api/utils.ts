import { pb } from "./base";

/**
 * Ensures the user is authenticated with a valid auth token.
 * If the token isn't valid, it saves a new one in PocketBase's auth store.
 */
export const ensureAuth = (authToken: string): void => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }

  if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
    pb.authStore.save(authToken, null);
  }
};
