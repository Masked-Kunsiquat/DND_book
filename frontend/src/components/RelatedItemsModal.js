import React, { useState, useEffect } from "react";
import { fetchRelatedItems } from "../api/tags"; // Use the modular API function
import { useNavigate } from "react-router-dom"; // For navigation

export const RelatedItemsModal = ({ tagId, onClose }) => {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!tagId) return;

    let isMounted = true; // Prevent state updates if component unmounts

    const loadRelatedItems = async () => {
      try {
        console.log("🔄 Fetching related items for tag:", tagId);
        setLoading(true);
        setError("");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Please log in to view related items.");
          navigate("/login");
          return;
        }

        const items = await fetchRelatedItems(tagId, authToken, { requestKey: null }); // Prevent auto-cancellation

        if (isMounted) {
          console.log("✅ Fetched Related Items:", items);
          setRelatedItems(items);
        }
      } catch (err) {
        console.error("❌ Error fetching related items:", err);
        if (isMounted) setError("Failed to load related items. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRelatedItems();

    return () => {
      isMounted = false; // Cleanup function
      console.log("🧹 Cleanup executed for RelatedItemsModal.");
    };
  }, [tagId, navigate]);

  if (!tagId) return null;

  const handleNavigate = (item) => {
    const routes = {
      note: `/notes/${item.related_id}`,
      location: `/locations/${item.related_id}`,
      session_log: `/session_logs/${item.related_id}`,
    };

    const targetRoute = routes[item.related_type];
    if (targetRoute) {
      console.log("🔗 Navigating to:", targetRoute);
      navigate(targetRoute);
    } else {
      console.error(`❌ No route found for type: ${item.related_type}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">Related Items</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 focus:outline-none text-lg"
          >
            &times;
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : relatedItems.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
              {relatedItems.map((item) => (
                <li key={item.related_id}>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleNavigate(item)}
                  >
                    {item.related_name} ({item.related_type})
                  </button>
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
