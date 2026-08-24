"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/providers/AuthProvider";
import { useUpdateProfile, useLogout } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Avatar } from "@/components/shared/Avatar";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useAuthContext();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const router = useRouter();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar ?? "");
    }
  }, [user]);

  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ name: name.trim(), avatar: avatar.trim() || null });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Settings" description="Your profile and preferences." />

      <div className="mb-4 flex items-center gap-3">
        <Avatar name={user.name} src={user.avatar} className="h-14 w-14 text-lg" />
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="settings-name">Name</Label>
          <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="settings-avatar">Avatar URL</Label>
          <Input
            id="settings-avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <Button type="submit" disabled={updateProfile.isPending}>
          Save changes
        </Button>
      </form>

      <div className="mt-6 border-t border-border pt-4">
        <Button
          variant="outline"
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.push("/login") })}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
