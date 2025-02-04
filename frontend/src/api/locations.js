import pb from "./base";

/**
 * Fetch all locations and group them by type.
 */
export const fetchLocations = async (authToken) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }

  console.log("📍 Fetching all locations...");

  // Ensure the token is valid, but don't overwrite if already set
  if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
    pb.authStore.save(authToken, null);
  }

  try {
    const locations = await pb.collection("locations").getFullList({
      sort: "type,name",
      requestKey: null, // Prevent auto-cancellation
    });

    console.log("✅ API Response (Locations):", locations);

    const groupedLocations = locations.reduce((acc, location) => {
      if (!acc[location.type]) acc[location.type] = [];
      acc[location.type].push(location);
      return acc;
    }, {});

    console.log("📌 Grouped Locations:", groupedLocations);
    return groupedLocations;
  } catch (err) {
    console.error("❌ Failed to fetch locations:", err);
    throw new Error("Failed to load locations. Please try again.");
  }
};

/**
 * Fetch a single location along with its parent.
 */
export const fetchLocationWithParents = async (authToken, locationId) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }
  if (!locationId) {
    throw new Error("❌ Location ID is required.");
  }

  console.log("📍 Fetching location with ID:", locationId);

  // Ensure the token is valid, but don't overwrite if already set
  if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
    pb.authStore.save(authToken, null);
  }

  try {
    const location = await pb.collection("locations").getOne(locationId, {
      expand: "parent",
      requestKey: null, // Prevent auto-cancellation
    });

    if (!location) {
      throw new Error("❌ Location not found or invalid response format.");
    }

    console.log("✅ Fetched Location Data:", location);
    return location;
  } catch (err) {
    console.error("❌ Failed to fetch location:", err);
    throw new Error("Failed to load location. Please try again.");
  }
};

export const fetchLocationAncestry = async (authToken, locationId) => {
  if (!authToken) throw new Error("Authentication token is required");
  if (!locationId) throw new Error("Location ID is required");

  console.log("🔄 Fetching full ancestry for location:", locationId);

  let ancestry = [];
  let currentLocationId = locationId;

  try {
    while (currentLocationId) {
      const location = await pb.collection("locations").getOne(currentLocationId, {
        expand: "parent",
        requestKey: null, //  Prevent auto-cancellation
      });

      if (!location) break; // Stop if no location is found

      ancestry.unshift(location); // Add to the beginning
      currentLocationId = location.expand?.parent?.id || null;
    }

    console.log("✅ Full location ancestry:", ancestry);
    return ancestry;
  } catch (error) {
    console.error("❌ Error fetching location ancestry:", error);
    throw error;
  }
};
