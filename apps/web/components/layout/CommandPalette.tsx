"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import {
  Archive,
  FileText,
  Folder,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useSearch } from "@/hooks/useSearch";
import { SPRING_DRAWER } from "@/lib/motion";
import { useUIStore } from "@/store/useUIStore";

const PAGES: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "HQ", href: "/", icon: LayoutDashboard },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Areas", href: "/areas", icon: Folder },
  { label: "Resources", href: "/resources", icon: FileText },
  { label: "Archive", href: "/archive", icon: Archive },
  { label: "Settings", href: "/settings", icon: Settings },
];

const ITEM =
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none transition-colors duration-(--dur-fast) data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-foreground";
const GROUP = "px-2 pb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: results } = useSearch(query);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);

  // ⌘K / Ctrl+K toggles the palette from anywhere
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Exactly Mod+K: Mod+Shift+K (and other combos) belong to quick capture
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  function go(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  // Tasks open in the cross-page detail drawer, wherever you are
  function openTask(id: string) {
    onOpenChange(false);
    setQuery("");
    openTaskDetail(id);
  }

  const q = query.trim().toLowerCase();
  const pages = PAGES.filter((p) => !q || p.label.toLowerCase().includes(q));
  const groups = results
    ? [
        { heading: "Tasks", icon: ListTodo, items: results.tasks.map((t) => ({ id: t.id, label: t.title, href: `/tasks?taskId=${t.id}` })) },
        { heading: "Projects", icon: FolderKanban, items: results.projects.map((p) => ({ id: p.id, label: p.name, href: `/projects/${p.id}` })) },
        { heading: "Areas", icon: Folder, items: results.areas.map((a) => ({ id: a.id, label: a.name, href: `/areas/${a.id}` })) },
        { heading: "Resources", icon: FileText, items: results.resources.map((r) => ({ id: r.id, label: r.title, href: `/resources/${r.id}` })) },
      ].filter((g) => g.items.length > 0)
    : [];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-50 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <m.div
                className="glass-overlay fixed left-1/2 top-[18vh] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl focus:outline-none max-sm:inset-0 max-sm:flex max-sm:max-w-none max-sm:translate-x-0 max-sm:flex-col max-sm:rounded-none max-sm:border-0 max-sm:pb-[env(safe-area-inset-bottom)] max-sm:pt-[env(safe-area-inset-top)]"
                initial={{ opacity: 0, scale: 0.97, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -6 }}
                transition={SPRING_DRAWER}
              >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          {/* Server search already filters results; we filter pages ourselves */}
          <CommandPrimitive shouldFilter={false} loop className="max-sm:flex max-sm:min-h-0 max-sm:flex-1 max-sm:flex-col">
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <CommandPrimitive.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search or jump to"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {/* Full-screen on phones hides the overlay, so give an explicit way out */}
              <Dialog.Close className="shrink-0 text-sm text-muted-foreground hover:text-foreground sm:hidden">Cancel</Dialog.Close>
            </div>
            <CommandPrimitive.List className="max-h-[50vh] overflow-y-auto py-2 max-sm:max-h-none max-sm:flex-1">
              <CommandPrimitive.Empty className="px-4 py-6 text-center text-sm text-muted-foreground">
                No results
              </CommandPrimitive.Empty>
              {pages.length > 0 && (
                <CommandPrimitive.Group heading="Go to" className={GROUP}>
                  {pages.map((p) => (
                    <CommandPrimitive.Item key={p.href} value={`page:${p.href}`} onSelect={() => go(p.href)} className={ITEM}>
                      <p.icon className="h-4 w-4" strokeWidth={1.75} />
                      {p.label}
                    </CommandPrimitive.Item>
                  ))}
                </CommandPrimitive.Group>
              )}
              {groups.map((g) => (
                <CommandPrimitive.Group key={g.heading} heading={g.heading} className={GROUP}>
                  {g.items.map((item) => (
                    <CommandPrimitive.Item key={item.id} value={`${g.heading}:${item.id}`} onSelect={() => (g.heading === "Tasks" ? openTask(item.id) : go(item.href))} className={ITEM}>
                      <g.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{item.label}</span>
                    </CommandPrimitive.Item>
                  ))}
                </CommandPrimitive.Group>
              ))}
            </CommandPrimitive.List>
          </CommandPrimitive>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
