import { useUser } from "../hooks/useUser";
import { UserProfile } from "../components/shared/UserProfile";
import { Loader } from "../components/shared/Loader";
import { ErrorMessage } from "../components/shared/ErrorMessage";

export function Profile() {
  const { user, setUser, loading, error } = useUser();

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Profile</h1>

      <div className="max-w-2xl mx-auto">
        {user ? <UserProfile user={user} setUser={setUser} /> : <p className="text-center">User not found.</p>}
      </div>
    </div>
  );
}

export default Profile;
