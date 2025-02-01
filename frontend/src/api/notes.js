import api from "./base";

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
