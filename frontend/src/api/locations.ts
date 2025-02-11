import { pb } from "./base";
import { ensureAuth } from "./utils";
import type { LocationsResponse } from "../types/pocketbase-types";

/**
 * Fetch all locations and group them by type.
 */
export const fetchLocations = async (authToken: string): Promise<Record<string, LocationsResponse[]>> => {
  ensureAuth(authToken);
  if (import.meta.env.DEV) console.log("📍 Fetching all locations...");

  try {
    const locations = await pb.collection("locations").getFullList<LocationsResponse>({
      sort: "type,name",
      requestKey: null, // Prevent auto-cancellation
    });

    if (import.meta.env.DEV) console.log("✅ API Response (Locations):", locations);

    // Group locations by type
    const groupedLocations: Record<string, LocationsResponse[]> = locations.reduce((acc, location) => {
      if (!acc[location.type]) acc[location.type] = [];
      acc[location.type].push(location);
      return acc;
    }, {} as Record<string, LocationsResponse[]>);

    return groupedLocations;
  } catch (error: any) {
    console.error("❌ Failed to fetch locations:", error.message);
    throw new Error(error.message || "Failed to load locations.");
  }
};

/**
 * Fetch a single location along with its parent.
 */
export const fetchLocationWithParents = async (authToken: string, locationId: string): Promise<LocationsResponse> => {
  ensureAuth(authToken);
  if (!locationId) throw new Error("❌ Location ID is required.");

  if (import.meta.env.DEV) console.log(`📍 Fetching location with ID: ${locationId}`);

  try {
    const location = await pb.collection("locations").getOne<LocationsResponse>(locationId, {
      expand: "parent",
      requestKey: null,
    });

    if (import.meta.env.DEV) console.log("✅ Fetched Location Data:", location);

    return location;
  } catch (error: any) {
    console.error(`❌ Failed to fetch location (ID: ${locationId}):`, error.message);
    throw new Error(error.message || "Failed to load location.");
  }
};

/**
 * Fetch full ancestry of a location.
 */
export const fetchLocationAncestry = async (authToken: string, locationId: string): Promise<LocationsResponse[]> => {
  ensureAuth(authToken);
  if (!locationId) throw new Error("❌ Location ID is required.");

  if (import.meta.env.DEV) console.log(`🔄 Fetching ancestry for location: ${locationId}`);

  let ancestry: LocationsResponse[] = [];
  let currentLocationId: string | null = locationId;

  try {
    while (currentLocationId) {
      const location = await pb.collection("locations").getOne<LocationsResponse & { expand?: { parent?: LocationsResponse } }>(
        currentLocationId,
        {
          expand: "parent",
          requestKey: null,
        }
      );

      if (!location) break;

      ancestry.unshift(location);

      // ✅ **Explicitly define expand.parent type**
      const expandedParent: LocationsResponse | null = location.expand?.parent ?? null;
      currentLocationId = expandedParent?.id || null;
    }

    if (import.meta.env.DEV) console.log("✅ Full location ancestry:", ancestry);
    return ancestry;
  } catch (error: any) {
    console.error(`❌ Error fetching location ancestry (ID: ${locationId}):`, error.message);
    throw new Error(error.message || "Failed to fetch location ancestry.");
  }
};

/**
 * Create or update a location.
 */
export const saveOrUpdateLocation = async (authToken: string, locationData: Partial<LocationsResponse>): Promise<LocationsResponse> => {
  ensureAuth(authToken);
  if (!locationData || typeof locationData !== "object") throw new Error("❌ Location data is required.");

  if (import.meta.env.DEV) console.log(`💾 ${locationData.id ? "Updating" : "Creating"} location...`);

  try {
    const response: LocationsResponse = locationData.id
      ? await pb.collection("locations").update<LocationsResponse>(locationData.id, locationData)
      : await pb.collection("locations").create<LocationsResponse>(locationData);

    if (import.meta.env.DEV) console.log("✅ Location saved successfully:", response);
    return response;
  } catch (error: any) {
    console.error(`❌ Error saving location (ID: ${locationData.id || "new"}):`, error.message);
    throw new Error(error.message || "Failed to save location.");
  }
};
