# 📖 Frontend Component Code Standards
**Directory**: `src/components/`

This guide outlines best practices for structuring, naming, and organizing components in this project, ensuring consistency and maintainability while leveraging **Flowbite React** for UI elements.

---

## 1️⃣ General Structure
Each component should:
- **Use Flowbite React components when possible** (e.g., `Button`, `Modal`).
- **Follow PascalCase for filenames** (e.g., `Navbar.jsx`, `ProtectedRoute.jsx`).
- **Separate UI from logic** – API calls should happen in pages, not UI components.
- **Use named exports** (`export function ComponentName`) instead of default exports.
- **Group components into appropriate folders** (see structure below).

Example Component Structure:
```bash
components/
├── ui/                # Flowbite-based UI Elements (buttons, modals, forms)
│   ├── index.js       # Centralized UI exports
├── layout/            # Layout components (nav, sidebar, footer)
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
├── pages/             # Page-specific sections (e.g., dashboard elements)
│   ├── DashboardStats.jsx
│   ├── ProfileOverview.jsx
├── shared/            # Reusable components (breadcrumbs, placeholders)
│   ├── Breadcrumbs.jsx
│   ├── Placeholder.jsx
├── auth/              # Authentication-related (protected routes, login forms)
│   ├── LoginForm.jsx
│   ├── ProtectedRoute.jsx
├── modal/             # Entity-based modals
│   ├── LocationModal.jsx
│   ├── NPCModal.jsx
│   ├── NoteModal.jsx
```

---

## 2️⃣ Using Flowbite React Components
- **Always use Flowbite’s built-in components where possible.**
- **Avoid creating unnecessary custom UI components** (e.g., `Button.jsx`, `Modal.jsx`).

✅ **Correct Usage (Flowbite)**:
```jsx
import { Button } from "flowbite-react";

export function SaveButton({ onClick }) {
  return <Button onClick={onClick} color="blue">Save</Button>;
}
```

❌ **Avoid Creating Custom Components Unnecessarily**:
```jsx
export function CustomButton({ onClick }) {
  return <button className="bg-blue-500 text-white px-4 py-2" onClick={onClick}>Save</button>;
}
```
> **Why?** Flowbite already provides a `Button` component with built-in styles.

---

## 3️⃣ Component Naming & Structure
- **Use descriptive names**: `LocationModal.jsx` instead of `Modal1.jsx`.
- **UI components should not fetch data** – only display it via props.
- **Separate form elements into the `/form/` folder.**

✅ **Correct Approach (Separation of Concerns)**:
```jsx
import { Modal, Button } from "flowbite-react";

export function LocationModal({ isOpen, onClose, location }) {
  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>{location.name}</Modal.Header>
      <Modal.Body>
        <p>{location.description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

## 4️⃣ State & Data Management
- **UI components should not fetch data** – that happens in pages.
- **Pass data via props instead of accessing global state directly.**
- **Use hooks/context for state where needed.**

✅ **Correct Data Flow**:
```jsx
import { useState, useEffect } from "react";
import { fetchLocations } from "../api/locations";
import { LocationModal } from "../components/modal/LocationModal";

export function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchLocations().then(setLocations);
  }, []);

  return (
    <>
      <h1>Locations</h1>
      <ul>
        {locations.map((loc) => (
          <li key={loc.id} onClick={() => setSelectedLocation(loc)}>
            {loc.name}
          </li>
        ))}
      </ul>
      <LocationModal isOpen={!!selectedLocation} onClose={() => setSelectedLocation(null)} location={selectedLocation} />
    </>
  );
}
```

---

## 5️⃣ Styling Guidelines
- **Use Tailwind CSS (Flowbite is Tailwind-based)**.
- **Do not use global styles unless necessary**.
- **Avoid inline styles – use class names.**

✅ **Preferred Approach (Tailwind & Flowbite)**:
```jsx
import { Button } from "flowbite-react";

export function SubmitButton({ onClick }) {
  return <Button color="green" onClick={onClick}>Submit</Button>;
}
```

---

## 6️⃣ Component Exports & Imports
- **Each folder should have an `index.js` to simplify imports.**

Example `components/ui/index.js`:
```javascript
export { Button } from "flowbite-react";
export { Modal } from "flowbite-react";
```

✅ **Now you can import easily**:
```jsx
import { Button, Modal } from "../components/ui";
```

---

## 7️⃣ Debugging & Best Practices
- Ensure components follow **PascalCase naming** (`ComponentName.jsx`).  
- UI components **should not fetch data** – that happens in pages.  
- Logs should be **disabled in production** (`import.meta.env.DEV`).  
- Use **Flowbite components** before creating custom UI.  
