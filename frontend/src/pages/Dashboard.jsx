import React, { useState, useEffect } from "react";
import pb from "../api/base";
import { fetchNpcs } from "../api/npc";
import { Card } from "flowbite-react";

const Dashboard = () => {
  const [npcs, setNpcs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNpcSectionVisible, setNpcSectionVisible] = useState(true); // Collapsible state

  const handleLogout = async () => {
    try {
      pb.authStore.clear();
      alert("Logged out successfully!");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Something went wrong while logging out. Please try again.");
    }
  };

  useEffect(() => {
    const loadNpcs = async () => {
      try {
        const authToken = pb.authStore.token;
        const npcData = await fetchNpcs(authToken, 1, 10); // Fetch first 10 NPCs
        setNpcs(npcData.items);
      } catch (error) {
        console.error("Error loading NPCs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNpcs();
  }, []);

  return (
    <div className="dark:bg-gray-900 dark:text-white min-h-screen p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Logout
        </button>
      </div>

      {/* NPC Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">NPCs</h2>
          <button
            onClick={() => setNpcSectionVisible((prev) => !prev)}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            {isNpcSectionVisible ? "Hide" : "Show"}
          </button>
        </div>

        {isNpcSectionVisible && (
          <div>
            {isLoading ? (
              <p>Loading NPCs...</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {npcs.map((npc) => (
                  <Card key={npc.id} className="max-w-sm dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex flex-col items-center pb-6">
                      <img
                        src={npc.image ? pb.files.getUrl(npc, npc.image) : "/placeholder-avatar.jpg"}
                        alt={npc.name || "NPC"}
                        className="mb-4 h-24 w-24 rounded-full shadow-lg"
                      />
                      <h5 className="text-lg font-medium dark:text-white">
                        {npc.name || "Unnamed NPC"}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {npc.role || "Unknown Role"}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
