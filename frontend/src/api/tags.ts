import { pb } from "./base";
import { ensureAuth } from "./utils";
import type { TaggedCombinedResponse } from "../types/pocketbase-types";

/**
 * Fetch related items for a specific tag.
 */
export const fetchRelatedItems = async (authToken: string, tagId: string): Promise<TaggedCombinedResponse[]> => {
  ensureAuth(authToken);
  if (!tagId) throw new Error("❌ Tag ID is required.");

  if (import.meta.env.DEV) console.log(`🔄 Fetching related items for tag ID: ${tagId}`);

  try {
    // Fetch related items with no auto-cancellation
    const relatedItems = await pb.collection("tagged_combined").getFullList<TaggedCombinedResponse>({
      filter: `tag_ids~'${tagId}'`,
      requestKey: null, // Prevent auto-cancellation
    });

    if (import.meta.env.DEV) console.log("✅ Related items fetched:", relatedItems);
    return relatedItems;
  } catch (error: any) {
    console.error(`❌ Error fetching related items (Tag ID: ${tagId}):`, error.message);
    throw new Error(error.message || "Failed to fetch related items.");
  }
};
