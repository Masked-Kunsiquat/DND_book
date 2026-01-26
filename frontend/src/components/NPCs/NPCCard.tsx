import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "flowbite-react";
import type { NpcsResponse } from "../../types/pocketbase-types";

interface NPCCardProps {
  npc: NpcsResponse;
}

const NPCCard: React.FC<NPCCardProps> = ({ npc }) => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-sm cursor-pointer" onClick={() => navigate(`/npcs/${npc.id}`)}>
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {npc.name}
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        {npc.background ?? "No background available."}
      </p>
    </Card>
  );
};

export default NPCCard;
