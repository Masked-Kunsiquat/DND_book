import { useState, useEffect } from "react";
import { Avatar } from "flowbite-react";
import type { UsersResponse } from "../../types/pocketbase-types";
import { pb } from "../../api/base";
import { Loader } from "../shared/Loader"; // ✅ Reusing Loader component
import { ErrorMessage } from "../shared/ErrorMessage"; // ✅ Reusing ErrorMessage component

interface UserAvatarProps {
  user: UsersResponse | null;
}

export function UserAvatar({ user }: UserAvatarProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    if (user?.avatar) {
      const img = new Image();
      img.src = `${pb.baseURL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`;

      img.onload = () => {
        if (!mounted) return;
        setAvatarUrl(img.src);
        setLoading(false);
      };

      img.onerror = () => {
        if (!mounted) return;
        setError("Failed to load avatar.");
        setLoading(false);
      };
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [user?.avatar, user?.id]);

  if (loading) return <Loader />; // ✅ Uses Loader component

  if (error) return <ErrorMessage message={error} />; // ✅ Uses ErrorMessage component

  return (
    <Avatar
      rounded
      img={avatarUrl}
      alt={`${user?.name || "User"}'s profile picture`}
    />
  );
}
