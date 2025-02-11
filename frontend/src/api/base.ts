import PocketBase from "pocketbase";

// Initialize PocketBase SDK with environment variable fallback
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const pb = new PocketBase(API_BASE_URL);

// Debugging (Only in Development)
if (import.meta.env.DEV) {
  console.log("🛠️ PocketBase initialized with:", pb.baseURL);
}
