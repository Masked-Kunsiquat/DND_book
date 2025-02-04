import PocketBase from "pocketbase";

// Initialize PocketBase SDK with environment variable fallback
const pb = new PocketBase(import.meta.env.VITE_API_BASE_URL || "http://10.0.0.69:8080");

export default pb;
