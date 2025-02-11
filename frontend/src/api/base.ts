import PocketBase from "pocketbase";

/**
 * Validates the API base URL before initializing PocketBase.
 * - Ensures the URL is a valid string.
 * - Prevents runtime errors caused by invalid URLs.
 * - Logs an error in development mode if validation fails.
 */

// Retrieve API base URL from environment variables or fallback to localhost
const API_BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Function to validate the URL format
function isValidURL(url: string | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url); // Throws an error if the URL is invalid
    return true;
  } catch {
    return false;
  }
}

// Validate API base URL
if (!isValidURL(API_BASE_URL)) {
  console.error("❌ Invalid PocketBase API base URL:", API_BASE_URL);
  throw new Error("Invalid API base URL. Please check VITE_API_BASE_URL.");
}

// Initialize PocketBase SDK
export const pb = new PocketBase(API_BASE_URL as string);

// Debugging (Only in Development)
if (import.meta.env.DEV) {
  console.log("🛠️ PocketBase initialized with:", pb.baseUrl);
}
