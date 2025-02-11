import { useState } from "react";
import { Card, Avatar, Button, FileInput, Label, TextInput } from "flowbite-react";
import type { UsersResponse } from "../types/pocketbase-types";
import { updateUserProfile } from "../api/users";
import { pb } from "../api/base";

interface UserProfileProps {
  user: UsersResponse;
  setUser: (user: UsersResponse) => void;
}

export function UserProfile({ user, setUser }: UserProfileProps) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) setAvatar(event.target.files[0]);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const updatedUser = await updateUserProfile(user.id, name, avatar ?? undefined);
      setUser(updatedUser);
      setAvatar(null);
    } catch (err) {
      console.error("❌ Profile update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col items-center">
        <Avatar
          img={user.avatar ? `${pb.baseUrl}/api/files/_pb_users_auth_/${user.id}/${user.avatar}` : undefined}
          rounded
          size="xl"
        />
        <h2 className="text-2xl font-bold mt-3">{user.name || "Guest"}</h2>
        <p className="text-gray-500">{user.email || "Not Logged In"}</p>
      </div>

      {/* Profile Update Form */}
      <div className="space-y-4 mt-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="avatar">Avatar</Label>
          <FileInput id="avatar" accept="image/*" onChange={handleAvatarChange} />
        </div>

        <Button onClick={handleUpdateProfile} disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </Card>
  );
}
