import React, { useEffect, useState, useRef } from "react";
import { fetchNotes } from "../api/notes";
import { getTagColor } from "../utils/colors";
import { useNavigate } from "react-router-dom";
import RelatedItemsModal from "../components/RelatedItemsModal";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [isRelatedItemsModalOpen, setIsRelatedItemsModalOpen] = useState(false);
  const navigate = useNavigate();
  const effectRan = useRef(false); // Prevent double execution

  const openRelatedItemsModal = (tagId) => {
    setSelectedTagId(tagId);
    setIsRelatedItemsModalOpen(true);
  };

  const closeRelatedItemsModal = () => {
    setSelectedTagId(null);
    setIsRelatedItemsModalOpen(false);
  };

  useEffect(() => {
    if (effectRan.current) return; // Prevent running twice in Strict Mode
    effectRan.current = true;

    console.log("🔄 useEffect triggered: Loading notes...");

    const loadNotes = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Please log in to view notes.");
          navigate("/login");
          return;
        }

        console.log("📡 Fetching notes...");
        const notesData = await fetchNotes(authToken, { requestKey: null });

        if (Array.isArray(notesData)) {
          console.log("✅ Setting notes state:", notesData);
          setNotes([...notesData]);
        } else {
          setError("Invalid response format from API.");
          console.error("Expected an array but got:", notesData);
        }
      } catch (err) {
        setError("Failed to load notes.");
        console.error("❌ Error in loadNotes:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [navigate]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg">Loading notes...</p>
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
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Notes</h1>
      <div className="grid grid-cols-[auto-fit] sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                {note.title}
              </h5>
              <p className="mb-3 font-normal text-gray-700">
                {note.content.substring(0, 100)}...
              </p>

              {/* Tags */}
              {note.expand?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.expand.tags.map((tag) => (
                    <button
                      key={tag.id}
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-sm ${getTagColor(
                        tag.id
                      )}`}
                      onClick={() => openRelatedItemsModal(tag.id)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate(`/notes/${note.id}`)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
              >
                Read more
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Related Items Modal */}
      {isRelatedItemsModalOpen && (
        <RelatedItemsModal
          tagId={selectedTagId}
          onClose={closeRelatedItemsModal}
        />
      )}
    </div>
  );
};

export default Notes;
