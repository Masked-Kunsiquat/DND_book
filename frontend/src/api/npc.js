import { pb } from "./base";
import { ensureAuth } from "./utils"; // Utility for auth validation

// Fetch all NPCs
export const fetchNPCs = async (authToken) => {
  ensureAuth(authToken);
  if (import.meta.env.DEV) console.log("🔄 Fetching NPCs...");

  try {
    const npcs = await pb.collection("npcs").getFullList({
      expand: "locations,tags,campaign,notes,user",
      requestKey: null, // Prevent auto-cancellation
    });

    if (import.meta.env.DEV) console.log("✅ NPCs fetched:", npcs);
    return { items: npcs };
  } catch (error) {
    console.error("❌ Error fetching NPCs:", error.message);
    throw new Error(error.message || "Failed to fetch NPCs.");
  }
};

// Fetch NPC details
export const fetchNPCDetails = async (npcId, authToken) => {
  ensureAuth(authToken);
  if (!npcId) throw new Error("❌ NPC ID is required.");

  if (import.meta.env.DEV) console.log(`🔄 Fetching NPC details for ID: ${npcId}`);

  try {
    const npc = await pb.collection("npcs").getOne(npcId, {
      expand: "locations,tags,campaign,notes,user",
      requestKey: null,
    });

    if (import.meta.env.DEV) console.log("✅ NPC details fetched:", npc);
    return npc;
  } catch (error) {
    console.error(`❌ Error fetching NPC details (ID: ${npcId}):`, error.message);
    throw new Error(error.message || "Failed to fetch NPC details.");
  }
};

// Create NPC
export const createNPC = async (authToken, npcData) => {
  ensureAuth(authToken);
  if (!npcData || typeof npcData !== "object") throw new Error("❌ NPC data is required.");

  if (import.meta.env.DEV) console.log("💾 Creating NPC...");

  try {
    const newNPC = await pb.collection("npcs").create(npcData);
    if (import.meta.env.DEV) console.log("✅ NPC Created:", newNPC);
    return newNPC;
  } catch (error) {
    console.error("❌ Error creating NPC:", error.message);
    throw new Error(error.message || "Failed to create NPC.");
  }
};

// Update NPC
export const updateNPC = async (authToken, npcId, npcData) => {
  ensureAuth(authToken);
  if (!npcId) throw new Error("❌ NPC ID is required.");
  if (!npcData || typeof npcData !== "object") throw new Error("❌ NPC data is required.");

  if (import.meta.env.DEV) console.log(`🔄 Updating NPC with ID: ${npcId}...`);

  try {
    const updatedNPC = await pb.collection("npcs").update(npcId, npcData);
    if (import.meta.env.DEV) console.log("✅ NPC Updated:", updatedNPC);
    return updatedNPC;
  } catch (error) {
    console.error(`❌ Error updating NPC (ID: ${npcId}):`, error.message);
    throw new Error(error.message || "Failed to update NPC.");
  }
};

// Delete NPC
export const deleteNPC = async (authToken, npcId) => {
  ensureAuth(authToken);
  if (!npcId) throw new Error("❌ NPC ID is required.");

  if (import.meta.env.DEV) console.log(`🗑️ Deleting NPC with ID: ${npcId}...`);

  try {
    await pb.collection("npcs").delete(npcId);
    if (import.meta.env.DEV) console.log("✅ NPC Deleted.");
    return true;
  } catch (error) {
    console.error(`❌ Error deleting NPC (ID: ${npcId}):`, error.message);
    throw new Error(error.message || "Failed to delete NPC.");
  }
};
