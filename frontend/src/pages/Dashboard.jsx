import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pb from "../api/base"; // Ensure PocketBase instance is imported
import { fetchNPCs } from "../api/npc";
import NpcCard from "../components/dashboard/NpcCard";
import AuthButton from "../components/auth/AuthButton";
import CollapsibleSection from "../components/ui/CollapsibleSection";

const Dashboard = () => {
  const [npcs, setNpcs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNpcs = async () => {
      try {
        console.log("PocketBase instance:", pb); // Debugging
        const authToken = pb.authStore.token;
        if (!authToken) {
          throw new Error("Authentication token is missing");
        }
        const npcData = await fetchNPCs(authToken);
        console.log("Fetched NPCs:", npcData); // Debug fetched data
        setNpcs(npcData.items || []);
      } catch (error) {
        console.error("Error fetching NPCs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNpcs();
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    navigate("/login");
  };

  return (
    <div className="dark:bg-gray-900 dark:text-white min-h-screen p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
        <AuthButton label="Logout" onClick={handleLogout} />
      </div>

      <CollapsibleSection title="NPCs" initialVisible={true}>
        {isLoading ? (
          <p>Loading NPCs...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {npcs.map((npc) => (
              <NpcCard key={npc.id} npc={npc} />
            ))}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
};

export default Dashboard;
