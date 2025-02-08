import { saveOrUpdateLocation } from "../api/locations";
import React, { useState } from "react";
import { Button, Label, Modal, TextInput, FileInput } from "flowbite-react";

const LocationModal = ({ location, onClose }) => {
  const [name, setName] = useState(location?.name || "");
  const [type, setType] = useState(location?.type || "");
  const [description, setDescription] = useState(location?.description || "");
  const [file, setFile] = useState(null);

  const handleSave = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("Authentication token missing");
      return;
    }

    // Construct location data properly
    const locationData = {
      name,
      type,
      description,
    };

    // Only add ID if editing an existing location
    if (location?.id) {
      locationData.id = location.id;
    }

    // Handle file upload
    if (file) {
      locationData.map = file;
    }

    try {
      const savedLocation = await saveOrUpdateLocation(authToken, locationData);
      console.log("✅ Location saved successfully:", savedLocation);
      onClose(); // Close the modal after saving
    } catch (err) {
      console.error("❌ Failed to save location:", err);
    }
  };

  return (
    <Modal show={true} size="md" onClose={onClose} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {location?.id ? "Edit Location" : "Add Location"}
          </h3>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Name" />
            </div>
            <TextInput
              id="name"
              placeholder="Enter location name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="type" value="Type" />
            </div>
            <TextInput
              id="type"
              placeholder="Enter location type (e.g., Plane, City)"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="description" value="Description" />
            </div>
            <TextInput
              id="description"
              placeholder="Enter location description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="file-upload" value="Upload Map (Optional)" />
            </div>
            <FileInput
              id="file-upload"
              helperText="SVG, PNG, JPG or GIF (MAX. 800x400px)."
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
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

export default LocationModal;
