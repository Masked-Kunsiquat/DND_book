import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import { fetchLocationWithParents } from "../api/locations";
import map from "../img/placeholder-map.png";

const LocationDetail = () => {
  const { locationId } = useParams();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Track component mount status

    const fetchLocation = async () => {
      try {
        console.log("🔄 Fetching location...");
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Authentication required. Please log in.");
          return;
        }

        const data = await fetchLocationWithParents(authToken, locationId, { requestKey: null }); // Prevent auto-cancellation
        
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
      isMounted = false; // Cleanup on component unmount
      console.log("🧹 Cleanup executed.");
    };
  }, [locationId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M100 50.59C100 78.2 77.61 100.59 50 100.59S0 78.2 0 50.59 22.39 0.59 50 0.59s50 22.39 50 50ZM9.08 50.59C9.08 73.19 27.4 91.51 50 91.51c22.6 0 40.92-18.32 40.92-40.92 0-22.6-18.32-40.92-40.92-40.92C27.4 9.67 9.08 27.99 9.08 50.59Z" />
            <path d="M93.97 39.04c2.42-.64 3.89-3.13 3.04-5.49C95.29 28.82 92.87 24.37 89.82 20.35 85.85 15.12 80.88 10.72 75.21 7.41 69.54 4.1 63.28 1.94 56.77 1.05 51.77.37 46.7.45 41.73 1.28c-2.47.42-3.91 2.93-3.27 5.36.64 2.42 3.13 3.88 5.54 3.52 3.8-.56 7.67-.57 11.49.05 5.32.73 10.45 2.5 15.1 5.21 4.65 2.71 8.72 6.3 11.97 10.58 2.33 3.07 4.2 6.44 5.59 9.93.9 2.34 3.35 3.71 5.76 3.13Z" />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL; // PocketBase URL
  const mapUrl =
    location.map && `${baseUrl}/files/${location.collectionId}/${location.id}/${location.map}`;

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <Breadcrumbs locationId={locationId} />

      {/* Location Info */}
      <h1 className="text-3xl font-bold mt-4">{location.name}</h1>
      <p className="text-gray-700">
        {location.description || "No description available for this location."}
      </p>

      {/* Display Map */}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Map</h2>
        <img
          src={mapUrl || map}
          alt={`${location.name} map`}
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = map; // Fallback to placeholder
          }}
          className="h-auto max-w-sm rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default LocationDetail;
