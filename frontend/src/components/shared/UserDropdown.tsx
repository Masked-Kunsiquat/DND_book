import { useNavigate } from "react-router-dom";
import { Dropdown, Button, Spinner } from "flowbite-react";
import { pb } from "../../api/base";
import type { UsersResponse } from "../../types/pocketbase-types";
import { UserAvatar } from "./UserAvatar";
import { ErrorBoundary } from "../shared/ErrorBoundary"; // ✅ Import Error Boundary

interface UserDropdownProps {
  user: UsersResponse | null;
  loading: boolean;
  error: string | null;
}

export function UserDropdown({ user, loading, error }: UserDropdownProps) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    pb.authStore.clear();
    navigate("/login");
  };

  return (
    <ErrorBoundary> {/* ✅ Wrap the entire dropdown in an error boundary */}
      {loading ? (
        <Spinner size="sm" color="blue" aria-label="Loading user info..." />
      ) : error ? (
        <span className="text-red-500">{error}</span>
      ) : !user ? (
        <Button color="blue" onClick={() => navigate("/login")}>
          Sign In
        </Button>
      ) : (
        <Dropdown arrowIcon={false} inline label={<UserAvatar user={user} />}>
          <Dropdown.Header>
            <span className="block text-sm text-gray-900 dark:text-white">
              {user.name || "Guest"}
            </span>
            <span className="block truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {user.email || "Not Logged In"}
            </span>
          </Dropdown.Header>
          <Dropdown.Item onClick={() => navigate("/profile")}>Profile</Dropdown.Item>
          <Dropdown.Item onClick={() => navigate("/settings")}>Settings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
        </Dropdown>
      )}
    </ErrorBoundary>
  );
}
