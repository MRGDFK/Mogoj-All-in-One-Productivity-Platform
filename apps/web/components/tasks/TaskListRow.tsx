"use client";

import { memo, useRef } from "react";
import type { Task } from "@mogoj/shared";
import { CalendarPlus, FolderKanban, MoreHorizontal } from "lucide-react";
import { useUpdateTask } from "@/hooks/useTasks";
import { CompletionIcon } from "@/components/shared/CompletionIcon";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { DeadlineBadge } from "@/components/tasks/DeadlineBadge";
import { EntityIcon } from "@/components/shared/EntityIcon";

interface TaskListRowProps {
  task: Task;
  onClick?: () => void;
  onMenuClick?: () => void;
}

function TaskListRowImpl({ task, onClick, onMenuClick }: TaskListRowProps) {
  const updateTask = useUpdateTask(task.id);
  const dateRef = useRef<HTMLInputElement>(null);

  return (
    <li
      className="list-row spotlight group flex items-center gap-2 rounded-lg px-3 py-2"
      style={{ "--row-accent": `var(--prio-${task.priority})` } as React.CSSProperties}
    >
      <span className="row-edge" aria-hidden />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          updateTask.mutate({ status: task.status === "done" ? "todo" : "done" });
        }}
        className="touch-hit relative shrink-0 text-muted-foreground hover:text-primary"
        aria-label="Toggle complete"
      >
        <CompletionIcon done={task.status === "done"} className="h-4 w-4" />
      </button>

      {/* Phones: badges drop under the title so it gets the full width. From sm up the wrapper is display:contents (desktop row unchanged). */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
        <button type="button" onClick={onClick} className="row-nudge min-w-0 flex-1 cursor-pointer text-left">
          <p className={cn("truncate text-sm font-medium", task.status === "done" && "text-muted-foreground line-through")}>
            {task.title}
          </p>
        </button>

        {task.area?.name && (
          <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
            <EntityIcon icon={task.area.icon} color={task.area.color} size={14} />
            {task.area.name}
          </span>
        )}

        {task.project?.name && (
          <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground md:flex">
            <EntityIcon icon={task.project.icon} color={task.project.color} size={12} fallback={FolderKanban} />
            {task.project.name}
          </span>
        )}

        <div className="flex items-center gap-1.5 empty:hidden sm:contents">
          <PriorityBadge priority={task.priority} status={task.status} />
          <DeadlineBadge dueDate={task.dueDate} />
        </div>
      </div>

      <div className="row-actions flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dateRef.current?.showPicker();
          }}
          className="touch-hit relative rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Set due date"
        >
          <CalendarPlus className="h-4 w-4" />
          <input
            ref={dateRef}
            type="date"
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0"
            defaultValue={task.dueDate?.slice(0, 10) ?? ""}
            onChange={(e) =>
              updateTask.mutate({ dueDate: e.target.value ? new Date(`${e.target.value}T12:00:00Z`) : null })
            }
          />
        </button>
        {onMenuClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick();
            }}
            className="touch-hit relative rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );
}

export const TaskListRow = memo(TaskListRowImpl);
