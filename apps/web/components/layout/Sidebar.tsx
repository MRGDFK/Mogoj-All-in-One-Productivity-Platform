"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "motion/react";
import {
  Inbox,
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  FileText,
  Archive,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAreas } from "@/hooks/useAreas";
import { useUnprocessedInboxCount } from "@/hooks/useInbox";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { MogojMark } from "@/components/layout/MogojMark";

const NAV_ITEMS = [
  { href: "/", label: "HQ", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/resources", label: "Resources", icon: FileText },
  { href: "/archive", label: "Archive", icon: Archive },
];

function NavLink({
  href,
  active,
  icon: Icon,
  leading,
  children,
  trailing,
}: {
  href: string;
  active: boolean;
  icon?: LucideIcon;
  leading?: React.ReactNode;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-(--dur-fast) ease-soft",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        // One pill shared across all items: it glides to whichever link is active
        <m.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-lg bg-white/[0.07] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
          transition={{ type: "spring", bounce: 0, duration: 0.35 }}
        />
      )}
      <span className="relative flex w-4 shrink-0 justify-center">
        {Icon ? <Icon className="h-4 w-4" strokeWidth={1.75} /> : leading}
      </span>
      <span className="relative min-w-0 flex-1 truncate">{children}</span>
      {trailing && <span className="relative">{trailing}</span>}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: areas } = useAreas({ status: "active" });
  const { data: unprocessedCount } = useUnprocessedInboxCount();

  return (
    <aside className="glass flex h-full w-64 shrink-0 flex-col rounded-2xl">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <MogojMark />
        <Link href="/" className="text-[15px] font-medium">
          Mogoj
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div className="space-y-0.5">
          <NavLink
            href="/inbox"
            active={pathname === "/inbox"}
            icon={Inbox}
            trailing={
              Boolean(unprocessedCount) && (
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{unprocessedCount}</span>
              )
            }
          >
            Inbox
          </NavLink>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} active={pathname === item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div>
          <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">Areas</p>
          <div className="space-y-0.5">
            {areas?.map((area) => {
              const href = `/areas/${area.id}`;
              return (
                <NavLink
                  key={area.id}
                  href={href}
                  active={pathname === href}
                  leading={<EntityIcon icon={area.icon} color={area.color} size={14} />}
                >
                  {area.name}
                </NavLink>
              );
            })}
            <Link
              href="/areas"
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground"
            >
              View all areas
            </Link>
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <NavLink href="/settings" active={pathname === "/settings"} icon={Settings}>
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
