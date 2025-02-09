# 📖 Pages Code Standards
**Directory**: `src/pages/`

This guide outlines best practices for structuring, organizing, and managing pages in the project. It ensures consistency in routing, layout usage, and data handling.

---

## 1️⃣ General Structure
Each page should:
- **Be a functional component** (no class components).
- **Use PascalCase for filenames** (e.g., `Home.jsx`, `Dashboard.jsx`).
- **Only handle page-level logic** – UI should be handled in `components/`.
- **Import necessary components/layouts instead of re-creating UI elements.**
- **Use React Router (`react-router-dom`) for navigation.**

Example `pages/` folder structure:
```bash
pages/
├── Home.jsx             # Home page
├── Dashboard.jsx        # Main dashboard
├── Profile.jsx          # User profile page
├── Auth/                # Authentication pages (login, register, etc.)
│   ├── Login.jsx
│   ├── Register.jsx
├── index.js             # Centralized page exports
```

---

## 2️⃣ Page Responsibilities
Each page should:
- **Focus on layout and data flow** – UI should be inside `components/`.
- **Import reusable components** instead of defining them in the page.
- **Handle page-specific API calls but delegate UI rendering to components.**
- **Use `useEffect` for fetching data when the page loads.**

✅ **Correct Page Structure Example:**
```jsx
import { useState, useEffect } from "react";
import { fetchUserProfile } from "../api/auth";
import { ProfileCard } from "../components/shared/ProfileCard";

export function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile().then(setProfile);
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">User Profile</h1>
      {profile ? <ProfileCard profile={profile} /> : <p>Loading...</p>}
    </div>
  );
}
```

❌ **Incorrect (Mixing UI and Data Fetching in the Same File)**
```jsx
export function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile().then(setProfile);
  }, []);

  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>{profile?.bio}</p>
    </div>
  );
}
```
> **Why?** This mixes UI logic with the page. Instead, pass `profile` to a `ProfileCard` component inside `components/shared/`.

---

## 3️⃣ Routing & Navigation
We use `react-router-dom` for client-side routing.

### **Example: Setting Up Routes in `App.jsx`**
```jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
```

### **Protected Routes Example**
If a page requires authentication, use a `ProtectedRoute` component from `components/auth/`.
```jsx
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

---

## 4️⃣ **Using Layout Components**
Pages should use a **layout component** instead of repeating headers/sidebars.

✅ **Correct (Using Layout Components)**
```jsx
import { MainLayout } from "../components/layout/MainLayout";

export function Dashboard() {
  return (
    <MainLayout>
      <h1>Dashboard</h1>
    </MainLayout>
  );
}
```

❌ **Incorrect (Duplicating Layout in Every Page)**
```jsx
export function Dashboard() {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <h1>Dashboard</h1>
    </div>
  );
}
```
> **Why?** Use `MainLayout` instead of repeating Navbar/Sidebar.

---

## 5️⃣ Error Handling in Pages
- **Use `try/catch` for async data fetching**.
- **Display error messages inside the UI instead of breaking the page.**

✅ **Correct Example**
```jsx
export function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile()
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      {error ? <p className="text-red-500">{error}</p> : <ProfileCard profile={profile} />}
    </div>
  );
}
```

---

## 6️⃣ Best Practices & Debugging Checklist
- **Ensure pages follow PascalCase (`Dashboard.jsx`, `Profile.jsx`).**  
- **Use layout components (`MainLayout`) instead of duplicating UI structure.**  
- **Fetch data inside `useEffect()` and pass it to components as props.**  
- **Use `react-router-dom` for navigation and route protection.**  
- **Separate concerns – keep pages focused on logic and pass UI to `components/`.**  
