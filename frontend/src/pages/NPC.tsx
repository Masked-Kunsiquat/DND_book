import { useNPCs } from "../hooks/useNPCs";
import NPCCard from "../components/NPCs/NPCCard";
import { Loader } from "../components/shared/Loader";
import { ErrorMessage } from "../components/shared/ErrorMessage";

export function NPCsPage() {
  const { npcs, loading, error } = useNPCs();

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Non-Player Characters</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {npcs.map((npc) => (
          <NPCCard key={npc.id} npc={npc} />
        ))}
      </div>
    </div>
  );
}

export default NPCsPage;
