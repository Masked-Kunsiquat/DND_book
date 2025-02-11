import { DarkThemeToggle } from "flowbite-react";
import { useAuthUser } from "../../hooks/useAuthUser";
import { UserDropdown } from "../shared/UserDropdown";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const user = useAuthUser(); // Fetch the authenticated user
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center px-6 py-3 border-b bg-white dark:bg-gray-800">
      <span className="text-xl font-semibold text-gray-900 dark:text-white" onClick={() => navigate("/dashboard")}>DND Book</span>
      <div className="flex items-center gap-4">
        <DarkThemeToggle />
        <UserDropdown user={user} /> {/* Uses modular dropdown */}
      </div>
    </div>
  );
}
