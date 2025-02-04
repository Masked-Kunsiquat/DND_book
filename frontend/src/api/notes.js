import pb from "./base";

export const fetchNotes = async (authToken) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }

  console.log("🔄 Fetching notes...");

  // Ensure auth token is set only if it's not already valid
  if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
    pb.authStore.save(authToken, null);
  }

  try {
    const notes = await pb.collection("notes").getFullList({
      expand: "locations,tags",
      requestKey: null, // Prevent auto-cancellation
    });

    console.log("✅ API Response (Notes):", notes);
    return notes;
  } catch (error) {
    console.error("❌ Error fetching notes:", error);
    throw new Error("Failed to fetch notes. Please try again.");
  }
};

export const fetchNoteDetails = async (noteId, authToken) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }
  if (!noteId) {
    throw new Error("❌ Note ID is required.");
  }

  try {
    console.log(`🔄 Fetching note details for ID: ${noteId}`);

    // Ensure auth token is set only if it's not already valid
    if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
      pb.authStore.save(authToken, null);
    }

    const note = await pb.collection("notes").getOne(noteId, {
      expand: "locations,tags",
      requestKey: null, // Prevent auto-cancellation
    });

    console.log("✅ Fetched Note Details:", note);
    return note;
  } catch (error) {
    console.error("❌ Error fetching note details:", error);
    throw new Error("Failed to fetch note details. Please try again.");
  }
};
