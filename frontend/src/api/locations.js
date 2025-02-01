import api from "./base";

export const fetchLocations = async (authToken) => {
  if (!authToken) {
    throw new Error("Authentication token is required");
  }

  console.log("Fetching all locations...");

  const response = await api.get("/collections/locations/records", {
    params: { sort: "type,name" },
    headers: { Authorization: `Bearer ${authToken}` },
  });

  console.log("API Response:", response.data);

  if (!response.data || !Array.isArray(response.data.items)) {
    throw new Error("Invalid response format");
  }

  const groupedLocations = response.data.items.reduce((acc, location) => {
    if (!acc[location.type]) acc[location.type] = [];
    acc[location.type].push(location);
    return acc;
  }, {});

  console.log("Grouped Locations:", groupedLocations);
  return groupedLocations;
};

export const fetchLocationWithParents = async (authToken, locationId) => {
  if (!authToken) {
    throw new Error("Authentication token is required");
  }
  if (!locationId) {
    throw new Error("Location ID is required");
  }

  console.log("Fetching location with ID:", locationId);

  const response = await api.get(`/collections/locations/records/${locationId}`, {
    params: { expand: "parent" },
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!response.data) {
    throw new Error("Location not found or invalid response format");
  }

  console.log("Fetched Location Data:", response.data);
  return response.data;
};
