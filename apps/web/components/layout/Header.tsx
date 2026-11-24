"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Search, LogOut, Settings } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useLogout } from "@/hooks/useAuth";
import { Avatar } from "@/components/shared/Avatar";
import { CommandPalette } from "@/components/layout/CommandPalette";

const MENU_POP =
  "duration-150 ease-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-[0.98] data-[state=closed]:zoom-out-[0.98] data-[side=bottom]:slide-in-from-top-1";

export function Header() {
  const { user } = useAuthContext();
  const logout = useLogout();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <header className="glass flex h-14 shrink-0 items-center justify-between gap-4 rounded-2xl px-3">
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2.5 rounded-lg bg-white/[0.04] px-3 text-sm text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-white/[0.07] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="h-4 w-4" strokeWidth={1.75} />
        <span className="flex-1 text-left">Search</span>
        <kbd className="rounded-md border border-border bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px]">⌘K</kbd>
      </button>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {user && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition-colors duration-(--dur-fast) hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar name={user.name} src={user.avatar} />
            <span className="text-sm">{user.name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className={`glass-overlay z-50 min-w-52 rounded-xl p-1 text-popover-foreground ${MENU_POP}`}
            >
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild>
                <Link
                  href="/settings"
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => {
                  logout.mutate(undefined, { onSuccess: () => router.push("/login") });
                }}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-destructive outline-none data-[highlighted]:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </header>
  );
}
