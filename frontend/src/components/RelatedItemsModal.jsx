import React, { useState, useEffect } from "react";
import { fetchRelatedItems } from "../api/tags";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Spinner, Alert } from "flowbite-react";
import { getTagDisplayName } from "../utils/tagUtils"; // Import the utility function

const RelatedItemsModal = ({ tagId, onClose }) => {
  const [openModal, setOpenModal] = useState(!!tagId); // Control modal state
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!tagId) return;

    setOpenModal(true); // Ensure modal opens when tagId is set
    let isMounted = true;

    const loadRelatedItems = async () => {
      try {
        setLoading(true);
        setError("");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Please log in to view related items.");
          navigate("/login");
          return;
        }

        const items = await fetchRelatedItems(tagId, authToken, { requestKey: null });

        if (isMounted) {
          setRelatedItems(items);
        }
      } catch (err) {
        if (isMounted) setError("Failed to load related items. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRelatedItems();

    return () => {
      isMounted = false;
    };
  }, [tagId, navigate]);

  const handleNavigate = (item) => {
    const routes = {
      note: `/notes/${item.related_id}`,
      location: `/locations/${item.related_id}`,
      session_log: `/session_logs/${item.related_id}`,
    };

    const targetRoute = routes[item.related_type];
    if (targetRoute) {
      navigate(targetRoute);
      setOpenModal(false); // Close modal on navigation
    }
  };

  return (
    <Modal dismissible show={openModal} size="sm" onClose={() => { setOpenModal(false); onClose(); }}>
      <Modal.Header>Related Items</Modal.Header>
      <Modal.Body>
        <div className="text-center">
          {loading ? (
            <Spinner size="lg" />
          ) : error ? (
            <Alert color="failure">{error}</Alert>
          ) : relatedItems.length > 0 ? (
            <ul className="space-y-2 text-left">
              {relatedItems.map((item) => (
                <li key={item.related_id}>
                  <Button 
                    color="blue" 
                    className="w-full text-left" 
                    onClick={() => handleNavigate(item)}
                  >
                    {item.related_name} ({getTagDisplayName(item.related_type)}) {/* Use the mapping utility */}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No related items found.</p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={() => { setOpenModal(false); onClose(); }}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RelatedItemsModal;
