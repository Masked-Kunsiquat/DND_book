import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLocationWithParents } from "../api/locations";
import { pb } from "../api/base";
import type { LocationsResponse } from "../types/pocketbase-types";

/**
 * Custom hook for fetching a single location with its parent data.
 */
export function useLocationDetail() {
  const { locationId } = useParams();
  const [location, setLocation] = useState<LocationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const authToken = pb.authStore.token;
        if (!authToken) {
          setError("Please log in to view location details.");
          navigate("/login");
          return;
        }

        if (!locationId) {
          setError("Invalid location ID.");
          return;
        }

        const locationData = await fetchLocationWithParents(authToken, locationId);
        setLocation(locationData);
      } catch (err: any) {
        setError(err.message || "Failed to load location.");
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, [navigate, locationId]);

  return { location, loading, error };
}
