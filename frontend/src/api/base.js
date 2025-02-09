import PocketBase from "pocketbase";

// Initialize PocketBase SDK with environment variable fallback
export const pb = new PocketBase(import.meta.env.VITE_API_BASE_URL || "http://localhost:8080");

// Debugging (Only in Development)
if (import.meta.env.DEV) {
  console.log("🛠️ PocketBase initialized with:", pb.baseURL);
}
