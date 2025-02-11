import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../api/base";
import type { UsersResponse } from "../types/pocketbase-types";

/**
 * Custom hook to manage authenticated user data.
 */
export function useUser() {
  const [user, setUser] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authRecord = pb.authStore.record;
    if (!authRecord) {
      navigate("/login");
      return;
    }

    // ✅ Ensure only necessary fields are included
    const typedUser: Partial<UsersResponse> = {
      id: authRecord.id,
      email: authRecord.email,
      emailVisibility: authRecord.emailVisibility ?? false,
      verified: authRecord.verified ?? false,
      name: authRecord.name ?? "Guest",
      avatar: authRecord.avatar ?? "",
      created: authRecord.created,
      updated: authRecord.updated,
    };

    setUser(typedUser as UsersResponse); // ✅ Explicitly cast to match the type
    setLoading(false);
  }, [navigate]);

  return { user, setUser, loading, error, setError };
}
