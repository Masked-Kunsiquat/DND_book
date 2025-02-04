import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

const App = () => {
  const isAuthenticated = pb.authStore.isValid; // Check if the user is authenticated using PocketBase

  return (
    <Router>
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
              <Placeholder pageName="NPCs" />
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
    </Router>
  );
};

export default App;
