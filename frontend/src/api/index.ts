import { pb } from "./base";
import * as authAPI from "./auth"; // Login/logout API
import * as notesAPI from "./notes";
import * as locationsAPI from "./locations";
import * as tagsAPI from "./tags";
import * as npcAPI from "./npc";

// Export the PocketBase instance & all API modules
export { pb, authAPI, notesAPI, locationsAPI, tagsAPI, npcAPI };
