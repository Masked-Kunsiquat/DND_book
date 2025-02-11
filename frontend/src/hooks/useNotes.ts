import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNotes } from "../api/notes";
import { pb } from "../api/base";
import type { NotesResponse } from "../types/pocketbase-types";

/**
 * Custom hook for fetching and managing notes.
 */
export function useNotes() {
  const [notes, setNotes] = useState<NotesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const authToken = pb.authStore.token;
        if (!authToken) {
          setError("Please log in to view notes.");
          navigate("/login");
          return;
        }

        const { items } = await fetchNotes(authToken); // Extract the `items` array
        setNotes(items || []); // Ensure it's always an array
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [navigate]);

  return { notes, loading, error };
}
