import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchNoteDetails } from "../api/notes";
import { getTagColor } from "../utils/colors"; // For dynamic tag colors
import RelatedItemsModal from "../components/RelatedItemsModal"; // Related Items Modal

const NoteDetail = () => {
  const { noteId } = useParams(); // Get the note ID from the URL
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTagId, setSelectedTagId] = useState(null); // Track selected tag
  const [isRelatedItemsModalOpen, setIsRelatedItemsModalOpen] = useState(false); // Modal state
  const navigate = useNavigate();

  const openRelatedItemsModal = (tagId) => {
    setSelectedTagId(tagId);
    setIsRelatedItemsModalOpen(true);
  };

  const closeRelatedItemsModal = () => {
    setSelectedTagId(null);
    setIsRelatedItemsModalOpen(false);
  };

  useEffect(() => {
    const loadNote = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Please log in to view note details.");
          navigate("/login");
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg">Loading note...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)} // Go back to the previous page
        className="text-blue-600 hover:underline mb-4"
      >
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
      <p className="text-gray-700 mb-4">{note.content}</p>

      {/* 🔥 Fixed Location Links */}
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

      {/* Tags */}
      {note.expand?.tags?.length > 0 && (
        <div className="mb-4">
          <strong>Tags:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {note.expand.tags.map((tag) => (
              <button
                key={tag.id}
                className={`text-xs font-medium px-2.5 py-0.5 rounded-sm ${getTagColor(
                  tag.id
                )}`}
                onClick={() => openRelatedItemsModal(tag.id)} // Open modal for the tag
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related Items Modal */}
      {isRelatedItemsModalOpen && (
        <RelatedItemsModal
          tagId={selectedTagId} // Pass the selected tag ID
          onClose={closeRelatedItemsModal} // Close modal callback
        />
      )}
    </div>
  );
};

export default NoteDetail;
