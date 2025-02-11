import { useEffect, useState } from "react";
import { pb } from "../api/base";
import type { UsersResponse } from "../types/pocketbase-types";

/**
 * Custom hook to manage the authenticated user state in PocketBase.
 * - Subscribes to auth store changes to stay in sync.
 * - Cleans up subscription on unmount.
 * - Ensures correct type handling.
 */
export function useAuthUser() {
  const [user, setUser] = useState<UsersResponse | null>(null);

  useEffect(() => {
    // Function to update user state when auth changes
    const updateUser = () => {
      const authUser = pb.authStore.model;
      setUser(authUser && "id" in authUser ? (authUser as UsersResponse) : null);
    };

    // Initialize user state
    updateUser();

    // Subscribe to auth store changes and return the cleanup function
    const unsubscribe = pb.authStore.onChange(updateUser);

    // Cleanup function to unsubscribe on unmount
    return unsubscribe;
  }, []);

  return user;
}
