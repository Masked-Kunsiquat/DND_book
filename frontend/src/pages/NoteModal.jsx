import React, { useState } from "react";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { getTagColor } from "../utils/colors";

export const NoteModal = ({ note, onClose }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  if (!note) return null;

  const handleSave = () => {
    // Add logic to save the note here
    console.log("Saving note...", { title, content });
    onClose(); // Close the modal after saving
  };

  return (
    <Modal show={true} size="md" onClose={onClose} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {note.title ? "Edit Note" : "Add Note"}
          </h3>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="title" className="text-gray-900 dark:text-white" value="Title" />
            </div>
            <TextInput
              id="title"
              placeholder="Enter note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="content" className="text-gray-900 dark:text-white" value="Content" />
            </div>
            <TextInput
              id="content"
              placeholder="Enter note content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          {/* Locations */}
          {note.expand?.locations?.length > 0 && (
            <div>
              <strong className="text-gray-900 dark:text-white">Locations:</strong>
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
              <strong className="text-gray-900 dark:text-white">Tags:</strong>
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
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave} className="mr-2">
          Save
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
