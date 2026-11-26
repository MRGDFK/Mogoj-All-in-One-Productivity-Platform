"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, LayoutDashboard, ListTodo, Menu, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { activeTab, type MobileTab } from "@/lib/mobileNav";
import { useUIStore } from "@/store/useUIStore";

const TAB =
  "flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function TabLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: LucideIcon; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(TAB, active ? "bg-white/[0.1] text-foreground" : "text-muted-foreground hover:text-foreground")}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
      {label}
    </Link>
  );
}

/** Phones and tablets (below lg): floating bottom bar that replaces the header and sidebar. */
export function MobileTabBar() {
  const tab: MobileTab = activeTab(usePathname());
  const openMore = useUIStore((s) => s.setSidebarOpen);
  const openCapture = useUIStore((s) => s.setQuickCaptureOpen);
  const [typing, setTyping] = useState(false);

  // Step out of the way of the on-screen keyboard while a text field has focus
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.matches("input:not([type=checkbox]):not([type=radio]), textarea, select") || el.isContentEditable);
    const onFocusIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onFocusOut = () => setTyping(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
      <nav
        aria-label="Main"
        className={cn(
          "glass-frost fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto grid h-16 max-w-md grid-cols-5 items-center rounded-full px-2 transition-transform duration-(--dur-base) ease-soft lg:hidden",
          typing && "translate-y-[calc(100%+2rem)]",
        )}
      >
        <TabLink href="/" label="Home" icon={LayoutDashboard} active={tab === "home"} />
        <TabLink href="/tasks" label="Tasks" icon={ListTodo} active={tab === "tasks"} />
        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Quick capture"
            onClick={() => openCapture(true)}
            className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_28px_rgb(0_0_0/0.5),0_0_32px_-6px_rgb(124_156_255/0.6)] transition-transform duration-(--dur-fast) ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
          >
            <Plus className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
        <TabLink href="/projects" label="Projects" icon={FolderKanban} active={tab === "projects"} />
        <button
          type="button"
          onClick={() => openMore(true)}
          className={cn(TAB, tab === "more" ? "bg-white/[0.1] text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
          More
        </button>
      </nav>
  );
}
