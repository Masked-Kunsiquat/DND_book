import api from "./base";

export const fetchNotes = async (authToken) => {
  if (!authToken) {
    throw new Error("Authentication token is required");
  }

  console.log("Fetching notes...");

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

export const fetchNoteDetails = async (noteId, authToken) => {
  if (!authToken) {
    throw new Error("Authentication token is required");
  }
  if (!noteId) {
    throw new Error("Note ID is required");
  }

  try {
    const response = await api.get(`/collections/notes/records/${noteId}`, {
      params: { expand: "locations,tags" },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching note details:", error.message);
    throw error;
  }
};

