import pb from "./base";

// Fetch related items for a specific tag
export const fetchRelatedItems = async (tagId, authToken) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }
  if (!tagId) {
    throw new Error("❌ Tag ID is required.");
  }

  try {
    console.log("🔄 Fetching related items for tag ID:", tagId);

    // Ensure auth token is set properly without overwriting
    if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
      pb.authStore.save(authToken, null);
    }

    // Sanitize tagId: Remove anything except alphanumeric, hyphen, and underscore
    const safeTagId = tagId.replace(/[^a-zA-Z0-9-_]/g, "");

    // Fetch related items with no auto-cancellation
    const relatedItems = await pb.collection("tagged_combined").getFullList({
      filter: `(tag_ids~'${safeTagId}')`,
      requestKey: null, // Prevent auto-cancellation
    });

    console.log("✅ Related items response:", relatedItems);
    return relatedItems;
  } catch (error) {
    console.error("❌ Error fetching related items:", error);
    throw new Error("Failed to fetch related items. Please try again.");
  }
};
