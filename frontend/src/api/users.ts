import { pb } from "./base";
import type { UsersResponse } from "../types/pocketbase-types";

/**
 * Updates user profile (name & avatar).
 * - Validates input parameters.
 * - Handles API errors gracefully.
 */
export async function updateUserProfile(userId: string, name: string, avatar?: File): Promise<UsersResponse> {
  // Input validation
  if (!userId || typeof userId !== "string") {
    throw new Error("❌ Invalid user ID.");
  }
  if (!name || typeof name !== "string") {
    throw new Error("❌ Name is required and must be a string.");
  }
  if (avatar && !(avatar instanceof File)) {
    throw new Error("❌ Avatar must be a valid file.");
  }

  const formData = new FormData();
  formData.append("name", name);
  if (avatar) formData.append("avatar", avatar);

  try {
    const updatedUser = await pb.collection("users").update<UsersResponse>(userId, formData);

    if (import.meta.env.DEV) {
      console.log("✅ User profile updated successfully:", updatedUser);
    }

    return updatedUser;
  } catch (error: any) {
    console.error("❌ Error updating user profile:", error.message);
    throw new Error(error.message || "Failed to update user profile.");
  }
}
