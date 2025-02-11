import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Alert } from "flowbite-react";
import { fetchNotes } from "../api/notes";
import { pb } from "../api/base";
import type { NotesResponse } from "../types/pocketbase-types";
import NoteCard from "../components/shared/NoteCard"; // ✅ Import the extracted component

export function Notes() {
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

        const fetchedNotes = await fetchNotes(authToken);
        setNotes(fetchedNotes);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-900 dark:text-white">Loading notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Your Notes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}

export default Notes;
