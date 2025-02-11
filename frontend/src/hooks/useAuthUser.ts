import { useEffect, useState } from "react";
import { pb } from "../api/base";
import type { UsersResponse } from "../types/pocketbase-types";

/**
 * Custom hook to manage the authenticated user state in PocketBase.
 * - Subscribes to auth store changes to stay in sync.
 * - Handles loading and errors.
 */
export function useAuthUser() {
  const [user, setUser] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const updateUser = () => {
      try {
        const authUser = pb.authStore.record;
        setUser(authUser && "id" in authUser ? (authUser as UsersResponse) : null);
      } catch (err: any) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    // Initialize user state
    updateUser();

    // Subscribe to auth store changes
    const unsubscribe = pb.authStore.onChange(updateUser);

    // Cleanup function to unsubscribe on unmount
    return unsubscribe;
  }, []);

  return { user, loading, error };
}
