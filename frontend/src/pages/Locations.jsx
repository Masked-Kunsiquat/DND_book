import React, { useEffect, useState, useRef } from "react";
import { fetchLocations } from "../api/locations";
import { useNavigate } from "react-router-dom";
import iconMap from "../utils/iconMap";
import { Spinner } from "flowbite-react";

const Locations = () => {
  const [groupedLocations, setGroupedLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const loadLocations = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Please log in to view locations.");
          navigate("/login");
          return;
        }

        console.log("📡 Fetching locations...");
        const locationsData = await fetchLocations(authToken, { requestKey: null });

        if (typeof locationsData === "object" && locationsData !== null) {
          console.log("✅ Setting groupedLocations state:", locationsData);
          setGroupedLocations(locationsData);
        } else {
          setError("Invalid response format from API.");
          console.error("Expected an object but got:", locationsData);
        }
      } catch (err) {
        setError("Failed to load locations. Please try again.");
        console.error("❌ Error in loadLocations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, [navigate]);

  const containerClasses = "flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900";

  if (loading) {
    return (
      <div className={containerClasses}>
        <Spinner aria-label="Loading locations" color="blue" size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Locations</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.keys(groupedLocations).map((type) => (
          <div
            key={type}
            className="max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center mb-2">
                <img
                  src={iconMap[type] || iconMap.default}
                  alt={`${type} icon`}
                  className="w-8 h-8 mr-3"
                />
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {type}
                </h5>
              </div>
              <ul className="space-y-1">
                {groupedLocations[type].map((location) => (
                  <li key={location.id}>
                    <button
                      onClick={() => navigate(`/locations/${location.id}`)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {location.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Locations;

// ... existing code...
