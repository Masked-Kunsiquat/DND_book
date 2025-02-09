import { pb } from "./base";
import { ensureAuth } from "./utils"; // Utility function for auth validation

/**
 * Fetch all notes.
 */
export const fetchNotes = async (authToken) => {
  ensureAuth(authToken);
  if (import.meta.env.DEV) console.log("🔄 Fetching notes...");

  try {
    const notes = await pb.collection("notes").getFullList({
      expand: "locations,tags",
      requestKey: null, // Prevent auto-cancellation
    });

    if (import.meta.env.DEV) console.log("✅ API Response (Notes):", notes);
    return notes;
  } catch (error) {
    console.error("❌ Error fetching notes:", error.message);
    throw new Error(error.message || "Failed to fetch notes.");
  }
};

/**
 * Fetch details of a specific note.
 */
export const fetchNoteDetails = async (noteId, authToken) => {
  ensureAuth(authToken);
  if (!noteId) throw new Error("❌ Note ID is required.");

  if (import.meta.env.DEV) console.log(`🔄 Fetching note details for ID: ${noteId}`);

  try {
    const note = await pb.collection("notes").getOne(noteId, {
      expand: "locations,tags",
      requestKey: null,
    });

    if (import.meta.env.DEV) console.log("✅ Fetched Note Details:", note);
    return note;
  } catch (error) {
    console.error(`❌ Error fetching note details (ID: ${noteId}):`, error.message);
    throw new Error(error.message || "Failed to fetch note details.");
  }
};
