"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { TaskMonthCalendar } from "@/components/shared/TaskMonthCalendar";

/** Full Notion-style task calendar in a large frosted dialog (opened from the HQ calendar widget). */
export function TaskCalendarModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-overlay fixed left-1/2 top-1/2 z-50 flex h-[85vh] w-[95vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl p-4 duration-200 ease-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-[0.97] data-[state=closed]:zoom-out-[0.97]"
        >
          <Dialog.Title className="sr-only">Task calendar</Dialog.Title>
          <Dialog.Close
            aria-label="Close calendar"
            className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
          <TaskMonthCalendar className="min-h-0 flex-1 pr-8" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
