import React, { useEffect, useState } from "react";
import { fetchLocations } from "../api/locations";
import { useNavigate } from "react-router-dom";

const Locations = () => {
  const [groupedLocations, setGroupedLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const locationsData = await fetchLocations(authToken);
        setGroupedLocations(locationsData);
      } catch (err) {
        setError("Failed to load locations. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg">Loading locations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Locations</h1>
      <div className="grid grid-cols-[auto-fit] sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.keys(groupedLocations).map((type) => (
          <div
            key={type}
            className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                {type}
              </h5>
              <ul className="space-y-1">
                {groupedLocations[type].map((location) => (
                  <li key={location.id}>
                    <button
                      onClick={() => navigate(`/locations/${location.id}`)}
                      className="text-blue-600 hover:underline"
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
