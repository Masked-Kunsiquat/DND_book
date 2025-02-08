import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Textarea } from "flowbite-react";
import pb from "../api/base";

const NoteModal = ({ isOpen, onClose, note, refreshNotes }) => {
  const isEditing = Boolean(note);
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  const handleSubmit = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication required.");

      const data = { title, content };

      if (isEditing) {
        await pb.collection("notes").update(note.id, data);
      } else {
        await pb.collection("notes").create(data);
      }

      refreshNotes(); // Refresh the notes list after modification
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>{isEditing ? "Edit Note" : "Add Note"}</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <TextInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label="Content"
            value={content}
            rows={5}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit} color="blue">
          {isEditing ? "Save Changes" : "Create Note"}
        </Button>
        <Button onClick={onClose} color="gray">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NoteModal;
