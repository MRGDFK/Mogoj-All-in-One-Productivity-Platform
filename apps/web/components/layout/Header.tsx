"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Search, LogOut, Settings } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useLogout } from "@/hooks/useAuth";
import { useSearch } from "@/hooks/useSearch";
import { Avatar } from "@/components/shared/Avatar";
import { Input } from "@/components/shared/Input";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useAuthContext();
  const logout = useLogout();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: results } = useSearch(query);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults =
    results &&
    (results.tasks.length || results.projects.length || results.areas.length || results.resources.length);

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-6">
      <div ref={containerRef} className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search tasks, projects, areas, resources…"
          className="pl-8"
        />

        {open && query.trim().length > 1 && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-96 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
            {!hasResults && (
              <p className="px-3 py-4 text-sm text-muted-foreground">No results found.</p>
            )}
            {results && (
              <SearchGroup
                label="Tasks"
                items={results.tasks.map((t) => ({ id: t.id, label: t.title, href: `/tasks?taskId=${t.id}` }))}
                onNavigate={() => setOpen(false)}
              />
            )}
            {results && (
              <SearchGroup
                label="Projects"
                items={results.projects.map((p) => ({ id: p.id, label: p.name, href: `/projects/${p.id}` }))}
                onNavigate={() => setOpen(false)}
              />
            )}
            {results && (
              <SearchGroup
                label="Areas"
                items={results.areas.map((a) => ({ id: a.id, label: a.name, href: `/areas/${a.id}` }))}
                onNavigate={() => setOpen(false)}
              />
            )}
            {results && (
              <SearchGroup
                label="Resources"
                items={results.resources.map((r) => ({ id: r.id, label: r.title, href: `/resources/${r.id}` }))}
                onNavigate={() => setOpen(false)}
              />
            )}
          </div>
        )}
      </div>

      {user && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar name={user.name} src={user.avatar} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
            >
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild>
                <Link
                  href="/settings"
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => {
                  logout.mutate(undefined, { onSuccess: () => router.push("/login") });
                }}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none hover:bg-accent"
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

function SearchGroup({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: { id: string; label: string; href: string }[];
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="border-b border-border py-1 last:border-b-0">
      <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "block truncate px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
