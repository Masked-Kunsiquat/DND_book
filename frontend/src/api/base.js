import PocketBase from "pocketbase";

// Initialize PocketBase SDK with environment variable fallback
const pb = new PocketBase(import.meta.env.VITE_API_BASE_URL || "http://localhost:8080");

export default pb;
