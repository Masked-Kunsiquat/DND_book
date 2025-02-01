import React, { useState, useEffect } from "react";
import { fetchRelatedItems } from "../api/tags"; // Import the modular API function

export const RelatedItemsModal = ({ tagId, onClose }) => {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRelatedItems = async () => {
      try {
        setLoading(true);
        setError("");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          throw new Error("No authentication token found.");
        }

        const items = await fetchRelatedItems(tagId, authToken); // Use the modular API function
        setRelatedItems(items);
      } catch (err) {
        console.error("Error fetching related items:", err.message);
        setError("Failed to load related items.");
      } finally {
        setLoading(false);
      }
    };

    if (tagId) {
      loadRelatedItems();
    }
  }, [tagId]);

  if (!tagId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">Related Items</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="p-4">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : relatedItems.length > 0 ? (
            <ul>
              {relatedItems.map((item) => (
                <li key={item.related_id}>
                  {item.related_name} ({item.related_type})
                </li>
              ))}
            </ul>
          ) : (
            <p>No related items found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatedItemsModal;
