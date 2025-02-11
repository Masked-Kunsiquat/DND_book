import { pb } from "./base";

/**
 * Updates user profile (name & avatar).
 */
export async function updateUserProfile(userId: string, name: string, avatar?: File) {
  const formData = new FormData();
  formData.append("name", name);
  if (avatar) formData.append("avatar", avatar);

  return await pb.collection("users").update(userId, formData);
}
