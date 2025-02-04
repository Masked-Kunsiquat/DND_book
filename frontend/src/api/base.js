import PocketBase from "pocketbase";

// Initialize PocketBase SDK
const pb = new PocketBase(process.env.REACT_APP_API_BASE_URL || "http://10.0.0.69:8080");

export default pb;
