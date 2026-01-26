import { useLocationDetail } from "../hooks/useLocationDetail";
import { Loader } from "../components/shared/Loader";
import { ErrorMessage } from "../components/shared/ErrorMessage";
import { useNavigate, Link } from "react-router-dom";
import { Card, Button } from "flowbite-react";
import { useState } from "react";
import { MapModal } from "../components/shared/MapModal";

export function LocationDetail() {
  const { location, loading, error } = useLocationDetail();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  // ✅ Ensure PocketBase URL is defined
  const pocketBaseUrl = import.meta.env.VITE_POCKETBASE_URL || "http://localhost:8090";
  const mapUrl = location?.map
    ? `${pocketBaseUrl}/api/files/locations/${location.id}/${location.map}`
    : null;

  console.log("Map URL:", mapUrl);

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
      <Card className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{location?.name}</h1>
        <p className="text-gray-700 dark:text-gray-400 mt-2">
          {location?.description && location.description.trim() !== ""
            ? location.description
            : location?.background && location.background.trim() !== ""
            ? location.background
            : "No description available."}
        </p>

        {/* ✅ Display the Map if Available */}
        {mapUrl ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Map</h2>
            <div className="flex justify-center">
              <img 
                src={mapUrl} 
                alt={`Map of ${location.name}`} 
                className="w-80 h-80 rounded-lg shadow-md object-cover cursor-pointer"
                onClick={() => setIsOpen(true)}
              />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-gray-500 dark:text-gray-400">No map available.</p>
        )}

        {/* ✅ Imported Modal Component for Enlarged Map */}
        <MapModal isOpen={isOpen} onClose={() => setIsOpen(false)} mapUrl={mapUrl} locationName={location.name} />

        {/* ✅ Parent Location Section */}
        {location?.expand?.parent && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Parent Location</h2>
            <Link
              to={`/locations/${location.expand.parent.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 p-1"
            >
              {location.expand.parent.name}
            </Link>
          </div>
        )}

        <Button onClick={() => navigate("/locations")} color="blue" className="mt-4">
          Back to Locations
        </Button>
      </Card>
    </div>
  );
}

export default LocationDetail;