import React from "react";
import { getTagColor } from "../utils/colors";

export const NoteCard = ({ note, onOpenNote, onTagClick }) => {
  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          {note.title}
        </h5>
        <p className="mb-3 font-normal text-gray-700">
          {note.content.substring(0, 100)}...
        </p>

        {note.expand?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {note.expand.tags.map((tag) => (
              <span
                key={tag.id}
                className={`cursor-pointer text-xs font-medium px-2.5 py-0.5 rounded-sm ${getTagColor(
                  tag.id
                )}`}
                onClick={() => onTagClick(tag.id)}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => onOpenNote(note)}
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
  );
};
