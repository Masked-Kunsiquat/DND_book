# 📖 Utils Directory Code Standards
**Directory**: `src/utils/`

This guide defines best practices for utility functions, ensuring **code reusability, maintainability, and consistency** in utility files.

---

## 1️⃣ General Structure
Each utility file should:
- **Follow camelCase for filenames** (e.g., `tagUtils.js`, `iconMap.js`).
- **Only export helper functions, constants, or mappings** (no UI components or API calls).
- **Use named exports** (`export function exampleFunction`) instead of default exports.
- **Be specific to a single responsibility** (e.g., `colors.js` for color-related utilities only).

Example `utils/` folder structure:
```bash
utils/
├── colors.js        # Tag color utilities
├── iconMap.js       # Mapping for location icons
├── tagUtils.js      # Tag name mapping utilities
├── index.js         # Centralized utility exports
```

---

## 2️⃣ Utility File Responsibilities

### ✅ `colors.js` (Handles Tag Colors)
- Contains predefined Tailwind-based tag colors.
- Provides `getTagColor(tagId)`, a function that assigns **consistent tag colors**.
- Uses caching (`Map`) to store previously calculated tag colors.

✅ **Example Usage:**
```javascript
import { getTagColor } from "../utils/colors";

const colorClass = getTagColor("session_log");
console.log(colorClass); // bg-blue-100 text-blue-800
```

---

### ✅ `iconMap.js` (Handles Location Icons)
- Stores an object mapping **location types to their corresponding icons**.
- Imports **PNG assets** for locations and assigns them to types.
- Uses a `default` fallback for unrecognized location types.

✅ **Example Usage:**
```javascript
import iconMap from "../utils/iconMap";

const realmIcon = iconMap["Realm"];
console.log(realmIcon); // Returns RealmIcon import
```

---

### ✅ `tagUtils.js` (Handles Tag Name Mappings)
- Converts **raw tag types** (`session_log`, `npc`) into **display-friendly names** (`Session Log`, `NPC`).
- Uses an object mapping (`tagTypeMapping`) for easy conversion.
- Provides `getTagDisplayName(rawType)` to fetch the user-friendly name.

✅ **Example Usage:**
```javascript
import { getTagDisplayName } from "../utils/tagUtils";

console.log(getTagDisplayName("npc")); // Outputs: "NPC"
```

---

## 3️⃣ Exporting Utilities
- **Each utility file should have named exports**.
- **Use an `index.js` file** to centralize utility exports.

Example `utils/index.js`:
```javascript
export { getTagColor } from "./colors";
export { getTagDisplayName } from "./tagUtils";
export { default as iconMap } from "./iconMap";
```

✅ **Now you can import utilities easily:**
```javascript
import { getTagColor, getTagDisplayName, iconMap } from "../utils";
```

---

## 4️⃣ Best Practices & Debugging Checklist
- **Follow camelCase for filenames (`tagUtils.js`, not `TagUtils.js`)**  
- **Keep utility functions single-responsibility** – don’t mix concerns.  
- **Use named exports (`export function example() {}`), no default exports.**  
- **Ensure all utilities are centralized in `utils/index.js` for easy imports.**  
- **Cache repeated calculations where necessary (`Map` in `colors.js`).**  
