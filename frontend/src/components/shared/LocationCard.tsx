import { Card } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import type { LocationsResponse } from "../../types/pocketbase-types";
import iconMap from "../../utils/iconMap";

interface LocationCardProps {
  type: string;
  locations: LocationsResponse[];
}

/**
 * Reusable LocationCard component.
 */
export function LocationCard({ type, locations }: LocationCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md">
      <div className="flex items-center gap-4">
        <img src={iconMap[type as keyof typeof iconMap] || iconMap.default} 
             alt={type} 
             className="w-8 h-8" />
        <h2 className="text-xl font-bold">{type}</h2>
      </div>
      <ul className="mt-2">
        {locations.map((loc) => (
          <li key={loc.id} className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
              onClick={() => navigate(`/locations/${loc.id}`)}>
            {loc.name}
          </li>
        ))}
      </ul>
    </Card>
  );
}
