"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { usePathname } from "next/navigation";
import { m } from "motion/react";
import {
  Inbox,
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  FileText,
  Archive,
  Compass,
  Settings,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAreas } from "@/hooks/useAreas";
import { useUnprocessedInboxCount } from "@/hooks/useInbox";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { MogojMark } from "@/components/layout/MogojMark";
import { SheetContent } from "@/components/shared/Sheet";
import { useUIStore } from "@/store/useUIStore";

const NAV_ITEMS = [
  { href: "/", label: "HQ", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/areas", label: "Areas", icon: Compass },
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
  pillId,
}: {
  pillId: string;
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
          layoutId={pillId}
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

const NAV_ROW =
  "relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-(--dur-fast) ease-soft hover:text-foreground";

/** Sidebar contents, shared by the desktop column and the mobile drawer. */
function SidebarNav({ pillId, onCapture }: { pillId: string; onCapture?: () => void }) {
  const pathname = usePathname();
  const { data: areas } = useAreas({ status: "active" });
  const { data: unprocessedCount } = useUnprocessedInboxCount();

  return (
    <>
      <div className="flex h-14 items-center gap-2.5 px-5">
        <MogojMark />
        <Link href="/" className="text-[15px] font-medium">
          Mogoj
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div>
          <NavLink
            pillId={pillId}
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
            <NavLink pillId={pillId} key={item.href} href={item.href} active={pathname === item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div>
          <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">Areas</p>
          <div>
            {areas?.map((area) => {
              const href = `/areas/${area.id}`;
              return (
                <NavLink
                  pillId={pillId}
                  key={area.id}
                  href={href}
                  active={pathname === href}
                  leading={<EntityIcon icon={area.icon} color={area.color} size={14} />}
                >
                  {area.name}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-3">
        {onCapture && (
          <button type="button" onClick={onCapture} className={NAV_ROW}>
            <span className="flex w-4 shrink-0 justify-center">
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </span>
            Quick capture
          </button>
        )}
        <NavLink pillId={pillId} href="/settings" active={pathname === "/settings"} icon={Settings}>
          Settings
        </NavLink>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const open = useUIStore((s) => s.sidebarOpen);
  const setOpen = useUIStore((s) => s.setSidebarOpen);
  const setQuickCaptureOpen = useUIStore((s) => s.setQuickCaptureOpen);

  // Close the drawer after navigating, and if the window grows into the desktop layout
  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [setOpen]);

  return (
    <>
      <aside className="glass hidden h-full w-64 shrink-0 flex-col rounded-2xl lg:flex">
        <SidebarNav pillId="sidebar-active-pill" />
      </aside>
      <SheetContent
        open={open}
        onOpenChange={setOpen}
        side="left"
        className="max-w-[min(18rem,85vw)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)]"
      >
        <Dialog.Title className="sr-only">Navigation</Dialog.Title>
        <SidebarNav
          pillId="drawer-active-pill"
          onCapture={() => {
            setOpen(false);
            setQuickCaptureOpen(true);
          }}
        />
      </SheetContent>
    </>
  );
}
