import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spinner, Alert, Card, Avatar } from "flowbite-react";
import { fetchNPCDetails } from "../api/npc";
import placeholderAvatar from "../img/placeholder-avatar.png";
import NPCModal from "../components/NPCModal"; // Import the EditNPCModal component

const NPCDetail = () => {
  const { npcId } = useParams();
  const navigate = useNavigate();
  const [npc, setNPC] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal state

  useEffect(() => {
    let isMounted = true;

    const fetchNPC = async () => {
      try {
        console.log("🔄 Fetching NPC...");
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Authentication required. Please log in.");
          return;
        }

        const data = await fetchNPCDetails(npcId, authToken);

        if (isMounted) {
          setNPC(data);
          setError("");
          console.log("✅ Fetched NPC Data:", data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch NPC:", err);
        if (isMounted) {
          setError("Failed to load NPC. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNPC();

    return () => {
      isMounted = false;
      console.log("🧹 Cleanup executed.");
    };
  }, [npcId]);

  const handleSaveNPC = (updatedNPC) => {
    console.log("✅ Updated NPC:", updatedNPC);
    setNPC(updatedNPC); // Update the NPC in state
    setIsEditModalOpen(false); // Close the modal
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Alert color="failure">{error}</Alert>
      </div>
    );
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const imageUrl = npc.image
    ? `${baseUrl}/api/files/${npc.collectionId}/${npc.id}/${npc.image}`
    : placeholderAvatar;

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Back Button */}
      <Button
        color="blue"
        onClick={() => navigate(-1)}
        className="mb-4 hover:opacity-90 transition-opacity"
      >
        &larr; Back
      </Button>

      <Card className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <Avatar
            img={imageUrl}
            size="xl"
            rounded
            bordered
            className="w-32 h-32 md:w-48 md:h-48 object-cover"
          />

          {/* NPC Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{npc.name}</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              {npc.background || "No background information available."}
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              <strong>Role:</strong> {npc.role || "Unknown"}
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              <strong>Race:</strong> {npc.race || "Unknown"}
            </p>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-6 text-right">
          <Button
            color="blue"
            onClick={() => setIsEditModalOpen(true)}
            className="hover:opacity-90 transition-opacity"
          >
            Edit NPC
          </Button>
        </div>
      </Card>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <NPCModal
          npc={npc}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveNPC}
        />
      )}
    </div>
  );
};

export default NPCDetail;
