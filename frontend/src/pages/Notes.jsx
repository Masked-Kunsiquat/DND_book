import React, { useEffect, useState, useRef } from "react";
import { fetchNotes } from "../api/notes";
import { useNavigate } from "react-router-dom";
import { Card, Badge } from "flowbite-react"; // Import Flowbite-React components
import RelatedItemsModal from "../components/RelatedItemsModal";
import { getTagColor } from "../utils/colors"; // Your existing utility function

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [isRelatedItemsModalOpen, setIsRelatedItemsModalOpen] = useState(false);
  const navigate = useNavigate();
  const effectRan = useRef(false);

  const openRelatedItemsModal = (tagId) => {
    setSelectedTagId(tagId);
    setIsRelatedItemsModalOpen(true);
  };

  const closeRelatedItemsModal = () => {
    setSelectedTagId(null);
    setIsRelatedItemsModalOpen(false);
  };

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const loadNotes = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Please log in to view notes.");
          navigate("/login");
          return;
        }

        const notesData = await fetchNotes(authToken, { requestKey: null });
        if (Array.isArray(notesData)) {
          setNotes([...notesData]);
        } else {
          setError("Invalid response format from API.");
        }
      } catch (err) {
        setError("Failed to load notes.");
        console.error(err);
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
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Your Notes
      </h1>
      <div className="grid grid-cols-[auto-fit] sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="max-w-sm"
            onClick={() => navigate(`/notes/${note.id}`)}
          >
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {note.title}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {note.content.substring(0, 100)}...
            </p>

            {/* Tags */}
            {note.expand?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {note.expand.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className={`cursor-pointer ${getTagColor(tag.id)}`} // Dynamically apply colors
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent Card click from triggering
                      openRelatedItemsModal(tag.id);
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
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
