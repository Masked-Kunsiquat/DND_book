import React, { useState } from "react";
import { Button, Label, Modal, TextInput, Spinner, Alert } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { updateNPC } from "../api/npc"; // Import the API function

const NPCModal = ({ npc, onClose, onSave }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(npc?.name || "");
  const [role, setRole] = useState(npc?.role || "");
  const [race, setRace] = useState(npc?.race || "");
  const [background, setBackground] = useState(npc?.background || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!npc) return null;

  const handleSave = async () => {
    setLoading(true);
    setError("");

    const updatedNPC = { ...npc, name, role, race, background };

    try {
      console.log("💾 Saving NPC to database...", updatedNPC);
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setError("Authentication required. Please log in.");
        return;
      }

      // Send update request to API
      const savedNPC = await updateNPC(authToken, npc.id, updatedNPC);
      console.log("✅ NPC Saved Successfully:", savedNPC);

      if (onSave) {
        onSave(savedNPC);
      }

      onClose(); // Close modal after saving
    } catch (err) {
      console.error("❌ Failed to update NPC:", err);
      setError("Failed to update NPC. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={true} size="md" onClose={onClose} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {npc.name ? "Edit NPC" : "Add NPC"}
          </h3>

          {error && <Alert color="failure">{error}</Alert>}

          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" className="text-gray-900 dark:text-white" value="Name" />
            </div>
            <TextInput
              id="name"
              placeholder="Enter NPC name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="role" className="text-gray-900 dark:text-white" value="Role" />
            </div>
            <TextInput
              id="role"
              placeholder="Enter NPC role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="race" className="text-gray-900 dark:text-white" value="Race" />
            </div>
            <TextInput
              id="race"
              placeholder="Enter NPC race"
              value={race}
              onChange={(e) => setRace(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="background"
                className="text-gray-900 dark:text-white"
                value="Background"
              />
            </div>
            <TextInput
              id="background"
              placeholder="Enter NPC background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave} className="mr-2" disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Save"}
        </Button>
        <Button color="gray" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NPCModal;
