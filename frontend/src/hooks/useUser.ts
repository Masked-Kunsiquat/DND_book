import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../api/base";
import type { UsersResponse } from "../types/pocketbase-types";

/**
 * Custom hook to fetch and manage authenticated user data.
 */
export function useUser() {
  const [user, setUser] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authRecord = pb.authStore.record as unknown as UsersResponse | null; // ✅ Forced cast

    if (!authRecord?.id) {
      setLoading(false);
      navigate("/login");
      return;
    }

    setUser(authRecord);
    setLoading(false);
  }, [navigate]);

  return { user, setUser, loading, error, setError };
}
