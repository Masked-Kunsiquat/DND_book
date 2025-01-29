import React, { useEffect, useState } from "react";
import { fetchNotes } from "../api/api";
import { useNavigate } from "react-router-dom";
import { getTagColor } from "../utils/colors"; // Import the color utility

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const notesData = await fetchNotes(authToken);
        setNotes(notesData);
      } catch (err) {
        setError("Failed to load notes. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const openModal = (note) => setSelectedNote(note);
  const closeModal = () => setSelectedNote(null);

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      closeModal();
    }
  };

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
      <div className="grid grid-cols-[auto-fit] sm:grid-cols-2 lg:grid-cols-3 gap-8">
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

              {/* Tags Display in the Card */}
              {note.expand?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.expand.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-sm ${getTagColor(
                        tag.id
                      )}`} // Apply dynamic colors
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => openModal(note)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
              >
                Read more
                <svg
                  className="w-3.5 h-3.5 ml-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedNote && (
        <div
          id="modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleOutsideClick}
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
        >
          <div className="relative bg-white rounded-lg shadow-md w-full max-w-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 dark:border-gray-600">
              <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedNote.title}
              </h3>
              <button
                onClick={closeModal}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                aria-label="Close modal"
              >
                <svg
                  className="w-3 h-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-5 space-y-4">
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {selectedNote.content}
              </p>

              {/* Locations */}
              {selectedNote.expand?.locations?.length > 0 && (
                <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  <strong>Locations:</strong>
                  {selectedNote.expand.locations.map((location) => (
                    <span key={location.id} className="block">
                      <button
                        onClick={() => navigate(`/locations/${location.id}`)}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {location.name}
                      </button>
                    </span>
                  ))}
                </p>
              )}

              {/* Tags Display in Modal */}
              {selectedNote.expand?.tags?.length > 0 && (
                <div>
                  <strong>Tags:</strong>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.expand.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-sm ${getTagColor(
                          tag.id
                        )}`} // Apply dynamic colors
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={closeModal}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
