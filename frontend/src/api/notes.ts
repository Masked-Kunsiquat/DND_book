import { pb } from "./base";
import { ensureAuth } from "./utils";
import type { NotesResponse } from "../types/pocketbase-types"; // Adjust if needed

/**
 * Fetch all notes from PocketBase.
 */
export const fetchNotes = async (authToken: string): Promise<NotesResponse[]> => {
  ensureAuth(authToken);
  if (import.meta.env.DEV) console.log("🔄 Fetching notes...");

  try {
    const notes = await pb.collection("notes").getFullList<NotesResponse>({
      expand: "locations,tags",
      requestKey: null,
    });

    if (import.meta.env.DEV) console.log("✅ API Response (Notes):", notes);
    return notes;
  } catch (error: any) {
    console.error("❌ Error fetching notes:", error.message);
    throw new Error(error.message || "Failed to fetch notes.");
  }
};

/**
 * Fetch details of a specific note.
 */
export const fetchNoteDetails = async (noteId: string, authToken: string): Promise<NotesResponse> => {
  ensureAuth(authToken);
  if (!noteId) throw new Error("❌ Note ID is required.");

  if (import.meta.env.DEV) console.log(`🔄 Fetching note details for ID: ${noteId}`);

  try {
    const note = await pb.collection("notes").getOne<NotesResponse>(noteId, {
      expand: "locations,tags",
      requestKey: null,
    });

    if (import.meta.env.DEV) console.log("✅ Fetched Note Details:", note);
    return note;
  } catch (error: any) {
    console.error(`❌ Error fetching note details (ID: ${noteId}):`, error.message);
    throw new Error(error.message || "Failed to fetch note details.");
  }
};
