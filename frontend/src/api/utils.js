import { pb } from "./base";

export const ensureAuth = (authToken) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }

  if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
    pb.authStore.save(authToken, null);
  }
};
