import { pb } from "./base";
import { ensureAuth } from "./utils";
import type { NotesResponse, TaggedCombinedResponse } from "../types/pocketbase-types";

/**
 * Fetch paginated notes from PocketBase.
 * - Supports pagination with `page` and `perPage` parameters.
 * - Expands related fields (locations, tags).
 */
export const fetchNotes = async (
  authToken: string,
  page: number = 1,
  perPage: number = 10
): Promise<{ items: NotesResponse[]; totalPages: number; totalItems: number }> => {
  ensureAuth(authToken);

  try {
    const response = await pb.collection("notes").getList<NotesResponse>(page, perPage, {
      expand: "locations,tags",
      requestKey: null,
    });

    if (import.meta.env.DEV) {
      console.log(`✅ Fetched ${response.items.length} notes (Page ${page} of ${response.totalPages})`);
    }

    return {
      items: response.items,
      totalPages: response.totalPages,
      totalItems: response.totalItems,
    };
  } catch (error: any) {
    console.error("❌ Error fetching notes:", error.message);
    throw new Error(error.message || "Failed to fetch notes.");
  }
};

/**
 * Fetch details of a specific note.
 * - Ensures `noteId` is provided.
 */
export const fetchNoteDetails = async (noteId: string, authToken: string): Promise<NotesResponse> => {
  ensureAuth(authToken);
  if (!noteId) throw new Error("❌ Note ID is required.");

  try {
    const note = await pb.collection("notes").getOne<NotesResponse>(noteId, {
      expand: "locations,tags",
      requestKey: null,
    });

    if (import.meta.env.DEV) {
      console.log(`✅ Successfully fetched note details (ID: ${noteId})`);
    }

    return note;
  } catch (error: any) {
    console.error(`❌ Error fetching note details (ID: ${noteId}):`, error.message);
    throw new Error(error.message || "Failed to fetch note details.");
  }
};

/**
* Fetch related items for a specific tag.
* - Uses parameterized queries to prevent SQL injection.
*/
export const fetchRelatedItems = async (authToken: string, tagId: string): Promise<TaggedCombinedResponse[]> => {
 ensureAuth(authToken);
 if (!tagId) throw new Error("❌ Tag ID is required.");

 if (import.meta.env.DEV) console.log(`🔄 Fetching related items for tag ID: ${tagId}`);

 try {
   // Use parameterized filter to prevent SQL injection
   const relatedItems = await pb.collection("tagged_combined").getFullList<TaggedCombinedResponse>({
     filter: `tag_ids~@tagId`, // Use @param notation
     params: { tagId }, // Pass the value safely
     requestKey: null,
   });

   if (import.meta.env.DEV) console.log("✅ Related items fetched:", relatedItems);
   return relatedItems;
 } catch (error: any) {
   console.error(`❌ Error fetching related items (Tag ID: ${tagId}):`, error.message);
   throw new Error(error.message || "Failed to fetch related items.");
 }
};