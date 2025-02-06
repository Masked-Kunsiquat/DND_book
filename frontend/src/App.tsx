import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded pages
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Login = React.lazy(() => import("./pages/Login"));
const Placeholder = React.lazy(() => import("./pages/Placeholder"));

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Navbar always visible */}
        <Navbar />

        <main style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
          {/* Suspense ensures fallback during lazy loading */}
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Redirect base path */}
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
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

              {/* Fallback Route for 404 */}
              <Route path="*" element={<Placeholder pageName="404 - Page Not Found" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
};

export default App;
