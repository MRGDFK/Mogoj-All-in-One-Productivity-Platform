"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { FolderKanban, LayoutDashboard, ListTodo, Menu, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { activeTab, type MobileTab } from "@/lib/mobileNav";
import { useUIStore } from "@/store/useUIStore";
import { CREATE_ACTIONS, runCreateAction } from "@/components/layout/createActions";

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
  const [createOpen, setCreateOpen] = useState(false);
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
    <>
      <nav
        aria-label="Main"
        className={cn(
          "glass fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto grid h-16 max-w-md grid-cols-5 items-center rounded-full px-2 transition-transform duration-(--dur-base) ease-soft lg:hidden",
          typing && "translate-y-[calc(100%+2rem)]",
        )}
      >
        <TabLink href="/" label="Home" icon={LayoutDashboard} active={tab === "home"} />
        <TabLink href="/tasks" label="Tasks" icon={ListTodo} active={tab === "tasks"} />
        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Create"
            onClick={() => setCreateOpen(true)}
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

      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
          <Dialog.Content
            aria-describedby={undefined}
            className="glass-overlay fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-3xl p-2 duration-(--dur-base) ease-soft focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:slide-out-to-bottom-6"
          >
            <Dialog.Title className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">Create</Dialog.Title>
            {CREATE_ACTIONS.map(({ key, label, hint, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  runCreateAction(key);
                }}
                className="spotlight flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-(--dur-fast) hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
              </button>
            ))}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
