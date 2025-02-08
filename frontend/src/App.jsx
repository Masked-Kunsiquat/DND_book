import React, { useState, useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import pb from "./api/base";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Placeholder from "./components/Placeholder";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Locations from "./pages/Locations";
import LocationDetail from "./pages/LocationDetail";
import RelatedItemsModal from "./components/RelatedItemsModal";
import NoteDetail from "./pages/NoteDetail";
import NPCs from "./pages/NPCs";
import NPCDetail from "./pages/NPCDetail";

const App = () => {
  // State to track authentication dynamically
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
    });
    return () => unsubscribe();
  }, []);

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {isAuthenticated && <Navbar />} {/* Show Navbar only when logged in */}
      <Routes>
        {/* Redirect / to /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public route: Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/locations"
          element={
            <ProtectedRoute>
              <Locations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/locations/:locationId"
          element={
            <ProtectedRoute>
              <LocationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/npcs"
          element={
            <ProtectedRoute>
              <NPCs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/npcs/:npcId"
          element={
            <ProtectedRoute>
              <NPCDetail />
            </ProtectedRoute>
          }
        />
        {/* New route for viewing related items by tag */}
        <Route
          path="/tags/:tagId"
          element={
            <ProtectedRoute>
              <RelatedItemsModal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:noteId"
          element={
            <ProtectedRoute>
              <NoteDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
