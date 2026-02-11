import { pb } from "./base";
import { ensureAuth } from "./utils";
import type { NpcsResponse } from "../types/pocketbase-types";

/**
 * Fetch all NPCs with pagination.
 */
export const fetchNPCs = async (
  authToken: string,
  page = 1,
  perPage = 10
): Promise<{ items: NpcsResponse[]; totalPages: number }> => {
  ensureAuth(authToken);
  console.log("🔄 Fetching NPCs...");

  try {
    const response = await pb.collection("npcs").getList<NpcsResponse>(page, perPage, {
      expand: "locations,tags,campaign,notes,user",
      requestKey: null,
    });

    console.log("✅ NPCs fetched:", response.items);
    return { items: response.items, totalPages: response.totalPages };
  } catch (error: any) {
    console.error("❌ Error fetching NPCs:", error);
    throw new Error(error.message || "Failed to fetch NPCs.");
  }
};

/**
 * Fetch NPC details.
 */
export const fetchNPCDetails = async (
  authToken: string,
  npcId: string
): Promise<NpcsResponse> => {
  ensureAuth(authToken);
  if (!npcId) throw new Error("❌ NPC ID is required.");

  console.log(`🔄 Fetching NPC details for ID: ${npcId}`);

  try {
    const npc = await pb.collection("npcs").getOne<NpcsResponse>(npcId, {
      expand: "locations,tags,campaign,notes,user",
    });

    console.log("✅ NPC details fetched:", npc);
    return npc;
  } catch (error: any) {
    console.error(`❌ Error fetching NPC details (ID: ${npcId}):`, error);
    throw new Error(error.message || "Failed to fetch NPC details.");
  }
};

/**
 * Create an NPC.
 */
export const createNPC = async (
  authToken: string,
  npcData: Partial<NpcsResponse>
): Promise<NpcsResponse> => {
  ensureAuth(authToken);
  if (!npcData || typeof npcData !== "object") throw new Error("❌ NPC data is required.");

  console.log("💾 Creating NPC...");

  try {
    const newNPC = await pb.collection("npcs").create<NpcsResponse>(npcData);
    console.log("✅ NPC Created:", newNPC);
    return newNPC;
  } catch (error: any) {
    console.error("❌ Error creating NPC:", error);
    throw new Error(error.message || "Failed to create NPC.");
  }
};

/**
 * Update an NPC.
 */
export const updateNPC = async (
  authToken: string,
  npcId: string,
  npcData: Partial<NpcsResponse>
): Promise<NpcsResponse> => {
  ensureAuth(authToken);
  if (!npcId) throw new Error("❌ NPC ID is required.");
  if (!npcData || typeof npcData !== "object") throw new Error("❌ NPC data is required.");

  console.log(`🔄 Updating NPC with ID: ${npcId}...`);

  try {
    const updatedNPC = await pb.collection("npcs").update<NpcsResponse>(npcId, npcData);
    console.log("✅ NPC Updated:", updatedNPC);
    return updatedNPC;
  } catch (error: any) {
    console.error(`❌ Error updating NPC (ID: ${npcId}):`, error);
    throw new Error(error.message || "Failed to update NPC.");
  }
};

/**
 * Delete an NPC.
 */
export const deleteNPC = async (authToken: string, npcId: string): Promise<boolean> => {
  ensureAuth(authToken);
  if (!npcId) throw new Error("❌ NPC ID is required.");

  console.log(`🗑️ Deleting NPC with ID: ${npcId}...`);

  try {
    await pb.collection("npcs").delete(npcId);
    console.log("✅ NPC Deleted.");
    return true;
  } catch (error: any) {
    console.error(`❌ Error deleting NPC (ID: ${npcId}):`, error);
    throw new Error(error.message || "Failed to delete NPC.");
  }
};
