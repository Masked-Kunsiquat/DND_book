import React, { useEffect, useState } from "react";
import { fetchRelatedItems } from "../api/tags";

const TagModal = ({ tagId, onClose }) => {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const loadRelatedItems = async () => {
      try {
        const items = await fetchRelatedItems(tagId, authToken);
        setRelatedItems(items);
      } catch (err) {
        setError("Failed to fetch related items. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedItems();
  }, [tagId, authToken]);

  if (loading) return <div>Loading related items...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      tabIndex="-1"
    >
      <div className="relative bg-white rounded-lg shadow-md w-full max-w-2xl p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          X
        </button>
        <h2 id="modal-title" className="text-xl font-bold mb-4">Related Items</h2>
        {relatedItems.length === 0 ? (
          <p>No related items found.</p>
        ) : (
          <ul className="space-y-2">
            {relatedItems.map((item) => (
              <li
                key={item.id}
                className="p-3 bg-gray-100 rounded-lg shadow-sm"
              >
                <p>
                  <strong>{item.related_name}</strong> ({item.related_type})
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TagModal;
