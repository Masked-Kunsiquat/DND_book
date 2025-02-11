import { DarkThemeToggle } from "flowbite-react";
import { useAuthUser } from "../../hooks/useAuthUser";
import { UserDropdown } from "../shared/UserDropdown";
import { useNavigate } from "react-router-dom";

/**
 * Navbar component with accessibility improvements and user handling.
 */
export function Navbar() {
  const { user, loading, error } = useAuthUser();
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center px-6 py-3 border-b bg-white dark:bg-gray-800">
      <button
        className="text-xl font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
        onClick={() => navigate("/dashboard")}
        aria-label="Navigate to Dashboard"
      >
        DND Book
      </button>
      <div className="flex items-center gap-4">
        <DarkThemeToggle />
        <UserDropdown user={user} loading={loading} error={error} />
      </div>
    </div>
  );
}
