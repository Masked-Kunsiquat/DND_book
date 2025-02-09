import pb from "./base";

export async function loginWithEmailPassword(email, password) {
  try {
    const authData = await pb.collection("users").authWithPassword(email, password);

    // Save token and user info
    localStorage.setItem("authToken", authData.token);
    localStorage.setItem("userId", authData.record.id);

    return { success: true, data: authData };
  } catch (error) {
    return { success: false, message: error.message || "Invalid email or password" };
  }
}
