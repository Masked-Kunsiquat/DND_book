import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLocations } from "../api/locations";
import { pb } from "../api/base";
import type { LocationsResponse } from "../types/pocketbase-types";

/**
 * Custom hook for fetching and managing locations.
 */
export function useLocations() {
  const [locations, setLocations] = useState<Record<string, LocationsResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const authToken = pb.authStore.token;
        if (!authToken) {
          setError("Please log in to view locations.");
          navigate("/login");
          return;
        }

        const locationsData = await fetchLocations(authToken);
        console.log("✅ Grouped Locations Data:", locationsData);
        setLocations(locationsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, [navigate]);

  return { locations, loading, error };
}
