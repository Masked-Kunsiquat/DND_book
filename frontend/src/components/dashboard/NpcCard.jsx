import React from "react";
import { useNavigate } from "react-router-dom";
import placeholderAvatar from "../../img/placeholder-avatar.png";

const NpcCard = ({ npc }) => {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  console.log("NpcCard received NPC:", npc); // Debug NPC data
  console.log("Base URL in NpcCard:", baseUrl); // Debug baseUrl

  const handleCardClick = () => {
    navigate(`/npcs/${npc.id}`);
  };

  const imageUrl = npc?.image
    ? `${baseUrl}/api/files/${npc.collectionId}/${npc.id}/${npc.image}`
    : placeholderAvatar;

  return (
    <div
      className="max-w-sm bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
      onClick={handleCardClick}
    >
      <img
        src={imageUrl}
        alt={npc?.name || "NPC"}
        className="rounded-t-lg h-48 w-full object-cover"
      />
      <div className="p-4">
        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {npc?.name || "Unnamed NPC"}
        </h5>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {npc?.role || "Unknown Role"}
        </p>
      </div>
    </div>
  );
};

export default NpcCard;
