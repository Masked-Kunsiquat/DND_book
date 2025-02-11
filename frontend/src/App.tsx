import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Notes } from "./pages/Notes";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="*" element={<h1 className="text-center text-2xl">404 - Not Found</h1>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
