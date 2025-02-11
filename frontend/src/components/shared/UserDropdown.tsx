import { useNavigate } from "react-router-dom";
import { Dropdown, Button, Spinner } from "flowbite-react";
import { pb } from "../../api/base";
import type { UsersResponse } from "../../types/pocketbase-types";
import { UserAvatar } from "./UserAvatar";

interface UserDropdownProps {
  user: UsersResponse | null;
  loading: boolean;
  error: string | null;
}

export function UserDropdown({ user, loading, error }: UserDropdownProps) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    pb.authStore.clear();
    navigate("/login"); // Redirect after signing out
  };

  // ✅ Show loading spinner while fetching user data
  if (loading) {
    return <Spinner size="sm" color="blue" aria-label="Loading user info..." />;
  }

  // ✅ Show error message if fetching user data fails
  if (error) {
    return <span className="text-red-500">{error}</span>;
  }

  // ✅ Show "Sign In" button if no user is logged in
  if (!user) {
    return (
      <Button color="blue" onClick={() => navigate("/login")}>
        Sign In
      </Button>
    );
  }

  return (
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
  );
}
