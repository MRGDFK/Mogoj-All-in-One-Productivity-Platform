"use client";

import { FileText, FolderKanban, Inbox, ListTodo, type LucideIcon } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { NewResourceModal } from "@/components/resources/NewResourceModal";

export type CreateActionKey = "capture" | "task" | "project" | "resource";

/** The one list behind every + menu (bottom bar, desktop sidebar, Quick Capture), so web and mobile stay in sync. */
export const CREATE_ACTIONS: { key: CreateActionKey; label: string; hint: string; icon: LucideIcon }[] = [
  { key: "capture", label: "Quick capture", hint: "Drop it in your Inbox", icon: Inbox },
  { key: "task", label: "Add task", hint: "With a due date or priority", icon: ListTodo },
  { key: "project", label: "Add project", hint: "Inside one of your areas", icon: FolderKanban },
  { key: "resource", label: "Add resource", hint: "A note, link or reference", icon: FileText },
];

/** Opens the matching dialog on the next frame, after the menu that triggered it has closed (avoids two Radix focus traps fighting). */
export function runCreateAction(key: CreateActionKey) {
  requestAnimationFrame(() => {
    const ui = useUIStore.getState();
    if (key === "capture") ui.setQuickCaptureOpen(true);
    else ui.setCreateDialog(key);
  });
}

/** App-wide instances of the create dialogs, driven by `useUIStore.createDialog`. */
export function GlobalCreateDialogs() {
  const dialog = useUIStore((s) => s.createDialog);
  const setDialog = useUIStore((s) => s.setCreateDialog);
  const onOpenChange = (open: boolean) => !open && setDialog(null);
  return (
    <>
      <NewTaskModal open={dialog === "task"} onOpenChange={onOpenChange} />
      <NewProjectModal open={dialog === "project"} onOpenChange={onOpenChange} />
      <NewResourceModal open={dialog === "resource"} onOpenChange={onOpenChange} />
    </>
  );
}
