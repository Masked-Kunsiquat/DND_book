import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import { fetchLocationWithParents } from "../api/locations";
import mapPlaceholder from "../img/placeholder-map.png";
import LocationModal from "../components/LocationModal";

const LocationDetail = () => {
  const { locationId } = useParams();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        console.log("🔄 Fetching location...");
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Authentication required. Please log in.");
          return;
        }

        const data = await fetchLocationWithParents(authToken, locationId);
        
        if (isMounted) {
          setLocation(data);
          setError("");
          console.log("✅ Fetched Location Data:", data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch location:", err);
        if (isMounted) {
          setError("Failed to load location. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
      console.log("🧹 Cleanup executed.");
    };
  }, [locationId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-900 dark:text-white">Loading location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const mapUrl = location.map
    ? `${baseUrl}/api/files/${location.collectionId}/${location.id}/${location.map}`
    : mapPlaceholder;
  console.log("MAP URL:", mapUrl);

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <Breadcrumbs locationId={locationId} />

      {/* Location Info */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mt-4 text-gray-900 dark:text-white">{location.name}</h1>
        <p className="text-gray-700 dark:text-gray-300">
          {location.description || "No description available for this location."}
        </p>

        {/* Display Map */}
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Map</h2>
          <img
            src={mapUrl}
            alt={`${location.name} map`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = mapPlaceholder;
            }}
            className="h-auto w-full max-w-md rounded-lg shadow-lg mx-auto"
          />
        </div>


        <div className="mt-4">
          <button
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-500 focus:outline-none"
            onClick={() => setIsLocationModalOpen(true)}
          >
            Edit Location
          </button>
        </div>
      </div>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <LocationModal
          location={location}
          onClose={() => setIsLocationModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LocationDetail;
