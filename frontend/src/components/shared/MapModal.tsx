"use client";

import { Modal } from "flowbite-react";

export function MapModal({ isOpen, onClose, mapUrl, locationName }) {
  return (
    <Modal dismissible show={isOpen} onClose={onClose}>
      <Modal.Header className="text-center text-lg font-semibold">Map of {locationName}</Modal.Header>
      <Modal.Body>
        <div className="space-y-6 flex justify-center">
          {mapUrl ? (
            <img
              src={mapUrl}
              alt={`Enlarged Map of ${locationName}`}
              className="w-full max-h-screen object-contain rounded-lg shadow-md"
            />
          ) : (
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">No map available.</p>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default MapModal;
