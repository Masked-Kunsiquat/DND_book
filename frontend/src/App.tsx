import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Notes } from "./pages/Notes";
import { Login } from "./pages/Login";
import { Locations } from "./pages/Locations";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="*" element={<h1 className="text-center text-2xl">404 - Not Found</h1>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
