import { useState } from "react";
import { Button, FileInput, Label, TextInput } from "flowbite-react";
import type { UsersResponse } from "../../types/pocketbase-types";
import { updateUserProfile } from "../../api/users";
import { ErrorMessage } from "./ErrorMessage";

interface UserProfileFormProps {
  user: UsersResponse;
  setUser: (user: UsersResponse) => void;
}

export function UserProfileForm({ user, setUser }: UserProfileFormProps) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // ✅ Validate file type
      const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a PNG, JPEG, or WEBP image.");
        return;
      }

      // ✅ Validate file size (max 2MB)
      const maxSizeMB = 2;
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File is too large. Max size allowed is ${maxSizeMB}MB.`);
        return;
      }

      setError(null);
      setAvatar(file);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUserProfile(user.id, name, avatar ?? undefined);
      setUser(updatedUser as unknown as UsersResponse);
      setAvatar(null);
    } catch (err: any) {
      console.error("❌ Profile update failed:", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
      {error && <ErrorMessage message={error} />}

      <div>
        <Label htmlFor="name" className="text-gray-900 dark:text-white">Name</Label>
        <TextInput
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <Label htmlFor="avatar" className="text-gray-900 dark:text-white">Avatar</Label>
        <FileInput
          id="avatar"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleAvatarChange}
          className="dark:bg-gray-700 dark:text-white"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <Button onClick={handleUpdateProfile} disabled={loading}>
        {loading ? "Updating..." : "Update Profile"}
      </Button>
    </div>
  );
}
