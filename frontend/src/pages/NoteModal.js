import React from "react";
import { getTagColor } from "../utils/colors";
import { useNavigate } from "react-router-dom";

export const NoteModal = ({ note, onClose }) => {
  const navigate = useNavigate();

  if (!note) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-labelledby="note-modal-title"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-lg shadow-md w-full max-w-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 id="note-modal-title" className="text-xl font-semibold">
            {note.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
            aria-label="Close modal"
          >
            <svg
              className="w-4 h-4"
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
        <div className="p-4 space-y-4">
          <p className="text-base text-gray-700">{note.content}</p>

          {/* Locations */}
          {note.expand?.locations?.length > 0 && (
            <div>
              <strong>Locations:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {note.expand.locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => navigate(`/locations/${location.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {note.expand?.tags?.length > 0 && (
            <div>
              <strong>Tags:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {note.expand.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-sm ${getTagColor(
                      tag.id
                    )}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
