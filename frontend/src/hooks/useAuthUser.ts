import { useEffect, useState } from "react";
import { pb } from "../api/base";
import type { UsersResponse } from "../types/pocketbase-types";

/**
 * Custom hook to retrieve the authenticated user from PocketBase.
 * Ensures state is managed properly across re-renders.
 */
export function useAuthUser() {
  const [user, setUser] = useState<UsersResponse | null>(null);

  useEffect(() => {
    const authUser = pb.authStore.record as UsersResponse | null;
    setUser(authUser || null);
  }, []);

  return user;
}
