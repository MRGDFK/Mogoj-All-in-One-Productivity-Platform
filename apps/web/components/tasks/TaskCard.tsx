"use client";

import type { Task } from "@mogoj/shared";
import { MoreHorizontal } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUIStore } from "@/store/useUIStore";
import { TaskCardContent } from "@/components/tasks/TaskCardContent";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onMenuClick?: () => void;
}

export function TaskCard({ task, onClick, onMenuClick }: TaskCardProps) {
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const handleOpen = () => (onClick ? onClick() : openTaskDetail(task.id));

  return (
    <div className="group relative rounded-lg border border-border/60 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 hover:border-border hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="absolute right-2 top-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="rounded p-0.5 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" sideOffset={4} className="z-50 min-w-32 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
              <DropdownMenu.Item
                className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                onSelect={handleOpen}
              >
                Open
              </DropdownMenu.Item>
              {onMenuClick && (
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-destructive outline-none hover:bg-accent"
                  onSelect={onMenuClick}
                >
                  Delete
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-left"
      >
        <TaskCardContent task={task} />
      </button>
    </div>
  );
}
