import { Card, Button } from "flowbite-react";
import { useState } from "react";
import { NPCModal } from "./NPCModal";
import type { NpcsResponse } from "../../types/pocketbase-types";

interface Props {
  npc: NpcsResponse;
}

export function NPCItem({ npc }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <h3 className="text-lg font-semibold">{npc.name}</h3>
        <p className="text-sm text-gray-600">{npc?.background ?? "No description available"}</p>
        <Button onClick={() => setOpen(true)} color="blue" size="sm">
          View Details
        </Button>
      </Card>
      {open && <NPCModal npc={npc} onClose={() => setOpen(false)} />}
    </>
  );
}
