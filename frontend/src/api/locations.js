import { pb } from "./base";
import { ensureAuth } from "./utils"; // Utility function for auth validation

/**
 * Fetch all locations and group them by type.
 */
export const fetchLocations = async (authToken) => {
  ensureAuth(authToken);
  if (import.meta.env.DEV) console.log("📍 Fetching all locations...");

  try {
    const locations = await pb.collection("locations").getFullList({
      sort: "type,name",
      requestKey: null, // Prevent auto-cancellation
    });

    if (import.meta.env.DEV) console.log("✅ API Response (Locations):", locations);

    const groupedLocations = locations.reduce((acc, location) => {
      if (!acc[location.type]) acc[location.type] = [];
      acc[location.type].push(location);
      return acc;
    }, {});

    return groupedLocations;
  } catch (error) {
    console.error("❌ Failed to fetch locations:", error.message);
    throw new Error(error.message || "Failed to load locations.");
  }
};

/**
 * Fetch a single location along with its parent.
 */
export const fetchLocationWithParents = async (authToken, locationId) => {
  ensureAuth(authToken);
  if (!locationId) throw new Error("❌ Location ID is required.");

  if (import.meta.env.DEV) console.log(`📍 Fetching location with ID: ${locationId}`);

  try {
    const location = await pb.collection("locations").getOne(locationId, {
      expand: "parent",
      requestKey: null,
    });

    if (import.meta.env.DEV) console.log("✅ Fetched Location Data:", location);

    return location;
  } catch (error) {
    console.error(`❌ Failed to fetch location (ID: ${locationId}):`, error.message);
    throw new Error(error.message || "Failed to load location.");
  }
};

/**
 * Fetch full ancestry of a location.
 */
export const fetchLocationAncestry = async (authToken, locationId) => {
  ensureAuth(authToken);
  if (!locationId) throw new Error("❌ Location ID is required.");

  if (import.meta.env.DEV) console.log(`🔄 Fetching ancestry for location: ${locationId}`);

  let ancestry = [];
  let currentLocationId = locationId;

  try {
    while (currentLocationId) {
      const location = await pb.collection("locations").getOne(currentLocationId, {
        expand: "parent",
        requestKey: null,
      });

      if (!location) break;

      ancestry.unshift(location);
      currentLocationId = location.expand?.parent?.id || null;
    }

    if (import.meta.env.DEV) console.log("✅ Full location ancestry:", ancestry);
    return ancestry;
  } catch (error) {
    console.error(`❌ Error fetching location ancestry (ID: ${locationId}):`, error.message);
    throw new Error(error.message || "Failed to fetch location ancestry.");
  }
};

/**
 * Create or update a location.
 */
export const saveOrUpdateLocation = async (authToken, locationData) => {
  ensureAuth(authToken);
  if (!locationData || typeof locationData !== "object") throw new Error("❌ Location data is required.");

  if (import.meta.env.DEV) console.log(`💾 ${locationData.id ? "Updating" : "Creating"} location...`);

  try {
    const response = locationData.id
      ? await pb.collection("locations").update(locationData.id, locationData)
      : await pb.collection("locations").create(locationData);

    if (import.meta.env.DEV) console.log("✅ Location saved successfully:", response);
    return response;
  } catch (error) {
    console.error(`❌ Error saving location (ID: ${locationData.id || "new"}):`, error.message);
    throw new Error(error.message || "Failed to save location.");
  }
};
