import { pb } from "./base";

/**
 * Type definitions for authentication responses.
 */
interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    userId: string;
  };
  message?: string;
}

/**
 * Login function using email & password.
 */
export async function loginWithEmailPassword(email: string, password: string): Promise<AuthResponse> {
  try {
    const authData = await pb.collection("users").authWithPassword(email, password);

    // Save auth token & user ID securely
    localStorage.setItem("authToken", authData.token);
    localStorage.setItem("userId", authData.record.id);

    return { success: true, data: { token: authData.token, userId: authData.record.id } };
  } catch (error: any) {
    console.error("❌ Login failed:", error);
    return { success: false, message: error.message || "Invalid email or password" };
  }
}

/**
 * Logout function to clear authentication state.
 */
export const logout = async (): Promise<boolean> => {
  try {
    pb.authStore.clear();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    return true;
  } catch (err) {
    console.error("❌ Error logging out:", err);
    return false;
  }
};
