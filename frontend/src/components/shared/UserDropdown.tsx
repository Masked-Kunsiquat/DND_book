import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Button, Spinner } from "flowbite-react";
import { pb } from "../../api/base";
import type { UsersResponse } from "../../types/pocketbase-types";
import { UserAvatar } from "./UserAvatar";
import { ErrorBoundary } from "../shared/ErrorBoundary"; // ✅ Import Error Boundary
import { ErrorMessage } from "../shared/ErrorMessage"; // ✅ Import ErrorMessage
import { Loader } from "../shared/Loader"; // ✅ Import Loader

interface UserDropdownProps {
  user: UsersResponse | null;
  loading: boolean;
  error: string | null;
}

export function UserDropdown({ user, loading, error }: UserDropdownProps) {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);

    try {
      pb.authStore.clear();
      navigate("/login");
    } catch (err: any) {
      console.error("❌ Error signing out:", err);
      setSignOutError("Failed to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ErrorBoundary> {/* ✅ Wrap the entire dropdown in an error boundary */}
      {loading ? (
        <Loader /> // ✅ Reuse Loader component
      ) : error ? (
        <ErrorMessage message={error} /> // ✅ Reuse ErrorMessage component
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
          {signOutError && <ErrorMessage message={signOutError} />} {/* ✅ Show sign-out errors */}
          <Dropdown.Item onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? "Signing out..." : "Sign out"}
          </Dropdown.Item>
        </Dropdown>
      )}
    </ErrorBoundary>
  );
}
