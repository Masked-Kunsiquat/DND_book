# 📖 API Code Standards
**Directory**: `api/`

This guide outlines best practices for structuring API-related functions in this project.

## 1️⃣ General Structure
Each file in `api/` should: 
- Export only functions (no default exports).
- Use named exports to ensure clear imports.
- Be named after the resource it handles (e.g., `npc.js`, `tags.js`).
- Contain only API logic (no UI-related code).
- Handle errors gracefully with `try/catch` blocks.

Example API File Structure:

```bash
api/
├── auth.js        # Authentication helpers (login/logout)
├── base.js        # PocketBase SDK instance
├── index.js       # Centralized API exports
├── locations.js   # Locations API functions
├── login.js       # Login API calls
├── notes.js       # Notes API functions
├── npc.js         # NPC-related API functions
├── tags.js        # Tags API functions
└── utils.js       # Shared utility functions (e.g., auth handling)
```

## 2️⃣ PocketBase Initialization
- `base.js` initializes the PocketBase client.
- Always use environment variables (`VITE_API_BASE_URL`).
- Log connection details only in development.

```javascript
import PocketBase from "pocketbase";

const pb = new PocketBase(import.meta.env.VITE_API_BASE_URL || "http://localhost:8080");

// Debugging (remove in production)
if (import.meta.env.DEV) {
  console.log("🛠️ PocketBase initialized with:", pb.baseUrl);
}

export default pb;
```

## 3️⃣ Authentication Handling
- Use a utility function (`ensureAuth`) in `utils.js` to manage auth tokens.
- Do NOT manually set `pb.authStore.token` in every API call.
- Always validate authentication before making API requests.

```javascript
import pb from "./base";

export const ensureAuth = (authToken) => {
  if (!authToken) {
    throw new Error("❌ Authentication token is required.");
  }
  if (!pb.authStore.isValid || pb.authStore.token !== authToken) {
    pb.authStore.save(authToken, null);
  }
};
```

## 4️⃣ API Functions (Standard Template)
Each API function should:
- Be asynchronous (`async/await`).
- Use `try/catch` blocks for error handling.
- Log errors clearly for debugging.
- Return consistent object structures (e.g., `{ items: [...] }`).
- Use `ensureAuth(authToken)` before making API calls.

```javascript
import pb from "./base";
import { ensureAuth } from "./utils";

// Fetch all NPCs
export const fetchNPCs = async (authToken, page = 1, perPage = 10) => {
  ensureAuth(authToken);
  console.log("🔄 Fetching NPCs...");

  try {
    const npcs = await pb.collection("npcs").getList(page, perPage, {
      expand: "locations,tags,campaign,notes,user",
    });

    console.log("✅ NPCs fetched:", npcs.items);
    return { items: npcs.items || [] };
  } catch (error) {
    console.error("❌ Error fetching NPCs:", error);
    throw new Error("Failed to fetch NPCs.");
  }
};
```

5️⃣ API Function Naming Conventions
- Use verb-noun naming style (e.g., `fetchNPCs`, `updateLocation`).
- CRUD operations should be named as follows:

| Action         | Function Name         | Example                    |
|---------------|----------------------|----------------------------|
| **Read (GET)**  | `fetch<Resource>`      | `fetchNPCs()`              |
| **Create (POST)** | `create<Resource>`     | `createNPC()`              |
| **Update (PATCH/PUT)** | `update<Resource>` | `updateNPC(npcId, data)`   |
| **Delete (DELETE)** | `delete<Resource>` | `deleteNPC(npcId)`         |

## 6️⃣ Centralized API Exports
- Use `index.js` to centralize imports/export API functions.
- This makes imports cleaner and easier to manage.

```javascript
export { fetchNPCs } from "./npc";
export { fetchLocations } from "./locations";
export { fetchTags } from "./tags";
export { loginWithEmailPassword } from "./login";
export { logout } from "./auth";
export { fetchNotes } from "./notes";
```

Now, in Dashboard.jsx, import it like this:

```javascript
import { fetchNPCs } from "../api";
```

## 7️⃣ Error Handling
- Always wrap API calls in try/catch blocks.
- Throw errors with meaningful messages (`throw new Error("Failed to fetch NPCs.")`).
- Log API errors to the console.

```javascript
try {
  const npcs = await fetchNPCs(authToken);
} catch (error) {
  console.error("🚨 Failed to load NPCs:", error);
}
```

## 8️⃣ Security & Best Practices
- Do not store passwords or sensitive data in `localStorage`.
- Do not hardcode API keys or environment variables in code.
- Do not expose PocketBase admin routes to the frontend.
- Use environment variables (`VITE_API_BASE_URL`) instead of hardcoded URLs.

## 9️⃣ Debugging Checklist
If something breaks, follow this checklist: 
- Run `console.log(pb.authStore.token)` to confirm authentication.
- Check if API endpoints work in Postman or browser console:

```javascript
const npcs = await pb.collection("npcs").getFullList();
console.log(npcs);
```

- Ensure `fetchNPCs()` is correctly imported (`import { fetchNPCs } from "../api"`).
- Check if PocketBase permissions allow authenticated users to fetch `npcs`.

## 🔟 Example API File (`npc.js`)
```javascript
import pb from "./base";
import { ensureAuth } from "./utils";

// Fetch all NPCs
export const fetchNPCs = async (authToken, page = 1, perPage = 10) => {
  ensureAuth(authToken);
  console.log("🔄 Fetching NPCs...");

  try {
    const npcs = await pb.collection("npcs").getList(page, perPage, {
      expand: "locations,tags,campaign,notes,user",
    });

    console.log("✅ NPCs fetched:", npcs.items);
    return { items: npcs.items || [] };
  } catch (error) {
    console.error("❌ Error fetching NPCs:", error);
    throw new Error("Failed to fetch NPCs.");
  }
};

// Fetch single NPC details
export const fetchNPCDetails = async (npcId, authToken) => {
  ensureAuth(authToken);
  console.log(`🔄 Fetching NPC details for ID: ${npcId}`);

  try {
    const npc = await pb.collection("npcs").getOne(npcId, {
      expand: "locations,tags,campaign,notes,user",
    });

    console.log("✅ NPC details:", npc);
    return npc;
  } catch (error) {
    console.error("❌ Error fetching NPC details:", error);
    throw new Error("Failed to fetch NPC details.");
  }
};
```