"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateProfile, updateAvatar, removeAvatar } from "@/lib/actions/profile";
import { useProfile } from "@/lib/hooks/use-profile";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import { Camera, Trash2 } from "lucide-react";

export default function EditProfilePage() {
  const { profile, refresh } = useProfile();
  const haptic = useHaptic();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(updateProfile, null);

  useEffect(() => {
    if (state && "success" in state) {
      haptic.notify("success");
      refresh();
    }
    if (state && "error" in state) {
      haptic.notify("error");
    }
  }, [state, haptic, refresh]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("avatar", file);
    const result = await updateAvatar(fd);

    if ("success" in result) {
      haptic.notify("success");
      refresh();
    } else {
      haptic.notify("error");
    }
  };

  const handleRemoveAvatar = async () => {
    const result = await removeAvatar();
    if ("success" in result) {
      haptic.notify("success");
      refresh();
    }
  };

  return (
    <div className="container-page py-4 flex flex-col gap-fluid-4 max-w-lg mx-auto">
      <h2 className="text-fluid-lg uppercase">Edit profile</h2>

      {/* Avatar section */}
      <div className="flex items-center gap-4">
        <Avatar
          src={profile.avatar_url}
          alt={profile.display_name ?? "User"}
          size="xl"
          fallback={profile.display_name ?? "?"}
        />
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            icon={<Camera className="w-4 h-4" />}
          >
            Change photo
          </Button>
          {profile.avatar_url && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemoveAvatar}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {state && "success" in state && (
        <Alert variant="success">{state.message}</Alert>
      )}
      {state && "error" in state && (
        <Alert variant="error">{state.error}</Alert>
      )}

      {/* Profile form */}
      <form action={formAction} className="flex flex-col gap-3">
        <Input
          label="Display name"
          name="displayName"
          defaultValue={profile.display_name ?? ""}
          required
          minLength={2}
          maxLength={50}
          placeholder="Your name"
        />
        <Textarea
          label="Bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          maxLength={500}
          placeholder="Tell people about yourself..."
          hint="500 characters max"
        />
        <Button
          variant="primary"
          type="submit"
          disabled={isPending}
          loading={isPending}
        >
          Save changes
        </Button>
      </form>
    </div>
  );
}
