import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchNoteDetails } from "../api/notes";
import RelatedItemsModal from "../components/RelatedItemsModal";
import { Button, Spinner, Alert, Card } from "flowbite-react";

const NoteDetail = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [isRelatedItemsModalOpen, setIsRelatedItemsModalOpen] = useState(false);
  const navigate = useNavigate();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;
  
    const loadNote = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Please log in to view note details.");
          navigate("/login", { replace: true });
          return;
        }
        const noteData = await fetchNoteDetails(noteId, authToken);
        setNote(noteData);
      } catch (err) {
        setError("Failed to load the note.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    if (noteId) {
      loadNote();
    }
  }, [noteId, navigate]);
  

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="lg" />
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
      {/* Back Button */}
      <Button
        color="blue"
        onClick={() => navigate(-1)}
        className="mb-4 hover:opacity-90 transition-opacity"
      >
        &larr; Back
      </Button>

      {/* Note Card */}
      <Card className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {note.title}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mt-4">{note.content}</p>

        {/* Locations Section */}
        {note.expand?.locations?.length > 0 && (
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
        {note.expand?.tags?.length > 0 && (
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
    </div>
  );
};

export default NoteDetail;
