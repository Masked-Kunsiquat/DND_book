import { Card, Avatar } from "flowbite-react";
import type { UsersResponse } from "../../types/pocketbase-types";
import { pb } from "../../api/base";
import { UserProfileForm } from "./UserProfileForm";

interface UserProfileProps {
  user: UsersResponse;
  setUser: (user: UsersResponse) => void;
}

export function UserProfile({ user, setUser }: UserProfileProps) {
  return (
    <Card className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md">
      <div className="flex flex-col items-center">
        <Avatar
          img={user.avatar ? `${pb.baseURL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}` : undefined}
          rounded
          size="xl"
        />
        <h2 className="text-2xl font-bold mt-3">{user.name || "Guest"}</h2>
        <p className="text-gray-500">{user.email || "Not Logged In"}</p>
      </div>

      {/* Inject the profile update form */}
      <div className="mt-4">
        <UserProfileForm user={user} setUser={setUser} />
      </div>
    </Card>
  );
}
