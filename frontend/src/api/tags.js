import api from "./base";

// Fetch related items for a specific tag
export const fetchRelatedItems = async (tagId, authToken) => {
  if (!authToken) {
    throw new Error("Authentication token is required");
  }
  if (!tagId) {
    throw new Error("Tag ID is required");
  }

  try {
    console.log("Fetching related items for tag ID:", tagId);

    const response = await api.get(`/collections/tagged_combined/records`, {
      params: { filter: `(tag_ids~'${tagId.replace(/['\\]/g, '')}')` }, // Matches tag ID in the tag_ids array
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("Related items response:", response.data);
    return response.data.items;
  } catch (error) {
    console.error("Error fetching related items:", error.message);
    throw error;
  }
};
