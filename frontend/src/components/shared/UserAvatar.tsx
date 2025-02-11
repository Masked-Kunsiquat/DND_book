import { Avatar } from "flowbite-react";
import type { UsersResponse } from "../../types/pocketbase-types";
import { pb } from "../../api/base"; // ✅ Import PocketBase instance

interface UserAvatarProps {
  user: UsersResponse | null;
}

export function UserAvatar({ user }: UserAvatarProps) {
  const avatarUrl = user?.avatar
    ? `${pb.baseURL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`
    : undefined;

  return <Avatar rounded img={avatarUrl} />;
}
