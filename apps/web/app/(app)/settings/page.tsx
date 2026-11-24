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
import { useQuickCaptureShortcut } from "@/hooks/useQuickCaptureShortcut";
import {
  DEFAULT_QUICK_CAPTURE_SHORTCUT,
  eventToShortcut,
  formatShortcut,
  isMacPlatform,
  isReservedShortcut,
} from "@/lib/shortcut";

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

      <ShortcutSetting />

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

function ShortcutSetting() {
  const { shortcut, setShortcut } = useQuickCaptureShortcut();
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMac = isMacPlatform();
  const isDefault = JSON.stringify(shortcut) === JSON.stringify(DEFAULT_QUICK_CAPTURE_SHORTCUT);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!recording) return;
    e.preventDefault();
    // React's root is `document` in the App Router, the same node as the global shortcut listeners,
    // so only stopImmediatePropagation keeps quick capture / the palette from firing while recording
    e.nativeEvent.stopImmediatePropagation();
    if (e.key === "Escape") return setRecording(false);
    const next = eventToShortcut(e.nativeEvent, isMac);
    if (!next) return;
    if (isReservedShortcut(next)) return setError(`${isMac ? "⌘K" : "Ctrl+K"} already opens the command palette.`);
    setShortcut(next);
    setRecording(false);
  }

  return (
    <div className="mt-6 space-y-2 border-t border-border pt-4">
      <h2 className="text-sm font-medium">Keyboard shortcuts</h2>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm">Quick capture</p>
          <p className="text-xs text-muted-foreground">Opens the capture popup from any page.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setRecording(true);
              setError(null);
            }}
            onBlur={() => setRecording(false)}
            onKeyDown={onKeyDown}
            aria-label="Change quick capture shortcut"
            className={`flex h-8 min-w-28 items-center justify-center gap-1 rounded-lg border px-2 text-xs transition-colors duration-(--dur-fast) ${
              recording ? "border-brand/60 text-brand" : "border-white/10 bg-white/[0.03] hover:border-white/20"
            }`}
          >
            {recording
              ? "Press keys…"
              : formatShortcut(shortcut, isMac).map((k) => (
                  <kbd key={k} className="rounded border border-white/10 bg-white/[0.04] px-1.5 font-mono text-[11px]">
                    {k}
                  </kbd>
                ))}
          </button>
          {!isDefault && (
            <Button variant="ghost" size="sm" onClick={() => setShortcut(null)}>
              Reset
            </Button>
          )}
        </div>
      </div>
      {recording && (
        <p className="text-xs text-muted-foreground">
          Hold {isMac ? "⌘ or ⌥" : "Ctrl or Alt"} (plus ⇧ if you like) and press a key. Esc cancels.
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
