import { useUser } from "../hooks/useUser";
import { UserProfile } from "../components/UserProfile";
import { Spinner, Alert } from "flowbite-react";

export function Profile() {
  const { user, setUser, loading, error } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert color="failure">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {user ? <UserProfile user={user} setUser={setUser} /> : <p className="text-center">User not found.</p>}
    </div>
  );
}

export default Profile;
