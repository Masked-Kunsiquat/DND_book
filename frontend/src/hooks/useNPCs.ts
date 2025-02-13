import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNPCs } from "../api/npc";
import { pb } from "../api/base";
import type { NpcsResponse } from "../types/pocketbase-types";

/**
 * Custom hook for fetching and managing NPCs.
 */
export function useNPCs() {
  const [npcs, setNpcs] = useState<NpcsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNPCs = async () => {
      try {
        const authToken = pb.authStore.token;
        if (!authToken) {
          setError("Please log in to view NPCs.");
          navigate("/login");
          return;
        }

        const { items } = await fetchNPCs(authToken);
        setNpcs(items || []); // Ensure it's always an array
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNPCs();
  }, [navigate]);

  return { npcs, loading, error };
}
