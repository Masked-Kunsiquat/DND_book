import pb from "./base";

// Fetch all NPCs
export const fetchNPCs = async (authToken) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }

  console.log("🔄 Fetching NPCs...");

  // Ensure the token is valid, but don't overwrite if already set
  if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
    pb.authStore.save(authToken, null);
  }

  try {
    const npcs = await pb.collection("npcs").getFullList({
      expand: "locations,tags,campaign,notes,user",
      requestKey: null, // Prevent auto-cancellation
    });

    console.log("✅ API Response (NPCs):", npcs);

    // Wrap data in an "items" object for consistency
    return { items: npcs };
  } catch (error) {
    console.error("❌ Error fetching NPCs:", error);
    throw new Error("Failed to fetch NPCs. Please try again.");
  }
};

// Fetch NPC details
export const fetchNPCDetails = async (npcId, authToken) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }
  if (!npcId) {
    throw new Error("❌ NPC ID is required.");
  }

  try {
    console.log(`🔄 Fetching NPC details for ID: ${npcId}`);

    // Ensure the token is valid, but don't overwrite if already set
    if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
      pb.authStore.save(authToken, null);
    }

    const npc = await pb.collection("npcs").getOne(npcId, {
      expand: "locations,tags,campaign,notes,user",
      requestKey: null, // Prevent auto-cancellation
    });

    console.log("✅ Fetched NPC Details:", npc);
    return npc;
  } catch (error) {
    console.error("❌ Error fetching NPC details:", error);
    throw new Error("Failed to fetch NPC details. Please try again.");
  }
};

// Create a new NPC
export const createNPC = async (authToken, npcData) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }
  if (!npcData || typeof npcData !== "object") {
    throw new Error("❌ NPC data is required.");
  }

  try {
    console.log("💾 Creating NPC...");

    // Ensure the token is valid, but don't overwrite if already set
    if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
      pb.authStore.save(authToken, null);
    }

    const newNPC = await pb.collection("npcs").create(npcData);
    console.log("✅ NPC Created Successfully:", newNPC);
    return newNPC;
  } catch (error) {
    console.error("❌ Error creating NPC:", error);
    throw new Error("Failed to create NPC. Please try again.");
  }
};

// Update an existing NPC
export const updateNPC = async (authToken, npcId, npcData) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }
  if (!npcId) {
    throw new Error("❌ NPC ID is required.");
  }
  if (!npcData || typeof npcData !== "object") {
    throw new Error("❌ NPC data is required for update.");
  }

  try {
    console.log(`🔄 Updating NPC with ID: ${npcId}...`);

    // Ensure the token is valid, but don't overwrite if already set
    if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
      pb.authStore.save(authToken, null);
    }

    const updatedNPC = await pb.collection("npcs").update(npcId, npcData);
    console.log("✅ NPC Updated Successfully:", updatedNPC);
    return updatedNPC;
  } catch (error) {
    console.error("❌ Error updating NPC:", error);
    throw new Error("Failed to update NPC. Please try again.");
  }
};

// Delete an NPC
export const deleteNPC = async (authToken, npcId) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }
  if (!npcId) {
    throw new Error("❌ NPC ID is required.");
  }

  try {
    console.log(`🗑️ Deleting NPC with ID: ${npcId}...`);

    // Ensure the token is valid, but don't overwrite if already set
    if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
      pb.authStore.save(authToken, null);
    }

    await pb.collection("npcs").delete(npcId);
    console.log("✅ NPC Deleted Successfully.");
    return true;
  } catch (error) {
    console.error("❌ Error deleting NPC:", error);
    throw new Error("Failed to delete NPC. Please try again.");
  }
};
