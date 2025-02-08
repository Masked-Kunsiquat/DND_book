import pb from "./base";

export const fetchNpcs = async (authToken, page = 1, perPage = 50, filter = "") => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }

  console.log("🔄 Fetching NPCs...");

  // Ensure auth token is set only if it's not already valid
  if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
    pb.authStore.save(authToken, null);
  }

  try {
    const npcs = await pb.collection("npcs").getList(page, perPage, {
      filter,
      requestKey: null, // Prevent auto-cancellation
    });

    console.log("✅ API Response (NPCs):", npcs);
    return npcs;
  } catch (error) {
    console.error("❌ Error fetching NPCs:", error);
    throw new Error("Failed to fetch NPCs. Please try again.");
  }
};

export const fetchNpcDetails = async (npcId, authToken) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }
  if (!npcId) {
    throw new Error("❌ NPC ID is required.");
  }

  console.log(`🔄 Fetching NPC details for ID: ${npcId}`);

  // Ensure auth token is set only if it's not already valid
  if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
    pb.authStore.save(authToken, null);
  }

  try {
    const npc = await pb.collection("npcs").getOne(npcId, {
      expand: "relatedField1,relatedField2", // Replace with actual related fields if necessary
      requestKey: null, // Prevent auto-cancellation
    });

    console.log("✅ Fetched NPC Details:", npc);
    return npc;
  } catch (error) {
    console.error("❌ Error fetching NPC details:", error);
    throw new Error("Failed to fetch NPC details. Please try again.");
  }
};
