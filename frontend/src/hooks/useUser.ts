import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../api/base";
import type { UsersResponse } from "../types/pocketbase-types";

/**
 * Custom hook to fetch and manage authenticated user data.
 */
export function useUser() {
  const [user, setUser] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const authRecord = pb.authStore.record as unknown as UsersResponse | null;

      if (!authRecord?.id) {
        throw new Error("User is not authenticated.");
      }

      setUser(authRecord);
    } catch (err: any) {
      console.error("❌ Error accessing auth record:", err);
      setError(err.message || "Failed to retrieve user data.");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return { user, setUser, loading, error, setError };
}
