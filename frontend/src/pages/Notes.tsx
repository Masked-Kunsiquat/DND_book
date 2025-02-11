import { useNotes } from "../hooks/useNotes";
import NoteCard from "../components/shared/NoteCard";
import { Loader } from "../components/shared/Loader"; // Import Loader
import { ErrorMessage } from "../components/shared/ErrorMessage"; // Import ErrorMessage

export function Notes() {
  const { notes, loading, error } = useNotes();

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

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
