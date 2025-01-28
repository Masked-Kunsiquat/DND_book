import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./components/Placeholder";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

const App = () => {
  const isAuthenticated = !!localStorage.getItem("authToken"); // Check if the user is authenticated

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
              <Placeholder pageName="Notes" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/locations"
          element={
            <ProtectedRoute>
              <Placeholder pageName="Locations" />
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
      </Routes>
    </Router>
  );
};

export default App;
