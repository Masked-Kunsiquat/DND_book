import { Card } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import type { LocationsResponse } from "../../types/pocketbase-types";
import iconMap from "../../utils/iconMap";

interface LocationCardProps {
  type: string;
  locations: LocationsResponse[];
}

/**
 * Reusable LocationCard component with improved formatting and accessibility.
 */
export function LocationCard({ type, locations }: LocationCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md flex flex-col items-center text-center">
      {/* Type with icon */}
      <div className="flex flex-col items-center mb-3">
        <img 
          src={iconMap[type as keyof typeof iconMap] || iconMap.default} 
          alt={type} 
          className="w-12 h-12 mb-2"
        />
        <h2 className="text-lg font-semibold tracking-wide uppercase">{type}</h2>
      </div>

      {/* Locations List */}
      <ul className="w-full">
        {locations.map((loc) => (
          <li key={loc.id} className="mb-2">
            <button
              className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 p-1"
              onClick={() => navigate(`/locations/${loc.id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/locations/${loc.id}`)}
              aria-label={`View details for ${loc.name}`}
            >
              {loc.name}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
