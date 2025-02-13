import { useLocations } from "../hooks/useLocations";
import { LocationCard } from "../components/shared/LocationCard";
import { Loader } from "../components/shared/Loader"; // Import Loader
import { ErrorMessage } from "../components/shared/ErrorMessage"; // Import ErrorMessage

export function Locations() {
  const { locations, loading, error } = useLocations();

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Locations</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(locations).map(([type, locs]) => (
          <LocationCard key={type} type={type} locations={Array.isArray(locs) ? locs : []} />
        ))}
      </div>
    </div>
  );
}

export default Locations;
