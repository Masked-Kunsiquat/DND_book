import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

export const fetchNotes = async (authToken) => {
  if (!authToken) {
    throw new Error("Authentication token is required");
  }

  console.log("Fetching notes with authToken:", authToken);

  const response = await api.get("/collections/notes/records", {
    params: { expand: "locations,tags" }, // Expand both locations and tags
    headers: { Authorization: `Bearer ${authToken}` },
  });

  console.log("API Response (Notes):", response.data);

  if (!response.data || !Array.isArray(response.data.items)) {
    throw new Error("Invalid response format");
  }

  console.log("Expanded Notes with Tags:", response.data.items);
  return response.data.items;
};


// Fetch all locations and group them by type
export const fetchLocations = async (authToken) => {
  if (!authToken) {
    throw new Error("Authentication token is required");
  }

  try {
    console.log("Fetching all locations...");

    const response = await api.get("/collections/locations/records", {
      params: { sort: "type,name" },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("API Response:", response.data);

    if (!response.data || !Array.isArray(response.data.items)) {
      throw new Error("Invalid response format");
    }

    // Group locations by type
    const groupedLocations = response.data.items.reduce((acc, location) => {
      if (!acc[location.type]) acc[location.type] = [];
      acc[location.type].push(location);
      return acc;
    }, {});

    console.log("Grouped Locations:", groupedLocations);
    return groupedLocations;
  } catch (error) {
    console.error("Error fetching locations:", error.message);
    throw error;
  }
};

// Fetch a single location with its parent details
export const fetchLocationWithParents = async (authToken, locationId) => {
    if (!authToken) {
      throw new Error("Authentication token is required");
    }
    if (!locationId) {
      console.error("fetchLocationWithParents called without locationId");
      throw new Error("Location ID is required");
    }
  
    try {
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
    } catch (error) {
      console.error("Error fetching location with parents:", error.message);
      throw error;
    }
  };  

export default api;
