"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  FileText,
  Archive,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAreas } from "@/hooks/useAreas";
import { useUnprocessedInboxCount } from "@/hooks/useInbox";
import { Badge } from "@/components/shared/Badge";
import { EntityIcon } from "@/components/shared/EntityIcon";

const NAV_ITEMS = [
  { href: "/", label: "HQ Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "All Tasks", icon: ListTodo },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/resources", label: "Resources", icon: FileText },
  { href: "/archive", label: "Archive", icon: Archive },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: areas } = useAreas({ status: "active" });
  const { data: unprocessedCount } = useUnprocessedInboxCount();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-10 items-center border-b border-border px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Mogoj
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          <Link
            href="/inbox"
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/inbox" && "bg-accent text-accent-foreground",
            )}
          >
            <span className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Inbox
            </span>
            {Boolean(unprocessedCount) && (
              <Badge variant="primary" className="min-w-5 justify-center">
                {unprocessedCount}
              </Badge>
            )}
          </Link>

          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  active && "bg-accent text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Areas
            </span>
          </div>
          <div className="space-y-1">
            {areas?.map((area) => {
              const href = `/areas/${area.id}`;
              const active = pathname === href;
              return (
                <Link
                  key={area.id}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    active && "bg-accent text-accent-foreground",
                  )}
                >
                  <EntityIcon icon={area.icon} color={area.color} size={14} />
                  <span className="truncate">{area.name}</span>
                </Link>
              );
            })}
            <Link
              href="/areas"
              className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View all areas
            </Link>
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === "/settings" && "bg-accent text-accent-foreground",
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
