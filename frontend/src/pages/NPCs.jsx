import React, { useEffect, useState, useRef } from "react";
import { fetchNPCs } from "../api/npc";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Avatar } from "flowbite-react"; // Import Avatar component
import RelatedItemsModal from "../components/RelatedItemsModal";
import { getTagColor } from "../utils/colors";
import placeholderAvatar from "../img/placeholder-avatar.png"; // Import placeholder image

const NPCs = () => {
  const [npcs, setNPCs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [isRelatedItemsModalOpen, setIsRelatedItemsModalOpen] = useState(false);
  const navigate = useNavigate();
  const effectRan = useRef(false);

  const openRelatedItemsModal = (tagId) => {
    setSelectedTagId(tagId);
    setIsRelatedItemsModalOpen(true);
  };

  const closeRelatedItemsModal = () => {
    setSelectedTagId(null);
    setIsRelatedItemsModalOpen(false);
  };

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const loadNPCs = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Please log in to view NPCs.");
          navigate("/login");
          return;
        }

        const npcsData = await fetchNPCs(authToken, { requestKey: null });

        if (npcsData?.items && Array.isArray(npcsData.items)) {
          setNPCs([...npcsData.items]); // Use npcsData.items instead of npcsData
        } else {
          setError("Invalid response format from API.");
        }
      } catch (err) {
        setError("Failed to load NPCs.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNPCs();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-900 dark:text-white">Loading NPCs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        NPCs
      </h1>
      <div className="grid grid-cols-[auto-fit] sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {npcs.map((npc) => (
          <Card
            key={npc.id}
            className="max-w-sm cursor-pointer"
            onClick={() => navigate(`/npcs/${npc.id}`)}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <Avatar
                img={
                  npc.image
                    ? `${import.meta.env.VITE_API_BASE_URL}/api/files/${npc.collectionId}/${npc.id}/${npc.image}`
                    : placeholderAvatar
                }
                size="lg"
                rounded
                bordered
                className="w-16 h-16 object-cover"
              />
              <div>
                <h5 className="text-xl font-bold text-gray-900 dark:text-white">
                  {npc.name || "Unnamed NPC"}
                </h5>
                <p className="text-gray-700 dark:text-gray-400">
                  {npc.role || "Unknown Role"} - {npc.race || "Unknown Race"}
                </p>
              </div>
            </div>

            {/* Tags */}
            {npc.expand?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {npc.expand.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className={`cursor-pointer ${getTagColor(tag.id)}`} // Dynamically apply colors
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent Card click from triggering
                      openRelatedItemsModal(tag.id);
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Related Items Modal */}
      {isRelatedItemsModalOpen && (
        <RelatedItemsModal
          tagId={selectedTagId}
          onClose={closeRelatedItemsModal}
        />
      )}
    </div>
  );
};

export default NPCs;
