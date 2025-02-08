import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchNoteDetails } from "../api/notes";
import RelatedItemsModal from "../components/RelatedItemsModal";
import NoteModal from "../components/NoteModal";
import { Button, Spinner, Alert, Card } from "flowbite-react";

const NoteDetail = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [isRelatedItemsModalOpen, setIsRelatedItemsModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const navigate = useNavigate();
  const effectRan = useRef(false);

  const refreshNotes = async () => {
    try {
      console.log("🔄 Refreshing note details...");
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setError("Please log in to refresh note details.");
        return;
      }
      const noteData = await fetchNoteDetails(noteId, authToken);
      setNote(noteData);
      console.log("✅ Note details refreshed:", noteData);
    } catch (err) {
      setError("Failed to refresh the note.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    console.log("🔄 Initializing NoteDetail component...");
    refreshNotes();
  }, [noteId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="lg" />
        <p className="text-gray-500 mt-4">Loading note details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Alert color="failure">{error}</Alert>
      </div>
    );

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Back and Edit Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          color="blue"
          onClick={() => navigate(-1)}
          className="hover:opacity-90 transition-opacity"
        >
          &larr; Back
        </Button>
        <Button
          color="blue"
          onClick={() => setIsNoteModalOpen(true)}
          className="hover:opacity-90 transition-opacity"
        >
          ✏️ Edit Note
        </Button>
      </div>

      {/* Note Card */}
      <Card className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {note?.title || "Untitled"}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mt-4">
          {note?.content || "No content available."}
        </p>

        {/* Locations Section */}
        {note?.expand?.locations?.length > 0 && (
          <div className="mb-4">
            <strong>Locations:</strong>
            <ul className="list-disc ml-6">
              {note.expand.locations.map((location) => (
                <li key={location.id}>
                  <Link
                    to={`/locations/${location.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags Section */}
        {note?.expand?.tags?.length > 0 && (
          <div className="mb-4">
            <strong>Tags:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {note.expand.tags.map((tag) => (
                <Button
                  key={tag.id}
                  size="xs"
                  color="gray"
                  onClick={() => {
                    setSelectedTagId(tag.id);
                    setIsRelatedItemsModalOpen(true);
                  }}
                  className="text-xs"
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Related Items Modal */}
      {isRelatedItemsModalOpen && (
        <RelatedItemsModal
          tagId={selectedTagId}
          onClose={() => setIsRelatedItemsModalOpen(false)}
        />
      )}

      {/* Note Editing Modal */}
      {isNoteModalOpen && (
        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          note={note}
          refreshNotes={refreshNotes}
        />
      )}
    </div>
  );
};

export default NoteDetail;
